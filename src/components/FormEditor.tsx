import React, { useState } from 'react';
import { FormServiceMeta, FormType, ExtractedField } from '../types';
import {
  FileText,
  Code,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Edit3,
  Copy,
  Check,
} from 'lucide-react';

interface FormEditorProps {
  service: FormServiceMeta;
  formData: Record<string, ExtractedField<any>>;
  onUpdateField: (fieldName: string, value: any) => void;
  onProceedToPreview: () => void;
}

export const FormEditor: React.FC<FormEditorProps> = ({
  service,
  formData,
  onUpdateField,
  onProceedToPreview,
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'json'>('form');
  const [copiedJson, setCopiedJson] = useState(false);

  const handleCopyJson = () => {
    const jsonStr = JSON.stringify(formData, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'document_ocr':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 ring-1 ring-emerald-500/20">
            📸 ID OCR
          </span>
        );
      case 'user_prompt':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-sky-400 ring-1 ring-sky-500/20">
            💬 Prompt/Voice
          </span>
        );
      case 'inferred':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-400 ring-1 ring-indigo-500/20">
            🤖 Inferred
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400 ring-1 ring-amber-500/20">
            ✏️ Manual
          </span>
        );
    }
  };

  const getConfidenceBadge = (confidence?: number) => {
    const val = typeof confidence === 'number' ? Math.round(confidence * 100) : 95;
    const color =
      val >= 90
        ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40'
        : val >= 75
        ? 'text-amber-400 bg-amber-950/40 border-amber-800/40'
        : 'text-rose-400 bg-rose-950/40 border-rose-800/40';

    return (
      <span
        className={`rounded border px-1.5 py-0.2 font-mono text-[10px] font-bold ${color}`}
      >
        {val}%
      </span>
    );
  };

  // Helper to render individual input field with traceability
  const renderField = (
    fieldName: string,
    label: string,
    type: 'text' | 'date' | 'number' | 'boolean' | 'select' = 'text',
    options?: Array<{ label: string; value: any }>,
    placeholder?: string
  ) => {
    const fieldObj = formData[fieldName] || {
      value: type === 'boolean' ? false : type === 'number' ? 0 : '',
      confidence: 0.9,
      source: 'inferred',
      verified: true,
    };

    const currentValue = fieldObj.value;

    return (
      <div
        key={fieldName}
        className="group relative rounded-xl border border-slate-800 bg-slate-950/70 p-3 transition-all hover:border-slate-700 hover:bg-slate-950"
      >
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <label
            htmlFor={`field-${fieldName}`}
            className="text-xs font-semibold text-slate-300 group-hover:text-white"
          >
            {label}
          </label>
          <div className="flex items-center gap-1.5">
            {getSourceBadge(fieldObj.source)}
            {getConfidenceBadge(fieldObj.confidence)}
          </div>
        </div>

        {type === 'boolean' ? (
          <label className="flex cursor-pointer items-center gap-2 pt-1 text-xs text-slate-200">
            <input
              type="checkbox"
              id={`field-${fieldName}`}
              checked={Boolean(currentValue)}
              onChange={(e) => onUpdateField(fieldName, e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-950"
            />
            <span className="font-medium">
              {Boolean(currentValue) ? 'Yes / Confirmed' : 'No / Declined'}
            </span>
          </label>
        ) : type === 'select' && options ? (
          <select
            id={`field-${fieldName}`}
            value={currentValue || ''}
            onChange={(e) => onUpdateField(fieldName, e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="">Select option...</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            id={`field-${fieldName}`}
            value={currentValue ?? ''}
            placeholder={placeholder || `Enter ${label}...`}
            onChange={(e) => {
              const val = type === 'number' ? Number(e.target.value) : e.target.value;
              onUpdateField(fieldName, val);
            }}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        )}

        {fieldObj.fieldNote && (
          <p className="mt-1 text-[10px] text-slate-400 line-clamp-1" title={fieldObj.fieldNote}>
            💡 {fieldObj.fieldNote}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
            Step 3: Structured Government Schema Review
          </span>
          <h3 className="text-base font-bold text-white sm:text-lg">
            {service.title} ({service.code})
          </h3>
        </div>

        {/* Form View / JSON View Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-1">
            <button
              onClick={() => setActiveTab('form')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                activeTab === 'form'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Form Fields</span>
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                activeTab === 'json'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="h-3.5 w-3.5" />
              <span>D1 JSON Payload</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'form' ? (
        <div className="space-y-6">
          {/* Form Specific Field Grids */}
          {service.id === 'passport_renewal' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1. Applicant Legal Identification
              </h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {renderField('legalFirstName', 'Legal First Name')}
                {renderField('legalMiddleName', 'Middle Name')}
                {renderField('legalLastName', 'Last Name')}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {renderField('dateOfBirth', 'Date of Birth (YYYY-MM-DD)', 'date')}
                {renderField('placeOfBirthCity', 'Place of Birth (City)')}
                {renderField('placeOfBirthState', 'Place of Birth (State / Region)')}
              </div>

              <h4 className="pt-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                2. Contact & Residential Address
              </h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {renderField('emailAddress', 'Email Address')}
                {renderField('phoneNumber', 'Phone Number')}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  {renderField('residentialStreet', 'Street Address (including Apt/Suite)')}
                </div>
                {renderField('residentialCity', 'City')}
                {renderField('residentialZip', '5-Digit Postal ZIP')}
              </div>

              <h4 className="pt-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                3. Passport Book & Service Tier
              </h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {renderField(
                  'passportBookType',
                  'Passport Book Size',
                  'select',
                  [
                    { label: 'Standard 36-Page Book', value: 'standard_36' },
                    { label: 'Large 52-Page Official Book (Frequent Travelers)', value: 'large_52' },
                  ]
                )}
                {renderField('expeditedProcessing', 'Expedited 2-Day Priority Delivery', 'boolean')}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {renderField('emergencyContactName', 'Emergency Contact Full Name & Relationship')}
                {renderField('emergencyContactPhone', 'Emergency Contact Phone Number')}
              </div>
            </div>
          )}

          {service.id === 'drivers_license' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1. Driver & Identification Records
              </h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {renderField('legalFirstName', 'Legal First Name')}
                {renderField('legalLastName', 'Last Name')}
                {renderField('licenseNumber', 'Driver License / ID Number')}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {renderField('dateOfBirth', 'Date of Birth', 'date')}
                {renderField('eyeColor', 'Eye Color')}
                {renderField('heightFeetInches', "Height (e.g. 5'9\")")}
              </div>

              <h4 className="pt-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                2. Residential Address
              </h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div className="sm:col-span-2">{renderField('residentialStreet', 'Street Address')}</div>
                {renderField('residentialCity', 'City')}
                {renderField('residentialZip', 'ZIP Code')}
              </div>

              <h4 className="pt-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                3. Official Endorsements & Designations
              </h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {renderField('realIdRequested', 'Real ID Compliant Star Card', 'boolean')}
                {renderField('organDonor', 'Organ & Tissue Donor Registry', 'boolean')}
                {renderField('veteranIndicator', 'Military Veteran Designation', 'boolean')}
              </div>
            </div>
          )}

          {service.id === 'snap_assistance' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1. Applicant Information
              </h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {renderField('applicantFullName', 'Applicant Legal Full Name')}
                {renderField('citizenshipConfirmed', 'US Citizen / Qualified Immigrant', 'boolean')}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {renderField('residentialStreet', 'Street Address')}
                {renderField('residentialCity', 'City')}
                {renderField('residentialZip', 'ZIP Code')}
              </div>

              <h4 className="pt-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                2. Household Composition & Income
              </h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {renderField('householdSize', 'Total Household Size', 'number')}
                {renderField('grossMonthlyIncome', 'Gross Monthly Household Income ($)', 'number')}
                {renderField('employmentStatus', 'Current Employment Status')}
              </div>

              <h4 className="pt-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                3. Allowable Shelter & Utility Deductions
              </h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {renderField('monthlyRentOrMortgage', 'Monthly Rent or Mortgage Payment ($)', 'number')}
                {renderField('monthlyUtilityExpenses', 'Monthly Utility Expenses (Electric/Gas/Water) ($)', 'number')}
              </div>
            </div>
          )}

          {service.id === 'business_grant' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1. Business Legal Entity Details
              </h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {renderField('businessLegalName', 'Legal Business Entity Name')}
                {renderField('dbaName', 'Trade Name / DBA')}
                {renderField('einTaxId', 'Federal Employer ID (EIN)')}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {renderField('ownerFullName', 'Managing Owner Legal Name')}
                {renderField('ownerEmail', 'Owner Email')}
                {renderField('businessZip', 'Business ZIP Code')}
              </div>

              <h4 className="pt-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                2. Financials & Grant Request
              </h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {renderField('annualRevenue', 'Prior Year Annual Gross Revenue ($)', 'number')}
                {renderField('employeeCount', 'Full-time W-2 Employee Count', 'number')}
                {renderField('grantAmountRequested', 'Grant Amount Requested ($)', 'number')}
              </div>
              <div>{renderField('grantPurpose', 'Project Purpose & Economic Impact Statement')}</div>
            </div>
          )}

          {service.id === 'voter_registration' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1. Citizen Voter Qualifications
              </h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {renderField('usCitizenConfirmed', 'I am a citizen of the United States', 'boolean')}
                {renderField('willBe18ByElection', 'I will be at least 18 years old on or before Election Day', 'boolean')}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {renderField('legalFirstName', 'Legal First Name')}
                {renderField('legalLastName', 'Last Name')}
                {renderField('dateOfBirth', 'Date of Birth', 'date')}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {renderField('residentialStreet', 'Street Address')}
                {renderField('residentialCity', 'City')}
                {renderField('residentialZip', 'ZIP Code')}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {renderField('politicalPartyAffiliation', 'Political Party Affiliation Choice')}
                {renderField('idNumberOrLast4SSN', 'State ID Number or Last 4 SSN')}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              Normalized Cloudflare D1 JSON Object
            </span>
            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              {copiedJson ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
          </div>
          <pre className="max-h-96 overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-sky-300">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      )}

      {/* Next Step Action Button */}
      <div className="mt-6 flex items-center justify-end border-t border-slate-800/80 pt-4">
        <button
          onClick={onProceedToPreview}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500"
        >
          <span>Step 4: Official Document Preview & Attestation</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
