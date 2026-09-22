/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CaseProvider, useCases } from './context/CaseContext';
import { Header, PageId } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { VerificationModal } from './components/admin/VerificationModal';
import { InvestigatorLoginModal } from './components/auth/InvestigatorLoginModal';
import { HomePage } from './pages/HomePage';
import { PublicPortalPage } from './pages/PublicPortalPage';
import { MissingPersonsPage } from './pages/MissingPersonsPage';
import { CaseDetailsPage } from './pages/CaseDetailsPage';
import { ReportCasePage } from './pages/ReportCasePage';
import { ReportSightingPage } from './pages/ReportSightingPage';
import { AboutPage } from './pages/AboutPage';

function AppContent() {
  const { isInvestigator } = useCases();
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [selectedCaseId, setSelectedCaseId] = useState<string | undefined>(undefined);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isInvestigatorLoginOpen, setIsInvestigatorLoginOpen] = useState(false);

  // Scroll to top whenever route/page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, selectedCaseId]);

  const handleNavigate = (page: PageId, caseId?: string) => {
    if (caseId) {
      setSelectedCaseId(caseId);
    }
    setCurrentPage(page);
  };

  const handleOpenVerification = () => {
    setIsVerificationModalOpen(true);
  };

  const handleCloseVerification = () => {
    setIsVerificationModalOpen(false);
  };

  const handleOpenInvestigatorLogin = () => {
    setIsInvestigatorLoginOpen(true);
  };

  const handleCloseInvestigatorLogin = () => {
    setIsInvestigatorLoginOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/60 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Main Public / Investigator Application Header */}
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenVerification={handleOpenVerification}
        onOpenInvestigatorLogin={handleOpenInvestigatorLogin}
      />

      {/* Dynamic Page Outlet */}
      <main className="flex-1">
        {currentPage === 'home' && (
          isInvestigator ? (
            <HomePage
              onNavigate={handleNavigate}
              onOpenVerification={handleOpenVerification}
            />
          ) : (
            <PublicPortalPage
              onNavigate={handleNavigate}
              onOpenInvestigatorLogin={handleOpenInvestigatorLogin}
            />
          )
        )}

        {currentPage === 'cases' && (
          <MissingPersonsPage
            onNavigate={handleNavigate}
            onOpenInvestigatorLogin={handleOpenInvestigatorLogin}
          />
        )}

        {currentPage === 'details' && selectedCaseId && (
          <CaseDetailsPage
            caseId={selectedCaseId}
            onNavigate={handleNavigate}
            onOpenInvestigatorLogin={handleOpenInvestigatorLogin}
            onOpenVerification={handleOpenVerification}
          />
        )}

        {currentPage === 'report-case' && (
          <ReportCasePage onNavigate={handleNavigate} />
        )}

        {currentPage === 'report-sighting' && (
          <ReportSightingPage
            initialCaseId={selectedCaseId}
            onNavigate={handleNavigate}
            onOpenVerification={handleOpenVerification}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage
            onNavigate={handleNavigate}
            onOpenVerification={handleOpenVerification}
          />
        )}
      </main>

      {/* Global Public Service Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenVerification={handleOpenVerification}
      />

      {/* Caseworker Verification Desk Modal */}
      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={handleCloseVerification}
        initialSelectedCaseId={selectedCaseId}
      />

      {/* Investigator Authentication Modal */}
      <InvestigatorLoginModal
        isOpen={isInvestigatorLoginOpen}
        onClose={handleCloseInvestigatorLogin}
      />
    </div>
  );
}

export default function App() {
  return (
    <CaseProvider>
      <AppContent />
    </CaseProvider>
  );
}
