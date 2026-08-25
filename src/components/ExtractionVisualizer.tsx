import React from 'react';
import { ParseFormApiResponse } from '../types';
import {
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Clock,
  ShieldCheck,
  Cpu,
  Fingerprint,
  FileCheck2,
} from 'lucide-react';

interface ExtractionVisualizerProps {
  apiResponse: ParseFormApiResponse | null;
  isProcessing: boolean;
}

export const ExtractionVisualizer: React.FC<ExtractionVisualizerProps> = ({
  apiResponse,
  isProcessing,
}) => {
  if (isProcessing) {
    return (
      <div className="w-full rounded-2xl border border-sky-500/30 bg-gradient-to-br from-slate-900 via-sky-950/20 to-slate-900 p-6 shadow-xl">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-sky-500/20 border-t-sky-400" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-sky-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h4 className="text-base font-bold text-white">
              Gemini Vision & Multimodal Extraction in Progress
            </h4>
            <p className="mt-1 text-xs text-slate-400">
              Running OCR on attached identification cards • Mapping conversational prompt • Validating government rules
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-300">
              ⚡ Astro SSR Endpoint
            </span>
            <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-300">
              🤖 Gemini 3.7 Flash Model
            </span>
            <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-300">
              🔒 Edge D1 Persistence
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!apiResponse) return null;

  const confidencePct = Math.round(apiResponse.overallConfidence * 100);
  const totalFields = Object.keys(apiResponse.extractedData || {}).length;
  const ocrCount = Object.values(apiResponse.extractedData || {}).filter(
    (f: any) => f?.source === 'document_ocr'
  ).length;
  const promptCount = Object.values(apiResponse.extractedData || {}).filter(
    (f: any) => f?.source === 'user_prompt'
  ).length;

  return (
    <div className="w-full space-y-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl sm:p-5">
      {/* Top Metrics Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Extraction Analysis
              </span>
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-bold text-emerald-300">
                Verified Schema
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-200">
              {apiResponse.applicantName ? `Applicant: ${apiResponse.applicantName}` : 'Identity Extracted'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Confidence Metric */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs">
            <span className="text-slate-400">Confidence:</span>
            <span
              className={`font-mono font-black ${
                confidencePct >= 90
                  ? 'text-emerald-400'
                  : confidencePct >= 75
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {confidencePct}%
            </span>
          </div>

          {/* Extracted Fields Count */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs">
            <span className="text-slate-400">Fields Mapped:</span>
            <span className="font-mono font-bold text-sky-400">{totalFields}</span>
          </div>

          {/* Latency */}
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Clock className="h-3 w-3 text-slate-500" />
            <span>{apiResponse.processingTimeMs}ms</span>
          </div>
        </div>
      </div>

      {/* Traceability Breakdown Pills */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2 text-center">
          <span className="text-[10px] font-medium text-slate-400">📸 Document OCR</span>
          <p className="font-mono text-sm font-bold text-emerald-400">{ocrCount} fields</p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2 text-center">
          <span className="text-[10px] font-medium text-slate-400">💬 Prompt / Voice</span>
          <p className="font-mono text-sm font-bold text-sky-400">{promptCount} fields</p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2 text-center">
          <span className="text-[10px] font-medium text-slate-400">🤖 AI Model</span>
          <p className="font-mono text-xs font-bold text-indigo-300">{apiResponse.modelUsed}</p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2 text-center">
          <span className="text-[10px] font-medium text-slate-400">🗄️ Cloudflare D1</span>
          <p className="font-mono text-xs font-bold text-emerald-400">Sync Staged</p>
        </div>
      </div>

      {/* AI Reasoning Quote */}
      {apiResponse.aiReasoning && (
        <div className="rounded-xl border border-sky-500/20 bg-sky-950/30 p-3 text-xs leading-relaxed text-sky-200">
          <div className="mb-1 flex items-center gap-1.5 font-bold text-sky-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Gemini Extraction Summary:</span>
          </div>
          <p className="text-slate-300">{apiResponse.aiReasoning}</p>
        </div>
      )}

      {/* Anomalies / Flags Alert */}
      {apiResponse.anomaliesDetected && apiResponse.anomaliesDetected.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/30 p-3 text-xs text-amber-200">
          <div className="mb-1 flex items-center gap-1.5 font-bold text-amber-300">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Attention Items & Validation Discrepancies:</span>
          </div>
          <ul className="list-inside list-disc space-y-0.5 text-slate-300">
            {apiResponse.anomaliesDetected.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Missing Required Fields Notice */}
      {apiResponse.missingRequiredFields && apiResponse.missingRequiredFields.length > 0 && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-200">
          <div className="mb-1 flex items-center gap-1.5 font-bold text-rose-300">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Mandatory Fields Still Missing:</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {apiResponse.missingRequiredFields.map((field, i) => (
              <span
                key={i}
                className="rounded bg-rose-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-rose-300 ring-1 ring-rose-500/40"
              >
                {field}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
