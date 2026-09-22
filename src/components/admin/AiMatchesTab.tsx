import React, { useState } from 'react';
import { SightingReport, MissingPersonCase } from '../../types';
import {
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Eye,
  AlertTriangle,
  Layers,
  ZoomIn,
  Lock,
  Clock,
  MapPin,
  Maximize2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface AiMatchesTabProps {
  sightings: SightingReport[];
  cases: MissingPersonCase[];
  onReviewMatch: (
    sightingId: string,
    action: 'reject' | 'confirm_sighting' | 'confirm_found',
    notes?: string
  ) => void;
}

export const AiMatchesTab: React.FC<AiMatchesTabProps> = ({
  sightings,
  cases,
  onReviewMatch,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'reviewed'>('pending');
  const [activeInspectionSightingId, setActiveInspectionSightingId] = useState<string | null>(null);
  const [inspectionViewMode, setInspectionViewMode] = useState<'side_by_side' | 'grid_landmarks'>('side_by_side');
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});

  // Filter sightings that have AI analysis attached
  const aiSightings = sightings.filter((s) => s.aiAnalysis !== undefined);

  const filteredSightings = aiSightings.filter((s) => {
    if (filterMode === 'pending') {
      return (
        s.aiAnalysis?.caseworkerReviewStatus === 'pending_review' ||
        !s.aiAnalysis?.caseworkerReviewStatus
      );
    }
    if (filterMode === 'reviewed') {
      return (
        s.aiAnalysis?.caseworkerReviewStatus &&
        s.aiAnalysis.caseworkerReviewStatus !== 'pending_review'
      );
    }
    return true;
  });

  const handleNoteChange = (sightingId: string, val: string) => {
    setNotesMap((prev) => ({ ...prev, [sightingId]: val }));
  };

  const handleAction = (
    sightingId: string,
    action: 'reject' | 'confirm_sighting' | 'confirm_found'
  ) => {
    const note = notesMap[sightingId] || '';
    onReviewMatch(sightingId, action, note);
  };

  return (
    <div className="space-y-5">
      {/* Tab Control Bar & Safety Banner */}
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 text-xs text-amber-950 flex items-start gap-2.5">
        <ShieldAlert size={18} className="text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <strong className="block text-amber-950 font-bold">
            Caseworker Verification Protocol for AI Potential Matches
          </strong>
          <p className="leading-relaxed">
            AI similarity scores represent automated geometric vector similarity metrics, <strong>never proof of identity</strong>. Authorized caseworkers must conduct human cross-referencing against physical scars, dental records, tattoos, and law enforcement findings before altering official case statuses.
          </p>
        </div>
      </div>

      {/* Filter and Metrics Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-medium mr-1 text-[11px] uppercase tracking-wider">
            Queue Filter:
          </span>
          <button
            type="button"
            onClick={() => setFilterMode('pending')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              filterMode === 'pending'
                ? 'bg-blue-700 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Pending Review (
            {
              aiSightings.filter(
                (s) =>
                  s.aiAnalysis?.caseworkerReviewStatus === 'pending_review' ||
                  !s.aiAnalysis?.caseworkerReviewStatus
              ).length
            }
            )
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('reviewed')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              filterMode === 'reviewed'
                ? 'bg-blue-700 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Reviewed Matches
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              filterMode === 'all'
                ? 'bg-blue-700 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            All AI Analyzed ({aiSightings.length})
          </button>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>FindSafe Biometric Comparison Core Active</span>
        </div>
      </div>

      {/* Sightings List */}
      {filteredSightings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 p-6 space-y-2">
          <Sparkles size={32} className="mx-auto text-slate-300" />
          <h4 className="text-sm font-bold text-slate-800">
            No AI Matches in Selected Queue
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {filterMode === 'pending'
              ? 'All AI-assisted potential matches have been reviewed by a caseworker. You can submit a sighting photo via the Report Sighting page to generate new matches.'
              : 'No AI match entries match the current filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSightings.map((sighting) => {
            const ai = sighting.aiAnalysis!;
            const targetCase = cases.find(
              (c) => c.id.toLowerCase() === sighting.caseId.toLowerCase()
            );
            const isInspectionOpen = activeInspectionSightingId === sighting.id;
            const currentNote = notesMap[sighting.id] || '';
            const isPending =
              ai.caseworkerReviewStatus === 'pending_review' ||
              !ai.caseworkerReviewStatus;

            return (
              <div
                key={sighting.id}
                id={`ai-match-card-${sighting.id}`}
                className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                  ai.result === 'potential_match'
                    ? 'border-amber-300 shadow-sm'
                    : 'border-slate-200 shadow-2xs'
                }`}
              >
                {/* Header Bar */}
                <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                        {sighting.id}
                      </span>
                      {ai.result === 'potential_match' ? (
                        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 flex items-center gap-1 font-sans shadow-2xs">
                          <Sparkles size={12} />
                          Potential Match ({ai.similarityScore}% Similarity)
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                          Low Similarity ({ai.similarityScore}%)
                        </span>
                      )}

                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                        AI DEMO MODE
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-950 flex items-center gap-2">
                      <span>Target Missing Person: {sighting.personName}</span>
                      <span className="text-xs font-normal text-slate-500">
                        (Case Ref #{sighting.caseId})
                      </span>
                    </h4>
                  </div>

                  {/* Similarity metric pill */}
                  <div className="flex items-center gap-3">
                    <div className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-center shadow-2xs">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">
                        Similarity Score
                      </span>
                      <span className="text-xl font-black text-slate-900 font-sans block">
                        {ai.similarityScore}%
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setActiveInspectionSightingId(isInspectionOpen ? null : sighting.id)
                      }
                      className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold flex items-center gap-1.5 border border-blue-200 transition-colors"
                    >
                      <ZoomIn size={14} />
                      <span>{isInspectionOpen ? 'Close Side-by-Side' : 'Side-by-Side Review'}</span>
                    </button>
                  </div>
                </div>

                {/* Evidence Comparison Preview */}
                <div className="p-4 sm:p-5 space-y-4">
                  {/* Photo Side-by-Side Comparison Container */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Registered Reference Photo */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 uppercase text-[11px]">
                          1. Official Case Reference Photo
                        </span>
                        <span className="text-slate-500 font-mono text-[11px]">
                          Case #{sighting.caseId}
                        </span>
                      </div>
                      <div className="relative aspect-4/3 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                        <img
                          src={targetCase?.photoUrl || ai.referencePhotoUrl}
                          alt="Official reference"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[11px] font-bold">
                          {sighting.personName} (Reference)
                        </div>
                      </div>
                    </div>

                    {/* Sighting Photo */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 uppercase text-[11px]">
                          2. Public Sighting Observation Photo
                        </span>
                        <span className="text-slate-500 font-mono text-[11px]">
                          Ref #{sighting.id}
                        </span>
                      </div>
                      <div className="relative aspect-4/3 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                        <img
                          src={sighting.photoUrl || ai.sightingPhotoUrl}
                          alt="Sighting observation"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[11px] font-medium">
                          Uploaded Public Observation
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Full Inspection Drawer (When expanded) */}
                  {isInspectionOpen && (
                    <div className="bg-slate-900 text-slate-100 p-5 rounded-xl border border-slate-800 space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <Maximize2 size={16} className="text-blue-400" />
                          <h5 className="text-xs font-bold uppercase tracking-wider text-white">
                            Biometric Evidence Inspection Desk
                          </h5>
                        </div>

                        <div className="flex items-center gap-1 text-xs">
                          <button
                            type="button"
                            onClick={() => setInspectionViewMode('side_by_side')}
                            className={`px-2.5 py-1 rounded text-xs font-semibold ${
                              inspectionViewMode === 'side_by_side'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            Side-by-Side Dual Zoom
                          </button>
                          <button
                            type="button"
                            onClick={() => setInspectionViewMode('grid_landmarks')}
                            className={`px-2.5 py-1 rounded text-xs font-semibold ${
                              inspectionViewMode === 'grid_landmarks'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            Landmark Alignment Overlay
                          </button>
                        </div>
                      </div>

                      {/* Side by side magnified comparison */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-[11px] text-slate-400 block font-medium">
                            Reference Image Contour & Landmark Map
                          </span>
                          <div className="relative aspect-square bg-black rounded-lg overflow-hidden border border-slate-700">
                            <img
                              src={targetCase?.photoUrl || ai.referencePhotoUrl}
                              alt="Reference magnified"
                              className="w-full h-full object-contain"
                            />
                            {inspectionViewMode === 'grid_landmarks' && (
                              <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px] opacity-40 pointer-events-none"></div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[11px] text-slate-400 block font-medium">
                            Sighting Image Feature Vectors ({ai.similarityScore}% geometric match)
                          </span>
                          <div className="relative aspect-square bg-black rounded-lg overflow-hidden border border-slate-700">
                            <img
                              src={sighting.photoUrl || ai.sightingPhotoUrl}
                              alt="Sighting magnified"
                              className="w-full h-full object-contain"
                            />
                            {inspectionViewMode === 'grid_landmarks' && (
                              <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:12px_12px] opacity-40 pointer-events-none"></div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-800/80 p-3 rounded-lg text-[11px] text-slate-300 leading-relaxed">
                        <strong>Caseworker Diagnostic:</strong> Facial landmarks (interpupillary distance, nasal bridge slope, and jawline curvature) evaluated. Match index: {ai.similarityScore}/100.
                      </div>
                    </div>
                  )}

                  {/* Sighting Details & Confidential Submitter Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                      <strong className="block text-slate-900 font-bold uppercase text-[10px] tracking-wider">
                        Sighting Observation Details
                      </strong>
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <MapPin size={13} className="text-slate-400 shrink-0" />
                        <span>
                          {sighting.location.address ? `${sighting.location.address}, ` : ''}
                          {sighting.location.city}, {sighting.location.state}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Clock size={13} className="text-slate-400 shrink-0" />
                        <span>
                          {sighting.date} at {sighting.time}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1 italic">&ldquo;{sighting.description}&rdquo;</p>
                    </div>

                    <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200 space-y-1.5 text-blue-950">
                      <div className="flex items-center gap-1.5 text-blue-900 font-bold uppercase text-[10px] tracking-wider">
                        <Lock size={12} className="text-blue-700 shrink-0" />
                        <span>Confidential Submitter Contact</span>
                      </div>
                      {sighting.contactInfo?.isAnonymous ? (
                        <p className="text-slate-500 italic">Submitted Anonymously by member of public.</p>
                      ) : (
                        <div className="space-y-0.5 text-[11px]">
                          <p>
                            Name: <strong>{sighting.contactInfo?.name || 'Not specified'}</strong>
                          </p>
                          <p>
                            Email: <strong>{sighting.contactInfo?.email || 'Not specified'}</strong>
                          </p>
                          <p>
                            Phone: <strong>{sighting.contactInfo?.phone || 'Not specified'}</strong>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Caseworker Action Controls */}
                  {isPending ? (
                    <div className="pt-3 border-t border-slate-200 space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Caseworker Verification Notes (Official Audit Log):
                        </label>
                        <input
                          type="text"
                          value={currentNote}
                          onChange={(e) => handleNoteChange(sighting.id, e.target.value)}
                          placeholder="e.g. Reviewed biometric match with Detective Cole; features warrant immediate dispatch."
                          className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-2.5">
                        {/* 1. Reject Match */}
                        <button
                          type="button"
                          onClick={() => handleAction(sighting.id, 'reject')}
                          className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
                        >
                          <XCircle size={15} className="text-rose-600" />
                          <span>Reject AI Match</span>
                        </button>

                        {/* 2. Confirm Sighting */}
                        <button
                          type="button"
                          onClick={() => handleAction(sighting.id, 'confirm_sighting')}
                          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                        >
                          <Eye size={15} />
                          <span>Confirm Sighting (Update to &ldquo;Sighting Reported&rdquo;)</span>
                        </button>

                        {/* 3. Verify Found Safe */}
                        <button
                          type="button"
                          onClick={() => handleAction(sighting.id, 'confirm_found')}
                          className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <CheckCircle2 size={15} />
                          <span>Verify Found Safe (Official Resolution)</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 bg-slate-50/50 p-2.5 rounded-xl">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={15} className="text-emerald-600" />
                        <span className="font-bold text-slate-800">
                          {ai.caseworkerReviewStatus === 'confirmed_found' && 'Officially Verified: Person Found Safe'}
                          {ai.caseworkerReviewStatus === 'confirmed_sighting' && 'Caseworker Verified: Confirmed as Credible Sighting'}
                          {ai.caseworkerReviewStatus === 'rejected' && 'Caseworker Reviewed: Match Rejected as Inaccurate'}
                        </span>
                      </div>
                      {ai.caseworkerReviewNotes && (
                        <span className="text-[11px] text-slate-500 italic">
                          &ldquo;{ai.caseworkerReviewNotes}&rdquo;
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
