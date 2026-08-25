import React from 'react';
import {
  CheckCircle2,
  Download,
  Copy,
  Check,
  Printer,
  ShieldCheck,
  ExternalLink,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface SubmissionSuccessModalProps {
  isOpen: boolean;
  trackingNumber: string;
  applicantName: string;
  formTitle: string;
  onClose: () => void;
  onStartNew: () => void;
  onViewDatabase: () => void;
}

export const SubmissionSuccessModal: React.FC<SubmissionSuccessModalProps> = ({
  isOpen,
  trackingNumber,
  applicantName,
  formTitle,
  onClose,
  onStartNew,
  onViewDatabase,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopyTracking = () => {
    navigator.clipboard.writeText(trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-emerald-500/40 bg-slate-900 shadow-2xl">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 p-6 text-center text-white">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/20 shadow-lg ring-4 ring-white/20">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-black tracking-tight">Application Successfully Submitted</h3>
          <p className="mt-1 text-xs text-emerald-100">
            Committed to Cloudflare D1 SQLite database with digital signature & audit log
          </p>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Official Government Tracking Identifier
            </span>
            <div className="mt-1.5 flex items-center justify-center gap-2">
              <span className="font-mono text-xl font-black tracking-wider text-sky-400">
                {trackingNumber}
              </span>
              <button
                onClick={handleCopyTracking}
                className="rounded-lg bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white"
                title="Copy tracking number"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
              <span className="text-[10px] font-bold uppercase text-slate-500">Applicant</span>
              <p className="mt-0.5 font-bold text-slate-200">{applicantName}</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
              <span className="text-[10px] font-bold uppercase text-slate-500">Service</span>
              <p className="mt-0.5 font-bold text-slate-200 line-clamp-1">{formTitle}</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
              <span className="text-[10px] font-bold uppercase text-slate-500">Database Binding</span>
              <p className="mt-0.5 font-mono text-emerald-400">env.DB (Cloudflare D1)</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
              <span className="text-[10px] font-bold uppercase text-slate-500">Status</span>
              <p className="mt-0.5 font-bold text-emerald-400">Under Agency Review</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={onViewDatabase}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 py-2.5 text-xs font-bold text-white shadow-md hover:bg-sky-400"
            >
              <span>View in Cloudflare D1 Database</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={onStartNew}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white"
            >
              <Sparkles className="h-3.5 w-3.5 text-sky-400" />
              <span>Start Another Application</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
