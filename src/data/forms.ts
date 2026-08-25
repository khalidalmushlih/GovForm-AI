import { FormServiceMeta, FormType } from '../types';

export const FORM_SERVICES: FormServiceMeta[] = [
  {
    id: 'passport_renewal',
    title: 'U.S. Passport Application & Renewal',
    code: 'DS-82 / DS-11',
    agency: 'U.S. Department of State - Passport Services',
    description: 'Renew your adult passport or apply for a new standard or 52-page official passport book with expedited processing.',
    badge: 'Consular Affairs',
    icon: 'FileText',
    requiredDocuments: ['Driver License or State ID', 'Previous Passport (if renewing)', 'Proof of Address'],
    estimatedTime: '3-4 mins conversational intake',
    samplePrompt: "Hi, I need to renew my expired passport. My name is Eleanor Vance, born May 14, 1991 in Seattle, WA. I live at 1420 Pine Street, Apt 4B, Seattle WA 98101. My email is eleanor.vance@example.com and phone is 206-555-0199. I want the 52-page book with expedited 2-day priority service because I have upcoming international travel next month. My brother Thomas Vance (206-555-0188) is my emergency contact."
  },
  {
    id: 'drivers_license',
    title: "Driver's License & Real ID Renewal",
    code: 'DL-44 Real ID',
    agency: 'Department of Motor Vehicles (DMV)',
    description: 'State identification card or driver license renewal with Real ID star compliance, organ donor preference, and address verification.',
    badge: 'State DMV',
    icon: 'CreditCard',
    requiredDocuments: ['Proof of Identity (Passport or Birth Certificate)', 'Two Proofs of State Residency', 'Current DL'],
    estimatedTime: '2 mins conversational intake',
    samplePrompt: "I'm updating my Driver's License to a Real ID. I recently changed apartments to 884 Market Blvd, Austin, TX 78701. My eyes are Hazel, height is 5'9\". Yes, I want to be an organ donor and I am an honorably discharged Navy veteran, so please include the veteran indicator."
  },
  {
    id: 'snap_assistance',
    title: 'SNAP Nutrition & Food Assistance',
    code: 'SNAP-TANF Form 101',
    agency: 'Department of Health & Human Services',
    description: 'Supplemental Nutrition Assistance Program eligibility intake for individuals and families requiring food & grocery support.',
    badge: 'Public Benefits',
    icon: 'HeartHandshake',
    requiredDocuments: ['Government Issued Photo ID', 'Proof of Gross Household Income / Paystubs', 'Rent/Utility Lease Document'],
    estimatedTime: '4 mins conversational intake',
    samplePrompt: "I need to apply for SNAP benefits for my family. We have 3 people in our household (myself and two young kids). My gross monthly income is currently $1,850 working part-time. My monthly rent is $1,100 and utilities are about $180 per month. I am a US citizen living at 502 Oakridge Ave, Columbus, OH 43215."
  },
  {
    id: 'business_grant',
    title: 'Small Business Innovation & Growth Grant',
    code: 'SBA-EDG-2026',
    agency: 'Small Business Administration (SBA)',
    description: 'Emergency local business grants and technology modernization funding for small enterprises under 50 employees.',
    badge: 'Economic Dev',
    icon: 'Building2',
    requiredDocuments: ['Articles of Organization / Business License', 'Owner Photo Identification', 'W-9 / Tax ID Documentation'],
    estimatedTime: '3 mins conversational intake',
    samplePrompt: "We are applying for the $25,000 Small Business Innovation Grant for our company 'Apex Green Logistics LLC' (DBA 'Apex Eco Freight'). Our EIN is 84-9382104. I am the managing owner, Marcus Chen (marcus@apexeco.com, 415-555-0143). We are located at 350 Mission St, Suite 1200, San Francisco, CA 94105. Annual revenue was $340,000 last year with 6 full-time staff. The grant will fund automated route optimization software to cut fleet emissions by 30%."
  },
  {
    id: 'voter_registration',
    title: 'National Voter Registration Application',
    code: 'NVRA Form 01',
    agency: 'Federal Election Commission (EAC)',
    description: 'Register to vote or update your residential address and political party affiliation for upcoming municipal, state, and federal elections.',
    badge: 'Elections Division',
    icon: 'Vote',
    requiredDocuments: ['State Driver License or State ID Number', 'or Last 4 digits of SSN'],
    estimatedTime: '1-2 mins conversational intake',
    samplePrompt: "Please register me to vote in my county. My legal name is Sophia Marie Rodriguez, born November 03, 1998. I live at 1204 Cedar Parkway, Denver, CO 80203. I am a US Citizen, I will be over 18 for the election, and I would like to register as an Independent (Unenrolled) voter."
  }
];

export interface SampleIdPreset {
  id: string;
  name: string;
  type: string;
  fileName: string;
  description: string;
  mockDetails: {
    name: string;
    dob: string;
    docNumber: string;
    address: string;
    expiry: string;
    issuingState: string;
  };
  svgDataUrl: string;
}

// Generate high quality SVG sample ID cards for instant testing without needing real sensitive personal documents
export function generateSampleIdCardSvg(name: string, docType: string, number: string, dob: string, address: string, state: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
    <defs>
      <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="50%" stop-color="#1e293b" />
        <stop offset="100%" stop-color="#090d16" />
      </linearGradient>
      <linearGradient id="goldHolo" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.8"/>
        <stop offset="50%" stop-color="#f59e0b" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#fbbf24" stop-opacity="0.8"/>
      </linearGradient>
      <pattern id="guilloche" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="20" cy="20" r="18" fill="none" stroke="#334155" stroke-width="0.75" stroke-opacity="0.3"/>
        <circle cx="20" cy="20" r="10" fill="none" stroke="#38bdf8" stroke-width="0.5" stroke-opacity="0.2"/>
      </pattern>
    </defs>
    
    <!-- Card Outer Body -->
    <rect x="0" y="0" width="640" height="400" rx="24" fill="url(#cardGrad)" stroke="#475569" stroke-width="3"/>
    <rect x="0" y="0" width="640" height="400" rx="24" fill="url(#guilloche)" />
    
    <!-- Header Bar -->
    <rect x="0" y="0" width="640" height="74" rx="24" fill="#0284c7" fill-opacity="0.25"/>
    <rect x="0" y="50" width="640" height="24" fill="#0284c7" fill-opacity="0.25"/>
    
    <!-- Gold Hologram Ribbon -->
    <rect x="24" y="24" width="592" height="4" fill="url(#goldHolo)" rx="2"/>
    
    <!-- State & Header Text -->
    <text x="32" y="52" font-family="system-ui, sans-serif" font-size="22" font-weight="900" fill="#f8fafc" letter-spacing="2">STATE OF ${state.toUpperCase()} • REAL ID</text>
    <text x="590" y="52" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#38bdf8" text-anchor="end">${docType.toUpperCase()}</text>
    
    <!-- Star Emblem for Real ID -->
    <circle cx="590" cy="100" r="18" fill="#fbbf24" fill-opacity="0.2" stroke="#fbbf24" stroke-width="2"/>
    <text x="590" y="106" font-family="system-ui, sans-serif" font-size="18" font-weight="bold" fill="#fbbf24" text-anchor="middle">★</text>
    
    <!-- Photo Box Placeholder with Holographic Silhouette -->
    <rect x="32" y="96" width="140" height="180" rx="12" fill="#1e293b" stroke="#0284c7" stroke-width="2"/>
    <circle cx="102" cy="155" r="32" fill="#64748b"/>
    <path d="M 62 250 C 62 205, 142 205, 142 250 Z" fill="#64748b"/>
    <rect x="32" y="250" width="140" height="26" fill="#0369a1" fill-opacity="0.4" rx="4"/>
    <text x="102" y="268" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#bae6fd" text-anchor="middle">AUTHENTICATED</text>
    
    <!-- ID Fields -->
    <text x="196" y="112" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#94a3b8" letter-spacing="1.5">LICENSE / ID NUMBER</text>
    <text x="196" y="136" font-family="monospace" font-size="20" font-weight="900" fill="#38bdf8" letter-spacing="1">${number}</text>
    
    <text x="196" y="162" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#94a3b8" letter-spacing="1.5">LEGAL NAME</text>
    <text x="196" y="184" font-family="system-ui, sans-serif" font-size="17" font-weight="800" fill="#f8fafc">${name.toUpperCase()}</text>
    
    <text x="196" y="210" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#94a3b8" letter-spacing="1.5">DATE OF BIRTH</text>
    <text x="196" y="230" font-family="system-ui, sans-serif" font-size="15" font-weight="700" fill="#e2e8f0">${dob}</text>
    
    <text x="360" y="210" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#94a3b8" letter-spacing="1.5">EXPIRES</text>
    <text x="360" y="230" font-family="system-ui, sans-serif" font-size="15" font-weight="700" fill="#4ade80">05/14/2030</text>
    
    <text x="196" y="258" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#94a3b8" letter-spacing="1.5">PRINCIPAL RESIDENCE</text>
    <text x="196" y="278" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#cbd5e1">${address}</text>
    
    <!-- Machine Readable Zone (MRZ) Barcode Simulation -->
    <rect x="24" y="304" width="592" height="74" rx="10" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
    <text x="36" y="334" font-family="monospace" font-size="13" font-weight="bold" fill="#64748b" letter-spacing="2">DLUSA${number}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;9105142F3005148</text>
    <text x="36" y="360" font-family="monospace" font-size="13" font-weight="bold" fill="#64748b" letter-spacing="2">${name.replace(' ', '&lt;&lt;').toUpperCase()}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_ID_PRESETS: SampleIdPreset[] = [
  {
    id: 'sample_dl_eleanor',
    name: "Eleanor Vance (WA Driver's License)",
    type: "Driver's License",
    fileName: 'wa_drivers_license_eleanor_vance.svg',
    description: 'Real ID compliant Washington State Driver License with residential address and DOB',
    mockDetails: {
      name: 'Eleanor Jane Vance',
      dob: '1991-05-14',
      docNumber: 'WDL-849201948',
      address: '1420 Pine Street, Apt 4B, Seattle, WA 98101',
      expiry: '2030-05-14',
      issuingState: 'Washington'
    },
    svgDataUrl: generateSampleIdCardSvg(
      'Eleanor Jane Vance',
      'Driver License',
      'WDL-849201948',
      '05/14/1991',
      '1420 Pine St Apt 4B, Seattle WA 98101',
      'Washington'
    )
  },
  {
    id: 'sample_dl_marcus',
    name: 'Marcus Chen (CA Real ID)',
    type: 'State Identification Card',
    fileName: 'ca_real_id_marcus_chen.svg',
    description: 'California Real ID Star Card with San Francisco business owner address',
    mockDetails: {
      name: 'Marcus Alexander Chen',
      dob: '1986-11-20',
      docNumber: 'CA-DL77492018',
      address: '350 Mission St Suite 1200, San Francisco, CA 94105',
      expiry: '2029-11-20',
      issuingState: 'California'
    },
    svgDataUrl: generateSampleIdCardSvg(
      'Marcus Alexander Chen',
      'Real ID Card',
      'CA-DL77492018',
      '11/20/1986',
      '350 Mission St Ste 1200, San Francisco CA',
      'California'
    )
  },
  {
    id: 'sample_dl_sophia',
    name: 'Sophia Rodriguez (CO Driver License)',
    type: "Driver's License",
    fileName: 'co_drivers_license_sophia.svg',
    description: 'Colorado State Driver License with Denver residential address',
    mockDetails: {
      name: 'Sophia Marie Rodriguez',
      dob: '1998-11-03',
      docNumber: 'CO-98241094',
      address: '1204 Cedar Parkway, Denver, CO 80203',
      expiry: '2028-11-03',
      issuingState: 'Colorado'
    },
    svgDataUrl: generateSampleIdCardSvg(
      'Sophia Marie Rodriguez',
      'Driver License',
      'CO-98241094',
      '11/03/1998',
      '1204 Cedar Pkwy, Denver CO 80203',
      'Colorado'
    )
  }
];
