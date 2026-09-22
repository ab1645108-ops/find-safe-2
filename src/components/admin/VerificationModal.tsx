import React, { useState } from 'react';
import { useCases } from '../../context/CaseContext';
import { SightingReport, CaseStatus } from '../../types';
import { ShieldCheck, CheckCircle2, Eye, XCircle, AlertTriangle, UserCheck, RefreshCw, X, Sparkles } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { AiMatchesTab } from './AiMatchesTab';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelectedCaseId?: string;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  initialSelectedCaseId,
}) => {
  const {
    cases,
    sightings,
    verifySighting,
    reviewAiMatch,
    updateCaseStatus,
    resetToMockData,
    pendingAiMatchesCount,
  } = useCases();
  const [activeTab, setActiveTab] = useState<'pending' | 'ai_matches' | 'all' | 'manual'>('pending');
  const [selectedCaseId, setSelectedCaseId] = useState<string>(initialSelectedCaseId || cases[0]?.id || '');
  const [caseworkerNote, setCaseworkerNote] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const pendingSightings = sightings.filter((s) => s.verificationStatus === 'pending');
  const displaySightings = activeTab === 'pending' ? pendingSightings : sightings;

  const handleAiMatchReview = (
    sightingId: string,
    action: 'reject' | 'confirm_sighting' | 'confirm_found',
    notes?: string
  ) => {
    reviewAiMatch(sightingId, action, notes);
    const feedback =
      action === 'confirm_found'
        ? `Case officially verified as Found Safe based on corroborated physical evidence.`
        : action === 'confirm_sighting'
        ? `Sighting confirmed by caseworker. Case status promoted to "Sighting Reported".`
        : `AI potential match reviewed and rejected by caseworker.`;
    setActionFeedback(feedback);
    setTimeout(() => setActionFeedback(null), 4500);
  };

  const handleVerifyFound = (sighting: SightingReport) => {
    verifySighting(sighting.id, 'verify_found', caseworkerNote || 'Verified by authorized case supervisor.');
    setActionFeedback(`Case #${sighting.caseId} officially verified and updated to status "Found Safe".`);
    setCaseworkerNote('');
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleVerifySighting = (sighting: SightingReport) => {
    verifySighting(sighting.id, 'verify_sighting', caseworkerNote || 'Credible sighting verified by coordinator.');
    setActionFeedback(`Sighting #${sighting.id} verified. Case status updated to "Sighting Reported".`);
    setCaseworkerNote('');
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleDismiss = (sighting: SightingReport) => {
    verifySighting(sighting.id, 'dismiss', caseworkerNote || 'Unable to confirm or match description.');
    setActionFeedback(`Sighting #${sighting.id} marked as dismissed.`);
    setCaseworkerNote('');
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleManualStatusChange = (newStatus: CaseStatus) => {
    if (!selectedCaseId) return;
    updateCaseStatus(selectedCaseId, newStatus, caseworkerNote || `Administrative update by authorized user.`);
    setActionFeedback(`Case #${selectedCaseId} status manually updated to "${newStatus}".`);
    setCaseworkerNote('');
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const selectedCase = cases.find((c) => c.id === selectedCaseId);

  return (
    <div
      id="verification-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="verification-modal-container"
        className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-slate-100 p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold tracking-tight text-white">
                  Authorized Verification & Caseworker Desk
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Authorized Role
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Review community reports, verify potential finds, and legally update official statuses.
              </p>
            </div>
          </div>

          <button
            id="btn-close-verification"
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-xs px-5 py-2.5 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span className="font-medium">{actionFeedback}</span>
          </div>
        )}

        {/* Tab Controls */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              id="tab-pending-sightings"
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'pending'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>Pending Sighting Reviews</span>
              {pendingSightings.length > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeTab === 'pending' ? 'bg-blue-900 text-blue-100' : 'bg-rose-100 text-rose-700 font-bold'
                  }`}
                >
                  {pendingSightings.length}
                </span>
              )}
            </button>

            {/* AI-Assisted Potential Matches Tab */}
            <button
              id="tab-ai-matches"
              type="button"
              onClick={() => setActiveTab('ai_matches')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'ai_matches'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Sparkles
                size={13}
                className={activeTab === 'ai_matches' ? 'text-amber-300' : 'text-amber-500'}
              />
              <span>AI-Assisted Potential Matches</span>
              {pendingAiMatchesCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === 'ai_matches'
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  {pendingAiMatchesCount}
                </span>
              )}
            </button>

            <button
              id="tab-all-sightings"
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeTab === 'all'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Sightings History ({sightings.length})
            </button>

            <button
              id="tab-manual-case-override"
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeTab === 'manual'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Direct Case Status Manager
            </button>
          </div>

          <button
            id="btn-reset-demo-data"
            type="button"
            onClick={() => {
              if (window.confirm('Reset all demo cases and sightings to original mock data?')) {
                resetToMockData();
                setActionFeedback('Demo data reset to baseline mock records.');
              }
            }}
            className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition-colors"
            title="Restore default mock records"
          >
            <RefreshCw size={12} />
            <span>Reset Demo Data</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'ai_matches' ? (
            /* AI-Assisted Potential Matches Tab */
            <AiMatchesTab
              sightings={sightings}
              cases={cases}
              onReviewMatch={handleAiMatchReview}
            />
          ) : activeTab === 'manual' ? (
            /* Manual Case Status Control */
            <div className="space-y-5">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Case to Manage
                </label>
                <select
                  id="select-manage-case"
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} — {c.name} (Current: {c.status})
                    </option>
                  ))}
                </select>
              </div>

              {selectedCase && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{selectedCase.name}</h4>
                      <p className="text-xs text-slate-500">Case Ref: {selectedCase.id} | Age: {selectedCase.age}</p>
                    </div>
                    <div>
                      <StatusBadge status={selectedCase.status} size="md" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Official Caseworker Verification Note:
                    </label>
                    <input
                      id="input-caseworker-note"
                      type="text"
                      value={caseworkerNote}
                      onChange={(e) => setCaseworkerNote(e.target.value)}
                      placeholder="e.g. Identity verified by Detective Sarah Martinez, family notified."
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="pt-2">
                    <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Authorized Status Actions:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        id="btn-status-missing"
                        type="button"
                        onClick={() => handleManualStatusChange('Missing')}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                          selectedCase.status === 'Missing'
                            ? 'border-rose-300 bg-rose-50/60 ring-2 ring-rose-500/20'
                            : 'border-slate-200 hover:border-rose-300 hover:bg-rose-50/30'
                        }`}
                      >
                        <span className="text-xs font-bold text-rose-700 flex items-center gap-1">
                          <AlertTriangle size={14} />
                          Active Missing
                        </span>
                        <span className="text-[11px] text-slate-500 mt-1">
                          High priority active search
                        </span>
                      </button>

                      <button
                        id="btn-status-sighting-reported"
                        type="button"
                        onClick={() => handleManualStatusChange('Sighting Reported')}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                          selectedCase.status === 'Sighting Reported'
                            ? 'border-amber-300 bg-amber-50/60 ring-2 ring-amber-500/20'
                            : 'border-slate-200 hover:border-amber-300 hover:bg-amber-50/30'
                        }`}
                      >
                        <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                          <Eye size={14} />
                          Sighting Reported
                        </span>
                        <span className="text-[11px] text-slate-500 mt-1">
                          Credible lead actively vetted
                        </span>
                      </button>

                      <button
                        id="btn-status-found"
                        type="button"
                        onClick={() => handleManualStatusChange('Found')}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                          selectedCase.status === 'Found'
                            ? 'border-emerald-300 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30'
                        }`}
                      >
                        <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 size={14} />
                          Person Found Safe
                        </span>
                        <span className="text-[11px] text-slate-500 mt-1">
                          Law enforcement confirmed
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : displaySightings.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300 p-6">
              <UserCheck size={36} className="mx-auto text-slate-400 mb-2" />
              <h4 className="text-sm font-bold text-slate-800">No Pending Sighting Reviews</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                All community sighting submissions and &ldquo;Person May Have Been Found&rdquo; reports have been addressed.
                Submit a sighting to test this verification workflow.
              </p>
            </div>
          ) : (
            displaySightings.map((sighting) => {
              const matchedCase = cases.find((c) => c.id.toLowerCase() === sighting.caseId.toLowerCase());
              const isMayBeFound = sighting.sightingType === 'may_be_found';

              return (
                <div
                  key={sighting.id}
                  id={`verification-card-${sighting.id}`}
                  className={`rounded-xl border p-4 sm:p-5 transition-all ${
                    isMayBeFound
                      ? 'bg-amber-50/60 border-amber-300 shadow-xs'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200/80 pb-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {sighting.id}
                        </span>
                        {isMayBeFound ? (
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-600 text-white flex items-center gap-1">
                            <AlertTriangle size={12} />
                            &ldquo;Person May Have Been Found&rdquo; Report
                          </span>
                        ) : (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            General Sighting Report
                          </span>
                        )}

                        {sighting.aiAnalysis && (
                          <button
                            type="button"
                            onClick={() => setActiveTab('ai_matches')}
                            className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
                            title="Click to inspect in AI Comparison Tab"
                          >
                            <Sparkles size={12} className="text-amber-600" />
                            <span>AI Analysis: {sighting.aiAnalysis.similarityScore}% Similarity</span>
                          </button>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-slate-900 mt-1.5 flex items-center gap-2">
                        <span>Target Case: {sighting.personName}</span>
                        <span className="text-xs font-normal text-slate-500">
                          (Ref #{sighting.caseId})
                        </span>
                      </h4>
                    </div>

                    <div className="text-right text-xs">
                      <span className="text-slate-500 block">Submitted:</span>
                      <span className="font-medium text-slate-800">
                        {new Date(sighting.submittedAt).toLocaleDateString()} at{' '}
                        {new Date(sighting.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="md:col-span-2 space-y-2">
                      <div>
                        <strong className="text-slate-700">Location Observed:</strong>{' '}
                        <span className="text-slate-900">
                          {sighting.location.address ? `${sighting.location.address}, ` : ''}
                          {sighting.location.city}, {sighting.location.state}
                        </span>
                      </div>

                      <div>
                        <strong className="text-slate-700">Date & Time of Sighting:</strong>{' '}
                        <span className="text-slate-900">
                          {sighting.date} at {sighting.time}
                        </span>
                      </div>

                      <div>
                        <strong className="text-slate-700 block mb-0.5">Submitter Description:</strong>
                        <p className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800 leading-relaxed">
                          {sighting.description}
                        </p>
                      </div>

                      {/* Submitter Confidential Info (Shown to authorized admin only!) */}
                      <div className="bg-blue-50/60 p-2.5 rounded-lg border border-blue-200 text-blue-950">
                        <strong className="block text-[11px] uppercase tracking-wider text-blue-900 font-bold mb-1">
                          Confidential Submitter Information (Sealed from Public):
                        </strong>
                        {sighting.contactInfo?.isAnonymous ? (
                          <span className="italic text-slate-600">Submitted Anonymously</span>
                        ) : (
                          <div className="space-y-0.5 text-[11px]">
                            <p>Name: {sighting.contactInfo?.name || 'Not provided'}</p>
                            <p>Email: {sighting.contactInfo?.email || 'Not provided'}</p>
                            <p>Phone: {sighting.contactInfo?.phone || 'Not provided'}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sighting Photo if attached */}
                    <div>
                      {sighting.photoUrl ? (
                        <div>
                          <strong className="text-slate-700 block mb-1">Attached Photo:</strong>
                          <img
                            src={sighting.photoUrl}
                            alt="Submitted sighting attachment"
                            className="w-full aspect-4/3 object-cover rounded-lg border border-slate-300 shadow-2xs"
                          />
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center p-4 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-slate-400 text-center">
                          <span>No photograph attached with this report</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Verification Actions */}
                  {sighting.verificationStatus === 'pending' && (
                    <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex-1 min-w-[240px]">
                        <input
                          id={`input-note-${sighting.id}`}
                          type="text"
                          placeholder="Caseworker verification note (optional)..."
                          value={caseworkerNote}
                          onChange={(e) => setCaseworkerNote(e.target.value)}
                          className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                        />
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          id={`btn-dismiss-${sighting.id}`}
                          type="button"
                          onClick={() => handleDismiss(sighting)}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <XCircle size={14} />
                          <span>Dismiss</span>
                        </button>

                        <button
                          id={`btn-verify-sighting-${sighting.id}`}
                          type="button"
                          onClick={() => handleVerifySighting(sighting)}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                        >
                          <Eye size={14} />
                          <span>Verify Sighting</span>
                        </button>

                        <button
                          id={`btn-verify-found-${sighting.id}`}
                          type="button"
                          onClick={() => handleVerifyFound(sighting)}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                        >
                          <CheckCircle2 size={14} />
                          <span>Verify & Mark Official &ldquo;Found&rdquo;</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {sighting.verificationStatus !== 'pending' && (
                    <div className="mt-3 pt-2 border-t border-slate-100 text-xs flex items-center justify-between text-slate-500">
                      <span className="capitalize font-semibold text-slate-700">
                        Status: {sighting.verificationStatus}
                      </span>
                      {sighting.adminNotes && <span>Note: {sighting.adminNotes}</span>}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>FindSafe Caseworker Verification Portal — Phase 1 Compliance</span>
          <button
            id="btn-done-verification"
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors"
          >
            Close Desk
          </button>
        </div>
      </div>
    </div>
  );
};
