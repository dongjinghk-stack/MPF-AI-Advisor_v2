
import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, ChevronUp, CheckCircle, Download, 
  Info, FileText, User, Briefcase, RefreshCw, Loader2, UploadCloud, FolderUp, FileJson
} from 'lucide-react';
import { MPFFund, Scenario } from '../../types';
import { getFunds } from '../../services/dataService';
import { PDFDocument } from 'pdf-lib';
import { fetchPdfBuffer, ENROLLMENT_FORM_URL, TRANSFER_FORM_URL } from './pdfHelpers';

interface EnrollmentFormProps {
  prefillAllocation?: Scenario | null;
  copyToEnrollmentTrigger?: number;
}

interface FormData {
  surnameEn: string;
  givenNameEn: string;
  chineseName: string;
  idType: 'hkid' | 'passport';
  hkid: string;
  passportNo: string;
  dobDay: string;
  dobMonth: string;
  dobYear: string;
  gender: 'male' | 'female' | '';
  countryCode: string;
  phone: string;
  email: string;
  flatRoom: string;
  floor: string;
  block: string;
  building: string;
  street: string;
  district: string;
  region: 'hk' | 'kln' | 'nt' | '';
  nationality: string;
  placeOfBirth: string;
  occupation: string;
  memberType: string;
  taxResidencyHK: boolean;
  taxResidencyOther: boolean;
  acceptPIA: boolean;
  acceptPersonalInfo: boolean;
  transferType: string;
  originalSchemeName: string;
  originalSchemeNo: string;
  originalMemberAccNo: string;
  transferOption: string;
  enrollmentAllocations: Record<string, number>;
  transferAllocations: Record<string, number>;
}

const initialFormData: FormData = {
  surnameEn: '', givenNameEn: '', chineseName: '',
  idType: 'hkid', hkid: '', passportNo: '',
  dobDay: '', dobMonth: '', dobYear: '', gender: '',
  countryCode: '852', phone: '', email: '',
  flatRoom: '', floor: '', block: '', building: '', street: '', district: '', region: '',
  nationality: '', placeOfBirth: '', occupation: '',
  memberType: 'regular',
  taxResidencyHK: false, taxResidencyOther: false,
  acceptPIA: false, acceptPersonalInfo: false,
  transferType: 'general',
  originalSchemeName: '', originalSchemeNo: '', originalMemberAccNo: '',
  transferOption: 'full',
  enrollmentAllocations: {},
  transferAllocations: {}
};

// Coordinate mappings for Investment Mandate (Page 6 of Enrollment Form)
// Key: Fund Name (partial match), Value: Y coordinate (from bottom of page)
const ENROLLMENT_FUND_COORDS: Record<string, number> = {
  'Global Stable Fund': 562,
  'Global Growth Fund': 545,
  'Guaranteed Fund': 528,
  'MPF Conservative Fund': 511,
  'Global Equity Fund': 494,
  'Global Bond Fund': 477,
  'Asian Bond Fund': 460,
  'Asian Pacific Equity Fund': 443,
  'US Equity Fund': 426,
  'European Equity Fund': 409,
  'Hong Kong Equities Fund': 392,
  'Greater China Equity Fund': 375,
  'Core Accumulation Fund': 358,
  'Age 65 Plus Fund': 341
};

const EnrollmentForm: React.FC<EnrollmentFormProps> = ({ prefillAllocation, copyToEnrollmentTrigger }) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [expandedSection, setExpandedSection] = useState<string>('aboutYou');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableFunds, setAvailableFunds] = useState<MPFFund[]>([]);
  
  // New state for PDF generation
  const [generatedFiles, setGeneratedFiles] = useState<{name: string, url: string}[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Fallback states
  const [missingTemplates, setMissingTemplates] = useState<boolean>(false);
  const [manualEnrollmentFile, setManualEnrollmentFile] = useState<File | null>(null);
  const [manualTransferFile, setManualTransferFile] = useState<File | null>(null);

  // Initialize Available Funds, ensuring Scenario funds are present
  useEffect(() => {
    // Start with MASS / YF Life funds as target scheme base
    let funds = getFunds().filter(f => f.scheme_name.includes('MASS') || f.mpf_trustee === 'YF Life');
    if (funds.length === 0) funds = getFunds().slice(0, 10);
    
    // If we have a prefill scenario, ensure its funds are added to available list
    if (prefillAllocation) {
        const existingIds = new Set(funds.map(f => f.constituent_fund));
        prefillAllocation.allocations.forEach(alloc => {
            if (!existingIds.has(alloc.fund.constituent_fund)) {
                funds.push(alloc.fund);
                existingIds.add(alloc.fund.constituent_fund);
            }
        });
    }
    
    setAvailableFunds(funds);
  }, [prefillAllocation]);

  // Pre-fill Transfer Allocations (Section 3) on scenario change
  useEffect(() => {
    if (prefillAllocation && availableFunds.length > 0) {
      const newAllocations: Record<string, number> = {};
      prefillAllocation.allocations.forEach(alloc => {
        const match = availableFunds.find(f => f.constituent_fund === alloc.fund.constituent_fund);
        if (match) {
            const name = match.constituent_fund;
            newAllocations[name] = (newAllocations[name] || 0) + alloc.allocation;
        }
      });
      
      setFormData(prev => ({
        ...prev,
        transferAllocations: newAllocations
      }));
    }
  }, [prefillAllocation, availableFunds]);

  // Copy to Enrollment Allocations (Section 2) on Trigger
  useEffect(() => {
    if (prefillAllocation && copyToEnrollmentTrigger && copyToEnrollmentTrigger > 0) {
         const newAllocations: Record<string, number> = {};
         prefillAllocation.allocations.forEach(alloc => {
             const name = alloc.fund.constituent_fund;
             // Accumulate allocations if duplicates exist in scenario
             newAllocations[name] = (newAllocations[name] || 0) + alloc.allocation;
         });

         setFormData(prev => ({
             ...prev,
             enrollmentAllocations: newAllocations
         }));
         setExpandedSection('enrollment');
         
         // Smooth scroll to Enrollment section
         setTimeout(() => {
             const el = document.getElementById('enrollment-section');
             if (el) {
                 el.scrollIntoView({ behavior: 'smooth', block: 'start' });
             }
         }, 100);
    }
  }, [copyToEnrollmentTrigger, prefillAllocation]);

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? '' : section);
  };

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field if exists
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAllocationChange = (type: 'enrollment' | 'transfer', fundName: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      [`${type}Allocations`]: {
        ...prev[`${type}Allocations` as keyof FormData] as Record<string, number>,
        [fundName]: numValue
      }
    }));
  };

  const getAllocationTotal = (type: 'enrollment' | 'transfer') => {
    const allocs = formData[`${type}Allocations`] as Record<string, number>;
    return Object.values(allocs).reduce((sum, val) => sum + val, 0);
  };

  // --- Validation Logic ---
  const validateHKID = (hkid: string) => {
    if (!hkid) return 'HKID is required';
    const cleaned = hkid.toUpperCase().replace(/[^A-Z0-9()]/g, '');
    if (!/^([A-Z]{1,2})(\d{6})\(?([0-9A])\)?$/.test(cleaned)) return 'Invalid format';
    return null;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.surnameEn) newErrors.surnameEn = 'Surname is required';
    if (!formData.givenNameEn) newErrors.givenNameEn = 'Given name is required';
    
    if (formData.idType === 'hkid') {
      const hkidError = validateHKID(formData.hkid);
      if (hkidError) newErrors.hkid = hkidError;
    } else {
      if (!formData.passportNo) newErrors.passportNo = 'Passport number is required';
    }

    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Valid email required';

    // Enrollment Validation
    if (formData.memberType && expandedSection === 'enrollment') {
        if (!formData.acceptPIA) newErrors.acceptPIA = 'Required';
        if (!formData.acceptPersonalInfo) newErrors.acceptPersonalInfo = 'Required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const downloadJSONData = () => {
    if (!validateForm()) {
      alert("Please fix validation errors in the Personal Info section.");
      return;
    }

    // Prepare Enrollment JSON
    const enrollmentJson = {
      form: "MASS-PAA-25V1",
      personal_particulars: {
        surname_eng: formData.surnameEn,
        given_name_eng: formData.givenNameEn,
        chinese_name: formData.chineseName,
        id_type: formData.idType,
        id_no: formData.idType === 'hkid' ? formData.hkid : formData.passportNo,
        date_of_birth: `${formData.dobYear}-${formData.dobMonth}-${formData.dobDay}`,
        gender: formData.gender,
        mobile: formData.phone,
        email: formData.email,
        address: {
            flat: formData.flatRoom,
            floor: formData.floor,
            block: formData.block,
            building: formData.building,
            street: formData.street,
            district: formData.district,
            region: formData.region
        }
      },
      investment_mandate: {
          allocations: formData.enrollmentAllocations
      },
      declarations: {
          accepted_pia: formData.acceptPIA,
          accepted_pics: formData.acceptPersonalInfo
      }
    };

    // Prepare Transfer JSON
    const transferJson = {
      form: "PM-25V5",
      scheme_member_details: {
          surname: formData.surnameEn,
          given_name: formData.givenNameEn,
          id_no: formData.idType === 'hkid' ? formData.hkid : formData.passportNo,
          contact_no: formData.phone,
          address: {
            flat: formData.flatRoom,
            floor: formData.floor,
            block: formData.block,
            building: formData.building,
            street: formData.street,
            district: formData.district
          }
      },
      original_scheme_info: {
          scheme_name: formData.originalSchemeName,
          member_account_no: formData.originalMemberAccNo
      },
      new_scheme_info: {
          trustee: "YF Life Trustees Limited",
          scheme: "MASS Mandatory Provident Fund Scheme",
          transfer_to: "Designated Account"
      },
      fund_allocations: formData.transferAllocations
    };

    // Download Helper
    const downloadFile = (name: string, data: any) => {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    downloadFile("1_Enrollment_Data.json", enrollmentJson);
    // Small delay to ensure both downloads trigger
    setTimeout(() => {
        downloadFile("2_Transfer_Data.json", transferJson);
    }, 500);
  };

  const generatePDFs = async () => {
    if (!validateForm()) {
      alert("Please fix validation errors in the Personal Info section.");
      return;
    }
    
    setIsGenerating(true);
    setGeneratedFiles([]);
    const newGeneratedFiles = [];

    const hasTransferData = Object.keys(formData.transferAllocations).length > 0 || formData.originalSchemeName;

    // We will attempt to fetch from Google Drive URLs first.
    // If fetch fails, we check for manual uploads.
    // If manual uploads are missing, we trigger the popup.

    let enrollmentBuffer: ArrayBuffer | null = null;
    let transferBuffer: ArrayBuffer | null = null;

    try {
        // --- 1. Enrollment Form Source ---
        if (manualEnrollmentFile) {
            // Priority: Manual file if user already uploaded it
            enrollmentBuffer = await manualEnrollmentFile.arrayBuffer();
        } else {
            // Fallback: Try fetching from Google Drive
            try {
                enrollmentBuffer = await fetchPdfBuffer(ENROLLMENT_FORM_URL);
            } catch (err) {
                console.warn("Failed to automatically fetch enrollment form:", err);
            }
        }

        // --- 2. Transfer Form Source (if needed) ---
        if (hasTransferData) {
            if (manualTransferFile) {
                transferBuffer = await manualTransferFile.arrayBuffer();
            } else {
                try {
                    transferBuffer = await fetchPdfBuffer(TRANSFER_FORM_URL);
                } catch (err) {
                    console.warn("Failed to automatically fetch transfer form:", err);
                }
            }
        }

        // --- 3. Missing Template Check ---
        // If we still don't have buffers, we must ask the user
        if (!enrollmentBuffer || (hasTransferData && !transferBuffer)) {
            setMissingTemplates(true);
            setIsGenerating(false);
            return;
        }

        // Use string literal 'Helvetica' to avoid import issues with StandardFonts enum
        const fontName = 'Helvetica';

        // --- 4. Process Enrollment Form ---
        const pdfDoc = await PDFDocument.load(enrollmentBuffer, { ignoreEncryption: true });
        const helveticaFont = await pdfDoc.embedFont(fontName);
        
        if (!helveticaFont) {
            throw new Error("Failed to embed Helvetica font. Please check the PDF document.");
        }

        const pages = pdfDoc.getPages();

        // --- Page 2: Member Particulars ---
        if (pages.length > 1) {
            const page2 = pages[1];
            
            // Surname (Eng)
            if (formData.surnameEn) page2.drawText(formData.surnameEn, { x: 130, y: 118, size: 10, font: helveticaFont });
            // Given Name (Eng)
            if (formData.givenNameEn) page2.drawText(formData.givenNameEn, { x: 350, y: 118, size: 10, font: helveticaFont });
        }

        // --- Page 3: Personal Details & Address ---
        if (pages.length > 2) {
            const page3 = pages[2];
            // Date of Birth (DD MM YYYY)
            if (formData.dobDay) page3.drawText(formData.dobDay, { x: 285, y: 752, size: 10, font: helveticaFont });
            if (formData.dobMonth) page3.drawText(formData.dobMonth, { x: 320, y: 752, size: 10, font: helveticaFont });
            if (formData.dobYear) page3.drawText(formData.dobYear, { x: 355, y: 752, size: 10, font: helveticaFont });

            // Gender
            if (formData.gender === 'male') page3.drawText('X', { x: 453, y: 752, size: 12, font: helveticaFont });
            if (formData.gender === 'female') page3.drawText('X', { x: 523, y: 752, size: 12, font: helveticaFont });

            // ID Number
            const idVal = formData.idType === 'hkid' ? formData.hkid : formData.passportNo;
            if (formData.idType === 'hkid') page3.drawText('X', { x: 63, y: 725, size: 12, font: helveticaFont });
            else page3.drawText('X', { x: 243, y: 725, size: 12, font: helveticaFont });
            
            // ID Digits (Simulated spread in boxes)
            if (idVal) {
                let idX = 180;
                for (const char of idVal) {
                    page3.drawText(char, { x: idX, y: 695, size: 11, font: helveticaFont });
                    idX += 14.5; // approximate spacing for boxes
                }
            }

            // Phone
            if (formData.phone) {
                let phoneX = 350;
                for (const char of formData.phone) {
                    page3.drawText(char, { x: phoneX, y: 645, size: 11, font: helveticaFont });
                    phoneX += 14.5;
                }
            }

            // Email
            if (formData.email) page3.drawText(formData.email, { x: 80, y: 590, size: 10, font: helveticaFont });

            // Address
            const addrY = 535;
            if (formData.flatRoom) page3.drawText(formData.flatRoom, { x: 80, y: addrY, size: 10, font: helveticaFont });
            if (formData.floor) page3.drawText(formData.floor, { x: 300, y: addrY, size: 10, font: helveticaFont });
            if (formData.block) page3.drawText(formData.block, { x: 400, y: addrY, size: 10, font: helveticaFont });
            if (formData.building) page3.drawText(formData.building, { x: 80, y: addrY - 35, size: 10, font: helveticaFont });
            if (formData.street) page3.drawText(formData.street, { x: 80, y: addrY - 70, size: 10, font: helveticaFont });
            
            // District/Region checkboxes
            if (formData.region === 'hk') page3.drawText('X', { x: 283, y: 430, size: 12, font: helveticaFont });
            if (formData.region === 'kln') page3.drawText('X', { x: 375, y: 430, size: 12, font: helveticaFont });
            if (formData.region === 'nt') page3.drawText('X', { x: 468, y: 430, size: 12, font: helveticaFont });
        }

        // --- Page 6: Investment Mandate ---
        if (pages.length > 5) {
            const page6 = pages[5];
            // Fill allocation percentages
            Object.entries(formData.enrollmentAllocations).forEach(([fundName, value]) => {
                const allocation = value as number;
                if (allocation > 0) {
                    // Find mapped Y coordinate
                    let matchedY = 0;
                    for (const key in ENROLLMENT_FUND_COORDS) {
                        if (fundName.includes(key)) {
                            matchedY = ENROLLMENT_FUND_COORDS[key];
                            break;
                        }
                    }
                    
                    if (matchedY > 0) {
                        // Mandatory Contribution Column X ≈ 380
                        page6.drawText(allocation.toString(), { x: 380, y: matchedY, size: 10, font: helveticaFont });
                    }
                }
            });
            
            // Total (Mandatory) - approx Y=300
            page6.drawText('100', { x: 380, y: 300, size: 10, font: helveticaFont });
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        newGeneratedFiles.push({
            name: 'MPF_Enrollment_Form_Filled.pdf',
            url: URL.createObjectURL(blob)
        });

        // --- 5. Process Transfer Form ---
        if (hasTransferData && transferBuffer) {
            const pdfDocTransfer = await PDFDocument.load(transferBuffer, { ignoreEncryption: true });
            const helveticaFontTransfer = await pdfDocTransfer.embedFont(fontName);
            
            if (!helveticaFontTransfer) {
                throw new Error("Failed to embed Helvetica font for Transfer form.");
            }

            const pagesTransfer = pdfDocTransfer.getPages();

            // --- Page 1: Scheme Member's Details ---
            if (pagesTransfer.length > 0) {
                const page1 = pagesTransfer[0];
                // Surname (Eng)
                if (formData.surnameEn) page1.drawText(formData.surnameEn, { x: 120, y: 285, size: 10, font: helveticaFontTransfer });
                // Given Name (Eng)
                if (formData.givenNameEn) page1.drawText(formData.givenNameEn, { x: 320, y: 285, size: 10, font: helveticaFontTransfer });
                // ID Checkbox
                if (formData.idType === 'hkid') page1.drawText('X', { x: 63, y: 205, size: 12, font: helveticaFontTransfer });
                else page1.drawText('X', { x: 243, y: 205, size: 12, font: helveticaFontTransfer });
                
                // ID Number
                const idVal = formData.idType === 'hkid' ? formData.hkid : formData.passportNo;
                if (idVal) page1.drawText(idVal, { x: 260, y: 175, size: 11, font: helveticaFontTransfer });
            }

            // --- Page 2: Transfer Information ---
            if (pagesTransfer.length > 1) {
                const page2 = pagesTransfer[1];
                // Phone (Section 3)
                if (formData.phone) {
                    let phoneX = 360;
                    for (const char of formData.phone) {
                        page2.drawText(char, { x: phoneX, y: 750, size: 11, font: helveticaFontTransfer });
                        phoneX += 14.5;
                    }
                }
                
                // Address (Section 4)
                const addrY = 640;
                if (formData.flatRoom) page2.drawText(formData.flatRoom, { x: 150, y: addrY, size: 10, font: helveticaFontTransfer });
                if (formData.floor) page2.drawText(formData.floor, { x: 330, y: addrY, size: 10, font: helveticaFontTransfer });
                if (formData.block) page2.drawText(formData.block, { x: 450, y: addrY, size: 10, font: helveticaFontTransfer });
                if (formData.building) page2.drawText(formData.building, { x: 150, y: addrY - 35, size: 10, font: helveticaFontTransfer });
                if (formData.street) page2.drawText(formData.street, { x: 150, y: addrY - 70, size: 10, font: helveticaFontTransfer });
                if (formData.district) page2.drawText(formData.district, { x: 150, y: addrY - 105, size: 10, font: helveticaFontTransfer });

                // Original Trustee & Scheme (Section B.1)
                // Original Scheme Name
                if (formData.originalSchemeName) page2.drawText(formData.originalSchemeName, { x: 220, y: 440, size: 10, font: helveticaFontTransfer });
                
                // Account Type (Personal Account usually)
                page2.drawText('X', { x: 183, y: 410, size: 12, font: helveticaFontTransfer }); 
                
                // Member Account No
                if (formData.originalMemberAccNo) {
                    let accX = 220;
                    for (const char of formData.originalMemberAccNo) {
                        page2.drawText(char, { x: accX, y: 385, size: 11, font: helveticaFontTransfer });
                        accX += 14.5;
                    }
                }
            }
            
            // --- Page 3: Transfer Options ---
            if (pagesTransfer.length > 2) {
                const page3 = pagesTransfer[2];
                // Option (ii) To my designated account in the new scheme (Section C.1)
                page3.drawText('X', { x: 63, y: 555, size: 12, font: helveticaFontTransfer }); 
                
                // New Trustee Name
                page3.drawText("YF Life Trustees Limited", { x: 220, y: 530, size: 10, font: helveticaFontTransfer });
                // New Scheme Name
                page3.drawText("MASS Mandatory Provident Fund Scheme", { x: 220, y: 500, size: 10, font: helveticaFontTransfer });
            }
            
            const pdfBytesTransfer = await pdfDocTransfer.save();
            const blobTransfer = new Blob([pdfBytesTransfer], { type: 'application/pdf' });
            newGeneratedFiles.push({
                name: 'MPF_Transfer_Form_Filled.pdf',
                url: URL.createObjectURL(blobTransfer)
            });
        }

    } catch (error) {
        console.error("Error generating PDF", error);
        let msg = error instanceof Error ? error.message : 'Unknown error';
        if (msg.includes('instance of t') || msg.includes('instance of undefined')) {
            msg = "Internal PDF font error. Please try reloading the page.";
        }
        alert(`Error generating PDF: ${msg}`);
    }

    setGeneratedFiles(newGeneratedFiles);
    setIsGenerating(false);
  };

  // --- Render Helpers ---
  const renderAllocationSection = (type: 'enrollment' | 'transfer') => {
    const total = getAllocationTotal(type);
    return (
      <div className="space-y-3">
        <p className="text-xs text-gray-500">Allocate percentages (Must total 100%)</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {availableFunds.map(fund => (
            <div key={fund.constituent_fund} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
              <span className="text-xs font-medium text-gray-700 truncate max-w-[70%]" title={fund.constituent_fund}>
                {fund.constituent_fund}
              </span>
              <div className="flex items-center">
                <input 
                  type="number" 
                  min="0" max="100"
                  className="w-12 p-1 text-right text-sm border rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-800 border-gray-300"
                  placeholder="0"
                  value={formData[`${type}Allocations`][fund.constituent_fund] || ''}
                  onChange={(e) => handleAllocationChange(type, fund.constituent_fund, e.target.value)}
                />
                <span className="ml-1 text-xs text-gray-500">%</span>
              </div>
            </div>
          ))}
        </div>
        <div className={`p-2 rounded text-center text-sm font-bold ${total === 100 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          Total: {total}% {total === 100 ? '✓' : '(Must be 100%)'}
        </div>
      </div>
    );
  };

  // Common input class for Personal Info section to match dark style in screenshot
  const darkInputClass = "w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-700 text-white placeholder-gray-400 border-slate-600 focus:border-blue-500";

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm mt-6 overflow-hidden animate-fade-in">
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-4 text-white flex justify-between items-center">
        <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
                <FileText size={20} />
                Enrollment & Transfer Form
            </h2>
            <p className="text-xs text-blue-200">Generate pre-filled forms for paper submission</p>
        </div>
        <div className="text-xs bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
            Secure & Local
        </div>
      </div>

      <div className="p-6">
        {/* Progress Bar (Simplified) */}
        <div className="flex justify-between mb-8 px-4 relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10"></div>
            {['Personal Info', 'Enrollment', 'Fund Transfer'].map((step, idx) => (
                <div key={idx} className="flex flex-col items-center bg-white px-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1
                        ${idx === 0 || (idx === 1 && formData.surnameEn) || (idx === 2 && formData.acceptPIA) 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-500'}`}>
                        {idx + 1}
                    </div>
                    <span className="text-[10px] text-gray-600 uppercase font-bold">{step}</span>
                </div>
            ))}
        </div>

        {/* Section 1: About You */}
        <div className="border border-blue-100 rounded-lg overflow-hidden mb-4">
            <button 
                onClick={() => toggleSection('aboutYou')}
                className="w-full flex justify-between items-center p-3 bg-blue-50/50 hover:bg-blue-100/50 transition-colors text-left"
            >
                <span className="font-semibold text-blue-900 flex items-center gap-2"><User size={16}/> 1. Tell Us About You</span>
                {expandedSection === 'aboutYou' ? <ChevronUp size={16} className="text-blue-500"/> : <ChevronDown size={16} className="text-gray-400"/>}
            </button>
            
            {expandedSection === 'aboutYou' && (
                <div className="p-4 bg-white animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Surname (Eng) <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                className={`${darkInputClass} ${errors.surnameEn ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                value={formData.surnameEn}
                                onChange={(e) => handleChange('surnameEn', e.target.value.toUpperCase())}
                                placeholder="CHAN"
                            />
                            {errors.surnameEn && <p className="text-[10px] text-red-500 mt-1">{errors.surnameEn}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Given Name (Eng) <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                className={darkInputClass}
                                value={formData.givenNameEn}
                                onChange={(e) => handleChange('givenNameEn', e.target.value.toUpperCase())}
                                placeholder="TAI MAN"
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">ID Type</label>
                            <div className="flex gap-4 pt-2">
                                <label className="flex items-center text-sm gap-2 text-gray-700">
                                    <input type="radio" checked={formData.idType === 'hkid'} onChange={() => handleChange('idType', 'hkid')} /> HKID
                                </label>
                                <label className="flex items-center text-sm gap-2 text-gray-700">
                                    <input type="radio" checked={formData.idType === 'passport'} onChange={() => handleChange('idType', 'passport')} /> Passport
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">{formData.idType === 'hkid' ? 'HKID Number' : 'Passport No'} <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                className={darkInputClass}
                                value={formData.idType === 'hkid' ? formData.hkid : formData.passportNo}
                                onChange={(e) => handleChange(formData.idType === 'hkid' ? 'hkid' : 'passportNo', e.target.value.toUpperCase())}
                                placeholder={formData.idType === 'hkid' ? "A123456(7)" : ""}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                         <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth</label>
                            <div className="flex gap-2">
                                <input type="text" placeholder="DD" className={`${darkInputClass} w-16`} value={formData.dobDay} onChange={e => handleChange('dobDay', e.target.value)} maxLength={2}/>
                                <input type="text" placeholder="MM" className={`${darkInputClass} w-16`} value={formData.dobMonth} onChange={e => handleChange('dobMonth', e.target.value)} maxLength={2}/>
                                <input type="text" placeholder="YYYY" className={`${darkInputClass} w-24`} value={formData.dobYear} onChange={e => handleChange('dobYear', e.target.value)} maxLength={4}/>
                            </div>
                         </div>
                         <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
                             <div className="flex gap-4 pt-2">
                                <label className="flex items-center text-sm gap-2 text-gray-700">
                                    <input type="radio" checked={formData.gender === 'male'} onChange={() => handleChange('gender', 'male')} /> Male
                                </label>
                                <label className="flex items-center text-sm gap-2 text-gray-700">
                                    <input type="radio" checked={formData.gender === 'female'} onChange={() => handleChange('gender', 'female')} /> Female
                                </label>
                            </div>
                         </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Mobile Phone <span className="text-red-500">*</span></label>
                            <div className="flex gap-2">
                                <input type="text" value="+852" disabled className="w-16 p-2 text-sm border border-gray-600 rounded-lg bg-slate-600 text-gray-300 text-center" />
                                <input 
                                    type="text" 
                                    className={darkInputClass}
                                    value={formData.phone}
                                    onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g,''))}
                                    placeholder="12345678"
                                    maxLength={8}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                            <input 
                                type="email" 
                                className={darkInputClass}
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                placeholder="email@example.com"
                            />
                        </div>
                    </div>
                    
                    {/* Address Fields */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                         <label className="block text-xs font-bold text-gray-800 mb-3">Residential Address</label>
                         <div className="grid grid-cols-3 gap-2 mb-2">
                             <input type="text" placeholder="Flat/Room" className={darkInputClass} value={formData.flatRoom} onChange={e => handleChange('flatRoom', e.target.value)}/>
                             <input type="text" placeholder="Floor" className={darkInputClass} value={formData.floor} onChange={e => handleChange('floor', e.target.value)}/>
                             <input type="text" placeholder="Block" className={darkInputClass} value={formData.block} onChange={e => handleChange('block', e.target.value)}/>
                         </div>
                         <div className="grid grid-cols-1 gap-2 mb-2">
                             <input type="text" placeholder="Building / Estate" className={darkInputClass} value={formData.building} onChange={e => handleChange('building', e.target.value)}/>
                             <input type="text" placeholder="Street No. & Name" className={darkInputClass} value={formData.street} onChange={e => handleChange('street', e.target.value)}/>
                         </div>
                         <div className="grid grid-cols-2 gap-2">
                              <input type="text" placeholder="District" className={darkInputClass} value={formData.district} onChange={e => handleChange('district', e.target.value)}/>
                              <select className={darkInputClass} value={formData.region} onChange={e => handleChange('region', e.target.value)}>
                                  <option value="">Select Region</option>
                                  <option value="hk">Hong Kong</option>
                                  <option value="kln">Kowloon</option>
                                  <option value="nt">New Territories</option>
                              </select>
                         </div>
                    </div>
                </div>
            )}
        </div>

        {/* Section 2: Enrollment */}
        <div id="enrollment-section" className="border border-blue-100 rounded-lg overflow-hidden mb-4 scroll-mt-24">
            <button 
                onClick={() => toggleSection('enrollment')}
                className="w-full flex justify-between items-center p-3 bg-blue-50/50 hover:bg-blue-100/50 transition-colors text-left"
            >
                <span className="font-semibold text-blue-900 flex items-center gap-2"><Briefcase size={16}/> 2. Enrollment</span>
                {expandedSection === 'enrollment' ? <ChevronUp size={16} className="text-blue-500"/> : <ChevronDown size={16} className="text-gray-400"/>}
            </button>
            
            {expandedSection === 'enrollment' && (
                <div className="p-4 bg-white animate-fade-in">
                    <div className="mb-4">
                        <label className="block text-xs font-medium text-gray-700 mb-2">Member Type</label>
                        <div className="flex flex-wrap gap-4 text-sm">
                            {['Regular Employee', 'Casual Employee', 'Self-Employed', 'Personal Account'].map(type => (
                                <label key={type} className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="memberType" 
                                        checked={formData.memberType === type.split(' ')[0].toLowerCase()}
                                        onChange={() => handleChange('memberType', type.split(' ')[0].toLowerCase())}
                                    />
                                    {type}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-gray-800">Investment Mandate</label>
                            <button onClick={() => setActiveModal('investment')} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                <Info size={12}/> View Details
                            </button>
                        </div>
                        {renderAllocationSection('enrollment')}
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm text-gray-700 p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer">
                            <input type="checkbox" checked={formData.acceptPIA} onChange={(e) => handleChange('acceptPIA', e.target.checked)} />
                            <span>I accept the Principal Brochure & Participation Agreement</span>
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700 p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer">
                            <input type="checkbox" checked={formData.acceptPersonalInfo} onChange={(e) => handleChange('acceptPersonalInfo', e.target.checked)} />
                            <span>I accept the Personal Information Collection Statement</span>
                        </label>
                    </div>
                </div>
            )}
        </div>

        {/* Section 3: Transfer */}
        <div className="border border-blue-100 rounded-lg overflow-hidden mb-4">
            <button 
                onClick={() => toggleSection('transfer')}
                className="w-full flex justify-between items-center p-3 bg-blue-50/50 hover:bg-blue-100/50 transition-colors text-left"
            >
                <span className="font-semibold text-blue-900 flex items-center gap-2"><RefreshCw size={16}/> 3. Fund Transfer</span>
                {expandedSection === 'transfer' ? <ChevronUp size={16} className="text-blue-500"/> : <ChevronDown size={16} className="text-gray-400"/>}
            </button>
            
            {expandedSection === 'transfer' && (
                <div className="p-4 bg-white animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Original Scheme Name</label>
                            <input 
                                type="text" 
                                className={darkInputClass}
                                value={formData.originalSchemeName}
                                onChange={(e) => handleChange('originalSchemeName', e.target.value)}
                                placeholder="e.g. Manulife Global Select"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Member Account No</label>
                            <input 
                                type="text" 
                                className={darkInputClass}
                                value={formData.originalMemberAccNo}
                                onChange={(e) => handleChange('originalMemberAccNo', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-xs font-medium text-gray-700 mb-2">Transfer Allocation</label>
                        {prefillAllocation && (
                            <div className="mb-2 text-xs bg-blue-50 text-blue-700 p-2 rounded flex items-center gap-2">
                                <Info size={12} />
                                Pre-filled based on your selected scenario: <strong>{prefillAllocation.title}</strong>
                            </div>
                        )}
                        {renderAllocationSection('transfer')}
                    </div>
                </div>
            )}
        </div>

        {/* Submit Actions */}
        <div className="mt-6 flex flex-col items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <button 
                    onClick={generatePDFs}
                    disabled={isGenerating}
                    className="flex-1 md:flex-none px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                    {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                    Generate Form Data
                </button>
                
                <button 
                    onClick={downloadJSONData}
                    className="flex-1 md:flex-none px-8 py-3 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                    <FileJson size={18} />
                    Download JSON
                </button>
            </div>

            {generatedFiles.length > 0 && (
                <div className="w-full bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-scale-in">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-full text-green-600">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-green-800">Ready for Download</h4>
                            <p className="text-xs text-green-600">PDF documents generated successfully. Click to download.</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {generatedFiles.map((file, idx) => (
                            <a 
                                key={idx}
                                href={file.url}
                                download={file.name}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg shadow-sm flex items-center gap-2 transition-colors"
                            >
                                <Download size={16} />
                                {file.name.includes('Enrollment') ? 'Enrollment PDF' : 'Transfer PDF'}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Manual Upload Modal for Missing Templates */}
      {missingTemplates && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setMissingTemplates(false)}>
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-4 text-blue-600">
                    <FolderUp size={28} />
                    <h3 className="text-xl font-bold text-gray-900">Upload PDF Templates</h3>
                </div>
                
                <p className="text-sm text-gray-600 mb-6">
                    Automatic download failed. Please upload the required PDF template files to proceed.
                </p>

                <div className="space-y-4 mb-6">
                    {/* Enrollment File Input */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Upload "1_MASS-PAA-25V1.pdf" (Enrollment)</label>
                        <div className="flex items-center gap-2">
                            <label className="flex-1 flex flex-col items-center justify-center px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                                <UploadCloud className={`w-6 h-6 mb-1 ${manualEnrollmentFile ? 'text-green-500' : 'text-gray-400'}`} />
                                <span className="text-xs text-gray-500 truncate w-full text-center">
                                    {manualEnrollmentFile ? manualEnrollmentFile.name : 'Click to Select File'}
                                </span>
                                <input type="file" accept=".pdf" className="hidden" onChange={(e) => setManualEnrollmentFile(e.target.files?.[0] || null)} />
                            </label>
                        </div>
                    </div>

                    {/* Transfer File Input */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Upload "2_PM-25V5.pdf" (Transfer)</label>
                        <div className="flex items-center gap-2">
                            <label className="flex-1 flex flex-col items-center justify-center px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                                <UploadCloud className={`w-6 h-6 mb-1 ${manualTransferFile ? 'text-green-500' : 'text-gray-400'}`} />
                                <span className="text-xs text-gray-500 truncate w-full text-center">
                                    {manualTransferFile ? manualTransferFile.name : 'Click to Select File'}
                                </span>
                                <input type="file" accept=".pdf" className="hidden" onChange={(e) => setManualTransferFile(e.target.files?.[0] || null)} />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button 
                        onClick={() => setMissingTemplates(false)} 
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => {
                            setMissingTemplates(false);
                            generatePDFs(); // Retry with manual files
                        }}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-md transition-colors"
                    >
                        Generate Forms
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Info Modal Overlay */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setActiveModal(null)}>
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-2">
                    {activeModal === 'investment' ? 'Investment Mandate Info' : 'Information'}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                    {activeModal === 'investment' 
                        ? 'The available funds listed are based on the target scheme (MASS Mandatory Provident Fund Scheme). Allocations must sum to 100%. Pre-filled values are suggestions based on your scenario.'
                        : 'Detailed information regarding this section.'}
                </p>
                <button onClick={() => setActiveModal(null)} className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">Close</button>
            </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentForm;
