export type CaseStatus = 'Missing' | 'Sighting Reported' | 'Found';

export type UserRole = 'public' | 'investigator';

export interface InvestigatorProfile {
  badgeNumber: string;
  officerName: string;
  department: string;
  rank: string;
  email?: string;
}

export type Gender = 'Female' | 'Male' | 'Non-Binary' | 'Other';

export interface LocationInfo {
  address?: string;
  city: string;
  state: string;
  zip?: string;
  landmark?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface PhysicalDescription {
  height: string;
  weight: string;
  hairColor: string;
  eyeColor: string;
  ethnicity?: string;
  distinguishingMarks?: string;
  medicalNeeds?: string;
}

export interface ConfidentialContact {
  reporterName: string;
  relationship: string;
  contactEmail: string;
  contactPhone: string;
  lawEnforcementAgency?: string;
  policeCaseNumber?: string;
  officerContact?: string;
}

export interface CaseTimelineItem {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'report' | 'sighting' | 'verified' | 'found' | 'ai_analysis';
}

export interface DetectedFaceBox {
  id: string;
  x: number; // percentage or px
  y: number;
  width: number;
  height: number;
  confidence: number;
  label?: string;
}

export type AiAnalysisResultType = 'potential_match' | 'low_similarity' | 'unable_to_analyze';

export type AiQualityStatus = 'acceptable' | 'blurry' | 'dark' | 'obstructed' | 'invalid';

export type AiAnalysisFailureReason =
  | 'no_face'
  | 'multiple_faces'
  | 'poor_quality'
  | 'unsupported_format'
  | 'processing_error';

export interface AiAnalysisStep {
  step: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export interface AiMatchAnalysis {
  analysisId: string;
  faceDetected: boolean;
  facesCount: number;
  detectedFaces?: DetectedFaceBox[];
  selectedFaceIndex?: number;
  similarityScore?: number; // Technical similarity measure e.g. 87 (0-100), NOT a probability of identity!
  result: AiAnalysisResultType;
  qualityStatus: AiQualityStatus;
  qualityDetails?: string;
  message: string;
  reason?: AiAnalysisFailureReason;
  provider: 'ai_demo_mode' | 'client_vision' | 'gemini_vision';
  isDemoMode: boolean;
  comparedCaseId: string;
  comparedPersonName: string;
  referencePhotoUrl: string;
  sightingPhotoUrl: string;
  analyzedAt: string;
  analysisSteps: AiAnalysisStep[];
  caseworkerReviewStatus?: 'pending_review' | 'rejected' | 'confirmed_sighting' | 'confirmed_found';
  caseworkerReviewNotes?: string;
  caseworkerReviewedAt?: string;
}

export interface MissingPersonCase {
  id: string; // e.g. FS-2025-0419
  name: string;
  nickname?: string;
  age: number;
  gender: Gender;
  dateOfBirth?: string;
  photoUrl: string;
  additionalPhotos?: string[];
  dateMissing: string; // YYYY-MM-DD
  timeMissing?: string;
  lastSeenLocation: LocationInfo;
  circumstances: string;
  physicalDescription: PhysicalDescription;
  clothingDetails: string;
  status: CaseStatus;
  statusUpdatedAt: string;
  confidentialContact: ConfidentialContact;
  sightingsCount: number;
  createdAt: string;
  urgentAlert?: boolean;
  timeline: CaseTimelineItem[];
}

export interface SightingReport {
  id: string; // e.g. ST-2025-102
  caseId: string;
  personName: string;
  sightingType: 'general_sighting' | 'may_be_found';
  location: LocationInfo;
  date: string;
  time: string;
  description: string;
  photoUrl?: string;
  aiAnalysis?: AiMatchAnalysis;
  contactInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    isAnonymous: boolean;
  };
  submittedAt: string;
  verificationStatus: 'pending' | 'verified' | 'dismissed';
  adminNotes?: string;
}

export interface CaseFilters {
  search: string;
  location: string;
  gender: string;
  ageGroup: 'all' | 'child' | 'teen' | 'adult' | 'senior';
  status: 'all' | CaseStatus;
  sortBy: 'recent' | 'missing_date_desc' | 'missing_date_asc' | 'name';
}
