import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';

interface SafetyDisclaimerProps {
  variant?: 'banner' | 'card' | 'compact';
}

export const SafetyDisclaimer: React.FC<SafetyDisclaimerProps> = ({ variant = 'card' }) => {
  const [expanded, setExpanded] = useState(false);

  if (variant === 'compact') {
    return (
      <div
        id="safety-disclaimer-compact"
        className="bg-amber-50/80 border border-amber-200 text-amber-900 rounded-lg p-3 text-xs flex items-start gap-2.5"
      >
        <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={16} />
        <div>
          <p className="font-semibold text-amber-950">Immediate Danger or Emergency?</p>
          <p className="mt-0.5 text-amber-800">
            If you have sighted an abducted child or someone in immediate danger, contact local emergency services right away before submitting a report here.
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div
        id="safety-disclaimer-banner"
        className="bg-slate-900 text-slate-100 border-b border-slate-800 text-xs py-2 px-4 shadow-inner"
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-600 text-white font-bold text-[10px]">
              !
            </span>
            <span className="font-medium text-slate-200">
              Immediate Danger: Contact local emergency services immediately.
            </span>
            <span className="hidden md:inline text-slate-400">
              FindSafe is a public reporting & community assistance tool.
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="safety-disclaimer-card"
      className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-xl p-5 shadow-xs text-slate-800"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-amber-100 text-amber-700 rounded-lg shrink-0 mt-0.5">
            <ShieldAlert size={22} />
          </div>
          <div>
            <h4 className="text-base font-bold text-amber-950 flex items-center gap-2">
              Platform & Reporting Information
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900">
                Notice
              </span>
            </h4>
            <p className="mt-1 text-sm text-amber-900/90 leading-relaxed">
              If you have information regarding an abducted child, missing person in medical crisis, or immediate danger, 
              <strong> contact your local authorities without delay</strong>.
            </p>

            {expanded && (
              <div className="mt-3.5 pt-3.5 border-t border-amber-200/70 text-xs text-amber-950 space-y-2 leading-relaxed">
                <p>
                  <strong>Verification In The Loop:</strong> Sighting submissions provide investigative leads to authorized family members and law enforcement coordinators. Submitting a sighting does <em>not</em> automatically modify a case to &ldquo;Found&rdquo;.
                </p>
                <p>
                  <strong>Privacy Safeguards:</strong> In accordance with public safety protocols, citizen phone numbers, home addresses, and private contact lines are strictly sealed from the public directory. Only vetted investigative contacts and law enforcement reference numbers are displayed.
                </p>
                <p>
                  <strong>Fictional Demonstration Data:</strong> This platform is currently operating in prototype mode with simulated community records for functional testing and evaluation.
                </p>
              </div>
            )}
          </div>
        </div>

        <button
          id="btn-toggle-disclaimer"
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-amber-800 hover:text-amber-950 font-medium text-xs flex items-center gap-1 shrink-0 p-1 rounded-md hover:bg-amber-100/60 transition-colors"
        >
          <span>{expanded ? 'Show Less' : 'Full Policy'}</span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>
    </div>
  );
};
