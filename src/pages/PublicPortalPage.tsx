import React, { useState } from 'react';
import { useCases } from '../context/CaseContext';
import { PageId } from '../components/layout/Header';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Shield,
  PlusCircle,
  Eye,
  Search,
  Lock,
  CheckCircle2,
  FileText,
  Clock,
  MapPin,
  HelpCircle,
  KeyRound,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

interface PublicPortalPageProps {
  onNavigate: (page: PageId, caseId?: string) => void;
  onOpenInvestigatorLogin: () => void;
}

export const PublicPortalPage: React.FC<PublicPortalPageProps> = ({
  onNavigate,
  onOpenInvestigatorLogin,
}) => {
  const { trackCaseById, cases } = useCases();

  const [lookupQuery, setLookupQuery] = useState('');
  const [trackedCase, setTrackedCase] = useState<ReturnType<typeof trackCaseById> | null>(null);
  const [lookupAttempted, setLookupAttempted] = useState(false);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;
    const result = trackCaseById(lookupQuery.trim());
    setTrackedCase(result);
    setLookupAttempted(true);
  };

  const sampleCase = cases[0];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white pt-14 pb-18 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="relative max-w-5xl mx-auto text-center space-y-5">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
            <Shield size={14} className="text-amber-400" />
            <span>Citizen Reporting & Intake Portal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            FindSafe Public Citizen Portal
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base leading-relaxed">
            A secure public intake system for families and community members. 
            Register missing loved ones, submit confidential sighting tips, and verify the status of your reported submission.
          </p>

          {/* Privacy Disclaimer Card */}
          <div className="max-w-3xl mx-auto p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 text-amber-200 text-xs flex items-start sm:items-center gap-3 text-left">
            <Lock size={20} className="text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-bold text-white block">Strict Public Privacy Protocol:</span>
              <span>
                To protect victim identities and ongoing operations, full case files and investigative dossiers are confidential and only accessible to authorized investigators.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Two Core Citizen Actions: Report Missing or Sighting */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Action 1: Report Missing Person */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <PlusCircle size={26} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Register a Missing Loved One</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Submit comprehensive details regarding a missing family member or individual, including physical appearance, last known coordinates, and authorized family contacts.
                </p>
              </div>

              <div className="space-y-2 pt-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span>Generates official Case Reference ID (e.g. FS-2025-XXXX)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span>Immediate intake routing to authorized detectives</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span>Private contact information is never shown publicly</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <button
                type="button"
                id="btn-portal-report-case"
                onClick={() => onNavigate('report-case')}
                className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors"
              >
                <PlusCircle size={16} />
                <span>File Missing Person Report</span>
              </button>
            </div>
          </div>

          {/* Action 2: Report a Sighting / Found Individual */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Eye size={26} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Report a Sighting or Found Person</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Spotted someone matching an alert or encountered a disoriented or lost individual? Provide location coordinates, observation timestamp, and optional photo.
                </p>
              </div>

              <div className="space-y-2 pt-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-600" />
                  <span>Optional AI facial analysis against registered cases</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-600" />
                  <span>Confidential tip intake verified by assigned caseworkers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-600" />
                  <span>Coordinates routed directly to search response teams</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <button
                type="button"
                id="btn-portal-report-sighting"
                onClick={() => onNavigate('report-sighting')}
                className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Eye size={16} />
                <span>Submit Sighting & AI Match Tip</span>
              </button>
            </div>
          </div>
        </div>

        {/* Citizen Feature: Track My Submitted Report */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
              <Search size={20} className="text-blue-700" />
              <h3>Track Your Submitted Report Status</h3>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Enter your Case Reference ID (or police case number) to securely check verification progress and search status without viewing other cases.
            </p>
          </div>

          <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                id="input-citizen-case-lookup"
                value={lookupQuery}
                onChange={(e) => {
                  setLookupQuery(e.target.value);
                  if (lookupAttempted) setLookupAttempted(false);
                }}
                placeholder="Enter Case ID (e.g. FS-2025-0722 or person's name)"
                className="w-full py-3 pl-10 pr-4 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 font-medium"
              />
              <FileText size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <button
              type="submit"
              id="btn-citizen-lookup-submit"
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-colors shrink-0 flex items-center justify-center gap-2"
            >
              <Search size={16} />
              <span>Check Status</span>
            </button>
          </form>

          {/* Quick Helper for Testing */}
          {sampleCase && (
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span>Try sample case ID:</span>
              <button
                type="button"
                onClick={() => {
                  setLookupQuery(sampleCase.id);
                  setTrackedCase(sampleCase);
                  setLookupAttempted(true);
                }}
                className="font-mono text-blue-700 hover:underline font-semibold"
              >
                {sampleCase.id}
              </button>
              <span className="text-slate-400 font-mono text-[11px]">(Reference Code)</span>
            </div>
          )}

          {/* Tracked Case Result Card */}
          {lookupAttempted && (
            <div className="pt-4 border-t border-slate-100">
              {trackedCase ? (
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-mono font-bold text-slate-500 block">
                        Case ID: {trackedCase.id}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-0.5">
                        {trackedCase.name}
                      </h4>
                    </div>
                    <StatusBadge status={trackedCase.status} size="md" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200/80">
                      <span className="text-slate-500 block font-medium">Last Known Area:</span>
                      <span className="font-semibold text-slate-800 mt-0.5 block">
                        {trackedCase.lastSeenLocation.city}, {trackedCase.lastSeenLocation.state}
                      </span>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200/80">
                      <span className="text-slate-500 block font-medium">Assigned Agency:</span>
                      <span className="font-semibold text-slate-800 mt-0.5 block truncate">
                        {trackedCase.confidentialContact.lawEnforcementAgency || 'Missing Persons Taskforce'}
                      </span>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200/80">
                      <span className="text-slate-500 block font-medium">Verified Sightings:</span>
                      <span className="font-semibold text-slate-800 mt-0.5 block">
                        {trackedCase.sightingsCount} recorded leads
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50/80 border border-blue-100 rounded-lg text-xs text-blue-950 flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Case Status Note: </strong>
                      <span>
                        {trackedCase.status === 'Found'
                          ? 'This case has been officially confirmed as Found Safe by authorized law enforcement.'
                          : trackedCase.status === 'Sighting Reported'
                          ? 'Recent community sighting leads are currently under active evaluation by assigned detectives.'
                          : 'Case intake complete. Coordinated regional search protocols are actively underway.'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
                  <AlertCircle size={18} className="text-amber-700 shrink-0" />
                  <span>
                    No case record was found matching &ldquo;{lookupQuery}&rdquo;. Please verify the Case ID on your submission receipt.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Authorized Investigator Portal Section */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 text-white p-6 sm:p-8 border border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <KeyRound size={13} />
              <span>Law Enforcement & Investigators</span>
            </div>
            <h3 className="text-xl font-bold text-white">Authorized Detective Access</h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Are you an assigned investigator, detective, or authorized caseworker? Authenticate with your badge to view all case files, detailed dossiers, and verify case status changes.
            </p>
          </div>

          <button
            type="button"
            id="btn-portal-investigator-login"
            onClick={onOpenInvestigatorLogin}
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shrink-0 shadow-lg shadow-blue-950/50 transition-all"
          >
            <Shield size={16} />
            <span>Investigator Portal Sign-In</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
