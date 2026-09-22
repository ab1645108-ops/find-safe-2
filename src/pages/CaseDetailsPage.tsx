import React, { useState } from 'react';
import { useCases } from '../context/CaseContext';
import { PageId } from '../components/layout/Header';
import { StatusBadge } from '../components/common/StatusBadge';
import { SafetyDisclaimer } from '../components/common/SafetyDisclaimer';
import { PosterModal } from '../components/common/PosterModal';
import { CaseStatus } from '../types';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Shield,
  Eye,
  Printer,
  Share2,
  AlertTriangle,
  FileBadge,
  CheckCircle2,
  Lock,
  Sparkles,
  KeyRound,
  ShieldCheck,
  Edit3,
} from 'lucide-react';

interface CaseDetailsPageProps {
  caseId: string;
  onNavigate: (page: PageId, caseId?: string) => void;
  onOpenInvestigatorLogin?: () => void;
  onOpenVerification?: () => void;
}

export const CaseDetailsPage: React.FC<CaseDetailsPageProps> = ({
  caseId,
  onNavigate,
  onOpenInvestigatorLogin,
  onOpenVerification,
}) => {
  const { getCaseById, isInvestigator, investigatorProfile, updateCaseStatus } = useCases();
  const caseItem = getCaseById(caseId);

  const [isPosterOpen, setIsPosterOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Investigator Action Bar State
  const [statusSelect, setStatusSelect] = useState<CaseStatus>(caseItem?.status || 'Missing');
  const [statusNote, setStatusNote] = useState('');
  const [statusActionSuccess, setStatusActionSuccess] = useState<string | null>(null);

  if (!caseItem) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle size={48} className="mx-auto text-amber-500" />
        <h2 className="text-2xl font-black text-slate-900">Case Record Not Found</h2>
        <p className="text-sm text-slate-600">
          The requested case reference &ldquo;{caseId}&rdquo; was not found or may have been archived.
        </p>
        <button
          type="button"
          onClick={() => onNavigate(isInvestigator ? 'cases' : 'home')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft size={14} />
          <span>{isInvestigator ? 'Back to Missing Persons Directory' : 'Return to Citizen Portal'}</span>
        </button>
      </div>
    );
  }

  // RESTRICTED ACCESS: If current user is public, do NOT expose case details or sensitive info
  if (!isInvestigator) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-in fade-in">
        {/* Top Breadcrumb */}
        <button
          id="btn-restricted-back-to-home"
          type="button"
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-950 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Return to Citizen Portal</span>
        </button>

        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 mx-auto flex items-center justify-center">
            <Lock size={32} />
          </div>

          <div className="max-w-lg mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Shield size={13} />
              <span>Restricted Dossier • Case #{caseItem.id}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
              Authorized Personnel Only
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Full missing person case dossiers, forensic timelines, physical identifiers, and family records are protected and only accessible to authorized investigators and sworn detectives.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs max-w-md mx-auto space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-900">
              <span>Public Reference Code:</span>
              <span className="font-mono text-blue-700">{caseItem.id}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Jurisdiction:</span>
              <span>{caseItem.lastSeenLocation.city}, {caseItem.lastSeenLocation.state}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Current Status:</span>
              <StatusBadge status={caseItem.status} size="sm" />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              id="btn-dossier-investigator-login"
              onClick={onOpenInvestigatorLogin}
              className="w-full sm:w-auto px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <KeyRound size={16} />
              <span>Investigator Sign-In to Unlock Dossier</span>
            </button>

            <button
              type="button"
              id="btn-dossier-submit-sighting"
              onClick={() => onNavigate('report-sighting', caseItem.id)}
              className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors border border-slate-200"
            >
              <Eye size={16} className="text-blue-700" />
              <span>Submit Sighting for Case #{caseItem.id}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formattedMissingDate = new Date(caseItem.dateMissing).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const daysMissing = Math.max(
    0,
    Math.floor((Date.now() - new Date(caseItem.dateMissing).getTime()) / (1000 * 60 * 60 * 24))
  );

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    }
  };

  const handleApplyStatusChange = (e: React.FormEvent) => {
    e.preventDefault();
    updateCaseStatus(
      caseItem.id,
      statusSelect,
      statusNote.trim() || `Status officially modified to ${statusSelect} by ${investigatorProfile.officerName} (${investigatorProfile.badgeNumber}).`
    );
    setStatusActionSuccess(`Case status verified and updated to "${statusSelect}".`);
    setStatusNote('');
    setTimeout(() => setStatusActionSuccess(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <button
          id="btn-back-to-cases"
          type="button"
          onClick={() => onNavigate('cases')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-950 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to All Missing Persons Directory</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Share Button */}
          <button
            id="btn-share-case"
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Share2 size={14} />
            <span>{copySuccess ? 'Link Copied!' : 'Share Case'}</span>
          </button>

          {/* Printable Bulletin / Poster */}
          <button
            id="btn-view-poster-modal"
            type="button"
            onClick={() => setIsPosterOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Printer size={14} />
            <span>Print Public Notice</span>
          </button>

          {/* Primary Sighting CTA */}
          {caseItem.status !== 'Found' && (
            <button
              id="btn-details-report-sighting"
              type="button"
              onClick={() => onNavigate('report-sighting', caseItem.id)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
            >
              <Eye size={14} />
              <span>Log Sighting</span>
            </button>
          )}
        </div>
      </div>

      {/* Authorized Investigator Action & Status Verification Panel */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white border border-blue-900/60 shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/40 text-amber-400 flex items-center justify-center">
              <Shield size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Investigator Action & Status Verification
                </span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.2 rounded font-mono font-bold">
                  {investigatorProfile.badgeNumber}
                </span>
              </div>
              <span className="text-[11px] text-slate-300">
                Active Officer: {investigatorProfile.officerName} • {investigatorProfile.department}
              </span>
            </div>
          </div>

          {onOpenVerification && (
            <button
              type="button"
              id="btn-case-open-desk"
              onClick={onOpenVerification}
              className="px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ShieldCheck size={14} className="text-amber-400" />
              <span>Open Caseworker Verification Desk</span>
            </button>
          )}
        </div>

        {/* Change Status Form */}
        <form onSubmit={handleApplyStatusChange} className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-300 shrink-0">Case Status:</label>
              <select
                id="select-case-status-action"
                value={statusSelect}
                onChange={(e) => setStatusSelect(e.target.value as CaseStatus)}
                className="text-xs font-semibold py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="Missing">Missing (Active Search)</option>
                <option value="Sighting Reported">Sighting Reported (Under Investigation)</option>
                <option value="Found">Found Safe (Verified & Resolved)</option>
              </select>
            </div>

            <div className="flex-1 min-w-[220px]">
              <input
                type="text"
                id="input-case-investigator-note"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Enter official detective notes / action justification..."
                className="w-full text-xs py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              id="btn-apply-case-status"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
            >
              <CheckCircle2 size={15} />
              <span>Update & Verify Status</span>
            </button>
          </div>

          {statusActionSuccess && (
            <div className="text-xs text-emerald-400 flex items-center gap-1.5 pt-1 animate-in fade-in">
              <CheckCircle2 size={13} />
              <span>{statusActionSuccess}</span>
            </div>
          )}
        </form>
      </div>

      {/* Hero Case Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Large Photograph & Quick Vital Identifiers (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
            <div className="relative aspect-4/5 sm:aspect-square bg-slate-100 overflow-hidden">
              <img
                src={caseItem.photoUrl}
                alt={`Photograph of missing person ${caseItem.name}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <StatusBadge status={caseItem.status} size="md" />
              </div>
              <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-xs text-white px-2.5 py-1 rounded-md text-xs font-mono font-bold shadow-xs">
                Case #{caseItem.id}
              </div>

              {caseItem.urgentAlert && caseItem.status !== 'Found' && (
                <div className="absolute bottom-0 inset-x-0 bg-rose-600 text-white text-xs font-bold px-4 py-1.5 flex items-center justify-between tracking-wide uppercase">
                  <span className="flex items-center gap-1.5">
                    <Shield size={14} />
                    High Priority Investigation
                  </span>
                  <span>{daysMissing === 0 ? 'Missing Today' : `${daysMissing} Days Missing`}</span>
                </div>
              )}
            </div>

            {/* Photo Caption / Note */}
            <div className="p-4 bg-slate-50 border-t border-slate-200/80 text-xs text-slate-500 flex items-center justify-between">
              <span>Official Verification Photo</span>
              <span>Updated: {new Date(caseItem.statusUpdatedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Quick Contact & Law Enforcement Box (Strictly no private personal contact exposed) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Shield size={18} className="text-blue-700" />
              <span>Investigating Law Enforcement Contact</span>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1.5">
              <p className="font-bold text-slate-900">
                {caseItem.confidentialContact.lawEnforcementAgency || 'Regional Missing Persons Unit'}
              </p>
              {caseItem.confidentialContact.policeCaseNumber && (
                <p className="text-slate-700">
                  Official Police Case Reference: <strong>{caseItem.confidentialContact.policeCaseNumber}</strong>
                </p>
              )}
              {caseItem.confidentialContact.officerContact && (
                <p className="text-slate-600">
                  Assigned Lead: {caseItem.confidentialContact.officerContact}
                </p>
              )}
            </div>

            {/* Privacy Protection Notice */}
            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/80 text-[11px] text-blue-900 flex items-start gap-2">
              <Lock size={15} className="text-blue-700 shrink-0 mt-0.5" />
              <span>
                <strong>Privacy Protected:</strong> Submitter personal telephone numbers and family residential addresses are confidential to safeguard family privacy and prevent harassment.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: In-depth Profile, Circumstances, Physical Attributes (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Official Record • Ref #{caseItem.id}
                </span>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight mt-0.5">
                  {caseItem.name}
                </h1>
                {caseItem.nickname && (
                  <p className="text-sm font-medium text-slate-600 mt-0.5">
                    Known alias or nickname: &ldquo;{caseItem.nickname}&rdquo;
                  </p>
                )}
              </div>

              <div className="shrink-0">
                <StatusBadge status={caseItem.status} size="lg" />
              </div>
            </div>

            {/* Vital Facts Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Age</span>
                <span className="text-base font-extrabold text-slate-900">{caseItem.age} years old</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Gender</span>
                <span className="text-base font-extrabold text-slate-900">{caseItem.gender}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Days Missing</span>
                <span className="text-base font-extrabold text-rose-700">
                  {daysMissing === 0 ? 'Today' : `${daysMissing} days`}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Sightings Logged</span>
                <span className="text-base font-extrabold text-blue-700">{caseItem.sightingsCount}</span>
              </div>
            </div>
          </div>

          {/* Last Seen Information */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
              <MapPin size={18} className="text-rose-600" />
              <span>Last Seen Disappearance Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-slate-500 uppercase">Last Seen Date & Time</span>
                <p className="font-semibold text-slate-900 text-sm">
                  {formattedMissingDate} {caseItem.timeMissing ? `at ${caseItem.timeMissing}` : ''}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-500 uppercase">Jurisdiction & City</span>
                <p className="font-semibold text-slate-900 text-sm">
                  {caseItem.lastSeenLocation.city}, {caseItem.lastSeenLocation.state} {caseItem.lastSeenLocation.zip || ''}
                </p>
              </div>
            </div>

            {caseItem.lastSeenLocation.address && (
              <div className="pt-2 text-xs">
                <span className="font-bold text-slate-500 uppercase">Specific Street / Landmark:</span>
                <p className="text-slate-800 font-medium mt-0.5">
                  {caseItem.lastSeenLocation.address}
                  {caseItem.lastSeenLocation.landmark ? ` (${caseItem.lastSeenLocation.landmark})` : ''}
                </p>
              </div>
            )}

            <div className="pt-2 text-xs border-t border-slate-100">
              <span className="font-bold text-slate-900 uppercase">Circumstances of Disappearance:</span>
              <p className="mt-1 text-slate-700 leading-relaxed text-sm bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                {caseItem.circumstances}
              </p>
            </div>
          </div>

          {/* Physical Description & Clothing */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
              <User size={18} className="text-blue-700" />
              <span>Physical Characteristics & Appearance</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
                <span className="text-slate-500 block uppercase font-bold text-[10px]">Height</span>
                <span className="font-semibold text-slate-900">{caseItem.physicalDescription.height}</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
                <span className="text-slate-500 block uppercase font-bold text-[10px]">Weight</span>
                <span className="font-semibold text-slate-900">{caseItem.physicalDescription.weight}</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
                <span className="text-slate-500 block uppercase font-bold text-[10px]">Hair Color</span>
                <span className="font-semibold text-slate-900">{caseItem.physicalDescription.hairColor}</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
                <span className="text-slate-500 block uppercase font-bold text-[10px]">Eye Color</span>
                <span className="font-semibold text-slate-900">{caseItem.physicalDescription.eyeColor}</span>
              </div>
            </div>

            {/* Distinguishing Marks & Medical Needs */}
            <div className="space-y-3 pt-2 text-xs">
              {caseItem.physicalDescription.distinguishingMarks && (
                <div>
                  <span className="font-bold text-slate-900 uppercase">Distinguishing Scars / Tattoos / Marks:</span>
                  <p className="text-slate-700 mt-0.5">{caseItem.physicalDescription.distinguishingMarks}</p>
                </div>
              )}

              {caseItem.physicalDescription.medicalNeeds && (
                <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200 text-amber-950">
                  <span className="font-bold text-amber-900 uppercase flex items-center gap-1.5">
                    <AlertTriangle size={14} className="text-amber-700" />
                    Medical Condition & Urgent Care Needs:
                  </span>
                  <p className="mt-0.5">{caseItem.physicalDescription.medicalNeeds}</p>
                </div>
              )}

              <div>
                <span className="font-bold text-slate-900 uppercase">Clothing & Personal Effects When Last Seen:</span>
                <p className="text-slate-700 mt-0.5 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                  {caseItem.clothingDetails}
                </p>
              </div>
            </div>
          </div>

          {/* Sighting Action Section */}
          <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div>
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <Eye size={20} className="text-amber-400" />
                  Do you have information or a photograph of {caseItem.name}?
                </h4>
                <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                  Upload an observation photo to perform automated face matching against {caseItem.name}&apos;s registered profile, or submit a location sighting tip. Submissions are reviewed immediately by authorized response teams.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  id="btn-action-report-sighting"
                  type="button"
                  onClick={() => onNavigate('report-sighting', caseItem.id)}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles size={14} className="text-slate-950" />
                  <span>AI Face Compare & Sighting</span>
                </button>

                <button
                  id="btn-action-may-be-found"
                  type="button"
                  onClick={() => onNavigate('report-sighting', caseItem.id)}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs border border-white/20 transition-colors"
                  title="If you believe you have located this person"
                >
                  &ldquo;Person May Be Found&rdquo; Report
                </button>
              </div>
            </div>
          </div>

          {/* Official Investigation Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                <Clock size={18} className="text-slate-600" />
                <span>Case Activity & Verified Timeline</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">Public Event Log</span>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {caseItem.timeline.map((item) => (
                <div key={item.id} className="relative group">
                  <div
                    className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                      item.type === 'found'
                        ? 'bg-emerald-600 ring-2 ring-emerald-200'
                        : item.type === 'verified'
                        ? 'bg-blue-600 ring-2 ring-blue-200'
                        : item.type === 'sighting'
                        ? 'bg-amber-500 ring-2 ring-amber-200'
                        : item.type === 'ai_analysis'
                        ? 'bg-indigo-600 ring-2 ring-indigo-200'
                        : 'bg-slate-700 ring-2 ring-slate-200'
                    }`}
                  ></div>

                  <div className="text-xs space-y-0.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        {item.type === 'ai_analysis' && (
                          <Sparkles size={12} className="text-indigo-600 inline" />
                        )}
                        {item.title}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">{item.date}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Safety Banner */}
      <SafetyDisclaimer variant="banner" />

      {/* Printable Poster Modal */}
      <PosterModal
        caseItem={caseItem}
        isOpen={isPosterOpen}
        onClose={() => setIsPosterOpen(false)}
      />
    </div>
  );
};
