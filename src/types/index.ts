export type FormType = 
  | 'passport_renewal'
  | 'drivers_license'
  | 'snap_assistance'
  | 'business_grant'
  | 'voter_registration';

export interface FormServiceMeta {
  id: FormType;
  title: string;
  code: string;
  agency: string;
  description: string;
  badge: string;
  icon: string;
  requiredDocuments: string[];
  estimatedTime: string;
  samplePrompt: string;
}

export interface ExtractedField<T = string | number | boolean> {
  value: T;
  confidence: number; // 0.0 - 1.0
  source: 'document_ocr' | 'user_prompt' | 'inferred' | 'manual_override';
  verified: boolean;
  fieldNote?: string;
}

export interface PassportFormData {
  legalFirstName: ExtractedField<string>;
  legalMiddleName: ExtractedField<string>;
  legalLastName: ExtractedField<string>;
  dateOfBirth: ExtractedField<string>; // YYYY-MM-DD
  gender: ExtractedField<string>;
  placeOfBirthCity: ExtractedField<string>;
  placeOfBirthState: ExtractedField<string>;
  placeOfBirthCountry: ExtractedField<string>;
  socialSecurityNumber: ExtractedField<string>;
  emailAddress: ExtractedField<string>;
  phoneNumber: ExtractedField<string>;
  residentialStreet: ExtractedField<string>;
  residentialCity: ExtractedField<string>;
  residentialState: ExtractedField<string>;
  residentialZip: ExtractedField<string>;
  passportBookType: ExtractedField<'standard_36' | 'large_52'>;
  expeditedProcessing: ExtractedField<boolean>;
  emergencyContactName: ExtractedField<string>;
  emergencyContactPhone: ExtractedField<string>;
  previousPassportNumber?: ExtractedField<string>;
}

export interface DriversLicenseFormData {
  legalFirstName: ExtractedField<string>;
  legalLastName: ExtractedField<string>;
  dateOfBirth: ExtractedField<string>;
  licenseNumber: ExtractedField<string>;
  residentialStreet: ExtractedField<string>;
  residentialCity: ExtractedField<string>;
  residentialState: ExtractedField<string>;
  residentialZip: ExtractedField<string>;
  eyeColor: ExtractedField<string>;
  heightFeetInches: ExtractedField<string>;
  realIdRequested: ExtractedField<boolean>;
  organDonor: ExtractedField<boolean>;
  veteranIndicator: ExtractedField<boolean>;
}

export interface SnapFormData {
  applicantFullName: ExtractedField<string>;
  dateOfBirth: ExtractedField<string>;
  socialSecurityNumber: ExtractedField<string>;
  residentialStreet: ExtractedField<string>;
  residentialCity: ExtractedField<string>;
  residentialState: ExtractedField<string>;
  residentialZip: ExtractedField<string>;
  householdSize: ExtractedField<number>;
  grossMonthlyIncome: ExtractedField<number>;
  monthlyRentOrMortgage: ExtractedField<number>;
  monthlyUtilityExpenses: ExtractedField<number>;
  employmentStatus: ExtractedField<string>;
  citizenshipConfirmed: ExtractedField<boolean>;
}

export interface BusinessGrantFormData {
  businessLegalName: ExtractedField<string>;
  dbaName: ExtractedField<string>;
  einTaxId: ExtractedField<string>;
  ownerFullName: ExtractedField<string>;
  ownerEmail: ExtractedField<string>;
  ownerPhone: ExtractedField<string>;
  businessStreet: ExtractedField<string>;
  businessCity: ExtractedField<string>;
  businessState: ExtractedField<string>;
  businessZip: ExtractedField<string>;
  annualRevenue: ExtractedField<number>;
  employeeCount: ExtractedField<number>;
  grantPurpose: ExtractedField<string>;
  grantAmountRequested: ExtractedField<number>;
}

export interface VoterRegistrationFormData {
  legalFirstName: ExtractedField<string>;
  legalLastName: ExtractedField<string>;
  dateOfBirth: ExtractedField<string>;
  residentialStreet: ExtractedField<string>;
  residentialCity: ExtractedField<string>;
  residentialState: ExtractedField<string>;
  residentialZip: ExtractedField<string>;
  usCitizenConfirmed: ExtractedField<boolean>;
  willBe18ByElection: ExtractedField<boolean>;
  politicalPartyAffiliation: ExtractedField<string>;
  idNumberOrLast4SSN: ExtractedField<string>;
}

export type AnyFormData = 
  | PassportFormData 
  | DriversLicenseFormData 
  | SnapFormData 
  | BusinessGrantFormData 
  | VoterRegistrationFormData;

export interface ApplicationRecord {
  id: string;
  trackingNumber: string;
  formType: FormType;
  applicantName: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'action_required';
  data: Record<string, any>;
  extractedFieldsCount: number;
  overallConfidence: number;
  documentThumbnails: string[];
  userPromptExcerpt: string;
  createdAt: string;
  updatedAt: string;
  d1Synced: boolean;
  validationErrors: string[];
  signatureName?: string;
  signatureTimestamp?: string;
}

export interface DocumentUpload {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  base64Data: string;
  mimeType: string;
  previewUrl?: string;
  ocrExtractedPreview?: string;
}

export interface ParseFormApiResponse {
  success: boolean;
  formType: FormType;
  extractedData: Record<string, ExtractedField<any>>;
  overallConfidence: number;
  missingRequiredFields: string[];
  anomaliesDetected: string[];
  aiReasoning: string;
  processingTimeMs: number;
  modelUsed: string;
}
