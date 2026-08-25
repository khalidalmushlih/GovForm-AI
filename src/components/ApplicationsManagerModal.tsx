import React, { useState, useEffect } from 'react';
import { ApplicationRecord } from '../types';
import {
  Database,
  X,
  Search,
  FileText,
  Clock,
  Shield,
  Download,
  Trash2,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

interface ApplicationsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectApplicationToLoad: (app: ApplicationRecord) => void;
}

export const ApplicationsManagerModal: React.FC<ApplicationsManagerModalProps> = ({
  isOpen,
  onClose,
  onSelectApplicationToLoad,
}) => {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [selectedApp, setSelectedApp] = useState<ApplicationRecord | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/applications');
      const data = await res.json();
      if (data.applications) {
        setApplications(
          data.applications.map((row: any) => ({
            id: row.id,
            trackingNumber: row.tracking_number,
            formType: row.form_type,
            applicantName: row.applicant_name,
            status: row.status,
            data: row.form_payload || {},
            extractedFieldsCount: row.extracted_fields_count,
            overallConfidence: row.overall_confidence,
            documentThumbnails: [],
            userPromptExcerpt: row.user_prompt_excerpt || '',
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            d1Synced: true,
            validationErrors: row.validation_errors || [],
            signatureName: row.signature_name,
            signatureTimestamp: row.signature_timestamp,
          }))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchApplications();
    }
  }, [isOpen]);

  const loadAppDetails = async (app: ApplicationRecord) => {
    setSelectedApp(app);
    try {
      const res = await fetch(`/api/applications/${app.id}`);
      const data = await res.json();
      if (data.auditLogs) {
        setAuditLogs(data.auditLogs);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/applications/${id}`, { method: 'DELETE' });
      setApplications((prev) => prev.filter((a) => a.id !== id));
      if (selectedApp?.id === id) {
        setSelectedApp(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportD1Sql = () => {
    let sql = `-- Cloudflare D1 SQL Data Dump for GovForm AI\n-- Generated: ${new Date().toISOString()}\n\n`;
    applications.forEach((app) => {
      sql += `INSERT INTO applications (id, tracking_number, form_type, applicant_name, status, overall_confidence, extracted_fields_count, form_payload, created_at, updated_at)\n`;
      sql += `VALUES ('${app.id}', '${app.trackingNumber}', '${app.formType}', '${app.applicantName.replace(/'/g, "''")}', '${app.status}', ${app.overallConfidence}, ${app.extractedFieldsCount}, '${JSON.stringify(app.data).replace(/'/g, "''")}', '${app.createdAt}', '${app.updatedAt}');\n\n`;
    });

    const blob = new Blob([sql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `govform_d1_export_${Date.now()}.sql`;
    a.click();
  };

  if (!isOpen) return null;

  const filteredApps = applications.filter(
    (a) =>
      a.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.formType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 ring-1 ring-sky-500/30">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Cloudflare D1 Database Explorer
              </h3>
              <p className="text-xs text-slate-400">
                SQLite table <code className="font-mono text-sky-300">applications</code> bound to{' '}
                <code className="font-mono text-sky-300">env.DB</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportD1Sql}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export SQL Dump</span>
            </button>
            <button
              onClick={fetchApplications}
              className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white"
              title="Refresh Records"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-12">
          {/* Left: Applications List (7 cols) */}
          <div className="flex flex-col border-r border-slate-800 bg-slate-900/60 lg:col-span-7">
            {/* Search filter */}
            <div className="border-b border-slate-800 p-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by applicant name, tracking ID, or form..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 py-1.5 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredApps.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No records found in Cloudflare D1 database table.
                </div>
              ) : (
                filteredApps.map((app) => {
                  const isSelected = selectedApp?.id === app.id;
                  return (
                    <div
                      key={app.id}
                      onClick={() => loadAppDetails(app)}
                      className={`group cursor-pointer rounded-xl border p-3 transition-all ${
                        isSelected
                          ? 'border-sky-500 bg-sky-950/30'
                          : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-950'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-sky-400">
                              {app.trackingNumber}
                            </span>
                            <span
                              className={`rounded px-1.5 py-0.2 text-[10px] font-bold uppercase ${
                                app.status === 'submitted'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {app.status}
                            </span>
                          </div>
                          <h4 className="mt-1 text-sm font-bold text-slate-200">
                            {app.applicantName}
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            Form: {app.formType.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleDelete(app.id, e)}
                            className="rounded p-1 text-slate-500 hover:bg-rose-950/50 hover:text-rose-400"
                            title="Delete Record"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400" />
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[10px] text-slate-500">
                        <span>Confidence: {Math.round(app.overallConfidence * 100)}%</span>
                        <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Record Details & Audit Log (5 cols) */}
          <div className="flex flex-col overflow-y-auto bg-slate-950 p-4 lg:col-span-5">
            {selectedApp ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white">Record Details</h4>
                    <span className="font-mono text-xs text-sky-400">{selectedApp.id}</span>
                  </div>
                  <button
                    onClick={() => {
                      onSelectApplicationToLoad(selectedApp);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-sky-400"
                  >
                    <span>Load into Form</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Audit Trail */}
                <div>
                  <h5 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Cloudflare D1 Audit Logs
                  </h5>
                  <div className="space-y-1.5">
                    {auditLogs.length === 0 ? (
                      <span className="text-[11px] text-slate-500">No audit logs for this record.</span>
                    ) : (
                      auditLogs.map((log, i) => (
                        <div
                          key={log.id || i}
                          className="rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-xs"
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-emerald-400">{log.action_type}</span>
                            <span className="text-slate-500">
                              {new Date(log.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="mt-0.5 text-slate-300">Actor: {log.actor}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Raw Form Payload JSON */}
                <div>
                  <h5 className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Stored D1 JSON Payload
                  </h5>
                  <pre className="max-h-60 overflow-auto rounded-lg border border-slate-800 bg-slate-900 p-2.5 font-mono text-[11px] text-sky-300">
                    {JSON.stringify(selectedApp.data, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-center text-xs text-slate-500">
                Select an application from the left to inspect its Cloudflare D1 record & audit trail.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
