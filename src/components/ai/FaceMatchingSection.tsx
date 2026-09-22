import React, { useState, useRef, useEffect } from 'react';
import { MissingPersonCase, AiMatchAnalysis } from '../../types';
import {
  analyzeFaceMatch,
  validateImageFile,
  readFileAsDataUrl,
  SightingImageInput,
} from '../../services/faceMatchingService';
import { AI_TEST_SAMPLES, AiTestSample } from '../../data/aiTestSamples';
import {
  Upload,
  Camera,
  AlertTriangle,
  CheckCircle2,
  X,
  Sparkles,
  RefreshCw,
  Cpu,
  Layers,
  Search,
  Users,
  Image as ImageIcon,
  ShieldAlert,
  ShieldCheck,
  Link,
  User,
} from 'lucide-react';

interface FaceMatchingSectionProps {
  selectedCase?: MissingPersonCase;
  onAnalysisComplete: (analysis: AiMatchAnalysis | null, photoUrl: string | null) => void;
  currentAnalysis: AiMatchAnalysis | null;
  currentPhotoUrl: string | null;
}

export const FaceMatchingSection: React.FC<FaceMatchingSectionProps> = ({
  selectedCase,
  onAnalysisComplete,
  currentAnalysis,
  currentPhotoUrl,
}) => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(currentPhotoUrl);
  const [activeSampleId, setActiveSampleId] = useState<string | null>(null);
  const [selectedFaceIndex, setSelectedFaceIndex] = useState<number | undefined>(undefined);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // If a case is selected after photo was already loaded, auto-run analysis
  useEffect(() => {
    if (photoPreview && selectedCase && !currentAnalysis && !isAnalyzing) {
      runAnalysis({
        url: photoPreview,
        dataUrl: photoPreview.startsWith('data:') ? photoPreview : undefined,
        sampleId: activeSampleId || undefined,
      }, photoPreview);
    }
  }, [selectedCase?.id]);

  const handleFileSelect = async (file: File) => {
    setValidationError(null);
    setActiveSampleId(null);
    setSelectedFaceIndex(undefined);

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid file.');
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setPhotoPreview(dataUrl);
      if (selectedCase) {
        runAnalysis({
          file,
          dataUrl,
          fileName: file.name,
          fileSize: file.size,
        }, dataUrl);
      } else {
        onAnalysisComplete(null, dataUrl);
      }
    } catch (err: any) {
      setValidationError(err.message || 'Failed to read image.');
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    setValidationError(null);
    setActiveSampleId(null);
    setSelectedFaceIndex(undefined);
    const url = customUrl.trim();
    setPhotoPreview(url);
    setShowUrlInput(false);

    if (selectedCase) {
      runAnalysis({ url }, url);
    } else {
      onAnalysisComplete(null, url);
    }
  };

  const handlePresetSelect = (sample: AiTestSample) => {
    setValidationError(null);
    setActiveSampleId(sample.id);
    setSelectedFaceIndex(undefined);
    setPhotoPreview(sample.imageUrl);

    if (selectedCase) {
      runAnalysis({
        url: sample.imageUrl,
        sampleId: sample.id,
      }, sample.imageUrl);
    } else {
      onAnalysisComplete(null, sample.imageUrl);
    }
  };

  const handleIsolateFace = (faceIndex: number) => {
    if (!photoPreview || !selectedCase) return;
    setSelectedFaceIndex(faceIndex);

    runAnalysis({
      url: photoPreview,
      dataUrl: photoPreview.startsWith('data:') ? photoPreview : undefined,
      sampleId: activeSampleId || undefined,
      selectedFaceIndex: faceIndex,
    }, photoPreview);
  };

  const runAnalysis = async (input: SightingImageInput, photoUrl: string) => {
    if (!selectedCase) {
      onAnalysisComplete(null, photoUrl);
      return;
    }

    setIsAnalyzing(true);
    setActiveStepIndex(0);

    try {
      const result = await analyzeFaceMatch(
        input,
        selectedCase.id,
        selectedCase.name,
        selectedCase.photoUrl,
        (stepIdx) => {
          setActiveStepIndex(stepIdx);
        }
      );

      onAnalysisComplete(result, photoUrl);
    } catch (err: any) {
      setValidationError(err.message || 'An unexpected error occurred during face analysis.');
      onAnalysisComplete(null, photoUrl);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setActiveSampleId(null);
    setSelectedFaceIndex(undefined);
    setValidationError(null);
    setCustomUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    onAnalysisComplete(null, null);
  };

  return (
    <div id="ai-face-matching-section" className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
              <Cpu size={15} className="text-blue-700" />
              Seen Person Current Picture & AI Facial Analysis
            </span>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
              AI VISION SCAN
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {selectedCase ? (
              <span>Compare your observation photograph against the official case file for <strong>{selectedCase.name}</strong>.</span>
            ) : (
              <span>Add a photo or snapshot of the person you observed. When a case is attached, AI will immediately run facial recognition.</span>
            )}
          </p>
        </div>

        {photoPreview && !isAnalyzing && (
          <button
            type="button"
            onClick={handleRemovePhoto}
            className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors font-semibold"
          >
            <X size={14} />
            <span>Remove Photograph</span>
          </button>
        )}
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 text-xs flex items-start gap-2 animate-fadeIn">
          <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Image Validation Notice:</span>
            <span>{validationError}</span>
          </div>
        </div>
      )}

      {/* Quick Test Presets Toolbar */}
      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/90 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-500" />
            Quick Test Presets (1-Click Sample Sighting Photos):
          </span>
          <span className="text-[10px] text-slate-500">Test AI facial analysis with sample pictures</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {AI_TEST_SAMPLES.map((sample) => {
            const isSelected = activeSampleId === sample.id;
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => handlePresetSelect(sample)}
                disabled={isAnalyzing}
                className={`p-2 rounded-lg text-left border text-xs transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                } ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <img
                    src={sample.imageUrl}
                    alt={sample.name}
                    className="w-6 h-6 rounded object-cover border border-slate-200 shrink-0"
                  />
                  <span className="font-bold text-[11px] text-slate-800 truncate">
                    {sample.category === 'high_match' && 'High Match'}
                    {sample.category === 'low_similarity' && 'Low Similarity'}
                    {sample.category === 'no_face' && 'No Face'}
                    {sample.category === 'multiple_faces' && 'Multi-Faces'}
                    {sample.category === 'poor_quality' && 'Blurry Quality'}
                  </span>
                </div>
                <span
                  className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-sm truncate ${
                    sample.category === 'high_match'
                      ? 'bg-emerald-50 text-emerald-800'
                      : sample.category === 'low_similarity'
                      ? 'bg-slate-100 text-slate-700'
                      : 'bg-amber-50 text-amber-800'
                  }`}
                >
                  {sample.tag}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Photo Input Area (Upload / Camera / URL) */}
      {!photoPreview && (
        <div className="space-y-3">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileSelect(e.dataTransfer.files[0]);
              }
            }}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all ${
              isDragOver
                ? 'border-blue-600 bg-blue-50/50'
                : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50/70 bg-white'
            }`}
          >
            {/* Hidden file & camera inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-3 border border-blue-100 shadow-2xs">
              <Camera size={24} />
            </div>

            <p className="text-sm font-bold text-slate-900">
              Add Seen Person&apos;s Current Picture
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Upload a snapshot, take a live photo, or drag &amp; drop an image. AI will analyze facial features and compare geometry with the registered case.
            </p>

            {/* Quick Action Buttons for adding image */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                id="btn-upload-seen-file"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <Upload size={14} />
                <span>Upload Photo File</span>
              </button>

              <button
                type="button"
                id="btn-camera-seen-snap"
                onClick={() => cameraInputRef.current?.click()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <Camera size={14} />
                <span>Take Photo with Camera</span>
              </button>

              <button
                type="button"
                id="btn-url-seen-link"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Link size={14} />
                <span>Paste Image URL</span>
              </button>
            </div>
          </div>

          {/* Paste Image URL Box */}
          {showUrlInput && (
            <form onSubmit={handleUrlSubmit} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 animate-in fade-in">
              <Link size={16} className="text-slate-400 shrink-0" />
              <input
                type="url"
                required
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://example.com/seen-person-photo.jpg"
                className="flex-1 text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shrink-0"
              >
                Load Picture
              </button>
            </form>
          )}
        </div>
      )}

      {/* Preview & Side-by-Side Analysis Section */}
      {photoPreview && (
        <div className="space-y-4">
          {/* Photos Side-by-Side Reference Preview */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* Reference Case Photo */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 uppercase text-[11px] flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-blue-600" />
                    Official Case Reference Photo
                  </span>
                  {selectedCase ? (
                    <span className="font-mono text-slate-500 text-[11px]">#{selectedCase.id}</span>
                  ) : (
                    <span className="text-[11px] text-amber-600 font-semibold">Awaiting Case Selection</span>
                  )}
                </div>
                <div className="relative aspect-4/3 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                  {selectedCase ? (
                    <>
                      <img
                        src={selectedCase.photoUrl}
                        alt={`Reference case ${selectedCase.name}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-xs text-white px-2.5 py-0.5 rounded text-[11px] font-bold">
                        {selectedCase.name}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-slate-400 bg-slate-50">
                      <User size={32} className="text-slate-300 mb-1.5" />
                      <span className="text-xs font-semibold text-slate-600">No Case Attached Yet</span>
                      <span className="text-[11px] text-slate-400 mt-0.5">Select a missing person case in Step 1 to compare</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Uploaded Sighting Photo: Seen Person Current Picture */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 uppercase text-[11px] flex items-center gap-1.5">
                    <Camera size={13} className="text-emerald-600" />
                    Seen Person Current Picture
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-700 hover:text-blue-900 font-semibold text-[11px] flex items-center gap-1"
                    >
                      <RefreshCw size={11} />
                      <span>Change Picture</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="text-rose-600 hover:text-rose-800 font-semibold text-[11px] flex items-center gap-1"
                    >
                      <X size={11} />
                      <span>Remove</span>
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                  />
                </div>

                <div className="relative aspect-4/3 bg-slate-100 rounded-xl overflow-hidden border-2 border-emerald-500/60 shadow-2xs">
                  <img
                    src={photoPreview}
                    alt="Seen Person Current Picture"
                    className="w-full h-full object-cover"
                  />

                  {/* Multiple faces overlay indicators */}
                  {currentAnalysis?.reason === 'multiple_faces' &&
                    currentAnalysis.detectedFaces &&
                    currentAnalysis.detectedFaces.map((face, idx) => (
                      <button
                        key={face.id}
                        type="button"
                        onClick={() => handleIsolateFace(idx)}
                        style={{
                          left: `${face.x}%`,
                          top: `${face.y}%`,
                          width: `${face.width}%`,
                          height: `${face.height}%`,
                        }}
                        title={`Click to analyze ${face.label || `Subject #${idx + 1}`}`}
                        className={`absolute border-2 rounded transition-all flex flex-col justify-between p-1 text-[10px] font-bold ${
                          selectedFaceIndex === idx
                            ? 'border-blue-500 bg-blue-500/20 text-white shadow-lg'
                            : 'border-amber-400 bg-amber-500/10 text-amber-200 hover:bg-amber-500/30'
                        }`}
                      >
                        <span className="bg-slate-900/90 text-white px-1 py-0.2 rounded text-[9px]">
                          {face.label || `Face ${idx + 1}`}
                        </span>
                        <span className="bg-blue-600 text-white px-1 py-0.2 rounded text-[8px] self-end">
                          Click to Compare
                        </span>
                      </button>
                    ))}

                  <div className="absolute bottom-2 left-2 bg-emerald-950/90 backdrop-blur-xs text-emerald-200 px-2.5 py-0.5 rounded text-[11px] font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    <span>Current Sighting Photo Added</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Prompt if case not yet selected */}
            {!selectedCase && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                  <span>Seen person picture is loaded! Please select a missing person case in Step 1 to trigger AI facial matching.</span>
                </div>
              </div>
            )}
          </div>

          {/* Active Stepwise Progression State */}
          {isAnalyzing && (
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-md space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 animate-spin">
                    <RefreshCw size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300">
                      AI Analysis in Progress
                    </h4>
                    <p className="text-xs text-slate-300">
                      Analyzing facial geometry and computing vector embeddings...
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-900/80 text-blue-200 border border-blue-700">
                  Step {activeStepIndex + 1} of 5
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${((activeStepIndex + 1) / 5) * 100}%` }}
                ></div>
              </div>

              {/* Step indicator pills */}
              <div className="space-y-1.5 text-xs text-slate-400">
                {[
                  '1. Validating image resolution, orientation, and format',
                  '2. Scanning image for recognizable facial structures',
                  '3. Analyzing facial geometry, landmarks, and feature vectors',
                  '4. Comparing feature vectors against registered case reference photograph',
                  '5. Synthesizing similarity report and safety metrics',
                ].map((step, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 text-xs transition-colors ${
                      idx === activeStepIndex
                        ? 'text-blue-300 font-bold'
                        : idx < activeStepIndex
                        ? 'text-emerald-400 font-medium'
                        : 'text-slate-600'
                    }`}
                  >
                    {idx < activeStepIndex ? (
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    ) : idx === activeStepIndex ? (
                      <div className="w-3 h-3 rounded-full border-2 border-blue-400 border-t-transparent animate-spin shrink-0"></div>
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-slate-800 shrink-0"></div>
                    )}
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analysis Result Panel (When Finished) */}
          {!isAnalyzing && currentAnalysis && (
            <div className="space-y-3">
              {/* STATE 1: POTENTIAL MATCH */}
              {currentAnalysis.result === 'potential_match' && (
                <div
                  id="ai-result-potential-match"
                  className="bg-white border-2 border-amber-400/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-sans flex items-center gap-1 shadow-2xs">
                          <Sparkles size={13} />
                          Potential Match
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          Ref #{currentAnalysis.analysisId}
                        </span>
                      </div>

                      <h4 className="text-xl sm:text-2xl font-black text-slate-950 mt-1 tracking-tight">
                        Facial Feature Similarity Detected
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Compared against <strong>{selectedCase.name}</strong> (Case #{selectedCase.id}).
                      </p>
                    </div>

                    {/* Technical Similarity Score Badge */}
                    <div className="bg-amber-50 border border-amber-300 rounded-xl px-4 py-2.5 text-center shrink-0">
                      <span className="text-[10px] uppercase font-bold text-amber-900 block tracking-wider">
                        Technical Similarity Score
                      </span>
                      <span className="text-3xl font-black text-amber-950 font-sans block">
                        {currentAnalysis.similarityScore}%
                      </span>
                      <span className="text-[9px] text-amber-800/80 font-medium block">
                        Geometric vector alignment
                      </span>
                    </div>
                  </div>

                  {/* AI Assessment Statement */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed space-y-1">
                    <strong className="block text-slate-900 text-[11px] uppercase tracking-wider">
                      Automated Assessment Summary:
                    </strong>
                    <p>{currentAnalysis.message}</p>
                  </div>

                  {/* MANDATORY SAFETY WARNING BANNER */}
                  <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-3.5 text-xs text-amber-950 flex items-start gap-2.5">
                    <ShieldAlert size={18} className="text-amber-700 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <strong className="block text-amber-950 font-bold">
                        ⚠ Safety Protocol: AI analysis is NOT proof of identity.
                      </strong>
                      <p className="leading-relaxed">
                        The similarity score represents a technical measure of facial feature vector similarity, <strong>NOT a probability of identity</strong>. Human verification by authorized caseworkers and law enforcement is strictly required before confirming identification.
                      </p>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                    <span>Provider: FindSafe Biometric Comparison Engine (Demo Mode)</span>
                    <span>Status: Eligible for Caseworker Priority Review</span>
                  </div>
                </div>
              )}

              {/* STATE 2: LOW SIMILARITY */}
              {currentAnalysis.result === 'low_similarity' && (
                <div
                  id="ai-result-low-similarity"
                  className="bg-white border border-slate-300 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800">
                          No Strong Similarity Detected
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          Ref #{currentAnalysis.analysisId}
                        </span>
                      </div>

                      <h4 className="text-lg font-bold text-slate-900 mt-1">
                        Low Facial Feature Alignment
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Compared against <strong>{selectedCase.name}</strong> (Case #{selectedCase.id}).
                      </p>
                    </div>

                    <div className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 text-center shrink-0">
                      <span className="text-[10px] uppercase font-bold text-slate-600 block tracking-wider">
                        Technical Similarity Score
                      </span>
                      <span className="text-2xl font-black text-slate-800 font-sans block">
                        {currentAnalysis.similarityScore}%
                      </span>
                      <span className="text-[9px] text-slate-500 font-medium block">
                        Below confidence threshold
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    {currentAnalysis.message}
                  </p>

                  <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-blue-700 shrink-0 mt-0.5" />
                    <span>
                      <strong>Submission Still Permitted:</strong> Even with low algorithmic similarity, you may still transmit this sighting report. Sighting details, transit times, and clothing matches remain valuable for investigative teams.
                    </span>
                  </div>
                </div>
              )}

              {/* STATE 3: UNABLE TO ANALYZE */}
              {currentAnalysis.result === 'unable_to_analyze' && (
                <div
                  id="ai-result-unable-to-analyze"
                  className="bg-white border-2 border-rose-300 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                      <AlertTriangle size={22} />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-sans">
                        Unable to Complete Analysis
                      </span>
                      <h4 className="text-lg font-bold text-slate-950 mt-1">
                        {currentAnalysis.reason === 'no_face' && 'No Recognizable Face Detected'}
                        {currentAnalysis.reason === 'multiple_faces' && 'Multiple Faces Detected in Photograph'}
                        {currentAnalysis.reason === 'poor_quality' && 'Insufficient Image Quality'}
                        {currentAnalysis.reason === 'unsupported_format' && 'Unsupported File Format'}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {currentAnalysis.message}
                      </p>
                    </div>
                  </div>

                  {/* Specific Resolution Guidance */}
                  {currentAnalysis.reason === 'no_face' && (
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                      <strong className="block text-slate-900">Required Action:</strong>
                      <p>
                        The facial detection algorithm was unable to identify human facial landmarks in this image. Please upload a portrait or observation where the individual&apos;s face is unobstructed and facing the camera.
                      </p>
                    </div>
                  )}

                  {currentAnalysis.reason === 'multiple_faces' && currentAnalysis.detectedFaces && (
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-3">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-amber-700" />
                        <span className="font-bold">
                          Select the detected face you wish to isolate and compare:
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {currentAnalysis.detectedFaces.map((face, idx) => (
                          <button
                            key={face.id}
                            type="button"
                            onClick={() => handleIsolateFace(idx)}
                            className="px-3 py-1.5 rounded-lg bg-white hover:bg-amber-100 text-slate-900 font-bold border border-amber-300 text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
                          >
                            <Layers size={13} className="text-amber-600" />
                            <span>{face.label || `Subject #${idx + 1}`}</span>
                          </button>
                        ))}
                      </div>
                      <p className="text-[11px] text-amber-800">
                        Or click directly on any highlighted box on the image above.
                      </p>
                    </div>
                  )}

                  {currentAnalysis.reason === 'poor_quality' && (
                    <div className="bg-rose-50/80 p-3.5 rounded-xl border border-rose-200 text-xs text-rose-950 space-y-1">
                      <strong className="block font-bold">Quality Standard Explanation:</strong>
                      <p>
                        FindSafe enforces strict visual quality minimums to prevent erroneous facial matches. Images with extreme motion blur, low luminosity, or low resolution cannot be verified reliably.
                      </p>
                      {currentAnalysis.qualityDetails && (
                        <p className="font-mono text-[11px] text-rose-800 mt-1">
                          Diagnostic: {currentAnalysis.qualityDetails}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
