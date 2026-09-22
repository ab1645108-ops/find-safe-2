import React from 'react';
import { MissingPersonCase } from '../../types';
import { X, Printer, Shield, AlertCircle } from 'lucide-react';

interface PosterModalProps {
  caseItem: MissingPersonCase;
  isOpen: boolean;
  onClose: () => void;
}

export const PosterModal: React.FC<PosterModalProps> = ({ caseItem, isOpen, onClose }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(caseItem.dateMissing).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      id="poster-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="poster-modal-dialog"
        className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto border border-slate-300 print:border-none print:shadow-none print:m-0 print:max-w-none print:w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar (hidden in print) */}
        <div className="bg-slate-900 text-slate-100 px-5 py-3 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Shield size={16} className="text-amber-400" />
            <span>FindSafe — Official Public Notice Bulletin</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-print-poster"
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <Printer size={14} />
              <span>Print Bulletin</span>
            </button>
            <button
              id="btn-close-poster"
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Bulletin Container */}
        <div className="p-6 sm:p-8 bg-white" id="printable-area">
          {/* Header Banner */}
          <div className="border-b-4 border-rose-600 pb-4 text-center">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-rose-700 uppercase">
              MISSING PERSON
            </h1>
            <p className="text-sm font-bold text-slate-800 tracking-wider uppercase mt-1">
              Have you seen this individual? Any information is critically urgent.
            </p>
          </div>

          {/* Photo & Vital Specs */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            <div className="aspect-square bg-slate-100 border-2 border-slate-900 rounded-lg overflow-hidden shadow-sm">
              <img
                src={caseItem.photoUrl}
                alt={`Photograph of missing person ${caseItem.name}`}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-3">
              <div className="border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Full Legal Name
                </span>
                <h2 className="text-2xl font-black text-slate-950 leading-tight">
                  {caseItem.name}
                </h2>
                {caseItem.nickname && (
                  <p className="text-sm text-slate-600 font-medium">
                    Also known as: &ldquo;{caseItem.nickname}&rdquo;
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-bold text-slate-500 block uppercase">Age</span>
                  <span className="text-base font-extrabold text-slate-900">{caseItem.age} years old</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block uppercase">Gender</span>
                  <span className="text-base font-extrabold text-slate-900">{caseItem.gender}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block uppercase">Height</span>
                  <span className="font-semibold text-slate-900">{caseItem.physicalDescription.height}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block uppercase">Weight</span>
                  <span className="font-semibold text-slate-900">{caseItem.physicalDescription.weight}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block uppercase">Hair</span>
                  <span className="font-semibold text-slate-900">{caseItem.physicalDescription.hairColor}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block uppercase">Eyes</span>
                  <span className="font-semibold text-slate-900">{caseItem.physicalDescription.eyeColor}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                <span className="font-bold text-slate-700 block uppercase">Last Seen Date & Location</span>
                <p className="font-semibold text-slate-900 mt-0.5">
                  {formattedDate} {caseItem.timeMissing ? `at ${caseItem.timeMissing}` : ''}
                </p>
                <p className="text-slate-700 mt-0.5">
                  {caseItem.lastSeenLocation.address ? `${caseItem.lastSeenLocation.address}, ` : ''}
                  {caseItem.lastSeenLocation.city}, {caseItem.lastSeenLocation.state}
                </p>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="mt-5 pt-4 border-t border-slate-200 space-y-3 text-xs">
            {caseItem.physicalDescription.distinguishingMarks && (
              <div>
                <span className="font-bold text-slate-900 uppercase">Distinguishing Marks / Characteristics:</span>
                <p className="text-slate-700 mt-0.5">{caseItem.physicalDescription.distinguishingMarks}</p>
              </div>
            )}

            <div>
              <span className="font-bold text-slate-900 uppercase">Clothing & Personal Effects When Last Seen:</span>
              <p className="text-slate-700 mt-0.5">{caseItem.clothingDetails}</p>
            </div>

            <div>
              <span className="font-bold text-slate-900 uppercase">Circumstances:</span>
              <p className="text-slate-700 mt-0.5 leading-relaxed">{caseItem.circumstances}</p>
            </div>
          </div>

          {/* Contact & Agency Footer */}
          <div className="mt-6 pt-4 border-t-2 border-slate-900 bg-amber-50 p-4 rounded-xl border border-amber-300">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center justify-center sm:justify-start gap-1.5">
                  <AlertCircle size={14} className="text-amber-700" />
                  Official Investigative Agency
                </p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {caseItem.confidentialContact.lawEnforcementAgency || 'Local Law Enforcement Dispatch'}
                </p>
                {caseItem.confidentialContact.policeCaseNumber && (
                  <p className="text-xs text-slate-600">
                    Case Reference Number: <strong>{caseItem.confidentialContact.policeCaseNumber}</strong>
                  </p>
                )}
              </div>

              <div className="sm:text-right shrink-0">
                <span className="text-[11px] font-bold text-slate-700 uppercase block">Case Identifier</span>
                <span className="text-lg font-black text-slate-900 block mt-0.5">
                  #{caseItem.id}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  FindSafe Community Alert
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
