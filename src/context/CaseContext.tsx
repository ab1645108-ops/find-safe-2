import React, { createContext, useContext, useState, useEffect } from 'react';
import { MissingPersonCase, SightingReport, CaseStatus, CaseTimelineItem, UserRole, InvestigatorProfile } from '../types';
import { INITIAL_CASES, INITIAL_SIGHTINGS } from '../data/mockData';

interface CaseContextType {
  cases: MissingPersonCase[];
  sightings: SightingReport[];
  userRole: UserRole;
  isInvestigator: boolean;
  investigatorProfile: InvestigatorProfile;
  setUserRole: (role: UserRole) => void;
  loginInvestigator: (profile?: Partial<InvestigatorProfile>) => void;
  logoutToPublic: () => void;
  trackCaseById: (trackingId: string) => MissingPersonCase | undefined;
  getCaseById: (id: string) => MissingPersonCase | undefined;
  getSightingsForCase: (caseId: string) => SightingReport[];
  addCase: (caseData: Omit<MissingPersonCase, 'id' | 'createdAt' | 'sightingsCount' | 'timeline' | 'statusUpdatedAt'>) => MissingPersonCase;
  addSighting: (sightingData: Omit<SightingReport, 'id' | 'submittedAt' | 'verificationStatus'>) => SightingReport;
  verifySighting: (sightingId: string, action: 'verify_sighting' | 'verify_found' | 'dismiss', adminNotes?: string) => void;
  reviewAiMatch: (sightingId: string, action: 'reject' | 'confirm_sighting' | 'confirm_found', notes?: string) => void;
  updateCaseStatus: (caseId: string, newStatus: CaseStatus, reason?: string) => void;
  resetToMockData: () => void;
  pendingVerificationCount: number;
  pendingAiMatchesCount: number;
}

const CaseContext = createContext<CaseContextType | undefined>(undefined);

const STORAGE_KEY_CASES = 'findsafe_cases_v1';
const STORAGE_KEY_SIGHTINGS = 'findsafe_sightings_v1';
const STORAGE_KEY_ROLE = 'findsafe_user_role_v1';
const STORAGE_KEY_INVESTIGATOR = 'findsafe_investigator_v1';

const DEFAULT_INVESTIGATOR: InvestigatorProfile = {
  badgeNumber: 'DET-4829',
  officerName: 'Det. Sarah Vance',
  department: 'Special Victims & Missing Persons Unit',
  rank: 'Lead Detective',
  email: 's.vance@investigations.gov',
};

export const CaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRoleState] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ROLE);
      if (saved === 'investigator' || saved === 'public') return saved;
    } catch (e) {
      console.error(e);
    }
    return 'public';
  });

  const [investigatorProfile, setInvestigatorProfile] = useState<InvestigatorProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_INVESTIGATOR);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_INVESTIGATOR;
  });
  const [cases, setCases] = useState<MissingPersonCase[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CASES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed reading cases from localStorage', e);
    }
    return INITIAL_CASES;
  });

  const [sightings, setSightings] = useState<SightingReport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SIGHTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed reading sightings from localStorage', e);
    }
    return INITIAL_SIGHTINGS;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CASES, JSON.stringify(cases));
    } catch (e) {
      console.error('Failed saving cases to localStorage', e);
    }
  }, [cases]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SIGHTINGS, JSON.stringify(sightings));
    } catch (e) {
      console.error('Failed saving sightings to localStorage', e);
    }
  }, [sightings]);

  const getCaseById = (id: string): MissingPersonCase | undefined => {
    return cases.find((c) => c.id.toLowerCase() === id.trim().toLowerCase());
  };

  const getSightingsForCase = (caseId: string): SightingReport[] => {
    return sightings.filter((s) => s.caseId.toLowerCase() === caseId.trim().toLowerCase());
  };

  const addCase = (
    caseData: Omit<MissingPersonCase, 'id' | 'createdAt' | 'sightingsCount' | 'timeline' | 'statusUpdatedAt'>
  ): MissingPersonCase => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const id = `FS-${year}-${randomNum}`;
    const now = new Date().toISOString();

    const newCase: MissingPersonCase = {
      ...caseData,
      id,
      createdAt: now,
      statusUpdatedAt: now,
      sightingsCount: 0,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          title: 'Case Registered on FindSafe',
          description: `Case published to public directory with reference #${id}. Notification routed to local authorities.`,
          type: 'report',
        },
      ],
    };

    setCases((prev) => [newCase, ...prev]);
    return newCase;
  };

  const addSighting = (
    sightingData: Omit<SightingReport, 'id' | 'submittedAt' | 'verificationStatus'>
  ): SightingReport => {
    const randomId = Math.floor(100 + Math.random() * 900);
    const id = `ST-${new Date().getFullYear()}-${randomId}`;
    const now = new Date().toISOString();

    const newSighting: SightingReport = {
      ...sightingData,
      id,
      submittedAt: now,
      verificationStatus: 'pending', // All public sightings start as pending verification
    };

    setSightings((prev) => [newSighting, ...prev]);

    // Update case sightings count and add a pending entry to the timeline
    setCases((prev) =>
      prev.map((c) => {
        if (c.id.toLowerCase() === sightingData.caseId.toLowerCase()) {
          const isMayBeFound = sightingData.sightingType === 'may_be_found';
          const newTimelineItem: CaseTimelineItem = {
            id: `tl-s-${Date.now()}`,
            date: new Date().toISOString().replace('T', ' ').slice(0, 16),
            title: isMayBeFound
              ? 'Urgent: "Person May Have Been Found" Report Submitted'
              : 'Community Sighting Submitted',
            description: `Sighting reported near ${sightingData.location.city}, ${sightingData.location.state}. Pending review by authorized coordinator.`,
            type: 'sighting',
          };

          const newTimelineItems: CaseTimelineItem[] = [newTimelineItem];

          // If AI Face Matching analysis was performed with this sighting, add AI event to timeline
          if (sightingData.aiAnalysis) {
            const ai = sightingData.aiAnalysis;
            const isMatch = ai.result === 'potential_match';
            const aiTimelineItem = {
              id: `tl-ai-${Date.now()}`,
              date: new Date().toISOString().replace('T', ' ').slice(0, 16),
              title: isMatch
                ? `AI-Assisted Photo Comparison: Potential Match (${ai.similarityScore}% Similarity)`
                : ai.result === 'low_similarity'
                ? `AI-Assisted Photo Comparison: Low Similarity (${ai.similarityScore}% Similarity)`
                : 'AI-Assisted Photo Comparison Completed',
              description: isMatch
                ? `AI facial analysis calculated an ${ai.similarityScore}% technical similarity score against the registered reference photograph. Case flagged for prioritized caseworker review. (AI similarity is not proof of identity; human verification required).`
                : ai.message,
              type: 'ai_analysis' as const,
            };
            newTimelineItems.unshift(aiTimelineItem);
          }

          return {
            ...c,
            sightingsCount: c.sightingsCount + 1,
            timeline: [...newTimelineItems, ...c.timeline],
          };
        }
        return c;
      })
    );

    return newSighting;
  };

  const reviewAiMatch = (
    sightingId: string,
    action: 'reject' | 'confirm_sighting' | 'confirm_found',
    notes?: string
  ) => {
    const sighting = sightings.find((s) => s.id === sightingId);
    if (!sighting) return;

    const now = new Date().toISOString();
    const formattedDate = now.replace('T', ' ').slice(0, 16);
    const reviewStatus =
      action === 'reject'
        ? 'rejected'
        : action === 'confirm_sighting'
        ? 'confirmed_sighting'
        : 'confirmed_found';

    setSightings((prev) =>
      prev.map((s) => {
        if (s.id === sightingId) {
          return {
            ...s,
            verificationStatus: action === 'reject' ? 'dismissed' : 'verified',
            adminNotes: notes || s.adminNotes,
            aiAnalysis: s.aiAnalysis
              ? {
                  ...s.aiAnalysis,
                  caseworkerReviewStatus: reviewStatus,
                  caseworkerReviewNotes: notes || 'Reviewed by authorized caseworker.',
                  caseworkerReviewedAt: now,
                }
              : undefined,
          };
        }
        return s;
      })
    );

    const timelineTitle =
      action === 'confirm_found'
        ? 'Official Status Updated: Person Found Safe (AI Match Verified)'
        : action === 'confirm_sighting'
        ? 'Caseworker Verified AI Potential Match as Credible Sighting'
        : 'AI Potential Match Reviewed: Rejected by Caseworker';

    const timelineDescription =
      notes ||
      (action === 'confirm_found'
        ? `Law enforcement and caseworker officially confirmed identity from Sighting #${sighting.id}. Person safely found.`
        : action === 'confirm_sighting'
        ? `Authorized caseworker evaluated photographic facial characteristics and verified Sighting #${sighting.id}.`
        : `Authorized caseworker reviewed AI analysis for Sighting #${sighting.id} and determined facial features do not match.`);

    const timelineItem = {
      id: `tl-ai-review-${Date.now()}`,
      date: formattedDate,
      title: timelineTitle,
      description: timelineDescription,
      type: (action === 'confirm_found'
        ? 'found'
        : action === 'confirm_sighting'
        ? 'verified'
        : 'ai_analysis') as any,
    };

    setCases((prev) =>
      prev.map((c) => {
        if (c.id.toLowerCase() === sighting.caseId.toLowerCase()) {
          const newStatus: CaseStatus =
            action === 'confirm_found'
              ? 'Found'
              : action === 'confirm_sighting'
              ? 'Sighting Reported'
              : c.status;

          return {
            ...c,
            status: newStatus,
            statusUpdatedAt: action !== 'reject' ? now : c.statusUpdatedAt,
            urgentAlert: newStatus === 'Found' ? false : c.urgentAlert,
            timeline: [timelineItem, ...c.timeline],
          };
        }
        return c;
      })
    );
  };

  const verifySighting = (
    sightingId: string,
    action: 'verify_sighting' | 'verify_found' | 'dismiss',
    adminNotes?: string
  ) => {
    const sighting = sightings.find((s) => s.id === sightingId);
    if (!sighting) return;

    const updatedStatus = action === 'dismiss' ? 'dismissed' : 'verified';

    setSightings((prev) =>
      prev.map((s) =>
        s.id === sightingId
          ? {
              ...s,
              verificationStatus: updatedStatus,
              adminNotes: adminNotes || s.adminNotes,
            }
          : s
      )
    );

    // Apply official status change to the case
    if (action === 'verify_found') {
      updateCaseStatus(
        sighting.caseId,
        'Found',
        `Confirmed via Sighting #${sighting.id}. ${adminNotes || 'Authorized law enforcement confirmation complete.'}`
      );
    } else if (action === 'verify_sighting') {
      const targetCase = getCaseById(sighting.caseId);
      if (targetCase && targetCase.status !== 'Found') {
        updateCaseStatus(
          sighting.caseId,
          'Sighting Reported',
          `Authorized verification of sighting at ${sighting.location.city}, ${sighting.location.state}.`
        );
      }
    }
  };

  const updateCaseStatus = (caseId: string, newStatus: CaseStatus, reason?: string) => {
    const now = new Date().toISOString();
    const formattedDate = now.replace('T', ' ').slice(0, 16);

    setCases((prev) =>
      prev.map((c) => {
        if (c.id.toLowerCase() === caseId.toLowerCase()) {
          const type: 'verified' | 'found' | 'report' =
            newStatus === 'Found' ? 'found' : 'verified';

          const timelineTitle =
            newStatus === 'Found'
              ? 'Official Status Updated: Person Found Safe'
              : newStatus === 'Sighting Reported'
              ? 'Status Updated: Credible Sighting Verified'
              : 'Status Updated: Active Missing Case';

          const timelineItem = {
            id: `tl-stat-${Date.now()}`,
            date: formattedDate,
            title: timelineTitle,
            description:
              reason ||
              `Status officially modified to "${newStatus}" by authorized caseworker.`,
            type,
          };

          return {
            ...c,
            status: newStatus,
            statusUpdatedAt: now,
            urgentAlert: newStatus === 'Found' ? false : c.urgentAlert,
            timeline: [timelineItem, ...c.timeline],
          };
        }
        return c;
      })
    );
  };

  // Sync userRole to localStorage
  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    try {
      localStorage.setItem(STORAGE_KEY_ROLE, role);
    } catch (e) {
      console.error(e);
    }
  };

  const loginInvestigator = (profile?: Partial<InvestigatorProfile>) => {
    if (profile) {
      const merged: InvestigatorProfile = {
        ...investigatorProfile,
        ...profile,
      };
      setInvestigatorProfile(merged);
      try {
        localStorage.setItem(STORAGE_KEY_INVESTIGATOR, JSON.stringify(merged));
      } catch (e) {
        console.error(e);
      }
    }
    setUserRole('investigator');
  };

  const logoutToPublic = () => {
    setUserRole('public');
  };

  const trackCaseById = (trackingId: string): MissingPersonCase | undefined => {
    if (!trackingId.trim()) return undefined;
    const clean = trackingId.trim().toLowerCase();
    return cases.find(
      (c) =>
        c.id.toLowerCase() === clean ||
        c.name.toLowerCase() === clean ||
        (c.confidentialContact.policeCaseNumber &&
          c.confidentialContact.policeCaseNumber.toLowerCase() === clean)
    );
  };

  const resetToMockData = () => {
    setCases(INITIAL_CASES);
    setSightings(INITIAL_SIGHTINGS);
    localStorage.removeItem(STORAGE_KEY_CASES);
    localStorage.removeItem(STORAGE_KEY_SIGHTINGS);
  };

  const pendingVerificationCount = sightings.filter(
    (s) => s.verificationStatus === 'pending'
  ).length;

  const pendingAiMatchesCount = sightings.filter(
    (s) =>
      s.aiAnalysis &&
      s.aiAnalysis.result === 'potential_match' &&
      s.aiAnalysis.caseworkerReviewStatus === 'pending_review'
  ).length;

  return (
    <CaseContext.Provider
      value={{
        cases,
        sightings,
        userRole,
        isInvestigator: userRole === 'investigator',
        investigatorProfile,
        setUserRole,
        loginInvestigator,
        logoutToPublic,
        trackCaseById,
        getCaseById,
        getSightingsForCase,
        addCase,
        addSighting,
        verifySighting,
        reviewAiMatch,
        updateCaseStatus,
        resetToMockData,
        pendingVerificationCount,
        pendingAiMatchesCount,
      }}
    >
      {children}
    </CaseContext.Provider>
  );
};

export const useCases = (): CaseContextType => {
  const context = useContext(CaseContext);
  if (!context) {
    throw new Error('useCases must be used within a CaseProvider');
  }
  return context;
};
