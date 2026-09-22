import React from 'react';
import { CaseStatus } from '../../types';
import { AlertCircle, Eye, CheckCircle2 } from 'lucide-react';

interface StatusBadgeProps {
  status: CaseStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs sm:text-sm px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  if (status === 'Missing') {
    return (
      <span
        id={`badge-status-missing`}
        className={`inline-flex items-center rounded-full bg-rose-50 text-rose-700 border border-rose-200 tracking-wide uppercase ${sizeClasses[size]}`}
      >
        {showIcon && <AlertCircle size={iconSizes[size]} className="text-rose-600 animate-pulse" />}
        <span>Active Missing</span>
      </span>
    );
  }

  if (status === 'Sighting Reported') {
    return (
      <span
        id={`badge-status-sighting`}
        className={`inline-flex items-center rounded-full bg-amber-50 text-amber-800 border border-amber-300 tracking-wide uppercase ${sizeClasses[size]}`}
      >
        {showIcon && <Eye size={iconSizes[size]} className="text-amber-600" />}
        <span>Sighting Reported</span>
      </span>
    );
  }

  return (
    <span
      id={`badge-status-found`}
      className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 tracking-wide uppercase ${sizeClasses[size]}`}
    >
      {showIcon && <CheckCircle2 size={iconSizes[size]} className="text-emerald-600" />}
      <span>Person Found Safe</span>
    </span>
  );
};
