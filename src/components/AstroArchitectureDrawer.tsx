import React, { useState } from 'react';
import {
  Code2,
  X,
  Copy,
  Check,
  FileCode,
  Terminal,
  Layers,
  Database,
  Cloud,
  Zap,
  ShieldAlert,
} from 'lucide-react';

interface AstroArchitectureDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AstroArchitectureDrawer: React.FC<AstroArchitectureDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeFile, setActiveFile] = useState<string>('api_parse_form');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const CODE_FILES: Record<string, { name: string; lang: string; description: string; code: string }> = {
    api_parse_form: {
      name: 'src/pages/api/parse-form.ts',
      lang: 'typescript',
      description: 'Astro SSR API Route handling multipart ID images + conversational text to Gemini Vision, writing to Cloudflare D1',
      code: `import type { APIRoute } from 'astro';
import { GoogleGenAI, Type } from '@google/genai';

export const prerender = false; // SSR on Cloudflare Workers

export const POST: APIRoute = async ({ request, locals }) => {
  const startTime = Date.now();
  const cfRayId = request.headers.get('cf-ray') || 'ray_edge_001';
  const clientIp = request.headers.get('cf-connecting-ip') || '127.0.0.1';

  try {
    // 1. Resolve Cloudflare Workers Environment & Secrets
    const env = (locals as any)?.runtime?.env || process.env;
    const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY binding required in Cloudflare Workers' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Parse Multipart Form Data (Audio / Text + Uploaded ID Images)
    const formData = await request.formData();
    const userPrompt = (formData.get('userPrompt') as string) || '';
    const formType = (formData.get('formType') as string) || 'passport_renewal';
    const applicationId = (formData.get('applicationId') as string) || \`app_\${Date.now()}\`;

    const imageFiles: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('document_') && value instanceof File && value.size > 0) {
        imageFiles.push(value);
      }
    }

    // 3. Initialize Google Gen AI SDK
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    // 4. Construct Multimodal Prompt with Vision OCR
    const contents: any[] = [
      {
        text: \`You are an expert Government Identity Verification & Form Extraction Agent for GovForm AI.
Target Form: "\${formType}".
User's Conversational Statement:
"""
\${userPrompt || 'No text provided. Extract purely from attached ID documents.'}
"""

Instructions:
1. Perform high-precision OCR on all attached IDs (Driver's License, Passport, Utility bills).
2. Cross-reference the conversational statement with ID documents.
3. Map all fields for "\${formType}" government application.
4. Provide confidence scores (0.0 to 1.0) and source traceability ('document_ocr', 'user_prompt', or 'inferred').
5. Output strictly structured JSON matching the defined schema.\`,
      },
    ];

    for (const file of imageFiles) {
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      contents.push({
        inlineData: {
          mimeType: file.type || 'image/jpeg',
          data: base64,
        },
      });
    }

    // 5. Query Gemini 3.7 Flash with Strict ResponseSchema
    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: { parts: contents },
      config: {
        systemInstruction: 'You are an official government form processing intelligence.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            applicantName: { type: Type.STRING },
            extractedFields: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  fieldName: { type: Type.STRING },
                  value: { type: Type.STRING },
                  confidence: { type: Type.NUMBER },
                  source: { type: Type.STRING },
                  fieldNote: { type: Type.STRING },
                },
                required: ['fieldName', 'value', 'confidence', 'source'],
              },
            },
            overallConfidence: { type: Type.NUMBER },
            missingRequiredFields: { type: Type.ARRAY, items: { type: Type.STRING } },
            anomaliesDetected: { type: Type.ARRAY, items: { type: Type.STRING } },
            aiReasoning: { type: Type.STRING },
          },
          required: ['applicantName', 'extractedFields', 'overallConfidence', 'missingRequiredFields'],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    const trackingNumber = \`US-GOV-\${formType.substring(0, 3).toUpperCase()}-\${Math.floor(100000 + Math.random() * 900000)}\`;

    // 6. Cloudflare D1 Persistence Binding (env.DB)
    const db = env.DB;
    if (db) {
      await db.prepare(
        \`INSERT INTO applications (
          id, tracking_number, form_type, applicant_name, status,
          overall_confidence, extracted_fields_count, form_payload,
          validation_errors, user_prompt_excerpt, cf_ray_id, ip_address, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))\`
      ).bind(
        applicationId, trackingNumber, formType,
        parsedData.applicantName || 'Applicant', 'draft',
        parsedData.overallConfidence || 0.9,
        parsedData.extractedFields?.length || 0,
        JSON.stringify(parsedData.extractedFields || {}),
        JSON.stringify(parsedData.missingRequiredFields || []),
        userPrompt.substring(0, 250), cfRayId, clientIp
      ).run();
    }

    return new Response(JSON.stringify({
      success: true,
      applicationId,
      trackingNumber,
      parsedData,
      processingTimeMs: Date.now() - startTime,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};`,
    },
    astro_config: {
      name: 'astro.config.mjs',
      lang: 'javascript',
      description: 'Astro SSR Configuration with @astrojs/cloudflare Worker Adapter & React Islands',
      code: `// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  output: 'server', // Full Server-Side Rendering mode
  adapter: cloudflare({
    imageService: 'cloudflare',
    platformProxy: {
      enabled: true,
    },
  }),
  integrations: [
    react(), // Zero bundle bloat React Astro Islands
    tailwind({
      applyBaseStyles: true,
    }),
  ],
  vite: {
    ssr: {
      noExternal: ['@google/genai'],
    },
  },
});`,
    },
    wrangler_toml: {
      name: 'wrangler.toml',
      lang: 'toml',
      description: 'Cloudflare Workers Configuration with Cloudflare D1 Database & R2 Storage Bindings',
      code: `name = "govform-ai"
main = "./dist/_worker.js"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]

# Cloudflare D1 Database Binding for Application State
[[d1_databases]]
binding = "DB"
database_name = "govform-ai-db"
database_id = "d1-govform-production-001"

# Cloudflare R2 Storage Bucket for Encrypted Document Uploads
[[r2_buckets]]
binding = "DOCUMENTS_BUCKET"
bucket_name = "govform-documents-encrypted"

# Cloudflare KV for High-Speed Rate Limiting
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "kv-govform-ratelimit-001"

[vars]
ENVIRONMENT = "production"
APP_NAME = "GovForm AI"

# Secrets configured via CLI:
# wrangler secret put GEMINI_API_KEY`,
    },
    schema_sql: {
      name: 'schema.sql',
      lang: 'sql',
      description: 'Cloudflare D1 SQLite DDL for Applications, Documents, Verifications, and Audit Logs',
      code: `-- Cloudflare D1 Schema for GovForm AI
-- Apply with: wrangler d1 execute govform-ai-db --file=./schema.sql

CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  tracking_number TEXT UNIQUE NOT NULL,
  form_type TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'action_required')),
  overall_confidence REAL DEFAULT 0.0,
  extracted_fields_count INTEGER DEFAULT 0,
  form_payload JSON NOT NULL,
  validation_errors JSON DEFAULT '[]',
  user_prompt_excerpt TEXT,
  signature_name TEXT,
  signature_timestamp TEXT,
  cf_ray_id TEXT,
  ip_address TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  document_category TEXT NOT NULL,
  ocr_extracted_text TEXT,
  ocr_confidence REAL DEFAULT 0.0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  actor TEXT NOT NULL,
  details JSON,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_apps_tracking ON applications(tracking_number);
CREATE INDEX IF NOT EXISTS idx_apps_status ON applications(status);`,
    },
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(CODE_FILES[activeFile].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/30">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Astro SSR + Cloudflare Workers Architecture
              </h3>
              <p className="text-xs text-slate-400">
                Production-ready code artifacts for Cloudflare D1, Astro SSR, and Gemini Vision
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 rounded-lg bg-sky-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-sky-400"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body: Sidebar & Code View */}
        <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-12">
          {/* Left: File Selector (4 cols) */}
          <div className="flex flex-col border-r border-slate-800 bg-slate-950/60 p-4 lg:col-span-4 space-y-4 overflow-y-auto">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Astro SSR & Cloudflare Artifacts
              </span>
              <div className="mt-2 space-y-1.5">
                {Object.entries(CODE_FILES).map(([key, file]) => {
                  const isSelected = activeFile === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveFile(key)}
                      className={`flex w-full flex-col rounded-xl border p-3 text-left transition-all ${
                        isSelected
                          ? 'border-sky-500 bg-sky-950/40 text-white shadow-md'
                          : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FileCode className={`h-4 w-4 ${isSelected ? 'text-sky-400' : 'text-slate-500'}`} />
                        <span className="font-mono text-xs font-bold text-slate-200">
                          {file.name}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-400">
                        {file.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cloudflare Deployment Commands */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-sky-400">
                <Terminal className="h-3.5 w-3.5" />
                <span>Cloudflare Deploy Commands:</span>
              </div>
              <pre className="overflow-x-auto rounded bg-slate-950 p-2 font-mono text-[11px] text-slate-300">
{`# 1. Create D1 Database
npx wrangler d1 create govform-ai-db

# 2. Run D1 Schema Migration
npx wrangler d1 execute govform-ai-db --file=./schema.sql

# 3. Add Gemini Secret
npx wrangler secret put GEMINI_API_KEY

# 4. Deploy to Cloudflare Workers
npm run build && npx wrangler deploy`}
              </pre>
            </div>
          </div>

          {/* Right: Code Viewer (8 cols) */}
          <div className="flex flex-col overflow-hidden bg-slate-950 lg:col-span-8">
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-2 text-xs font-mono text-slate-400">
              <span>{CODE_FILES[activeFile].name}</span>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                {CODE_FILES[activeFile].lang.toUpperCase()}
              </span>
            </div>
            <pre className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-sky-300 selection:bg-sky-500 selection:text-white">
              <code>{CODE_FILES[activeFile].code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
