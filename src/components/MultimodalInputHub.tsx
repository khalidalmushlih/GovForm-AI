import React, { useState, useRef } from 'react';
import { FormServiceMeta, DocumentUpload } from '../types';
import { SAMPLE_ID_PRESETS, SampleIdPreset } from '../data/forms';
import {
  Mic,
  MicOff,
  Upload,
  Camera,
  Sparkles,
  FileText,
  Trash2,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Eye,
  X,
  Play,
  RotateCcw,
} from 'lucide-react';

interface MultimodalInputHubProps {
  service: FormServiceMeta;
  userPrompt: string;
  onChangeUserPrompt: (prompt: string) => void;
  documents: DocumentUpload[];
  onAddDocument: (doc: DocumentUpload) => void;
  onRemoveDocument: (docId: string) => void;
  onExecuteExtraction: () => void;
  isProcessing: boolean;
}

export const MultimodalInputHub: React.FC<MultimodalInputHubProps> = ({
  service,
  userPrompt,
  onChangeUserPrompt,
  documents,
  onAddDocument,
  onRemoveDocument,
  onExecuteExtraction,
  isProcessing,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [previewModalDoc, setPreviewModalDoc] = useState<DocumentUpload | null>(null);
  const [isDraftingStatement, setIsDraftingStatement] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Voice recording / Speech-to-text handling
  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsRecording(false);
    } else {
      // Check for browser speech recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript.trim()) {
            onChangeUserPrompt(userPrompt ? `${userPrompt} ${currentTranscript}` : currentTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        try {
          recognition.start();
          recognitionRef.current = recognition;
          setIsRecording(true);
        } catch (err) {
          console.warn('Could not start recognition, using simulation:', err);
          simulateVoiceInput();
        }
      } else {
        simulateVoiceInput();
      }
    }
  };

  const simulateVoiceInput = () => {
    setIsRecording(true);
    setTimeout(() => {
      onChangeUserPrompt(
        userPrompt
          ? `${userPrompt} [Voice]: I also request 52-page standard official passport with expedited 2-day delivery.`
          : service.samplePrompt
      );
      setIsRecording(false);
    }, 2200);
  };

  // Handle file uploads (PNG, JPG, PDF, SVG)
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const base64Data = dataUrl.split(',')[1] || '';
        const newDoc: DocumentUpload = {
          id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          type: file.type || 'image/jpeg',
          size: file.size,
          dataUrl,
          base64Data,
          mimeType: file.type || 'image/jpeg',
        };
        onAddDocument(newDoc);
      };
      reader.readAsDataURL(file);
    });
  };

  // Apply Sample ID Presets
  const handleApplyPreset = (preset: SampleIdPreset) => {
    setSelectedPresetId(preset.id);
    const newDoc: DocumentUpload = {
      id: `doc_preset_${preset.id}`,
      name: preset.fileName,
      type: 'image/svg+xml',
      size: 4096,
      dataUrl: preset.svgDataUrl,
      base64Data: btoa(decodeURIComponent(preset.svgDataUrl.split(',')[1])),
      mimeType: 'image/svg+xml',
    };
    // Replace or add
    onAddDocument(newDoc);
    if (!userPrompt || userPrompt === '') {
      onChangeUserPrompt(service.samplePrompt);
    }
  };

  // Quick Gemini Prompt Polish
  const handleDraftWithGemini = async () => {
    setIsDraftingStatement(true);
    try {
      const res = await fetch('/api/generate-ai-statement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: service.title,
          keywords: userPrompt || service.description,
        }),
      });
      const data = await res.json();
      if (data.statement) {
        onChangeUserPrompt(data.statement);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDraftingStatement(false);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
            Step 2: Multimodal Input Hub
          </span>
          <h3 className="text-base font-bold text-white sm:text-lg">
            Conversational Voice/Text Prompt + Document Vision Upload
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChangeUserPrompt(service.samplePrompt)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300 hover:border-slate-600 hover:bg-slate-700 hover:text-white"
          >
            <RotateCcw className="h-3 w-3 text-sky-400" />
            <span>Load Sample Citizen Scenario</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Conversational Natural Language & Voice Assistant (7 cols) */}
        <div className="flex flex-col justify-between space-y-3 lg:col-span-7">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="user-prompt-input" className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <FileText className="h-3.5 w-3.5 text-sky-400" />
                <span>Conversational Prompt or Voice Statement</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDraftWithGemini}
                  disabled={isDraftingStatement}
                  className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
                  title="Use Gemini to generate a structured conversational statement"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>{isDraftingStatement ? 'Drafting...' : 'Assist with Gemini'}</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <textarea
                id="user-prompt-input"
                rows={6}
                value={userPrompt}
                onChange={(e) => onChangeUserPrompt(e.target.value)}
                placeholder="Example: 'Hi, I need to renew my expired passport. My legal name is Eleanor Vance, born May 14, 1991 in Seattle WA. I live at 1420 Pine St, Seattle WA 98101. Please give me the 52-page book with expedited 2-day delivery...'"
                className="w-full resize-none rounded-xl border border-slate-700/80 bg-slate-950 p-3.5 text-sm leading-relaxed text-slate-100 placeholder-slate-500 shadow-inner focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />

              {/* Voice recording button overlay */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <button
                  type="button"
                  id="btn-voice-record"
                  onClick={toggleRecording}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-md transition-all ${
                    isRecording
                      ? 'animate-pulse bg-rose-600 text-white ring-2 ring-rose-400/50'
                      : 'border border-slate-700 bg-slate-800/90 text-slate-200 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="h-3.5 w-3.5" />
                      <span>Recording...</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-3.5 w-3.5 text-rose-400" />
                      <span>Voice Record</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Context Hints */}
          <div className="rounded-lg border border-slate-800/80 bg-slate-950/50 p-2.5">
            <span className="text-[11px] font-semibold text-slate-400">💡 Required for {service.code}:</span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {service.requiredDocuments.map((doc, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center rounded bg-slate-800/90 px-2 py-0.5 text-[10px] font-medium text-slate-300 ring-1 ring-slate-700/50"
                >
                  • {doc}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: ID & Document Upload Hub (5 cols) */}
        <div className="flex flex-col justify-between space-y-3 lg:col-span-5">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <ImageIcon className="h-3.5 w-3.5 text-emerald-400" />
                <span>Identification Documents ({documents.length})</span>
              </label>
              <span className="text-[10px] text-slate-400">Gemini Vision OCR</span>
            </div>

            {/* Drag & Drop Upload Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFileUpload(e.dataTransfer.files);
              }}
              className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/60 p-4 text-center transition-all hover:border-sky-500 hover:bg-slate-950"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp,image/svg+xml,application/pdf"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-300 group-hover:bg-sky-500 group-hover:text-white">
                <Upload className="h-4 w-4" />
              </div>
              <p className="text-xs font-semibold text-slate-200">
                Drop ID Cards, Passport scans, or W-2 here
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Supports JPG, PNG, WebP, SVG • Max 15MB
              </p>
            </div>
          </div>

          {/* Preset Sample ID Selector */}
          <div>
            <span className="mb-1.5 block text-[11px] font-semibold text-slate-400">
              Or Choose a Verified Mock ID Preset:
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {SAMPLE_ID_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`flex flex-col items-center rounded-lg border p-1.5 text-center transition-all ${
                    selectedPresetId === preset.id
                      ? 'border-sky-500 bg-sky-950/40 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="text-[11px] font-bold leading-tight line-clamp-1">
                    {preset.name.split(' ')[0]} {preset.name.split(' ')[1]?.[0]}.
                  </span>
                  <span className="text-[9px] text-slate-400">{preset.type.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Uploaded Documents List */}
          {documents.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400">Attached For Analysis:</span>
              <div className="max-h-28 space-y-1 overflow-y-auto pr-1">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <ImageIcon className="h-3.5 w-3.5 text-sky-400 flex-shrink-0" />
                      <span className="truncate font-medium text-slate-200">{doc.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPreviewModalDoc(doc)}
                        className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                        title="View Document"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveDocument(doc.id)}
                        className="rounded p-1 text-slate-400 hover:bg-rose-950/50 hover:text-rose-400"
                        title="Remove Document"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-slate-800/80 pt-4 sm:flex-row">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Sparkles className="h-4 w-4 text-sky-400" />
          <span>
            Gemini 3.7 Flash extracts OCR fields, cross-checks conversational facts, and formats strict JSON
          </span>
        </div>

        <button
          type="button"
          id="btn-execute-extraction"
          disabled={isProcessing}
          onClick={onExecuteExtraction}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/25 transition-all hover:from-sky-400 hover:to-indigo-500 hover:shadow-sky-500/40 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {isProcessing ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Analyzing Documents & Prompt...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Extract & Parse with Gemini Vision</span>
            </>
          )}
        </button>
      </div>

      {/* Document View Modal */}
      {previewModalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] max-w-2xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="font-bold text-white">{previewModalDoc.name}</h4>
              <button
                onClick={() => setPreviewModalDoc(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex max-h-[70vh] items-center justify-center overflow-auto rounded-lg bg-slate-950 p-2">
              <img
                src={previewModalDoc.dataUrl}
                alt={previewModalDoc.name}
                className="max-h-[60vh] rounded object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
