import React from 'react';
import { Shield, HeartHandshake, Lock, FileText } from 'lucide-react';
import { PageId } from './Header';

interface FooterProps {
  onNavigate: (page: PageId) => void;
  onOpenVerification: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenVerification }) => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center text-white">
                <Shield size={18} className="text-amber-400" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">FindSafe</span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              FindSafe is an AI-powered public assistance system designed to accelerate missing persons discovery, streamline community sighting reports, and provide coordinated case visibility for families and authorized response teams.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Lock size={14} className="text-emerald-500" />
              <span>Public Privacy Shield: Contact details are never exposed publicly.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Platform Navigation
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors"
                >
                  Home Overview
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('cases')}
                  className="hover:text-white transition-colors"
                >
                  Public Case Directory
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('report-case')}
                  className="hover:text-white transition-colors"
                >
                  Report a Missing Person
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('report-sighting')}
                  className="hover:text-white transition-colors"
                >
                  Submit a Sighting Tip
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition-colors"
                >
                  How It Works & Verification
                </button>
              </li>
            </ul>
          </div>

          {/* Verification & Legal */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Authorized Review & Policy
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={onOpenVerification}
                  className="text-amber-400 hover:text-amber-300 font-medium transition-colors flex items-center gap-1.5"
                >
                  <span>Caseworker Verification Desk</span>
                </button>
              </li>
              <li className="flex items-center gap-1 text-slate-500 text-[11px] pt-1">
                <HeartHandshake size={12} />
                <span>Community Protection Protocol</span>
              </li>
              <li className="flex items-center gap-1 text-slate-500 text-[11px]">
                <FileText size={12} />
                <span>Standard Public Safety Guidelines</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Phase 1 & Privacy Notice */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} FindSafe Public Assistance System. Simulated demonstration data.
          </p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Phase 1 Public Foundation Active
            </span>
            <span>AI Face Recognition Scheduled for Phase 2</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
