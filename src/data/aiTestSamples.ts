export interface AiTestSample {
  id: string;
  name: string;
  category: 'high_match' | 'low_similarity' | 'no_face' | 'multiple_faces' | 'poor_quality';
  tag: string;
  imageUrl: string;
  recommendedCaseId: string;
  description: string;
  expectedOutcome: string;
  simulatedScore?: number;
  facesCount: number;
  qualityStatus: 'acceptable' | 'blurry' | 'dark' | 'obstructed' | 'invalid';
  reason?: 'no_face' | 'multiple_faces' | 'poor_quality';
  faces?: {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
    label: string;
  }[];
}

export const AI_TEST_SAMPLES: AiTestSample[] = [
  {
    id: 'sample-high-match',
    name: 'Sample A: High Feature Similarity',
    category: 'high_match',
    tag: 'Potential Match (~87%)',
    // Young woman with wavy brown hair resembling Elena Rostova (Case FS-2025-0841)
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
    recommendedCaseId: 'FS-2025-0841',
    description: 'Clear portrait with similar facial geometry, eye spacing, and jawline contours matching registered reference case.',
    expectedOutcome: 'Potential Match (87% Similarity Score) — Eligible for caseworker review.',
    simulatedScore: 87,
    facesCount: 1,
    qualityStatus: 'acceptable',
  },
  {
    id: 'sample-low-similarity',
    name: 'Sample B: Low Similarity Sighting',
    category: 'low_similarity',
    tag: 'Low Similarity (~34%)',
    // Young man / completely different facial structure
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
    recommendedCaseId: 'FS-2025-0841',
    description: 'High-quality photograph with clear facial visibility, but distinct facial geometry differing from the reference case.',
    expectedOutcome: 'No Strong Similarity (34% Similarity Score) — Can still be submitted as a general tip.',
    simulatedScore: 34,
    facesCount: 1,
    qualityStatus: 'acceptable',
  },
  {
    id: 'sample-no-face',
    name: 'Sample C: No Recognizable Face',
    category: 'no_face',
    tag: 'Validation: 0 Faces Detected',
    // Empty transit platform / backpack / bench scenery
    imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&auto=format&fit=crop&q=80',
    recommendedCaseId: 'FS-2025-0841',
    description: 'Urban train station platform with personal items and benches, but no discernible human face.',
    expectedOutcome: 'Unable to Analyze — System correctly rejects photograph: "No recognizable face detected".',
    facesCount: 0,
    qualityStatus: 'acceptable',
    reason: 'no_face',
  },
  {
    id: 'sample-multiple-faces',
    name: 'Sample D: Multiple Faces in Crowd',
    category: 'multiple_faces',
    tag: 'Validation: Multiple Faces Detected',
    // Group of 3 people walking in an urban public space
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop&q=80',
    recommendedCaseId: 'FS-2025-0841',
    description: 'Public observation photograph containing 3 individuals in frame. Requires face isolation.',
    expectedOutcome: 'Multiple Faces Detected — Prompts user to select which detected face to isolate and compare.',
    facesCount: 3,
    qualityStatus: 'acceptable',
    reason: 'multiple_faces',
    faces: [
      { id: 'f1', x: 22, y: 25, width: 20, height: 28, confidence: 0.94, label: 'Subject 1 (Left)' },
      { id: 'f2', x: 48, y: 28, width: 22, height: 30, confidence: 0.96, label: 'Subject 2 (Center)' },
      { id: 'f3', x: 74, y: 26, width: 19, height: 27, confidence: 0.91, label: 'Subject 3 (Right)' },
    ],
  },
  {
    id: 'sample-poor-quality',
    name: 'Sample E: Degraded / Blurry Quality',
    category: 'poor_quality',
    tag: 'Validation: Insufficient Quality',
    // Motion blurred / degraded dark photo
    imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop&q=80',
    recommendedCaseId: 'FS-2025-0841',
    description: 'Heavily motion-blurred, low-contrast surveillance capture where facial landmarks cannot be reliably extracted.',
    expectedOutcome: 'Unable to Analyze — "Image quality is insufficient for reliable comparison".',
    facesCount: 1,
    qualityStatus: 'blurry',
    reason: 'poor_quality',
  },
];
