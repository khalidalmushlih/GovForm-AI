import React, { useState } from 'react';
import { FormServiceMeta, ExtractedField } from '../types';
import {
  Shield,
  CheckCircle,
  FileText,
  Lock,
  Printer,
  Download,
  Send,
  Sparkles,
  QrCode,
  PenTool,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface OfficialPdfPreviewProps {
  service: FormServiceMeta;
  formData: Record<string, ExtractedField<any>>;
  trackingNumber: string;
  onSubmitToD1: (signatureName: string) => Promise<void>;
  isSubmitting: boolean;
  onBackToEdit: () => void;
}

export const OfficialPdfPreview: React.FC<OfficialPdfPreviewProps> = ({
  service,
  formData,
  trackingNumber,
  onSubmitToD1,
  isSubmitting,
  onBackToEdit,
}) => {
  const [signatureName, setSignatureName] = useState(
    formData.applicantFullName?.value ||
      (formData.legalFirstName?.value
        ? `${formData.legalFirstName.value} ${formData.legalLastName?.value || ''}`
        : '')
  );
  const [agreedOath, setAgreedOath] = useState(true);

  const getFieldValue = (key: string, fallback: string = '—') => {
    const item = formData[key];
    if (!item || item.value === undefined || item.value === '') return fallback;
    if (typeof item.value === 'boolean') return item.value ? 'YES' : 'NO';
    if (typeof item.value === 'number') return item.value.toLocaleString();
    return String(item.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureName.trim() || !agreedOath) return;

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {}

    await onSubmitToD1(signatureName);
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch (err) {
      console.warn('Print not supported in iframe environment:', err);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
            Step 4: Official Document Attestation
          </span>
          <h3 className="text-base font-bold text-white">
            Pre-Submission Review & Electronic Signature
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToEdit}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            ← Edit Fields
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Form</span>
          </button>
        </div>
      </div>

      {/* Official Government Form Paper Mockup */}
      <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-slate-300 bg-white p-6 text-slate-900 shadow-2xl sm:p-10">
        {/* Document Header with Official Seal & Agency Code */}
        <div className="flex flex-wrap items-start justify-between border-b-2 border-slate-900 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-100 text-slate-900">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[11px] font-black tracking-widest text-slate-600 uppercase">
                UNITED STATES GOVERNMENT
              </span>
              <h1 className="text-xl font-black tracking-tight text-slate-950 uppercase">
                {service.agency}
              </h1>
              <p className="text-xs font-bold text-slate-700">
                Official Application Form: {service.title} ({service.code})
              </p>
            </div>
          </div>

          <div className="mt-2 text-right sm:mt-0">
            <div className="inline-block rounded border border-slate-400 bg-slate-50 px-2 py-1 font-mono text-xs font-bold">
              TRACKING: {trackingNumber}
            </div>
            <div className="mt-1 font-mono text-[10px] text-slate-500">
              OMB Control No. 1405-0004 • Exp: 2029
            </div>
          </div>
        </div>

        {/* Security Barcode Zone */}
        <div className="mt-3 flex items-center justify-between rounded bg-slate-100 px-4 py-1.5 font-mono text-[11px] text-slate-700">
          <span>MRZ REF: 00482-SECURE-CF-WORKERS-SSR</span>
          <span className="font-bold">STATUS: READY FOR D1 COMMIT</span>
        </div>

        {/* Section 1: Applicant Legal Identity Details */}
        <div className="mt-6">
          <div className="bg-slate-900 px-3 py-1 font-bold text-xs uppercase text-white">
            Section 1 — Applicant Identity & Personal Records
          </div>

          <div className="mt-2 grid grid-cols-1 gap-px bg-slate-300 sm:grid-cols-3">
            <div className="bg-white p-2.5">
              <span className="block text-[10px] font-bold uppercase text-slate-500">Legal First Name</span>
              <span className="font-bold text-sm text-slate-900">
                {getFieldValue('legalFirstName', getFieldValue('applicantFullName', 'Eleanor'))}
              </span>
            </div>
            <div className="bg-white p-2.5">
              <span className="block text-[10px] font-bold uppercase text-slate-500">Middle Name</span>
              <span className="font-bold text-sm text-slate-900">{getFieldValue('legalMiddleName', '—')}</span>
            </div>
            <div className="bg-white p-2.5">
              <span className="block text-[10px] font-bold uppercase text-slate-500">Last / Family Name</span>
              <span className="font-bold text-sm text-slate-900">{getFieldValue('legalLastName', 'Vance')}</span>
            </div>

            <div className="bg-white p-2.5">
              <span className="block text-[10px] font-bold uppercase text-slate-500">Date of Birth</span>
              <span className="font-mono font-bold text-sm text-slate-900">{getFieldValue('dateOfBirth', '1991-05-14')}</span>
            </div>
            <div className="bg-white p-2.5">
              <span className="block text-[10px] font-bold uppercase text-slate-500">Place of Birth / State</span>
              <span className="font-bold text-sm text-slate-900">
                {getFieldValue('placeOfBirthCity', 'Seattle')}, {getFieldValue('placeOfBirthState', 'WA')}
              </span>
            </div>
            <div className="bg-white p-2.5">
              <span className="block text-[10px] font-bold uppercase text-slate-500">Identification Number</span>
              <span className="font-mono font-bold text-sm text-slate-900">
                {getFieldValue('licenseNumber', getFieldValue('idNumberOrLast4SSN', getFieldValue('einTaxId', 'WDL-849201948')))}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Contact & Address */}
        <div className="mt-5">
          <div className="bg-slate-900 px-3 py-1 font-bold text-xs uppercase text-white">
            Section 2 — Verified Residence & Contact Information
          </div>

          <div className="mt-2 grid grid-cols-1 gap-px bg-slate-300 sm:grid-cols-4">
            <div className="bg-white p-2.5 sm:col-span-2">
              <span className="block text-[10px] font-bold uppercase text-slate-500">Residential Street Address</span>
              <span className="font-bold text-sm text-slate-900">
                {getFieldValue('residentialStreet', getFieldValue('businessStreet', '1420 Pine Street, Apt 4B'))}
              </span>
            </div>
            <div className="bg-white p-2.5">
              <span className="block text-[10px] font-bold uppercase text-slate-500">City / State</span>
              <span className="font-bold text-sm text-slate-900">
                {getFieldValue('residentialCity', 'Seattle')}, {getFieldValue('residentialState', 'WA')}
              </span>
            </div>
            <div className="bg-white p-2.5">
              <span className="block text-[10px] font-bold uppercase text-slate-500">Postal ZIP</span>
              <span className="font-mono font-bold text-sm text-slate-900">
                {getFieldValue('residentialZip', getFieldValue('businessZip', '98101'))}
              </span>
            </div>

            <div className="bg-white p-2.5 sm:col-span-2">
              <span className="block text-[10px] font-bold uppercase text-slate-500">Email Address</span>
              <span className="font-bold text-xs text-slate-900">
                {getFieldValue('emailAddress', getFieldValue('ownerEmail', 'applicant@example.com'))}
              </span>
            </div>
            <div className="bg-white p-2.5 sm:col-span-2">
              <span className="block text-[10px] font-bold uppercase text-slate-500">Telephone</span>
              <span className="font-mono font-bold text-xs text-slate-900">
                {getFieldValue('phoneNumber', getFieldValue('ownerPhone', '206-555-0199'))}
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Service-Specific Declarations */}
        <div className="mt-5">
          <div className="bg-slate-900 px-3 py-1 font-bold text-xs uppercase text-white">
            Section 3 — Specific Program Declarations & Elections
          </div>

          <div className="mt-2 grid grid-cols-1 gap-px bg-slate-300 sm:grid-cols-3">
            {service.id === 'passport_renewal' && (
              <>
                <div className="bg-white p-2.5">
                  <span className="block text-[10px] font-bold uppercase text-slate-500">Book Type</span>
                  <span className="font-bold text-xs text-slate-900">
                    {getFieldValue('passportBookType') === 'large_52' ? '52-Page Official Book' : '36-Page Standard'}
                  </span>
                </div>
                <div className="bg-white p-2.5">
                  <span className="block text-[10px] font-bold uppercase text-slate-500">Expedited Service</span>
                  <span className="font-bold text-xs text-slate-900">{getFieldValue('expeditedProcessing', 'YES')}</span>
                </div>
                <div className="bg-white p-2.5">
                  <span className="block text-[10px] font-bold uppercase text-slate-500">Emergency Contact</span>
                  <span className="font-bold text-xs text-slate-900">{getFieldValue('emergencyContactName', 'Thomas Vance')}</span>
                </div>
              </>
            )}

            {service.id === 'drivers_license' && (
              <>
                <div className="bg-white p-2.5">
                  <span className="block text-[10px] font-bold uppercase text-slate-500">Real ID Compliance</span>
                  <span className="font-bold text-xs text-slate-900">{getFieldValue('realIdRequested', 'YES')}</span>
                </div>
                <div className="bg-white p-2.5">
                  <span className="block text-[10px] font-bold uppercase text-slate-500">Organ Donor Registry</span>
                  <span className="font-bold text-xs text-slate-900">{getFieldValue('organDonor', 'YES')}</span>
                </div>
                <div className="bg-white p-2.5">
                  <span className="block text-[10px] font-bold uppercase text-slate-500">Veteran Indicator</span>
                  <span className="font-bold text-xs text-slate-900">{getFieldValue('veteranIndicator', 'YES')}</span>
                </div>
              </>
            )}

            {service.id === 'snap_assistance' && (
              <>
                <div className="bg-white p-2.5">
                  <span className="block text-[10px] font-bold uppercase text-slate-500">Household Size</span>
                  <span className="font-bold text-xs text-slate-900">{getFieldValue('householdSize', '3')}</span>
                </div>
                <div className="bg-white p-2.5">
                  <span className="block text-[10px] font-bold uppercase text-slate-500">Gross Monthly Income</span>
                  <span className="font-bold text-xs text-slate-900">${getFieldValue('grossMonthlyIncome', '1,850')}</span>
                </div>
                <div className="bg-white p-2.5">
                  <span className="block text-[10px] font-bold uppercase text-slate-500">Monthly Rent Expense</span>
                  <span className="font-bold text-xs text-slate-900">${getFieldValue('monthlyRentOrMortgage', '1,100')}</span>
                </div>
              </>
            )}

            {service.id === 'business_grant' && (
              <>
                <div className="bg-white p-2.5">
                  <span className="block text-[10px] font-bold uppercase text-slate-500">Legal Business Name</span>
                  <span className="font-bold text-xs text-slate-900">{getFieldValue('businessLegalName', 'Apex Green Logistics LLC')}</span>
                </div>
                <div className="bg-white p-2.5">
                  <span className="block text-[10px] font-bold uppercase text-slate-500">Grant Requested</span>
                  <span className="font-bold text-xs text-slate-900">${getFieldValue('grantAmountRequested', '25,000')}</span>
                </div>
                <div className="bg-white p-2.5">
                  <span className="block text-[10px] font-bold uppercase text-slate-500">Annual Revenue</span>
                  <span className="font-bold text-xs text-slate-900">${getFieldValue('annualRevenue', '340,000')}</span>
                </div>
              </>
            )}

            {service.id === 'voter_registration' && (
              <>
                <div className="bg-white p-2.5">
                  <span className="block text-[10px] font-bold uppercase text-slate-500">US Citizen Oath</span>
                  <span className="font-bold text-xs text-slate-900">{getFieldValue('usCitizenConfirmed', 'CONFIRMED')}</span>
                </div>
                <div className="bg-white p-2.5">
                  <span className="block text-[10px] font-bold uppercase text-slate-500">Party Affiliation</span>
                  <span className="font-bold text-xs text-slate-900">{getFieldValue('politicalPartyAffiliation', 'Independent')}</span>
                </div>
                <div className="bg-white p-2.5">
                  <span className="block text-[10px] font-bold uppercase text-slate-500">Age Qualification</span>
                  <span className="font-bold text-xs text-slate-900">{getFieldValue('willBe18ByElection', 'VERIFIED (≥18)')}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Section 4: Legal Oath & Electronic Signature */}
        <form onSubmit={handleSubmit} className="mt-6 border-t-2 border-slate-900 pt-4">
          <div className="rounded border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
            <span className="font-bold uppercase">LEGAL PENALTY OF PERJURY DECLARATION:</span> I declare under
            penalty of perjury under the laws of the United States of America that the foregoing information,
            extracted via multimodal verification and confirmed by my review, is true and correct.
          </div>

          <div className="mt-4 grid grid-cols-1 items-center gap-4 sm:grid-cols-12">
            <div className="sm:col-span-8">
              <label className="block text-xs font-bold uppercase text-slate-700">
                Digital Attestation Signature (Type Full Legal Name):
              </label>
              <div className="relative mt-1">
                <input
                  type="text"
                  required
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  placeholder="e.g., Eleanor Jane Vance"
                  className="w-full rounded-lg border-2 border-slate-800 bg-slate-50 px-3 py-2 font-serif text-base font-bold italic text-slate-900 focus:border-sky-600 focus:bg-white focus:outline-none"
                />
                <PenTool className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="sm:col-span-4">
              <span className="block text-xs font-bold uppercase text-slate-700">Attestation Date:</span>
              <div className="mt-1 rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 font-mono text-xs font-bold text-slate-700">
                {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })}
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-4 sm:flex-row">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Lock className="h-4 w-4 text-emerald-600" />
              <span>Signed payload will be written to Cloudflare D1 with immutable audit trace</span>
            </div>

            <button
              type="submit"
              id="btn-submit-d1"
              disabled={isSubmitting || !signatureName.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-8 py-3 text-sm font-black uppercase tracking-wider text-white shadow-xl hover:bg-slate-800 disabled:opacity-50 sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Committing to Cloudflare D1...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 text-sky-400" />
                  <span>Submit & Save to Cloudflare D1</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
