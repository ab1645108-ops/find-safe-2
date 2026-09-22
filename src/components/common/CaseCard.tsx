import React, { useState } from 'react';
import { MissingPersonCase } from '../../types';
import { StatusBadge } from './StatusBadge';
import { MapPin, Calendar, User, Eye, ArrowRight, Shield } from 'lucide-react';

interface CaseCardProps {
  caseItem: MissingPersonCase;
  onViewDetails: (caseId: string) => void;
  onReportSighting: (caseId: string) => void;
}

export const CaseCard: React.FC<CaseCardProps> = ({
  caseItem,
  onViewDetails,
  onReportSighting,
}) => {
  const [imgError, setImgError] = useState(false);

  // Format missing date for clear readability
  const formattedDate = new Date(caseItem.dateMissing).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate approximate days missing
  const daysMissing = Math.max(
    0,
    Math.floor((Date.now() - new Date(caseItem.dateMissing).getTime()) / (1000 * 60 * 60 * 24))
  );

  return (
    <article
      id={`case-card-${caseItem.id}`}
      className="bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group"
    >
      {/* Card Header & Photo */}
      <div className="relative aspect-4/3 sm:aspect-16/11 bg-slate-100 overflow-hidden">
        {imgError ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-200 text-slate-500 p-4 text-center">
            <User size={48} className="text-slate-400 mb-2" />
            <span className="text-xs font-medium">Photograph on File</span>
            <span className="text-[10px] text-slate-400 mt-1">Ref #{caseItem.id}</span>
          </div>
        ) : (
          <img
            src={caseItem.photoUrl}
            alt={`Photograph of missing person ${caseItem.name}`}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
            loading="lazy"
          />
        )}

        {/* Top Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-2 pointer-events-none">
          <div className="pointer-events-auto">
            <StatusBadge status={caseItem.status} size="sm" />
          </div>
          <span className="pointer-events-auto px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-mono font-medium shadow-xs">
            {caseItem.id}
          </span>
        </div>

        {/* Urgent Alert Banner */}
        {caseItem.urgentAlert && caseItem.status !== 'Found' && (
          <div className="absolute bottom-0 inset-x-0 bg-rose-600/95 text-white text-[11px] font-bold px-3 py-1 flex items-center justify-between tracking-wide uppercase">
            <span className="flex items-center gap-1.5">
              <Shield size={12} />
              High Priority Alert
            </span>
            <span>{daysMissing === 0 ? 'Today' : `${daysMissing}d missing`}</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug group-hover:text-blue-700 transition-colors">
              {caseItem.name}
              {caseItem.nickname && (
                <span className="text-slate-500 text-sm font-normal ml-1.5">
                  &ldquo;{caseItem.nickname}&rdquo;
                </span>
              )}
            </h3>
            <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
              Age {caseItem.age}
            </span>
          </div>

          <div className="mt-2.5 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <User size={14} className="text-slate-400 shrink-0" />
              <span>
                <strong className="text-slate-700 font-medium">Gender:</strong> {caseItem.gender}
              </span>
            </div>

            <div className="flex items-start gap-2">
              <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
              <span className="line-clamp-1">
                <strong className="text-slate-700 font-medium">Last seen:</strong>{' '}
                {caseItem.lastSeenLocation.city}, {caseItem.lastSeenLocation.state}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-slate-400 shrink-0" />
              <span>
                <strong className="text-slate-700 font-medium">Date Missing:</strong> {formattedDate}
              </span>
            </div>
          </div>

          {/* Distinctive excerpt */}
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            <span className="font-medium text-slate-700">Physical Details:</span> {caseItem.clothingDetails || caseItem.physicalDescription.hairColor}
          </div>
        </div>

        {/* Card Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          {caseItem.status !== 'Found' ? (
            <button
              id={`btn-card-sighting-${caseItem.id}`}
              type="button"
              onClick={() => onReportSighting(caseItem.id)}
              className="text-xs font-semibold text-blue-700 hover:text-blue-800 hover:underline flex items-center gap-1 py-1"
            >
              <Eye size={13} />
              Report Sighting
            </button>
          ) : (
            <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
              Case Resolved
            </span>
          )}

          <button
            id={`btn-card-details-${caseItem.id}`}
            type="button"
            onClick={() => onViewDetails(caseItem.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold tracking-wide transition-colors shadow-2xs"
          >
            <span>View Details</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </article>
  );
};
