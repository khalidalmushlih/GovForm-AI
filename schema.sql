-- Cloudflare D1 SQL Schema for GovForm AI
-- Deployment command: wrangler d1 execute govform-ai-db --file=./schema.sql

-- 1. Applications Master Table
CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  tracking_number TEXT UNIQUE NOT NULL,
  form_type TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'action_required', 'rejected')),
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

-- 2. Document Attachments & OCR Verification Table
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  document_category TEXT NOT NULL CHECK (document_category IN ('driver_license', 'passport', 'state_id', 'proof_of_residence', 'income_verification', 'business_license', 'other')),
  ocr_extracted_text TEXT,
  ocr_confidence REAL DEFAULT 0.0,
  ocr_metadata JSON,
  r2_object_key TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- 3. Field Verifications & Traceability Audit Log
CREATE TABLE IF NOT EXISTS field_verifications (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL,
  field_name TEXT NOT NULL,
  field_value TEXT,
  extracted_source TEXT NOT NULL CHECK (extracted_source IN ('document_ocr', 'user_prompt', 'inferred', 'manual_override')),
  confidence REAL DEFAULT 1.0,
  is_verified INTEGER DEFAULT 1,
  reviewer_notes TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- 4. Immutable Audit Trail Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL,
  action_type TEXT NOT NULL, -- 'AI_PARSED', 'FIELD_EDITED', 'SUBMITTED', 'VERIFIED', 'STATUS_CHANGED'
  actor TEXT NOT NULL DEFAULT 'system_ai',
  details JSON,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- Indexes for lightning-fast lookups on Cloudflare Edge
CREATE INDEX IF NOT EXISTS idx_apps_tracking ON applications(tracking_number);
CREATE INDEX IF NOT EXISTS idx_apps_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_apps_form_type ON applications(form_type);
CREATE INDEX IF NOT EXISTS idx_docs_app_id ON documents(application_id);
CREATE INDEX IF NOT EXISTS idx_audit_app_id ON audit_logs(application_id);
