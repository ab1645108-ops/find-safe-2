import React, { useState } from 'react';
import { useCases } from '../context/CaseContext';
import { PageId } from '../components/layout/Header';
import { Gender } from '../types';
import { TimeInput12Hour } from '../components/common/TimeInput12Hour';
import {
  User,
  MapPin,
  Calendar,
  Camera,
  Shield,
  Phone,
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowRight,
  ArrowLeft,
  Upload,
} from 'lucide-react';

interface ReportCasePageProps {
  onNavigate: (page: PageId, caseId?: string) => void;
}

const SAMPLE_PHOTOS = [
  { label: 'Young Woman', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80' },
  { label: 'Young Man', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80' },
  { label: 'Teenager', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80' },
  { label: 'Child', url: 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?w=600&auto=format&fit=crop&q=80' },
  { label: 'Senior', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&auto=format&fit=crop&q=80' },
];

export const ReportCasePage: React.FC<ReportCasePageProps> = ({ onNavigate }) => {
  const { addCase } = useCases();

  // Multi-step form step indicator
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<Gender>('Female');
  const [dateOfBirth, setDateOfBirth] = useState('');

  // Disappearance
  const [dateMissing, setDateMissing] = useState(new Date().toISOString().split('T')[0]);
  const [timeMissing, setTimeMissing] = useState('11:00 AM');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('WA');
  const [zipVal, setZipVal] = useState('');
  const [landmark, setLandmark] = useState('');
  const [circumstances, setCircumstances] = useState('');

  // Physical
  const [height, setHeight] = useState("5'7\"");
  const [weight, setWeight] = useState('140 lbs');
  const [hairColor, setHairColor] = useState('Brown');
  const [eyeColor, setEyeColor] = useState('Brown');
  const [distinguishingMarks, setDistinguishingMarks] = useState('');
  const [medicalNeeds, setMedicalNeeds] = useState('');
  const [clothingDetails, setClothingDetails] = useState('');

  // Photo & Submitter Contact
  const [photoUrl, setPhotoUrl] = useState(SAMPLE_PHOTOS[0].url);
  const [customPhotoInput, setCustomPhotoInput] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [relationship, setRelationship] = useState('Parent / Guardian');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [lawEnforcementAgency, setLawEnforcementAgency] = useState('');
  const [policeCaseNumber, setPoliceCaseNumber] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Validation Error
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // File Upload handler for preview
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (step: number): boolean => {
    setErrorMessage(null);
    if (step === 1) {
      if (!name.trim()) {
        setErrorMessage('Please enter the missing person’s full legal name.');
        return false;
      }
      if (age === '' || Number(age) < 0 || Number(age) > 120) {
        setErrorMessage('Please enter a valid age between 0 and 120.');
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (!dateMissing) {
        setErrorMessage('Please specify the date when the person went missing.');
        return false;
      }
      if (!city.trim() || !stateVal.trim()) {
        setErrorMessage('Please enter at least the city and state of last seen location.');
        return false;
      }
      if (!circumstances.trim() || circumstances.length < 20) {
        setErrorMessage('Please provide a brief description of the circumstances (at least 20 characters).');
        return false;
      }
      return true;
    }

    if (step === 3) {
      if (!clothingDetails.trim()) {
        setErrorMessage('Please describe the clothing and personal effects worn when last seen.');
        return false;
      }
      return true;
    }

    if (step === 4) {
      if (!photoUrl) {
        setErrorMessage('Please provide or select a photograph for identification.');
        return false;
      }
      if (!reporterName.trim()) {
        setErrorMessage('Please enter your name as the submitter.');
        return false;
      }
      if (!contactEmail.trim() && !contactPhone.trim()) {
        setErrorMessage('Please provide either a contact email or telephone number for coordinator verification.');
        return false;
      }
      if (!agreeTerms) {
        setErrorMessage('Please check the confirmation acknowledgment regarding accuracy of report.');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => (prev < 4 ? ((prev + 1) as any) : prev));
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => (prev > 1 ? ((prev - 1) as any) : prev));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    const newCase = addCase({
      name: name.trim(),
      nickname: nickname.trim() || undefined,
      age: Number(age),
      gender,
      dateOfBirth: dateOfBirth || undefined,
      photoUrl,
      dateMissing,
      timeMissing: timeMissing || undefined,
      lastSeenLocation: {
        address: address.trim() || undefined,
        city: city.trim(),
        state: stateVal.trim(),
        zip: zipVal.trim() || undefined,
        landmark: landmark.trim() || undefined,
      },
      circumstances: circumstances.trim(),
      physicalDescription: {
        height: height.trim() || "Unspecified",
        weight: weight.trim() || "Unspecified",
        hairColor: hairColor.trim() || "Unspecified",
        eyeColor: eyeColor.trim() || "Unspecified",
        distinguishingMarks: distinguishingMarks.trim() || undefined,
        medicalNeeds: medicalNeeds.trim() || undefined,
      },
      clothingDetails: clothingDetails.trim(),
      status: 'Missing',
      urgentAlert: Number(age) < 14 || Boolean(medicalNeeds),
      confidentialContact: {
        reporterName: reporterName.trim(),
        relationship: relationship.trim(),
        contactEmail: contactEmail.trim() || 'unspecified@demo.org',
        contactPhone: contactPhone.trim() || 'unspecified',
        lawEnforcementAgency: lawEnforcementAgency.trim() || 'Local Jurisdiction Police Dept',
        policeCaseNumber: policeCaseNumber.trim() || undefined,
      },
    });

    // Navigate directly to new case details page
    onNavigate('details', newCase.id);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-rose-700 text-xs font-bold uppercase tracking-wider mb-1">
          <Shield size={16} />
          <span>Official Case Intake Portal</span>
        </div>
        <h1 className="text-3xl font-black text-slate-950 tracking-tight">
          Report a Missing Person
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Complete the multi-section intake form below. The information will be structured into a searchable public bulletin and coordinated with authorized caseworkers.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div
            className={`py-2 px-1 rounded-lg font-bold border transition-colors ${
              currentStep === 1
                ? 'bg-blue-700 text-white border-blue-700'
                : currentStep > 1
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}
          >
            <span className="block text-[10px] uppercase font-semibold">Step 1</span>
            <span>Identity</span>
          </div>

          <div
            className={`py-2 px-1 rounded-lg font-bold border transition-colors ${
              currentStep === 2
                ? 'bg-blue-700 text-white border-blue-700'
                : currentStep > 2
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}
          >
            <span className="block text-[10px] uppercase font-semibold">Step 2</span>
            <span>Disappearance</span>
          </div>

          <div
            className={`py-2 px-1 rounded-lg font-bold border transition-colors ${
              currentStep === 3
                ? 'bg-blue-700 text-white border-blue-700'
                : currentStep > 3
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}
          >
            <span className="block text-[10px] uppercase font-semibold">Step 3</span>
            <span>Physical Specs</span>
          </div>

          <div
            className={`py-2 px-1 rounded-lg font-bold border transition-colors ${
              currentStep === 4
                ? 'bg-blue-700 text-white border-blue-700'
                : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}
          >
            <span className="block text-[10px] uppercase font-semibold">Step 4</span>
            <span>Photo & Contact</span>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3.5 text-xs flex items-center gap-2.5">
          <AlertCircle size={16} className="text-rose-600 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User size={18} className="text-blue-700" />
                <span>Section 1: Missing Person Identity</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Accurate identification details allow fast public and volunteer recognition.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Legal Name <span className="text-rose-600">*</span>
                </label>
                <input
                  id="input-person-name"
                  type="text"
                  required
                  placeholder="e.g. Elena Rostova"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nickname or Alias
                </label>
                <input
                  id="input-person-nickname"
                  type="text"
                  placeholder="e.g. Lena, Ellie"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Current Age (Years) <span className="text-rose-600">*</span>
                </label>
                <input
                  id="input-person-age"
                  type="number"
                  required
                  min="0"
                  max="120"
                  placeholder="e.g. 24"
                  value={age}
                  onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Gender <span className="text-rose-600">*</span>
                </label>
                <select
                  id="select-person-gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Date of Birth (Optional)
                </label>
                <input
                  id="input-person-dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Disappearance Information */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MapPin size={18} className="text-rose-600" />
                <span>Section 2: Disappearance Location & Circumstances</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Exact last seen coordinates and circumstances aid immediate search radius establishment.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Date Missing <span className="text-rose-600">*</span>
                </label>
                <input
                  id="input-date-missing"
                  type="date"
                  required
                  value={dateMissing}
                  onChange={(e) => setDateMissing(e.target.value)}
                  className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Approximate Time Last Seen
                </label>
                <TimeInput12Hour
                  id="input-time-missing"
                  value={timeMissing}
                  onChange={(val) => setTimeMissing(val)}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Street Address or Cross Streets
                </label>
                <input
                  id="input-last-seen-address"
                  type="text"
                  placeholder="e.g. 4th Ave & Pine St, near transit entrance"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  City <span className="text-rose-600">*</span>
                </label>
                <input
                  id="input-last-seen-city"
                  type="text"
                  required
                  placeholder="e.g. Seattle"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  State <span className="text-rose-600">*</span>
                </label>
                <input
                  id="input-last-seen-state"
                  type="text"
                  required
                  placeholder="e.g. WA"
                  value={stateVal}
                  onChange={(e) => setStateVal(e.target.value)}
                  className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Postal / ZIP Code
                </label>
                <input
                  id="input-last-seen-zip"
                  type="text"
                  placeholder="e.g. 98101"
                  value={zipVal}
                  onChange={(e) => setZipVal(e.target.value)}
                  className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nearest Landmark / Park / Transit
                </label>
                <input
                  id="input-last-seen-landmark"
                  type="text"
                  placeholder="e.g. Light Rail Station, Westlake Center"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Circumstances of Disappearance <span className="text-rose-600">*</span>
                </label>
                <textarea
                  id="textarea-circumstances"
                  required
                  rows={3}
                  placeholder="Describe where the person was traveling, state of mind, whom they were with, vehicle info if applicable, or unusual circumstances..."
                  value={circumstances}
                  onChange={(e) => setCircumstances(e.target.value)}
                  className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Physical Appearance & Clothing */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User size={18} className="text-blue-700" />
                <span>Section 3: Physical Characteristics & Clothing</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Physical descriptors are crucial for visual matching and public sighting reports.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Approximate Height
                </label>
                <input
                  id="input-height"
                  type="text"
                  placeholder="e.g. 5'7&quot; (170 cm)"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Approximate Weight
                </label>
                <input
                  id="input-weight"
                  type="text"
                  placeholder="e.g. 135 lbs"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Hair Color & Style
                </label>
                <input
                  id="input-hair-color"
                  type="text"
                  placeholder="e.g. Brown wavy, shoulder length"
                  value={hairColor}
                  onChange={(e) => setHairColor(e.target.value)}
                  className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Eye Color
                </label>
                <input
                  id="input-eye-color"
                  type="text"
                  placeholder="e.g. Hazel, Dark Brown, Blue"
                  value={eyeColor}
                  onChange={(e) => setEyeColor(e.target.value)}
                  className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Distinguishing Scars, Tattoos, Piercings, or Features
                </label>
                <input
                  id="input-distinguishing-marks"
                  type="text"
                  placeholder="e.g. Small scar above left eyebrow, wrist tattoo, glasses"
                  value={distinguishingMarks}
                  onChange={(e) => setDistinguishingMarks(e.target.value)}
                  className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Urgent Medical Needs / Vulnerabilities (If any)
                </label>
                <input
                  id="input-medical-needs"
                  type="text"
                  placeholder="e.g. Requires daily insulin, asthma inhaler, dementia / memory impairment"
                  value={medicalNeeds}
                  onChange={(e) => setMedicalNeeds(e.target.value)}
                  className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Clothing & Personal Items When Last Seen <span className="text-rose-600">*</span>
                </label>
                <textarea
                  id="textarea-clothing"
                  required
                  rows={3}
                  placeholder="e.g. Dark olive hooded windbreaker, black jeans, white sneakers, carrying navy backpack..."
                  value={clothingDetails}
                  onChange={(e) => setClothingDetails(e.target.value)}
                  className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Photograph & Submitter Information */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Camera size={18} className="text-blue-700" />
                <span>Section 4: Photograph & Confidential Submitter Contact</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload a clear recent portrait. Submitter contact info is kept strictly confidential for coordinator verification.
              </p>
            </div>

            {/* Photo Picker */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select or Upload Recent Photograph <span className="text-rose-600">*</span>
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-28 h-28 rounded-xl bg-slate-200 border-2 border-slate-300 overflow-hidden shrink-0 shadow-2xs">
                  <img
                    src={photoUrl}
                    alt="Preview of missing person"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-3 w-full">
                  <div>
                    <span className="text-xs font-semibold text-slate-700 block mb-1">
                      Option A: Quick Demo Portrait Preset
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {SAMPLE_PHOTOS.map((sample, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPhotoUrl(sample.url)}
                          className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                            photoUrl === sample.url
                              ? 'bg-blue-700 text-white border-blue-700'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {sample.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-800 transition-colors">
                      <Upload size={14} />
                      <span>Upload Photo File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    <input
                      type="url"
                      placeholder="Or paste image URL (https://...)"
                      value={customPhotoInput}
                      onChange={(e) => {
                        setCustomPhotoInput(e.target.value);
                        if (e.target.value.startsWith('http')) {
                          setPhotoUrl(e.target.value);
                        }
                      }}
                      className="text-xs p-1.5 border border-slate-300 rounded-lg flex-1 min-w-[200px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Confidential Submitter Details */}
            <div className="pt-3 space-y-4">
              <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-blue-950 flex items-start gap-2 text-xs">
                <Lock size={16} className="text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Strict Public Privacy Safeguard</span>
                  <p className="text-blue-900/90 mt-0.5">
                    Your personal phone number and email will NEVER be displayed on the public website. They are stored securely for authorized caseworker verification and official updates only.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Full Name (Submitter) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="input-reporter-name"
                    type="text"
                    required
                    placeholder="e.g. Mikhail Rostov"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Relationship to Missing Person <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="input-reporter-relationship"
                    type="text"
                    required
                    placeholder="e.g. Father, Sister, Guardian, Roommate"
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Confidential Phone Number <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="input-reporter-phone"
                    type="tel"
                    required
                    placeholder="e.g. (206) 555-0192"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Confidential Contact Email <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="input-reporter-email"
                    type="email"
                    required
                    placeholder="e.g. reporter@family.org"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Law Enforcement Agency (If filed)
                  </label>
                  <input
                    id="input-agency"
                    type="text"
                    placeholder="e.g. Seattle Police Department"
                    value={lawEnforcementAgency}
                    onChange={(e) => setLawEnforcementAgency(e.target.value)}
                    className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Police Report / Reference Number
                  </label>
                  <input
                    id="input-police-case-number"
                    type="text"
                    placeholder="e.g. SPD-2025-98311"
                    value={policeCaseNumber}
                    onChange={(e) => setPoliceCaseNumber(e.target.value)}
                    className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Confirmation terms checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700">
                  <input
                    id="checkbox-agree-terms"
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>
                    I attest that the information provided is truthful to the best of my knowledge. I understand that submitting false reports is a serious matter and that this report will be published as an active search bulletin on the FindSafe network.
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-between gap-4">
          {currentStep > 1 ? (
            <button
              id="btn-form-prev"
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Previous Step</span>
            </button>
          ) : (
            <div></div>
          )}

          {currentStep < 4 ? (
            <button
              id="btn-form-next"
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <span>Next Section</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              id="btn-submit-case"
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold transition-colors shadow-md"
            >
              <CheckCircle2 size={18} />
              <span>Publish Missing Person Report</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
