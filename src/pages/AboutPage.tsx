import React from 'react';
import { PageId } from '../components/layout/Header';
import {
  Shield,
  FileText,
  Search,
  Eye,
  Sparkles,
  UserCheck,
  Lock,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: PageId) => void;
  onOpenVerification: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, onOpenVerification }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider">
          <Shield size={14} className="text-amber-500" />
          <span>Public Safety Architecture & Principles</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
          How FindSafe Works
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          FindSafe combines community awareness, standardized case reporting, and human-in-the-loop verification to assist in locating missing individuals while strictly protecting citizen privacy.
        </p>
      </div>

      {/* 5 Core Pillars */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-3">
          The 5 Pillars of the Platform
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pillar 1: Reporting */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <FileText size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900">1. Standardized Case Reporting</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Families, guardians, and advocates submit structured incident reports including verified physical descriptions, clothing details, last seen coordinates, and law enforcement case reference numbers. Every report is indexed with a unique case ID (e.g., FS-2025-0841).
            </p>
          </div>

          {/* Pillar 2: Public Search */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Search size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900">2. Community & Public Search</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The public directory empowers citizens, transit workers, park staff, and volunteer search parties to filter records by city, age bracket, and gender. Searchable criteria ensure vital bulletins reach the communities where observations are most probable.
            </p>
          </div>

          {/* Pillar 3: Sighting Reports */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Eye size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900">3. Rapid Sighting Reports</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Anyone with information can immediately submit a geolocated, time-stamped sighting report with photos. Sighting submissions are timestamped and logged directly into the investigative timeline without modifying official statuses automatically.
            </p>
          </div>

          {/* Pillar 4: Human Verification */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <UserCheck size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900">4. Mandatory Human Verification</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Crucial safeguard: The public cannot directly mark a person as found. Community members can submit a &ldquo;Person May Have Been Found&rdquo; report, after which an authorized caseworker or law enforcement officer independently verifies identity before updating official status to &ldquo;Found Safe&rdquo;.
            </p>
          </div>
        </div>
      </div>

      {/* Active AI-Assisted Matching Section */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} className="text-amber-400" />
            <span>Phase 2 Feature: AI-Assisted Photo Comparison</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            5. AI-Assisted Face Matching & Decision Support
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            When a member of the public uploads a sighting photo, FindSafe evaluates image quality (lighting, blur, face presence) and computes a biometric similarity score comparing the observation face directly against the registered profile photo of the selected case.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/10 text-xs space-y-1.5">
              <span className="font-bold text-amber-300 block uppercase tracking-wider text-[11px]">
                Technical Similarity Metric Only
              </span>
              <p className="text-slate-300 leading-relaxed">
                The algorithm produces a technical geometric similarity index (e.g. 87%), <strong>never a statement of identity</strong>. AI does not confirm identity or replace forensic investigation.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/10 text-xs space-y-1.5">
              <span className="font-bold text-emerald-300 block uppercase tracking-wider text-[11px]">
                Mandatory Caseworker Review
              </span>
              <p className="text-slate-300 leading-relaxed">
                All potential matches are sent to the authorized Caseworker Verification Desk. Human caseworkers cross-reference clothing, scars, and law enforcement findings before verifying.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Safety & Privacy Safeguards */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Lock size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Privacy Safeguards & Responsible Public Service Rules
            </h2>
            <p className="text-xs text-slate-500">
              How FindSafe handles sensitive data and ensures victim safety.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-slate-700">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <strong className="text-slate-900 block font-bold">No Private Contact Exposure</strong>
            <p className="leading-relaxed text-slate-600">
              Submitter telephone numbers, residential addresses, and personal emails are never exposed publicly. Public view shows only authorized law enforcement numbers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <strong className="text-slate-900 block font-bold">Emergency Services Priority</strong>
            <p className="leading-relaxed text-slate-600">
              FindSafe is a supportive communication tool. Sighters of endangered children or urgent situations are instructed to contact local emergency services immediately.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <strong className="text-slate-900 block font-bold">Clear Fictional / Demo Status</strong>
            <p className="leading-relaxed text-slate-600">
              During Phase 1 prototype testing, all missing person records are simulated demonstrative examples to validate functional UI flows responsibly.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle size={20} className="text-blue-700" />
          <span>Frequently Asked Questions</span>
        </h2>

        <div className="space-y-3 text-xs">
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">
              Can anyone mark a missing person as &ldquo;Found&rdquo;?
            </h4>
            <p className="text-slate-600 leading-relaxed">
              No. To protect missing individuals and avoid false closures, the public cannot directly alter the official status. Citizens can submit a &ldquo;Person May Have Been Found&rdquo; sighting report, which alerts authorized caseworkers for physical verification.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">
              Can I report a sighting anonymously?
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Yes. Community members have the option to check &ldquo;Submit completely anonymously&rdquo;. Even if contact information is provided, it is sealed from public view.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">
              How does FindSafe collaborate with police departments?
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Every missing person profile can include the official Police Report Number and assigned Detective or Unit. Caseworkers synchronize community tips with the active investigation files.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Call to Action */}
      <div className="text-center pt-4 flex flex-wrap items-center justify-center gap-4">
        <button
          id="btn-about-browse-cases"
          type="button"
          onClick={() => onNavigate('cases')}
          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center gap-2"
        >
          <Search size={16} />
          <span>Browse Public Missing Cases</span>
        </button>

        <button
          id="btn-about-report-person"
          type="button"
          onClick={() => onNavigate('report-case')}
          className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center gap-2"
        >
          <Shield size={16} />
          <span>Report a Missing Person</span>
        </button>

        <button
          id="btn-about-open-desk"
          type="button"
          onClick={onOpenVerification}
          className="px-5 py-3 border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold rounded-xl text-xs transition-colors"
        >
          Open Authorized Caseworker Desk
        </button>
      </div>
    </div>
  );
};
