import React, { useState } from 'react';
import { useCases } from '../../context/CaseContext';
import { Shield, KeyRound, Lock, UserCheck, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { InvestigatorProfile } from '../../types';

interface InvestigatorLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const DEMO_PROFILES: InvestigatorProfile[] = [
  {
    badgeNumber: 'DET-4829',
    officerName: 'Det. Sarah Vance',
    department: 'Special Victims & Missing Persons Unit',
    rank: 'Lead Detective',
    email: 's.vance@investigations.gov',
  },
  {
    badgeNumber: 'INSP-2190',
    officerName: 'Inspector Marcus Brody',
    department: 'Regional Missing Persons Taskforce',
    rank: 'Senior Inspector',
    email: 'm.brody@taskforce.gov',
  },
  {
    badgeNumber: 'CW-9024',
    officerName: 'Elena Rostova',
    department: 'Child Protection & Family Reconnection Desk',
    rank: 'Senior Caseworker',
    email: 'elena.rostova@casework.org',
  },
];

export const InvestigatorLoginModal: React.FC<InvestigatorLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { loginInvestigator, investigatorProfile } = useCases();

  const [badgeNumber, setBadgeNumber] = useState(investigatorProfile.badgeNumber || 'DET-4829');
  const [officerName, setOfficerName] = useState(investigatorProfile.officerName || 'Det. Sarah Vance');
  const [department, setDepartment] = useState(
    investigatorProfile.department || 'Special Victims & Missing Persons Unit'
  );
  const [pin, setPin] = useState('4829');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSelectDemo = (profile: InvestigatorProfile) => {
    setBadgeNumber(profile.badgeNumber);
    setOfficerName(profile.officerName);
    setDepartment(profile.department);
    setPin('4829');
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!badgeNumber.trim() || !officerName.trim()) {
      setError('Please provide your official badge number and officer name.');
      return;
    }

    loginInvestigator({
      badgeNumber: badgeNumber.trim(),
      officerName: officerName.trim(),
      department: department.trim(),
      rank: officerName.startsWith('Det.') ? 'Lead Detective' : 'Authorized Investigator',
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      if (onSuccess) onSuccess();
    }, 600);
  };

  return (
    <div
      id="investigator-login-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl space-y-0">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
              <Shield size={22} className="text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">Investigator Authorization</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
                  Restricted
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Law enforcement & authorized caseworker verification portal
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-close-investigator-login"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Notice */}
        <div className="px-6 py-3 bg-amber-500/10 border-b border-amber-500/20 text-amber-200/90 text-xs flex items-center gap-2.5">
          <Lock size={15} className="text-amber-400 shrink-0" />
          <span>
            Authorized access only. Public citizens cannot view confidential case dossiers or victim information.
          </span>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="py-8 text-center space-y-2">
              <CheckCircle2 size={44} className="mx-auto text-emerald-400 animate-bounce" />
              <h4 className="text-base font-bold text-white">Credentials Verified</h4>
              <p className="text-xs text-slate-400">Unlocking classified dossiers and detective actions...</p>
            </div>
          ) : (
            <>
              {/* Quick Profile Selectors */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Quick Demo Investigator Profiles (Click to test)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {DEMO_PROFILES.map((p) => {
                    const isSelected = badgeNumber === p.badgeNumber;
                    return (
                      <button
                        key={p.badgeNumber}
                        type="button"
                        onClick={() => handleSelectDemo(p)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                          isSelected
                            ? 'bg-blue-600/20 border-blue-500 text-white shadow-xs'
                            : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span className="font-bold block truncate">{p.officerName}</span>
                        <span className="text-[10px] text-blue-400 font-mono block mt-0.5">{p.badgeNumber}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-3.5 pt-2 border-t border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Badge / Officer ID
                    </label>
                    <input
                      type="text"
                      required
                      value={badgeNumber}
                      onChange={(e) => setBadgeNumber(e.target.value)}
                      placeholder="e.g. DET-4829"
                      className="w-full text-xs font-mono py-2.5 px-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Security PIN
                    </label>
                    <input
                      type="password"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="••••"
                      className="w-full text-xs font-mono py-2.5 px-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Officer / Investigator Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    placeholder="e.g. Det. Sarah Vance"
                    className="w-full text-xs py-2.5 px-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Department / Agency
                  </label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Special Victims Unit"
                    className="w-full text-xs py-2.5 px-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-submit-investigator-login"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-900/40 transition-all"
                >
                  <KeyRound size={15} />
                  <span>Authenticate & Open Cases</span>
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
