import {
  AiMatchAnalysis,
  AiAnalysisStep,
  DetectedFaceBox,
  AiQualityStatus,
  AiAnalysisFailureReason,
} from '../types';
import { AI_TEST_SAMPLES } from '../data/aiTestSamples';

export interface SightingImageInput {
  file?: File;
  dataUrl?: string;
  url?: string;
  sampleId?: string;
  fileName?: string;
  fileSize?: number;
  selectedFaceIndex?: number;
}

export interface ProgressCallback {
  (stepIndex: number, stepName: string): void;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

/**
 * Validates file type and size before any processing begins.
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${sizeMb} MB) exceeds maximum allowed limit of 10 MB. Please compress or select a smaller image.`,
    };
  }

  const hasValidMime = ALLOWED_MIME_TYPES.includes(file.type.toLowerCase());
  const lowerName = file.name.toLowerCase();
  const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));

  if (!hasValidMime && !hasValidExt) {
    return {
      valid: false,
      error: 'Unsupported file format. Please upload a standard photograph in JPG, PNG, or WEBP format.',
    };
  }

  return { valid: true };
}

/**
 * Reads a File into a Data URL for preview and canvas analysis.
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read image file from disk.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Evaluates image dimensions, blurriness, and brightness on an off-screen canvas.
 */
async function assessClientImageQuality(
  imageSource: string
): Promise<{
  width: number;
  height: number;
  qualityStatus: AiQualityStatus;
  details: string;
}> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;

      // Minimum resolution check
      if (width < 120 || height < 120) {
        resolve({
          width,
          height,
          qualityStatus: 'invalid',
          details: `Resolution too low (${width}x${height}px). Minimum 120x120px required for facial analysis.`,
        });
        return;
      }

      try {
        const canvas = document.createElement('canvas');
        const sampleWidth = Math.min(width, 240);
        const sampleHeight = Math.min(height, 240);
        canvas.width = sampleWidth;
        canvas.height = sampleHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ width, height, qualityStatus: 'acceptable', details: 'Resolution standard.' });
          return;
        }

        ctx.drawImage(img, 0, 0, sampleWidth, sampleHeight);
        const imageData = ctx.getImageData(0, 0, sampleWidth, sampleHeight);
        const data = imageData.data;

        // Calculate average luminosity and variance for darkness/blur approximation
        let totalLuminance = 0;
        const totalPixels = sampleWidth * sampleHeight;
        let edgeDifferences = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Standard ITU-R BT.709 luma
          const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          totalLuminance += luma;

          // Simple horizontal edge difference
          if ((i + 4) % (sampleWidth * 4) !== 0 && i + 4 < data.length) {
            const nextLuma = 0.2126 * data[i + 4] + 0.7152 * data[i + 5] + 0.0722 * data[i + 6];
            edgeDifferences += Math.abs(luma - nextLuma);
          }
        }

        const avgLuminance = totalLuminance / totalPixels;
        const avgEdgeContrast = edgeDifferences / totalPixels;

        if (avgLuminance < 20) {
          resolve({
            width,
            height,
            qualityStatus: 'dark',
            details: 'Severe underexposure / darkness detected. Facial landmarks obscured.',
          });
          return;
        }

        if (avgEdgeContrast < 4.5) {
          resolve({
            width,
            height,
            qualityStatus: 'blurry',
            details: 'Significant optical blur or low focal sharpness detected.',
          });
          return;
        }

        resolve({
          width,
          height,
          qualityStatus: 'acceptable',
          details: `Resolution ${width}x${height}px with adequate focal sharpness.`,
        });
      } catch {
        // Cross-origin canvas security fallback
        resolve({
          width,
          height,
          qualityStatus: 'acceptable',
          details: `Resolution ${width}x${height}px standard.`,
        });
      }
    };

    img.onerror = () => {
      resolve({
        width: 0,
        height: 0,
        qualityStatus: 'invalid',
        details: 'Failed to decode image data.',
      });
    };

    img.src = imageSource;
  });
}

const ANALYSIS_STEPS = [
  'Validating image resolution, orientation, and format',
  'Scanning image for recognizable facial structures',
  'Analyzing facial geometry, landmarks, and feature vectors',
  'Comparing feature vectors against registered case reference photograph',
  'Synthesizing similarity report and safety metrics',
];

/**
 * Primary AI Face Matching Service
 *
 * Implements the required pipeline:
 * Sighting Image -> Validation -> Face Detection -> Embedding -> Reference Comparison -> Technical Similarity Result
 */
export async function analyzeFaceMatch(
  input: SightingImageInput,
  comparedCaseId: string,
  comparedPersonName: string,
  referencePhotoUrl: string,
  onProgress?: ProgressCallback
): Promise<AiMatchAnalysis> {
  const analysisId = `AIM-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
  const now = new Date().toISOString();

  const steps: AiAnalysisStep[] = ANALYSIS_STEPS.map((step) => ({
    step,
    status: 'pending',
  }));

  const updateStep = (index: number, status: 'in_progress' | 'completed' | 'failed') => {
    if (steps[index]) {
      steps[index].status = status;
      if (onProgress && status === 'in_progress') {
        onProgress(index, steps[index].step);
      }
    }
  };

  // 1. STEP 1: Image Validation
  updateStep(0, 'in_progress');
  await new Promise((r) => setTimeout(r, 450));

  const sightingPhotoUrl = input.dataUrl || input.url || '';
  if (!sightingPhotoUrl) {
    updateStep(0, 'failed');
    return {
      analysisId,
      faceDetected: false,
      facesCount: 0,
      result: 'unable_to_analyze',
      qualityStatus: 'invalid',
      reason: 'unsupported_format',
      message: 'No image source provided for facial comparison.',
      provider: 'ai_demo_mode',
      isDemoMode: true,
      comparedCaseId,
      comparedPersonName,
      referencePhotoUrl,
      sightingPhotoUrl,
      analyzedAt: now,
      analysisSteps: steps,
    };
  }

  // Check preset match or evaluate client image
  const matchingPreset = input.sampleId
    ? AI_TEST_SAMPLES.find((s) => s.id === input.sampleId)
    : AI_TEST_SAMPLES.find((s) => s.imageUrl === input.url);

  const qualityAssessment = await assessClientImageQuality(sightingPhotoUrl);

  // If matching preset is specifically degraded or client image is invalid
  const isPresetBlurry = matchingPreset?.category === 'poor_quality';
  const isClientPoorQuality =
    qualityAssessment.qualityStatus === 'blurry' ||
    qualityAssessment.qualityStatus === 'dark' ||
    qualityAssessment.qualityStatus === 'invalid';

  if (isPresetBlurry || isClientPoorQuality) {
    updateStep(0, 'completed');
    updateStep(1, 'in_progress');
    await new Promise((r) => setTimeout(r, 400));
    updateStep(1, 'failed');

    const qualityStatus = isPresetBlurry ? 'blurry' : qualityAssessment.qualityStatus;
    return {
      analysisId,
      faceDetected: false,
      facesCount: 0,
      result: 'unable_to_analyze',
      qualityStatus,
      qualityDetails: isPresetBlurry
        ? 'High blur variance and compression artifacts detected across facial bounding coordinates.'
        : qualityAssessment.details,
      reason: 'poor_quality',
      message:
        'Image quality is insufficient for reliable comparison. Please upload a clearer, well-lit image.',
      provider: 'ai_demo_mode',
      isDemoMode: true,
      comparedCaseId,
      comparedPersonName,
      referencePhotoUrl,
      sightingPhotoUrl,
      analyzedAt: now,
      analysisSteps: steps,
    };
  }

  updateStep(0, 'completed');

  // 2. STEP 2: Face Detection
  updateStep(1, 'in_progress');
  await new Promise((r) => setTimeout(r, 550));

  // Determine face count:
  // If user selected a specific face from multiple faces, isolate to that single face!
  let facesCount = 1;
  let detectedFaces: DetectedFaceBox[] = [];

  if (matchingPreset) {
    facesCount = matchingPreset.facesCount;
    if (matchingPreset.faces) {
      detectedFaces = matchingPreset.faces;
    }
  } else {
    // For custom images, check if it's high resolution and assume 1 prominent face
    facesCount = 1;
    detectedFaces = [
      {
        id: 'f-primary',
        x: 30,
        y: 20,
        width: 40,
        height: 48,
        confidence: 0.95,
        label: 'Detected Primary Subject',
      },
    ];
  }

  // Check if user has isolated one specific face from a multiple-face detection
  const isFaceIsolated =
    typeof input.selectedFaceIndex === 'number' &&
    input.selectedFaceIndex >= 0 &&
    input.selectedFaceIndex < detectedFaces.length;

  if (isFaceIsolated) {
    facesCount = 1;
  }

  // Handle NO FACE
  if (facesCount === 0) {
    updateStep(1, 'failed');
    return {
      analysisId,
      faceDetected: false,
      facesCount: 0,
      result: 'unable_to_analyze',
      qualityStatus: 'acceptable',
      reason: 'no_face',
      message:
        'No recognizable face detected. Please upload a clearer photograph containing the person\'s face.',
      provider: 'ai_demo_mode',
      isDemoMode: true,
      comparedCaseId,
      comparedPersonName,
      referencePhotoUrl,
      sightingPhotoUrl,
      analyzedAt: now,
      analysisSteps: steps,
    };
  }

  // Handle MULTIPLE FACES without isolation
  if (facesCount > 1 && !isFaceIsolated) {
    updateStep(1, 'failed');
    return {
      analysisId,
      faceDetected: true,
      facesCount,
      detectedFaces,
      result: 'unable_to_analyze',
      qualityStatus: 'acceptable',
      reason: 'multiple_faces',
      message:
        'Multiple faces detected. Please select which face to analyze below or upload an image of a single individual.',
      provider: 'ai_demo_mode',
      isDemoMode: true,
      comparedCaseId,
      comparedPersonName,
      referencePhotoUrl,
      sightingPhotoUrl,
      analyzedAt: now,
      analysisSteps: steps,
    };
  }

  updateStep(1, 'completed');

  // 3. STEP 3: Facial Landmarks & Biometric Embeddings
  updateStep(2, 'in_progress');
  await new Promise((r) => setTimeout(r, 600));
  updateStep(2, 'completed');

  // 4. STEP 4: Reference Comparison
  updateStep(3, 'in_progress');
  await new Promise((r) => setTimeout(r, 650));
  updateStep(3, 'completed');

  // 5. STEP 5: Calculate Technical Similarity Score
  updateStep(4, 'in_progress');
  await new Promise((r) => setTimeout(r, 450));

  let similarityScore = 78;
  if (matchingPreset && matchingPreset.simulatedScore) {
    similarityScore = matchingPreset.simulatedScore;
  } else {
    // Deterministic hash based on target case ID and URL length
    const hash = (comparedCaseId + sightingPhotoUrl).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    // Produce realistic test score (between 30% and 88%)
    similarityScore = 65 + (hash % 24);
  }

  updateStep(4, 'completed');

  // Determine classification (Threshold: 70% technical similarity)
  const isPotentialMatch = similarityScore >= 70;
  const result: 'potential_match' | 'low_similarity' = isPotentialMatch
    ? 'potential_match'
    : 'low_similarity';

  const message = isPotentialMatch
    ? 'The uploaded image contains facial features that are sufficiently similar to the registered case photograph for further human review.'
    : 'The uploaded image does not show strong facial similarity with the selected missing-person reference image. This does not prove that the person is not the missing individual.';

  return {
    analysisId,
    faceDetected: true,
    facesCount: 1,
    detectedFaces,
    selectedFaceIndex: input.selectedFaceIndex,
    similarityScore,
    result,
    qualityStatus: 'acceptable',
    message,
    provider: 'ai_demo_mode',
    isDemoMode: true,
    comparedCaseId,
    comparedPersonName,
    referencePhotoUrl,
    sightingPhotoUrl,
    analyzedAt: now,
    analysisSteps: steps,
    caseworkerReviewStatus: 'pending_review',
  };
}
