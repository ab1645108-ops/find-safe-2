import React, { useState } from 'react';
import {
  Shield,
  Search,
  PlusCircle,
  Eye,
  HelpCircle,
  Menu,
  X,
  ShieldCheck,
  KeyRound,
  LogOut,
  Lock,
} from 'lucide-react';
import { useCases } from '../../context/CaseContext';

export type PageId = 'home' | 'cases' | 'details' | 'report-case' | 'report-sighting' | 'about';

interface HeaderProps {
  currentPage: PageId;
  onNavigate: (page: PageId, caseId?: string) => void;
  onOpenVerification: () => void;
  onOpenInvestigatorLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  onOpenVerification,
  onOpenInvestigatorLogin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    cases,
    pendingVerificationCount,
    pendingAiMatchesCount,
    isInvestigator,
    investigatorProfile,
    logoutToPublic,
  } = useCases();

  const activeCasesCount = cases.filter((c) => c.status !== 'Found').length;

  const handleNav = (page: PageId) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      {/* Authorized Investigator Top Security Bar */}
      {isInvestigator && (
        <div className="bg-slate-950 text-slate-200 px-4 sm:px-6 lg:px-8 py-1.5 border-b border-blue-900/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span className="font-mono font-bold text-amber-300 text-[10px] sm:text-[11px] uppercase tracking-wider shrink-0">
              RESTRICTED INVESTIGATOR DESK
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="hidden sm:inline text-slate-300 font-medium text-[11px] truncate">
              {investigatorProfile.officerName} (Badge #{investigatorProfile.badgeNumber}) — {investigatorProfile.department}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              id="btn-header-top-verification"
              onClick={onOpenVerification}
              className="text-[11px] font-bold text-blue-300 hover:text-white flex items-center gap-1 transition-colors"
            >
              <ShieldCheck size={13} className="text-amber-400" />
              <span>Verification Desk</span>
              {pendingVerificationCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-mono text-[10px]">
                  {pendingVerificationCount}
                </span>
              )}
            </button>

            <button
              type="button"
              id="btn-top-logout-public"
              onClick={logoutToPublic}
              className="text-[11px] font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition-colors bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
              title="Exit investigator mode and return to public citizen view"
            >
              <LogOut size={12} />
              <span>Exit to Citizen View</span>
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Brand */}
          <div
            id="brand-logo"
            onClick={() => handleNav('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs transition-colors ${
              isInvestigator ? 'bg-slate-950 text-amber-400 border border-blue-900' : 'bg-blue-900 text-white group-hover:bg-blue-800'
            }`}>
              <Shield size={22} className={isInvestigator ? 'text-amber-400' : 'text-amber-400'} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-950 font-sans">
                  FindSafe
                </span>
                {isInvestigator ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-950 text-amber-300 border border-blue-800 flex items-center gap-1">
                    <Shield size={10} className="text-amber-400" />
                    <span>Investigator Desk</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Citizen Portal
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium tracking-tight line-clamp-1 hidden sm:block">
                {isInvestigator
                  ? `${investigatorProfile.officerName} • Badge ${investigatorProfile.badgeNumber}`
                  : 'Public Citizen Reporting & Assistance Network'}
              </p>
            </div>
          </div>

          {/* Desktop Nav - Cleanly Separated by User Role */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {isInvestigator ? (
              /* INVESTIGATOR ONLY NAVIGATION */
              <>
                <button
                  id="nav-home"
                  type="button"
                  onClick={() => handleNav('home')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    currentPage === 'home'
                      ? 'text-blue-900 bg-blue-50/80 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Command Center
                </button>

                <button
                  id="nav-missing-persons"
                  type="button"
                  onClick={() => handleNav('cases')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    currentPage === 'cases' || currentPage === 'details'
                      ? 'text-blue-900 bg-blue-50/80 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Search size={15} />
                  <span>All Cases Directory</span>
                  {activeCasesCount > 0 && (
                    <span className="text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700">
                      {activeCasesCount}
                    </span>
                  )}
                </button>

                <button
                  id="nav-report-sighting"
                  type="button"
                  onClick={() => handleNav('report-sighting')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    currentPage === 'report-sighting'
                      ? 'text-blue-900 bg-blue-50/80 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Eye size={15} />
                  <span>Sighting & AI Review</span>
                </button>

                <button
                  id="nav-about"
                  type="button"
                  onClick={() => handleNav('about')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    currentPage === 'about'
                      ? 'text-blue-900 bg-blue-50/80 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <HelpCircle size={15} />
                  <span>Protocol Guide</span>
                </button>
              </>
            ) : (
              /* PUBLIC CITIZEN NAVIGATION (NO CASE DIRECTORY VISIBLE) */
              <>
                <button
                  id="nav-home"
                  type="button"
                  onClick={() => handleNav('home')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    currentPage === 'home'
                      ? 'text-blue-900 bg-blue-50/80 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Citizen Portal
                </button>

                <button
                  id="nav-report-case"
                  type="button"
                  onClick={() => handleNav('report-case')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    currentPage === 'report-case'
                      ? 'text-rose-900 bg-rose-50/80 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <PlusCircle size={15} className="text-rose-600" />
                  <span>Register Missing Loved One</span>
                </button>

                <button
                  id="nav-report-sighting"
                  type="button"
                  onClick={() => handleNav('report-sighting')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    currentPage === 'report-sighting'
                      ? 'text-blue-900 bg-blue-50/80 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Eye size={15} className="text-blue-600" />
                  <span>Report Sighting / Found Person</span>
                </button>

                <button
                  id="nav-about"
                  type="button"
                  onClick={() => handleNav('about')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    currentPage === 'about'
                      ? 'text-blue-900 bg-blue-50/80 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <HelpCircle size={15} />
                  <span>Safety & Hotline Guide</span>
                </button>
              </>
            )}
          </nav>

          {/* Desktop Right CTAs */}
          <div className="hidden md:flex items-center gap-2.5">
            {isInvestigator ? (
              <>
                {/* Caseworker Verification Desk Trigger */}
                <button
                  id="btn-open-caseworker-desk"
                  type="button"
                  onClick={onOpenVerification}
                  className="relative px-3 py-2 rounded-lg border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Open authorized caseworker verification portal"
                >
                  <ShieldCheck size={16} className="text-blue-700" />
                  <span>Verification Desk</span>
                  {pendingAiMatchesCount > 0 && (
                    <span className="inline-flex items-center justify-center px-1.5 h-4 text-[9px] font-bold rounded-full bg-amber-500 text-slate-950">
                      {pendingAiMatchesCount} AI
                    </span>
                  )}
                  {pendingVerificationCount > 0 && (
                    <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold rounded-full bg-rose-600 text-white">
                      {pendingVerificationCount}
                    </span>
                  )}
                </button>

                {/* Primary Action Button */}
                <button
                  id="btn-header-report-person"
                  type="button"
                  onClick={() => handleNav('report-case')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors"
                >
                  <PlusCircle size={16} className="text-amber-400" />
                  <span>Intake New Case</span>
                </button>

                {/* Switch to Public View */}
                <button
                  id="btn-header-logout-public"
                  type="button"
                  onClick={logoutToPublic}
                  className="px-2.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Exit investigator mode and return to public citizen view"
                >
                  <LogOut size={14} />
                  <span>Public View</span>
                </button>
              </>
            ) : (
              <>
                {/* Investigator Access Button for Law Enforcement */}
                <button
                  id="btn-header-investigator-signin"
                  type="button"
                  onClick={onOpenInvestigatorLogin}
                  className="px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                  title="Official Law Enforcement & Detective Portal"
                >
                  <Shield size={14} className="text-amber-400" />
                  <span>Investigator Sign-In</span>
                </button>

                {/* Primary Citizen Action Button */}
                <button
                  id="btn-header-report-person"
                  type="button"
                  onClick={() => handleNav('report-case')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors"
                >
                  <PlusCircle size={16} />
                  <span>Report Missing Person</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            {isInvestigator ? (
              <button
                id="btn-mobile-caseworker"
                type="button"
                onClick={onOpenVerification}
                className="p-2 rounded-lg border border-slate-200 text-slate-700 relative"
                aria-label="Caseworker Desk"
              >
                <ShieldCheck size={18} />
                {pendingVerificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] font-bold rounded-full bg-rose-600 text-white flex items-center justify-center">
                    {pendingVerificationCount}
                  </span>
                )}
              </button>
            ) : (
              <button
                id="btn-mobile-investigator-signin"
                type="button"
                onClick={onOpenInvestigatorLogin}
                className="p-2 rounded-lg border border-slate-700 bg-slate-900 text-amber-300"
                aria-label="Investigator Sign-In"
              >
                <Shield size={18} className="text-amber-400" />
              </button>
            )}

            <button
              id="btn-mobile-menu-toggle"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2 shadow-lg animate-fadeIn">
          {isInvestigator ? (
            /* Investigator Mobile Links */
            <>
              <button
                id="mobile-nav-home"
                type="button"
                onClick={() => handleNav('home')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between ${
                  currentPage === 'home' ? 'bg-blue-50 text-blue-900 font-bold' : 'text-slate-700'
                }`}
              >
                <span>Command Center (Home)</span>
              </button>

              <button
                id="mobile-nav-cases"
                type="button"
                onClick={() => handleNav('cases')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between ${
                  currentPage === 'cases' || currentPage === 'details' ? 'bg-blue-50 text-blue-900 font-bold' : 'text-slate-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Search size={16} />
                  <span>All Cases Directory</span>
                </span>
                {activeCasesCount > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                    {activeCasesCount}
                  </span>
                )}
              </button>

              <button
                id="mobile-nav-report-sighting"
                type="button"
                onClick={() => handleNav('report-sighting')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                  currentPage === 'report-sighting' ? 'bg-blue-50 text-blue-900 font-bold' : 'text-slate-700'
                }`}
              >
                <Eye size={16} />
                <span>Sighting & AI Review</span>
              </button>

              <button
                id="mobile-nav-about"
                type="button"
                onClick={() => handleNav('about')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                  currentPage === 'about' ? 'bg-blue-50 text-blue-900 font-bold' : 'text-slate-700'
                }`}
              >
                <HelpCircle size={16} />
                <span>Protocol Guide</span>
              </button>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <button
                  id="mobile-btn-report-person"
                  type="button"
                  onClick={() => handleNav('report-case')}
                  className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-xs"
                >
                  <PlusCircle size={16} className="text-amber-400" />
                  <span>Intake New Case</span>
                </button>

                <button
                  id="mobile-btn-caseworker-desk"
                  type="button"
                  onClick={() => {
                    onOpenVerification();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-200"
                >
                  <ShieldCheck size={16} className="text-blue-700" />
                  <span>Authorized Verification Desk ({pendingVerificationCount} pending)</span>
                </button>

                <button
                  id="mobile-btn-logout-public"
                  type="button"
                  onClick={() => {
                    logoutToPublic();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-200"
                >
                  <LogOut size={14} />
                  <span>Exit to Public Citizen View</span>
                </button>
              </div>
            </>
          ) : (
            /* Public Citizen Mobile Links (NO CASE DIRECTORY) */
            <>
              <button
                id="mobile-nav-home"
                type="button"
                onClick={() => handleNav('home')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between ${
                  currentPage === 'home' ? 'bg-blue-50 text-blue-900 font-bold' : 'text-slate-700'
                }`}
              >
                <span>Citizen Portal Home</span>
              </button>

              <button
                id="mobile-nav-report-case"
                type="button"
                onClick={() => handleNav('report-case')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                  currentPage === 'report-case' ? 'bg-rose-50 text-rose-900 font-bold' : 'text-slate-700'
                }`}
              >
                <PlusCircle size={16} className="text-rose-600" />
                <span>Register Missing Loved One</span>
              </button>

              <button
                id="mobile-nav-report-sighting"
                type="button"
                onClick={() => handleNav('report-sighting')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                  currentPage === 'report-sighting' ? 'bg-blue-50 text-blue-900 font-bold' : 'text-slate-700'
                }`}
              >
                <Eye size={16} className="text-blue-600" />
                <span>Report Sighting / Found Person</span>
              </button>

              <button
                id="mobile-nav-about"
                type="button"
                onClick={() => handleNav('about')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                  currentPage === 'about' ? 'bg-blue-50 text-blue-900 font-bold' : 'text-slate-700'
                }`}
              >
                <HelpCircle size={16} />
                <span>Safety & Hotline Guide</span>
              </button>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <button
                  id="mobile-btn-report-person"
                  type="button"
                  onClick={() => handleNav('report-case')}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-xs"
                >
                  <PlusCircle size={16} />
                  <span>Report Missing Person</span>
                </button>

                <button
                  id="mobile-btn-investigator-signin"
                  type="button"
                  onClick={() => {
                    onOpenInvestigatorLogin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 shadow-xs"
                >
                  <Shield size={15} className="text-amber-400" />
                  <span>Investigator Sign-In (Law Enforcement)</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};
