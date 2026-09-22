import React, { useState, useMemo } from 'react';
import { useCases } from '../context/CaseContext';
import { PageId } from '../components/layout/Header';
import { CaseCard } from '../components/common/CaseCard';
import { CaseStatus } from '../types';
import {
  Search,
  Filter,
  MapPin,
  User,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  AlertCircle,
  Lock,
  Shield,
  KeyRound,
  PlusCircle,
  Eye,
  FileCheck,
} from 'lucide-react';

interface MissingPersonsPageProps {
  onNavigate: (page: PageId, caseId?: string) => void;
  onOpenInvestigatorLogin?: () => void;
}

export const MissingPersonsPage: React.FC<MissingPersonsPageProps> = ({
  onNavigate,
  onOpenInvestigatorLogin,
}) => {
  const { cases, isInvestigator, investigatorProfile } = useCases();

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<'all' | 'child' | 'teen' | 'adult' | 'senior'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | CaseStatus>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'missing_desc' | 'name'>('recent');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // If public citizen, show restricted message because only investigators can browse all cases
  if (!isInvestigator) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8 animate-in fade-in">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 mx-auto flex items-center justify-center">
            <Lock size={32} />
          </div>

          <div className="max-w-xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Shield size={13} />
              <span>Restricted Law Enforcement System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950">
              Case Directory Restricted
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              In accordance with privacy standards and investigative security protocols, complete case records, personal identities, and sensitive evidence files cannot be viewed publicly. Only verified law enforcement officers and authorized caseworkers have directory access.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto pt-4 text-left">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <PlusCircle size={18} />
                <span>Need to Report a Missing Person?</span>
              </div>
              <p className="text-xs text-slate-600">
                Submit an urgent missing person report with photos and last-seen details directly into our intake queue.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('report-case')}
                className="w-full mt-2 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Register Missing Person
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                <Eye size={18} />
                <span>Saw Someone or Found a Person?</span>
              </div>
              <p className="text-xs text-slate-600">
                Submit a sighting tip or upload a photograph to run real-time automated AI facial matching.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('report-sighting')}
                className="w-full mt-2 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Report Sighting / Found Person
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              id="btn-public-open-login"
              onClick={onOpenInvestigatorLogin}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <KeyRound size={15} />
              <span>Investigator Sign-In (Unlock Full Directory)</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm transition-colors"
            >
              Return to Public Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Extract unique locations (state/city)
  const uniqueLocations = useMemo(() => {
    const set = new Set<string>();
    cases.forEach((c) => {
      set.add(`${c.lastSeenLocation.city}, ${c.lastSeenLocation.state}`);
    });
    return Array.from(set).sort();
  }, [cases]);

  // Filter & sort logic
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // 1. Search query (name, case ID, circumstances, clothing)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = c.name.toLowerCase().includes(q) || (c.nickname && c.nickname.toLowerCase().includes(q));
        const matchesId = c.id.toLowerCase().includes(q);
        const matchesLoc = `${c.lastSeenLocation.city} ${c.lastSeenLocation.state} ${c.lastSeenLocation.address || ''}`.toLowerCase().includes(q);
        const matchesDesc = c.circumstances.toLowerCase().includes(q) || c.clothingDetails.toLowerCase().includes(q);

        if (!matchesName && !matchesId && !matchesLoc && !matchesDesc) {
          return false;
        }
      }

      // 2. Location filter
      if (selectedLocation !== 'all') {
        const locString = `${c.lastSeenLocation.city}, ${c.lastSeenLocation.state}`;
        if (locString !== selectedLocation) {
          return false;
        }
      }

      // 3. Gender filter
      if (selectedGender !== 'all' && c.gender !== selectedGender) {
        return false;
      }

      // 4. Age group filter
      if (selectedAgeGroup !== 'all') {
        if (selectedAgeGroup === 'child' && (c.age < 0 || c.age > 12)) return false;
        if (selectedAgeGroup === 'teen' && (c.age < 13 || c.age > 17)) return false;
        if (selectedAgeGroup === 'adult' && (c.age < 18 || c.age > 59)) return false;
        if (selectedAgeGroup === 'senior' && c.age < 60) return false;
      }

      // 5. Status filter
      if (selectedStatus !== 'all' && c.status !== selectedStatus) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'missing_desc') {
        return new Date(b.dateMissing).getTime() - new Date(a.dateMissing).getTime();
      }
      // 'recent' by creation date
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [cases, searchQuery, selectedLocation, selectedGender, selectedAgeGroup, selectedStatus, sortBy]);

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedLocation !== 'all' ||
    selectedGender !== 'all' ||
    selectedAgeGroup !== 'all' ||
    selectedStatus !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedLocation('all');
    setSelectedGender('all');
    setSelectedAgeGroup('all');
    setSelectedStatus('all');
    setSortBy('recent');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Investigator Master Case Directory
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-900 text-amber-300 border border-blue-800">
              Clearance Level: Sworn Officer
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            All Active Cases
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            Logged as Officer {investigatorProfile.officerName} ({investigatorProfile.badgeNumber}). Access full forensic dossiers, log new sightings, and verify or change case statuses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-toggle-filters-mobile"
            type="button"
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="md:hidden inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold"
          >
            <SlidersHorizontal size={15} />
            <span>Filters {hasActiveFilters && '(Active)'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Main Search Input */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            id="input-search-missing"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, nickname, Case ID (e.g. FS-2025-0841), landmark, or physical clothing..."
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 hover:text-slate-700 bg-slate-200/60 px-1.5 py-0.5 rounded"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Row */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 ${showFiltersMobile ? 'block' : 'hidden md:grid'}`}>
          {/* 1. Location Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Location
            </label>
            <div className="relative">
              <select
                id="select-filter-location"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-2 pr-8 font-medium appearance-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">All Locations</option>
                {uniqueLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* 2. Gender Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Gender
            </label>
            <div className="relative">
              <select
                id="select-filter-gender"
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-2 pr-8 font-medium appearance-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">All Genders</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Other">Other</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* 3. Age Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Age Range
            </label>
            <div className="relative">
              <select
                id="select-filter-age"
                value={selectedAgeGroup}
                onChange={(e) => setSelectedAgeGroup(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-2 pr-8 font-medium appearance-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">All Ages</option>
                <option value="child">Child (0 - 12)</option>
                <option value="teen">Teen (13 - 17)</option>
                <option value="adult">Adult (18 - 59)</option>
                <option value="senior">Senior (60+)</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* 4. Status Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Status
            </label>
            <div className="relative">
              <select
                id="select-filter-status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-2 pr-8 font-medium appearance-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">All Statuses</option>
                <option value="Missing">Active Missing</option>
                <option value="Sighting Reported">Sighting Reported</option>
                <option value="Found">Person Found Safe</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* 5. Sort By */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Sort By
            </label>
            <div className="relative">
              <select
                id="select-sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-2 pr-8 font-medium appearance-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="recent">Recently Added to System</option>
                <option value="missing_desc">Missing Date (Newest first)</option>
                <option value="name">Name (A-Z)</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Results Count & Reset row */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong>{filteredCases.length}</strong> of <strong>{cases.length}</strong> cases
            </span>
            {hasActiveFilters && (
              <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-semibold">
                Filters Active
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              id="btn-reset-all-filters"
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-semibold"
            >
              <RotateCcw size={13} />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Cases Grid */}
      {filteredCases.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCases.map((caseItem) => (
            <CaseCard
              key={caseItem.id}
              caseItem={caseItem}
              onViewDetails={(id) => onNavigate('details', id)}
              onReportSighting={(id) => onNavigate('report-sighting', id)}
            />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-lg mx-auto">
          <AlertCircle size={40} className="mx-auto text-slate-400 mb-3" />
          <h3 className="text-lg font-bold text-slate-900">No Missing Persons Matched Criteria</h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            We couldn&apos;t find any records matching your search query or filter configuration. Try broadening your criteria or resetting filters.
          </p>
          <div className="mt-5">
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Reset Filters & View All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
