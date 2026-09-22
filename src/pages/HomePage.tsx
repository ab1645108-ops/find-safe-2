import React from 'react';
import { useCases } from '../context/CaseContext';
import { PageId } from '../components/layout/Header';
import { CaseCard } from '../components/common/CaseCard';
import { SafetyDisclaimer } from '../components/common/SafetyDisclaimer';
import {
  Search,
  PlusCircle,
  Shield,
  Eye,
  CheckCircle2,
  Users,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  Lock,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: PageId, caseId?: string) => void;
  onOpenVerification: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenVerification }) => {
  const { cases, sightings, investigatorProfile } = useCases();

  // Calculate high-level statistics
  const activeCasesCount = cases.filter((c) => c.status === 'Missing').length;
  const sightingReportedCount = cases.filter((c) => c.status === 'Sighting Reported').length;
  const foundCount = cases.filter((c) => c.status === 'Found').length;
  const totalSightings = sightings.length;

  // Recent cases for homepage display
  const recentCases = [...cases].slice(0, 4);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="max-w-3xl">
            {/* System Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-6">
              <Shield size={14} className="text-amber-400" />
              <span>Investigator Command Console • {investigatorProfile?.department || 'Missing Persons Unit'}</span>
            </div>

            {/* Title & Tagline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
              FindSafe Operations
              <span className="block text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-300 mt-2 font-sans">
                Master Directory, AI Face Matching & Case Verification
              </span>
            </h1>

            {/* Explanation */}
            <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
              Logged in as <strong className="text-white font-bold">{investigatorProfile?.officerName || 'Lead Detective'}</strong> (Badge #{investigatorProfile?.badgeNumber || 'DET-8821'}). 
              You have full clearance to browse complete missing person dossiers, review confidential sighting leads, run AI facial comparisons, and verify case status changes.
            </p>

            {/* Primary Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                id="btn-hero-search-cases"
                type="button"
                onClick={() => onNavigate('cases')}
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm sm:text-base flex items-center gap-2.5 shadow-lg shadow-blue-950/40 transition-all hover:translate-y-[-1px]"
              >
                <Search size={18} className="text-white" />
                <span>Master Case Directory ({cases.length})</span>
              </button>

              <button
                id="btn-hero-review-leads"
                type="button"
                onClick={onOpenVerification}
                className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold rounded-xl text-sm sm:text-base flex items-center gap-2.5 border border-slate-700 transition-all hover:translate-y-[-1px]"
              >
                <Sparkles size={18} className="text-amber-400" />
                <span>AI Sighting Triage Queue</span>
              </button>

              <button
                id="btn-hero-report-missing"
                type="button"
                onClick={() => onNavigate('report-case')}
                className="px-5 py-3.5 bg-transparent hover:bg-slate-800/80 text-slate-300 hover:text-white font-medium rounded-xl text-sm flex items-center gap-2 transition-colors border border-slate-700"
              >
                <PlusCircle size={17} className="text-rose-400" />
                <span>Register New Case</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Notice & Emergency Hotlines Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <SafetyDisclaimer variant="card" />
      </div>

      {/* Statistics Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Community Incident Metrics
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Live updates across registered missing-person investigations and verified community tips.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Active Missing Cases */}
          <div
            id="stat-active-missing"
            className="bg-white rounded-2xl p-5 border border-rose-200/80 shadow-xs flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 block">
                Active Missing Cases
              </span>
              <span className="text-3xl font-black text-slate-950 mt-1 block">
                {activeCasesCount}
              </span>
              <span className="text-xs text-slate-500 mt-0.5 block">Immediate search priority</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
              <Users size={24} />
            </div>
          </div>

          {/* Card 2: Active Sighting Reviews */}
          <div
            id="stat-sightings-reported"
            className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-xs flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block">
                Cases with Sightings
              </span>
              <span className="text-3xl font-black text-slate-950 mt-1 block">
                {sightingReportedCount}
              </span>
              <span className="text-xs text-slate-500 mt-0.5 block">Investigative leads active</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
              <Eye size={24} />
            </div>
          </div>

          {/* Card 3: Total Sighting Reports */}
          <div
            id="stat-sighting-reports"
            className="bg-white rounded-2xl p-5 border border-blue-200/80 shadow-xs flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800 block">
                Total Sighting Reports
              </span>
              <span className="text-3xl font-black text-slate-950 mt-1 block">
                {totalSightings}
              </span>
              <span className="text-xs text-slate-500 mt-0.5 block">Public tips logged</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
              <MapPin size={24} />
            </div>
          </div>

          {/* Card 4: People Found */}
          <div
            id="stat-people-found"
            className="bg-white rounded-2xl p-5 border border-emerald-200/80 shadow-xs flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
                People Found Safe
              </span>
              <span className="text-3xl font-black text-slate-950 mt-1 block">
                {foundCount}
              </span>
              <span className="text-xs text-slate-500 mt-0.5 block">Confirmed reunifications</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>
      </section>

      {/* Recent Missing-Person Cases */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Recent Missing-Person Cases
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Time is critical during the first 48 hours. Review details below or search the full directory.
            </p>
          </div>

          <button
            id="btn-view-all-cases"
            type="button"
            onClick={() => onNavigate('cases')}
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-blue-700 hover:text-blue-800 hover:underline"
          >
            <span>View All Cases ({cases.length})</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Case Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentCases.map((caseItem) => (
            <CaseCard
              key={caseItem.id}
              caseItem={caseItem}
              onViewDetails={(id) => onNavigate('details', id)}
              onReportSighting={(id) => onNavigate('report-sighting', id)}
            />
          ))}
        </div>
      </section>

      {/* How The Platform Works (Summary Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 sm:p-10">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 block mb-1">
              Core Protocol & Safeguards
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              A Responsible Public-Service Framework
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              FindSafe is structured specifically to maintain data integrity, eliminate false public closures, and keep families safe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-800">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-3">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Rapid Incident Intake</h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Standardized submission capturing physical markers, clothing details, and verified law enforcement reference numbers.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold mb-3">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Community Sighting Tips</h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Citizens submit geolocated sighting observations with photos. Sighting submissions do NOT mark cases as found automatically.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-3">
                3
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Authorized Verification</h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Cases can only transition to &ldquo;Found Safe&rdquo; after official verification by authorized caseworkers or law enforcement.
              </p>
            </div>
          </div>

          {/* AI Roadmap Note */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/70 p-4 rounded-xl border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg shrink-0">
                <Sparkles size={18} />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">
                  Phase 2 Technology Roadmap: AI-Powered Face Matching
                </h5>
                <p className="text-xs text-slate-600 mt-0.5">
                  The system foundation is primed for future algorithmic facial similarity matching. In accordance with public safety ethics, AI suggestions will serve as investigative similarity leads requiring mandatory human verification.
                </p>
              </div>
            </div>

            <button
              id="btn-learn-more-about"
              type="button"
              onClick={() => onNavigate('about')}
              className="shrink-0 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
