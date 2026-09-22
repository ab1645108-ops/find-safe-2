import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useCases } from '../context/CaseContext';
import { PageId } from '../components/layout/Header';
import { SafetyDisclaimer } from '../components/common/SafetyDisclaimer';
import { FaceMatchingSection } from '../components/ai/FaceMatchingSection';
import { TimeInput12Hour } from '../components/common/TimeInput12Hour';
import { validateImageFile, readFileAsDataUrl } from '../services/faceMatchingService';
import { AiMatchAnalysis } from '../types';
import {
  Eye,
  MapPin,
  Calendar,
  Clock,
  Camera,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  User,
  Info,
  ArrowRight,
  Sparkles,
  Search,
  X,
  Check,
  Shield,
  Upload,
} from 'lucide-react';

interface ReportSightingPageProps {
  initialCaseId?: string;
  onNavigate: (page: PageId, caseId?: string) => void;
  onOpenVerification: () => void;
}

export const ReportSightingPage: React.FC<ReportSightingPageProps> = ({
  initialCaseId,
  onNavigate,
  onOpenVerification,
}) => {
  const { cases, addSighting, getCaseById, isInvestigator, investigatorProfile } = useCases();

  // Selected case & type-to-search state
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    initialCaseId || (isInvestigator ? '' : 'unidentified')
  );
  const [caseSearchQuery, setCaseSearchQuery] = useState<string>('');
  
  // Public citizen specific states
  const [publicReportMode, setPublicReportMode] = useState<'unidentified' | 'id_lookup'>(
    initialCaseId ? 'id_lookup' : 'unidentified'
  );
  const [caseIdInput, setCaseIdInput] = useState<string>(initialCaseId || '');
  const [lookupMessage, setLookupMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const activeCase = selectedCaseId && selectedCaseId !== 'unidentified' ? getCaseById(selectedCaseId) : undefined;

  // Filter cases dynamically by user input (only for investigators)
  const filteredCases = useMemo(() => {
    if (!caseSearchQuery.trim()) {
      return cases;
    }
    const q = caseSearchQuery.toLowerCase().trim();
    return cases.filter((c) => {
      const matchName = c.name.toLowerCase().includes(q);
      const matchNick = c.nickname ? c.nickname.toLowerCase().includes(q) : false;
      const matchId = c.id.toLowerCase().includes(q);
      const matchCity = c.lastSeenLocation.city.toLowerCase().includes(q);
      const matchState = c.lastSeenLocation.state.toLowerCase().includes(q);
      return matchName || matchNick || matchId || matchCity || matchState;
    });
  }, [cases, caseSearchQuery]);

  // Sighting type
  const [sightingType, setSightingType] = useState<'general_sighting' | 'may_be_found'>('general_sighting');

  // Observation fields
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('WA');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('12:00 PM');
  const [description, setDescription] = useState('');

  // AI Photo & Analysis State
  const [sightingPhotoUrl, setSightingPhotoUrl] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AiMatchAnalysis | null>(null);

  // Optional submitter contact
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Submission result
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);
  const [lastSubmittedAnalysis, setLastSubmittedAnalysis] = useState<AiMatchAnalysis | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialCaseId) {
      setSelectedCaseId(initialCaseId);
      setCaseIdInput(initialCaseId);
      setPublicReportMode('id_lookup');
    }
  }, [initialCaseId]);

  // Handle public case reference ID lookup
  const handleVerifyCaseId = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLookupMessage(null);
    const cleaned = caseIdInput.trim();
    if (!cleaned) {
      setLookupMessage({ text: 'Please enter a Case Reference ID (e.g. MP-2024-001).', isError: true });
      return;
    }
    const matched = cases.find(
      (c) => c.id.toLowerCase() === cleaned.toLowerCase() || c.name.toLowerCase() === cleaned.toLowerCase()
    );
    if (matched) {
      setSelectedCaseId(matched.id);
      setLookupMessage({ text: `Case attached: ${matched.name} (${matched.id})`, isError: false });
    } else {
      setSelectedCaseId('');
      setLookupMessage({
        text: `No active case found with reference ID "${cleaned}". Please check the ID or switch to "Unidentified Person Report".`,
        isError: true,
      });
    }
  };

  // Handle direct photo upload for unidentified reports
  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoUploadError(null);
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setPhotoUploadError(validation.error || 'Invalid file format.');
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setSightingPhotoUrl(dataUrl);
    } catch (err) {
      setPhotoUploadError('Could not process this image file. Please try another photo.');
    }
  };

  // Handle AI analysis completed callback from FaceMatchingSection
  const handleAiAnalysisComplete = (
    analysis: AiMatchAnalysis | null,
    photoUrl: string | null
  ) => {
    setAiAnalysis(analysis);
    setSightingPhotoUrl(photoUrl);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedCaseId) {
      setErrorMessage('Please specify if this report is for an unidentified individual or enter a valid Case Reference ID.');
      return;
    }
    if (!city.trim() || !stateVal.trim()) {
      setErrorMessage('Please enter at least the city and state where you observed the person.');
      return;
    }
    if (!description.trim() || description.length < 15) {
      setErrorMessage('Please provide a detailed description (at least 15 characters) of what you observed.');
      return;
    }

    const isUnidentifiedLead = selectedCaseId === 'unidentified';
    const report = addSighting({
      caseId: isUnidentifiedLead ? 'UNIDENTIFIED-LEAD' : selectedCaseId,
      personName: activeCase ? activeCase.name : (isUnidentifiedLead ? 'Unidentified / Found Individual' : 'Community Lead'),
      sightingType,
      location: {
        address: address.trim() || undefined,
        city: city.trim(),
        state: stateVal.trim(),
      },
      date,
      time,
      description: description.trim(),
      photoUrl: sightingPhotoUrl || undefined,
      aiAnalysis: aiAnalysis || undefined,
      contactInfo: isAnonymous
        ? { isAnonymous: true }
        : {
            name: contactName.trim() || undefined,
            email: contactEmail.trim() || undefined,
            phone: contactPhone.trim() || undefined,
            isAnonymous: false,
          },
    });

    setSubmittedReportId(report.id);
    setLastSubmittedAnalysis(aiAnalysis);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Success Confirmation Screen
  if (submittedReportId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
        <div className="bg-white border border-emerald-200 rounded-2xl p-6 sm:p-8 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
            Report Received & Routed for Review
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
            Thank You for Your Community Sighting Tip
          </h2>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 max-w-md mx-auto space-y-1">
            <p>
              Your Reference Tracking ID:{' '}
              <strong className="font-mono text-slate-950 text-sm">{submittedReportId}</strong>
            </p>
            <p>
              Linked Case: <strong>{activeCase?.name || selectedCaseId}</strong> (#{selectedCaseId})
            </p>
            <p>
              Type:{' '}
              <span className="font-semibold capitalize">
                {sightingType === 'may_be_found' ? 'Urgent "Person May Have Been Found" Report' : 'General Sighting'}
              </span>
            </p>
          </div>

          {/* AI Analysis Receipt Notice if photo was compared */}
          {lastSubmittedAnalysis && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-left max-w-md mx-auto space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-950 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-blue-700" />
                  AI Analysis Record Attached
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                  {lastSubmittedAnalysis.similarityScore !== undefined
                    ? `${lastSubmittedAnalysis.similarityScore}% Similarity`
                    : 'Analyzed'}
                </span>
              </div>
              <p className="text-blue-900 leading-relaxed">
                Biometric evaluation report <strong>#{lastSubmittedAnalysis.analysisId}</strong> was transmitted with this sighting. It has been placed into the Caseworker Verification Desk queue under &quot;AI-Assisted Potential Matches&quot;.
              </p>
            </div>
          )}

          {/* Explicit reminder that sighting does not confirm found */}
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 text-xs text-left flex items-start gap-2.5">
            <Info size={18} className="text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Official Protocol Reminder:</strong> Submitting this report does <strong>not</strong> immediately change the public case status to &ldquo;Found&rdquo;. Authorized caseworkers and local law enforcement will review your observation details, assess photographic match data, and officially verify the report.
            </p>
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              id="btn-sighting-view-case"
              type="button"
              onClick={() => onNavigate('details', selectedCaseId)}
              className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
            >
              View Updated Case File
            </button>

            <button
              id="btn-sighting-test-verification"
              type="button"
              onClick={onOpenVerification}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <ShieldCheck size={14} className="text-blue-400" />
              <span>Open Caseworker Verification Desk</span>
            </button>

            <button
              id="btn-sighting-done-home"
              type="button"
              onClick={() => onNavigate('home')}
              className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-blue-800 text-xs font-bold uppercase tracking-wider mb-1">
          <Eye size={16} />
          <span>Public Sighting Submission</span>
        </div>
        <h1 className="text-3xl font-black text-slate-950 tracking-tight">
          Report a Sighting
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Have you seen someone matching a missing person&apos;s description? Provide the time, location, and details of your observation.
        </p>
      </div>

      {/* Crucial Safety & Protocol Warning Banner */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 text-xs text-amber-950 space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
          <AlertTriangle size={18} className="text-amber-700 shrink-0" />
          <span>Important Notice: Public Sighting & Report Policy</span>
        </div>
        <p className="leading-relaxed">
          Submitting a sighting report <strong>does NOT confirm that the person has been found</strong>. 
          To protect victim privacy and prevent impersonation, only authorized investigators can review official case dossiers and modify case records. 
          If you believe someone is in immediate life-threatening danger, <strong>please call emergency services (911) immediately</strong>.
        </p>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Error Notice */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 text-xs flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-600 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* 1. Case Association Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Case Attachment & Classification <span className="text-rose-600">*</span>
            </label>
            {activeCase ? (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <Check size={12} /> Case Attached: {activeCase.id}
              </span>
            ) : selectedCaseId === 'unidentified' ? (
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                <Shield size={12} /> Unidentified Person Mode
              </span>
            ) : null}
          </div>

          {isInvestigator ? (
            /* INVESTIGATOR VIEW: Full Directory Search & Selection */
            <div className="space-y-3 bg-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Investigator Department Directory
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300 border border-slate-700">
                  {investigatorProfile?.badgeNumber || 'AUTH'}
                </span>
              </div>

              {activeCase ? (
                <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={activeCase.photoUrl}
                      alt={activeCase.name}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-600 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{activeCase.name}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-900 text-blue-200">
                          {activeCase.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Age {activeCase.age} • Last seen: {activeCase.lastSeenLocation.city}, {activeCase.lastSeenLocation.state}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCaseId('');
                      setCaseSearchQuery('');
                    }}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-xs font-bold rounded-lg transition-colors"
                  >
                    Change Case
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={caseSearchQuery}
                      onChange={(e) => setCaseSearchQuery(e.target.value)}
                      placeholder="Search full department records by name, ID, or city..."
                      className="w-full text-xs pl-9 pr-8 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500"
                    />
                    {caseSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setCaseSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800 text-xs">
                    {filteredCases.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setSelectedCaseId(c.id);
                          setCaseSearchQuery('');
                        }}
                        className="w-full p-2 text-left rounded-lg hover:bg-slate-800 flex items-center justify-between gap-2 transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <img src={c.photoUrl} alt="" className="w-7 h-7 rounded object-cover" />
                          <span className="font-bold text-white truncate">{c.name}</span>
                          <span className="font-mono text-[10px] text-amber-300">({c.id})</span>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">{c.lastSeenLocation.city}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* PUBLIC CITIZEN VIEW: Privacy-Shielded Intake */
            <div className="space-y-4">
              <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 space-y-3 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-blue-400 shrink-0" />
                  <h3 className="font-bold text-sm text-white">Public Privacy Protection Protocol</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  To protect vulnerable missing individuals and their families, personal case dossiers are restricted from general browsing. You can report an unidentified person without a case ID, or enter an official Case Reference ID from an alert notice.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setPublicReportMode('unidentified');
                      setSelectedCaseId('unidentified');
                      setLookupMessage(null);
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      publicReportMode === 'unidentified'
                        ? 'bg-blue-600/30 border-blue-400 text-white ring-1 ring-blue-400'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">Option 1: Unidentified Person</span>
                      {publicReportMode === 'unidentified' && <Check size={14} className="text-blue-400" />}
                    </div>
                    <span className="text-[11px] text-slate-300 block">
                      Reporting someone found, disoriented, or sighted without a known case number.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPublicReportMode('id_lookup');
                      if (selectedCaseId === 'unidentified') setSelectedCaseId('');
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      publicReportMode === 'id_lookup'
                        ? 'bg-blue-600/30 border-blue-400 text-white ring-1 ring-blue-400'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">Option 2: Case Reference ID</span>
                      {publicReportMode === 'id_lookup' && <Check size={14} className="text-blue-400" />}
                    </div>
                    <span className="text-[11px] text-slate-300 block">
                      Enter reference code from a police flyer, missing poster, or Amber Alert.
                    </span>
                  </button>
                </div>
              </div>

              {publicReportMode === 'unidentified' ? (
                <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-950 flex items-start gap-3">
                  <Info size={18} className="text-blue-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Filing as Unidentified / Community Sighting</span>
                    <p className="text-blue-900/80 text-[11px] mt-0.5">
                      Your report will be assigned a priority triage lead ID and dispatched directly to detectives and local intake officers.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Enter Official Case Reference ID (e.g. MP-2024-001)
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={caseIdInput}
                      onChange={(e) => setCaseIdInput(e.target.value)}
                      placeholder="e.g. MP-2024-001 or FS-2025-0722"
                      className="flex-1 text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleVerifyCaseId()}
                      className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg transition-colors shrink-0"
                    >
                      Attach Case
                    </button>
                  </div>

                  {lookupMessage && (
                    <div
                      className={`p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                        lookupMessage.isError
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {lookupMessage.isError ? (
                        <AlertTriangle size={14} className="text-rose-600 shrink-0" />
                      ) : (
                        <Check size={14} className="text-emerald-600 shrink-0" />
                      )}
                      <span>{lookupMessage.text}</span>
                    </div>
                  )}

                  {activeCase && (
                    <div className="p-3 bg-white border border-emerald-300 rounded-lg flex items-center gap-3">
                      <img
                        src={activeCase.photoUrl}
                        alt={activeCase.name}
                        className="w-10 h-10 rounded-md object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{activeCase.name}</span>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            {activeCase.id}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Case attached. Sighting details will be linked to this investigation.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. Sighting Intent / Type */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            2. Report Classification <span className="text-rose-600">*</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              className={`p-3.5 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                sightingType === 'general_sighting'
                  ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="sighting_classification"
                  checked={sightingType === 'general_sighting'}
                  onChange={() => setSightingType('general_sighting')}
                  className="text-blue-600"
                />
                <span className="text-xs font-bold text-slate-900">General Sighting Observation</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 pl-5">
                Saw someone matching description in transit, in public, or in passing.
              </p>
            </label>

            <label
              className={`p-3.5 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                sightingType === 'may_be_found'
                  ? 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-500/20'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="sighting_classification"
                  checked={sightingType === 'may_be_found'}
                  onChange={() => setSightingType('may_be_found')}
                  className="text-amber-600"
                />
                <span className="text-xs font-bold text-amber-900">
                  &ldquo;Person May Have Been Found&rdquo; Report
                </span>
              </div>
              <p className="text-[11px] text-amber-800/80 mt-1 pl-5">
                Person is currently in a safe location (e.g. hospital, shelter, station) awaiting verification.
              </p>
            </label>
          </div>
        </div>

        {/* 3. Location of Sighting */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            3. Where Did You See Them? <span className="text-rose-600">*</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Specific Location / Street / Business / Transit Stop
              </label>
              <input
                id="input-sighting-address"
                type="text"
                placeholder="e.g. Metro station platform, convenience store on 8th street"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                City <span className="text-rose-600">*</span>
              </label>
              <input
                id="input-sighting-city"
                type="text"
                required
                placeholder="e.g. Seattle"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                State <span className="text-rose-600">*</span>
              </label>
              <input
                id="input-sighting-state"
                type="text"
                required
                placeholder="e.g. WA"
                value={stateVal}
                onChange={(e) => setStateVal(e.target.value)}
                className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        {/* 4. Date and Time */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            4. Date & Time of Observation <span className="text-rose-600">*</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
              <input
                id="input-sighting-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Time</label>
              <TimeInput12Hour
                id="input-sighting-time"
                value={time}
                onChange={(val) => setTime(val)}
              />
            </div>
          </div>
        </div>

        {/* 5. Detailed Description */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            5. Sighting Details & Description <span className="text-rose-600">*</span>
          </label>
          <p className="text-xs text-slate-500">
            Describe what the person was wearing, what they were doing, direction of travel, companions, physical state, or any words exchanged.
          </p>
          <textarea
            id="textarea-sighting-description"
            required
            rows={4}
            placeholder="e.g. Saw a young woman matching Elena’s description wearing an olive jacket sitting near the northbound bus stop looking disoriented. She asked for train times to Downtown..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* 6. AI-Assisted Photo Comparison */}
        <div className="pt-2 border-t border-slate-100">
          {activeCase ? (
            <FaceMatchingSection
              selectedCase={activeCase}
              onAnalysisComplete={handleAiAnalysisComplete}
              currentAnalysis={aiAnalysis}
              currentPhotoUrl={sightingPhotoUrl}
            />
          ) : (
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera size={18} className="text-blue-700" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    6. Observation Photograph (Optional)
                  </span>
                </div>
                {sightingPhotoUrl && (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <Check size={12} /> Photo Attached
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                If you were able to take a photograph of the observed individual, you can attach it here. Authorized investigators will review it and compare biometrics against confidential department records.
              </p>

              {photoUploadError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>{photoUploadError}</span>
                </div>
              )}

              {sightingPhotoUrl ? (
                <div className="flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-xl">
                  <img
                    src={sightingPhotoUrl}
                    alt="Sighting observation"
                    className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-slate-900 block">Photograph Attached</span>
                    <span className="text-[11px] text-slate-500 block">
                      Ready for detective review upon form submission.
                    </span>
                    <button
                      type="button"
                      onClick={() => setSightingPhotoUrl(null)}
                      className="mt-2 text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors"
                    >
                      Remove Photo
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handlePhotoFileChange}
                  />
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="w-full py-4 border-2 border-dashed border-slate-300 hover:border-blue-400 bg-white hover:bg-blue-50/50 rounded-xl text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-1.5"
                  >
                    <Upload size={20} className="text-blue-600" />
                    <span className="text-xs font-bold text-slate-700">Click to upload photo</span>
                    <span className="text-[11px] text-slate-400">JPG, PNG, or WEBP up to 10MB</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 7. Submitter Contact Information (Optional) */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              7. Submitter Contact Information (Optional)
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
              <input
                id="checkbox-sighting-anonymous"
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span>Submit completely anonymously</span>
            </label>
          </div>

          {!isAnonymous && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Your Name</label>
                <input
                  id="input-sighting-submitter-name"
                  type="text"
                  placeholder="e.g. Jordan Smith"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Email</label>
                <input
                  id="input-sighting-submitter-email"
                  type="email"
                  placeholder="e.g. j.smith@email.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Phone</label>
                <input
                  id="input-sighting-submitter-phone"
                  type="tel"
                  placeholder="e.g. (206) 555-0182"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          )}

          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-[11px] text-blue-900 flex items-start gap-2">
            <Lock size={15} className="text-blue-700 shrink-0 mt-0.5" />
            <span>
              <strong>Investigative Confidentiality:</strong> Your contact information is never published to the public sighting log. It is only accessible to authorized coordinators to ask follow-up verification questions.
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            Submissions are timestamped and routed to the caseworker verification queue.
          </div>

          <button
            id="btn-submit-sighting"
            type="submit"
            className="w-full sm:w-auto px-7 py-3 bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={18} />
            <span>Transmit Sighting Report</span>
          </button>
        </div>
      </form>
    </div>
  );
};
