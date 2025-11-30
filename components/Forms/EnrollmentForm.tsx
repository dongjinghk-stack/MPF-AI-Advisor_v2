
import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, ChevronUp, AlertCircle, CheckCircle, Download, 
  Info, FileText, User, Briefcase, RefreshCw, Loader2 
} from 'lucide-react';
import { MPFFund, Scenario } from '../../types';
import { getFunds } from '../../services/dataService';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

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

  const generatePDFs = async () => {
    if (!validateForm()) {
      alert("Please fix validation errors in the Personal Info section.");
      return;
    }
    
    setIsGenerating(true);
    setGeneratedFiles([]);
    const newGeneratedFiles = [];

    // 1. Generate Enrollment Form (Template 1_MASS-PAA-25V1.pdf)
    try {
        const enrollmentTemplateUrl = '1_MASS-PAA-25V1.pdf';
        let pdfDoc;
        let helveticaFont;

        try {
            const existingPdfBytes = await fetch(enrollmentTemplateUrl).then(res => {
                if (!res.ok) throw new Error("Template not found");
                return res.arrayBuffer();
            });
            pdfDoc = await PDFDocument.load(existingPdfBytes);
        } catch (e) {
            console.warn("Enrollment template not found, falling back to blank PDF.");
            pdfDoc = await PDFDocument.create();
            // Add dummy pages to match template structure (need at least 6 pages based on existing code)
            for(let i=0; i<6; i++) pdfDoc.addPage([595, 842]);
            
            const page1 = pdfDoc.getPages()[0];
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            page1.drawText("Enrollment Form Template Missing", { x: 50, y: 800, size: 20, font });
            page1.drawText("This is a generated placeholder containing your data.", { x: 50, y: 770, size: 12, font });
        }
        
        helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const pages = pdfDoc.getPages();

        // --- Page 2: Member Particulars ---
        if (pages.length > 1) {
            const page2 = pages[1];
            
            // Surname (Eng)
            page2.drawText(formData.surnameEn, { x: 130, y: 118, size: 10, font: helveticaFont });
            // Given Name (Eng)
            page2.drawText(formData.givenNameEn, { x: 350, y: 118, size: 10, font: helveticaFont });
        }

        // --- Page 3: Personal Details & Address ---
        if (pages.length > 2) {
            const page3 = pages[2];
            // Date of Birth (DD MM YYYY)
            if (formData.dobDay) page3.drawText(formData.dobDay, { x: 285, y: 752, size: 10, font: helveticaFont });
            if (formData.dobMonth) page3.drawText(formData.dobMonth, { x: 320, y: 752, size: 10, font: helveticaFont });
            if (formData.dobYear) page3.drawText(formData.dobYear, { x: 355, y: 752, size: 10, font: helveticaFont });

            // Gender
            if (formData.gender === 'male') page3.drawText('X', { x: 780, y: 752, size: 12, font: helveticaFont });
            if (formData.gender === 'female') page3.drawText('X', { x: 830, y: 752, size: 12, font: helveticaFont });

            // ID Number
            const idVal = formData.idType === 'hkid' ? formData.hkid : formData.passportNo;
            if (formData.idType === 'hkid') page3.drawText('X', { x: 78, y: 725, size: 12, font: helveticaFont });
            else page3.drawText('X', { x: 265, y: 725, size: 12, font: helveticaFont }); // Passport
            
            // ID Digits (Simulated spread in boxes)
            let idX = 180;
            for (const char of idVal) {
                page3.drawText(char, { x: idX, y: 695, size: 11, font: helveticaFont });
                idX += 14.5; // approximate spacing for boxes
            }

            // Phone
            let phoneX = 350;
             for (const char of formData.phone) {
                page3.drawText(char, { x: phoneX, y: 645, size: 11, font: helveticaFont });
                phoneX += 14.5;
            }

            // Email
            page3.drawText(formData.email, { x: 80, y: 590, size: 10, font: helveticaFont });

            // Address
            const addrY = 535;
            page3.drawText(formData.flatRoom, { x: 80, y: addrY, size: 10, font: helveticaFont });
            page3.drawText(formData.floor, { x: 300, y: addrY, size: 10, font: helveticaFont });
            page3.drawText(formData.block, { x: 400, y: addrY, size: 10, font: helveticaFont });
            page3.drawText(formData.building, { x: 80, y: addrY - 35, size: 10, font: helveticaFont });
            page3.drawText(formData.street, { x: 80, y: addrY - 70, size: 10, font: helveticaFont });
            
            // District/Region checkboxes
            if (formData.region === 'hk') page3.drawText('X', { x: 303, y: 430, size: 12, font: helveticaFont });
            if (formData.region === 'kln') page3.drawText('X', { x: 465, y: 430, size: 12, font: helveticaFont });
            if (formData.region === 'nt') page3.drawText('X', { x: 628, y: 430, size: 12, font: helveticaFont });
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
            name: 'MPF_Enrollment_Form_Sample.pdf',
            url: URL.createObjectURL(blob)
        });

    } catch (error) {
        console.error("Error generating Enrollment PDF", error);
        // No alert here, allow process to continue for other forms or show partial success
    }

    // 2. Generate Transfer Form (Template 2_PM-25V5.pdf)
    const hasTransferData = Object.keys(formData.transferAllocations).length > 0 || formData.originalSchemeName;
    
    if (hasTransferData) {
         try {
            const transferTemplateUrl = '2_PM-25V5.pdf';
            let pdfDoc;
            let helveticaFont;

            try {
                const existingPdfBytes = await fetch(transferTemplateUrl).then(res => {
                    if (!res.ok) throw new Error("Template not found");
                    return res.arrayBuffer();
                });
                pdfDoc = await PDFDocument.load(existingPdfBytes);
            } catch (e) {
                console.warn("Transfer template not found, falling back to blank PDF.");
                pdfDoc = await PDFDocument.create();
                // Add dummy pages (need at least 3 pages based on existing code)
                for(let i=0; i<3; i++) pdfDoc.addPage([595, 842]);

                const page1 = pdfDoc.getPages()[0];
                const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
                page1.drawText("Transfer Form Template Missing", { x: 50, y: 800, size: 20, font });
                page1.drawText("This is a generated placeholder containing your data.", { x: 50, y: 770, size: 12, font });
            }

            helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const pages = pdfDoc.getPages();

            // --- Page 1: Scheme Member's Details ---
            if (pages.length > 0) {
                const page1 = pages[0];
                // Surname (Eng)
                page1.drawText(formData.surnameEn, { x: 120, y: 285, size: 10, font: helveticaFont });
                // Given Name (Eng)
                page1.drawText(formData.givenNameEn, { x: 320, y: 285, size: 10, font: helveticaFont });
                // ID Checkbox
                if (formData.idType === 'hkid') page1.drawText('X', { x: 76, y: 205, size: 12, font: helveticaFont });
                else page1.drawText('X', { x: 260, y: 205, size: 12, font: helveticaFont });
                
                // ID Number
                const idVal = formData.idType === 'hkid' ? formData.hkid : formData.passportNo;
                page1.drawText(idVal, { x: 260, y: 175, size: 11, font: helveticaFont });
            }

            // --- Page 2: Transfer Information ---
            if (pages.length > 1) {
                const page2 = pages[1];
                // Phone (Section 3)
                let phoneX = 360;
                for (const char of formData.phone) {
                    page2.drawText(char, { x: phoneX, y: 750, size: 11, font: helveticaFont });
                    phoneX += 14.5;
                }
                
                // Address (Section 4)
                const addrY = 640;
                page2.drawText(formData.flatRoom, { x: 150, y: addrY, size: 10, font: helveticaFont });
                page2.drawText(formData.floor, { x: 330, y: addrY, size: 10, font: helveticaFont });
                page2.drawText(formData.block, { x: 450, y: addrY, size: 10, font: helveticaFont });
                page2.drawText(formData.building, { x: 150, y: addrY - 35, size: 10, font: helveticaFont });
                page2.drawText(formData.street, { x: 150, y: addrY - 70, size: 10, font: helveticaFont });
                page2.drawText(formData.district, { x: 150, y: addrY - 105, size: 10, font: helveticaFont });

                // Original Trustee & Scheme (Section B.1)
                // Original Scheme Name
                page2.drawText(formData.originalSchemeName, { x: 220, y: 440, size: 10, font: helveticaFont });
                
                // Account Type (Personal Account usually)
                page2.drawText('X', { x: 80, y: 410, size: 12, font: helveticaFont });
                
                // Member Account No
                let accX = 220;
                for (const char of formData.originalMemberAccNo) {
                    page2.drawText(char, { x: accX, y: 385, size: 11, font: helveticaFont });
                    accX += 14.5;
                }
            }
            
            // --- Page 3: Transfer Options ---
            if (pages.length > 2) {
                const page3 = pages[2];
                // Option (ii) To my designated account in the new scheme (Section C.1)
                page3.drawText('X', { x: 80, y: 555, size: 12, font: helveticaFont }); 
                
                // New Trustee Name
                page3.drawText("YF Life Trustees Limited", { x: 220, y: 530, size: 10, font: helveticaFont });
                // New Scheme Name
                page3.drawText("MASS Mandatory Provident Fund Scheme", { x: 220, y: 500, size: 10, font: helveticaFont });
            }
            
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            newGeneratedFiles.push({
                name: 'MPF_Transfer_Form_Sample.pdf',
                url: URL.createObjectURL(blob)
            });
        } catch (error) {
            console.error("Error generating Transfer PDF", error);
        }
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
                  className="w-12 p-1 text-right text-sm border rounded focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                                className={`w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.surnameEn ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white`}
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
                                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={formData.givenNameEn}
                                onChange={(e) => handleChange('givenNameEn', e.target.value.toUpperCase())}
                                placeholder="TAI MAN"
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">ID Type</label>
                            <div className="flex gap-4">
                                <label className="flex items-center text-sm gap-2">
                                    <input type="radio" checked={formData.idType === 'hkid'} onChange={() => handleChange('idType', 'hkid')} /> HKID
                                </label>
                                <label className="flex items-center text-sm gap-2">
                                    <input type="radio" checked={formData.idType === 'passport'} onChange={() => handleChange('idType', 'passport')} /> Passport
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">{formData.idType === 'hkid' ? 'HKID Number' : 'Passport No'} <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                                <input type="text" placeholder="DD" className="w-16 p-2 text-sm border rounded-lg" value={formData.dobDay} onChange={e => handleChange('dobDay', e.target.value)} maxLength={2}/>
                                <input type="text" placeholder="MM" className="w-16 p-2 text-sm border rounded-lg" value={formData.dobMonth} onChange={e => handleChange('dobMonth', e.target.value)} maxLength={2}/>
                                <input type="text" placeholder="YYYY" className="w-24 p-2 text-sm border rounded-lg" value={formData.dobYear} onChange={e => handleChange('dobYear', e.target.value)} maxLength={4}/>
                            </div>
                         </div>
                         <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
                             <div className="flex gap-4 mt-2">
                                <label className="flex items-center text-sm gap-2">
                                    <input type="radio" checked={formData.gender === 'male'} onChange={() => handleChange('gender', 'male')} /> Male
                                </label>
                                <label className="flex items-center text-sm gap-2">
                                    <input type="radio" checked={formData.gender === 'female'} onChange={() => handleChange('gender', 'female')} /> Female
                                </label>
                            </div>
                         </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Mobile Phone <span className="text-red-500">*</span></label>
                            <div className="flex gap-2">
                                <input type="text" value="+852" disabled className="w-16 p-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-center dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500" />
                                <input 
                                    type="text" 
                                    className="flex-1 p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                             <input type="text" placeholder="Flat/Room" className="p-2 text-sm border rounded-lg" value={formData.flatRoom} onChange={e => handleChange('flatRoom', e.target.value)}/>
                             <input type="text" placeholder="Floor" className="p-2 text-sm border rounded-lg" value={formData.floor} onChange={e => handleChange('floor', e.target.value)}/>
                             <input type="text" placeholder="Block" className="p-2 text-sm border rounded-lg" value={formData.block} onChange={e => handleChange('block', e.target.value)}/>
                         </div>
                         <div className="grid grid-cols-1 gap-2 mb-2">
                             <input type="text" placeholder="Building / Estate" className="w-full p-2 text-sm border rounded-lg" value={formData.building} onChange={e => handleChange('building', e.target.value)}/>
                             <input type="text" placeholder="Street No. & Name" className="w-full p-2 text-sm border rounded-lg" value={formData.street} onChange={e => handleChange('street', e.target.value)}/>
                         </div>
                         <div className="grid grid-cols-2 gap-2">
                              <input type="text" placeholder="District" className="p-2 text-sm border rounded-lg" value={formData.district} onChange={e => handleChange('district', e.target.value)}/>
                              <select className="p-2 text-sm border rounded-lg" value={formData.region} onChange={e => handleChange('region', e.target.value)}>
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
                                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={formData.originalSchemeName}
                                onChange={(e) => handleChange('originalSchemeName', e.target.value)}
                                placeholder="e.g. Manulife Global Select"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Member Account No</label>
                            <input 
                                type="text" 
                                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
            <button 
                onClick={generatePDFs}
                disabled={isGenerating}
                className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                Generate Form Data
            </button>

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
