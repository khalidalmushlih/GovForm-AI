import React, { useState, useEffect } from 'react';
import { FORM_SERVICES, SAMPLE_ID_PRESETS, utf8ToBase64 } from '../data/forms';
import {
  FormType,
  DocumentUpload,
  ParseFormApiResponse,
  ExtractedField,
  ApplicationRecord,
} from '../types';
import { ServiceSelector } from './ServiceSelector';
import { MultimodalInputHub } from './MultimodalInputHub';
import { ExtractionVisualizer } from './ExtractionVisualizer';
import { FormEditor } from './FormEditor';
import { OfficialPdfPreview } from './OfficialPdfPreview';
import { Navbar } from './Navbar';
import { ApplicationsManagerModal } from './ApplicationsManagerModal';
import { AstroArchitectureDrawer } from './AstroArchitectureDrawer';
import { SubmissionSuccessModal } from './SubmissionSuccessModal';
import { Sparkles, ArrowRight, ShieldAlert, Cpu, Database, AlertCircle, X } from 'lucide-react';

export const GovFormIsland: React.FC = () => {
  const [selectedFormId, setSelectedFormId] = useState<FormType>('passport_renewal');
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [documents, setDocuments] = useState<DocumentUpload[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [apiResponse, setApiResponse] = useState<ParseFormApiResponse | null>(null);
  const [formData, setFormData] = useState<Record<string, ExtractedField<any>>>({});
  const [trackingNumber, setTrackingNumber] = useState<string>('US-GOV-PAS-849201');
  const [activeStep, setActiveStep] = useState<'intake' | 'review' | 'preview'>('intake');

  // Modals
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const [isDatabaseOpen, setIsDatabaseOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [submittedAppName, setSubmittedAppName] = useState('');
  const [applicationsCount, setApplicationsCount] = useState(1);

  const activeService = FORM_SERVICES.find((s) => s.id === selectedFormId) || FORM_SERVICES[0];

  // Initialize initial preset sample document on mount
  useEffect(() => {
    try {
      const defaultPreset = SAMPLE_ID_PRESETS[0];
      const initialDoc: DocumentUpload = {
        id: `doc_${defaultPreset.id}`,
        name: defaultPreset.fileName,
        type: 'image/svg+xml',
        size: 4096,
        dataUrl: defaultPreset.svgDataUrl,
        base64Data:
          defaultPreset.base64Data ||
          utf8ToBase64(decodeURIComponent(defaultPreset.svgDataUrl.split(',')[1] || '')),
        mimeType: 'image/svg+xml',
      };
      setDocuments([initialDoc]);
      setUserPrompt(activeService.samplePrompt);
      fetchD1Count();
    } catch (err) {
      console.warn('[GovForm AI] Init warning:', err);
    }
  }, []);

  const fetchD1Count = async () => {
    try {
      const res = await fetch('/api/applications');
      const data = await res.json();
      if (data.total) setApplicationsCount(data.total);
    } catch (e) {}
  };

  const handleSelectForm = (formId: FormType) => {
    setSelectedFormId(formId);
    setErrorMessage(null);
    const newService = FORM_SERVICES.find((s) => s.id === formId);
    if (newService) {
      setUserPrompt(newService.samplePrompt);
    }
  };

  const handleAddDocument = (doc: DocumentUpload) => {
    setDocuments((prev) => [...prev, doc]);
  };

  const handleRemoveDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  // Trigger Gemini Multimodal Extraction
  const handleExecuteExtraction = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      // Build payload
      const payload = {
        formType: selectedFormId,
        userPrompt,
        applicationId: `app_${Date.now()}`,
        saveToD1: true,
        images: documents.map((d) => ({
          mimeType: d.mimeType,
          data: d.dataUrl,
        })),
      };

      const res = await fetch('/api/parse-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data: ParseFormApiResponse = await res.json();

      if (data.success) {
        setApiResponse(data);
        setFormData(data.extractedData || {});
        if ((data as any).trackingNumber) {
          setTrackingNumber((data as any).trackingNumber);
        }
        setActiveStep('review');
        fetchD1Count();
      } else {
        setErrorMessage('Extraction issue: ' + ((data as any).error || 'Unknown issue occurred while parsing.'));
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Error querying Gemini extraction API: ' + (err.message || 'Network error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateField = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: {
        value,
        confidence: 1.0,
        source: 'manual_override',
        verified: true,
      },
    }));
  };

  // Submit and write to Cloudflare D1
  const handleSubmitToD1 = async (signatureName: string) => {
    setIsSubmitting(true);
    try {
      const appId = (apiResponse as any)?.applicationId || `app_${Date.now()}`;
      await fetch(`/api/applications/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'submitted',
          formPayload: formData,
          signatureName,
        }),
      });

      setSubmittedAppName(signatureName);
      setIsSuccessModalOpen(true);
      fetchD1Count();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadAppFromD1 = (app: ApplicationRecord) => {
    setSelectedFormId(app.formType);
    setFormData(app.data);
    setTrackingNumber(app.trackingNumber);
    if (app.userPromptExcerpt) {
      setUserPrompt(app.userPromptExcerpt);
    }
    setActiveStep('review');
  };

  const handleStartNew = () => {
    setIsSuccessModalOpen(false);
    setApiResponse(null);
    setFormData({});
    setActiveStep('intake');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onOpenDatabase={() => setIsDatabaseOpen(true)}
        applicationsCount={applicationsCount}
        d1Status={true}
      />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 space-y-6">
        {/* Hero Banner with Architecture Badges */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 p-6 shadow-2xl sm:p-8">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-sky-400 ring-1 ring-sky-500/30">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Gemini 3.7 / 1.5 Flash Multimodal OCR</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-300 ring-1 ring-indigo-500/30">
                <Cpu className="h-3.5 w-3.5" />
                <span>Astro SSR + Cloudflare Workers</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300 ring-1 ring-emerald-500/30">
                <Database className="h-3.5 w-3.5" />
                <span>Cloudflare D1 Persistence (env.DB)</span>
              </span>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-white sm:text-4xl">
              GovForm AI: Zero-Bloat Government Intake
            </h1>
            <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
              Convert messy natural language conversations and photo uploads of IDs into strict,
              verified government application JSON payloads with field-level confidence scoring and
              immutable Cloudflare D1 persistence.
            </p>
          </div>

          {/* Background decorative glow */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
        </div>

        {/* Step Flow Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveStep('intake')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeStep === 'intake'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>1. Multimodal Intake</span>
            </button>

            <button
              onClick={() => setActiveStep('review')}
              disabled={!apiResponse && Object.keys(formData).length === 0}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeStep === 'review'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 disabled:opacity-40'
              }`}
            >
              <span>2. Schema Validation</span>
              {Object.keys(formData).length > 0 && (
                <span className="rounded-full bg-sky-950 px-1.5 py-0.2 text-[10px] text-sky-300">
                  {Object.keys(formData).length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveStep('preview')}
              disabled={Object.keys(formData).length === 0}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeStep === 'preview'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 disabled:opacity-40'
              }`}
            >
              <span>3. Official Attestation & D1 Submit</span>
            </button>
          </div>
        </div>

        {/* Error Notification Banner if any */}
        {errorMessage && (
          <div className="flex items-center justify-between rounded-xl border border-rose-500/40 bg-rose-950/40 p-4 text-xs text-rose-200">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="rounded p-1 text-rose-400 hover:bg-rose-900/50 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* View Routing Based on activeStep */}
        {activeStep === 'intake' && (
          <div className="space-y-6">
            <ServiceSelector
              selectedForm={selectedFormId}
              onSelectForm={handleSelectForm}
            />

            <MultimodalInputHub
              service={activeService}
              userPrompt={userPrompt}
              onChangeUserPrompt={setUserPrompt}
              documents={documents}
              onAddDocument={handleAddDocument}
              onRemoveDocument={handleRemoveDocument}
              onExecuteExtraction={handleExecuteExtraction}
              isProcessing={isProcessing}
            />

            {/* Quick Extraction Visualizer if processed */}
            {(apiResponse || isProcessing) && (
              <ExtractionVisualizer
                apiResponse={apiResponse}
                isProcessing={isProcessing}
              />
            )}
          </div>
        )}

        {activeStep === 'review' && (
          <div className="space-y-6">
            <ExtractionVisualizer
              apiResponse={apiResponse}
              isProcessing={isProcessing}
            />

            <FormEditor
              service={activeService}
              formData={formData}
              onUpdateField={handleUpdateField}
              onProceedToPreview={() => setActiveStep('preview')}
            />
          </div>
        )}

        {activeStep === 'preview' && (
          <OfficialPdfPreview
            service={activeService}
            formData={formData}
            trackingNumber={trackingNumber}
            onSubmitToD1={handleSubmitToD1}
            isSubmitting={isSubmitting}
            onBackToEdit={() => setActiveStep('review')}
          />
        )}
      </main>

      {/* Modals & Drawers */}
      <ApplicationsManagerModal
        isOpen={isDatabaseOpen}
        onClose={() => setIsDatabaseOpen(false)}
        onSelectApplicationToLoad={handleLoadAppFromD1}
      />

      <AstroArchitectureDrawer
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

      <SubmissionSuccessModal
        isOpen={isSuccessModalOpen}
        trackingNumber={trackingNumber}
        applicantName={submittedAppName}
        formTitle={activeService.title}
        onClose={() => setIsSuccessModalOpen(false)}
        onStartNew={handleStartNew}
        onViewDatabase={() => {
          setIsSuccessModalOpen(false);
          setIsDatabaseOpen(true);
        }}
      />
    </div>
  );
};
