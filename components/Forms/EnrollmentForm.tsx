import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, ChevronUp, AlertCircle, CheckCircle, Download, 
  Info, FileText, User, Briefcase, RefreshCw 
} from 'lucide-react';
import { MPFFund, Scenario } from '../../types';
import { getFunds } from '../../services/dataService';

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

const EnrollmentForm: React.FC<EnrollmentFormProps> = ({ prefillAllocation, copyToEnrollmentTrigger }) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [expandedSection, setExpandedSection] = useState<string>('aboutYou');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableFunds, setAvailableFunds] = useState<MPFFund[]>([]);
  const [generatedJson, setGeneratedJson] = useState<string | null>(null);
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
        // Find matching fund in available funds
        const match = availableFunds.find(f => f.constituent_fund === alloc.fund.constituent_fund);
        if (match) {
            newAllocations[match.constituent_fund] = alloc.allocation;
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
             // Fund should exist in availableFunds due to the initialization logic
             newAllocations[alloc.fund.constituent_fund] = alloc.allocation;
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
    if (formData.memberType) {
        if (!formData.acceptPIA) newErrors.acceptPIA = 'Required';
        if (!formData.acceptPersonalInfo) newErrors.acceptPersonalInfo = 'Required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateData = () => {
    if (!validateForm()) {
      alert("Please fix validation errors.");
      return;
    }

    const data = {
      scheme: "MASS Mandatory Provident Fund Scheme",
      timestamp: new Date().toISOString(),
      personalInfo: {
        name: `${formData.surnameEn}, ${formData.givenNameEn}`,
        chineseName: formData.chineseName,
        id: formData.idType === 'hkid' ? formData.hkid : formData.passportNo,
        contact: { phone: formData.phone, email: formData.email },
        address: { region: formData.region, district: formData.district, street: formData.street }
      },
      allocations: {
        enrollment: formData.enrollmentAllocations,
        transfer: formData.transferAllocations
      },
      declarations: {
        pia: formData.acceptPIA,
        pics: formData.acceptPersonalInfo
      }
    };

    setGeneratedJson(JSON.stringify(data, null, 2));
  };

  const downloadData = () => {
    if (!generatedJson) return;
    const blob = new Blob([generatedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MPF_Form_${formData.surnameEn}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                  className="w-12 p-1 text-right text-sm border rounded focus:ring-2 focus:ring-blue-500 outline-none"
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
                                className={`w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.surnameEn ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
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
                                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.idType === 'hkid' ? formData.hkid : formData.passportNo}
                                onChange={(e) => handleChange(formData.idType === 'hkid' ? 'hkid' : 'passportNo', e.target.value.toUpperCase())}
                                placeholder={formData.idType === 'hkid' ? "A123456(7)" : ""}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Mobile Phone <span className="text-red-500">*</span></label>
                            <div className="flex gap-2">
                                <input type="text" value="+852" disabled className="w-16 p-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-center" />
                                <input 
                                    type="text" 
                                    className="flex-1 p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                placeholder="email@example.com"
                            />
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
                                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.originalSchemeName}
                                onChange={(e) => handleChange('originalSchemeName', e.target.value)}
                                placeholder="e.g. Manulife Global Select"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Member Account No</label>
                            <input 
                                type="text" 
                                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                onClick={generateData}
                className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
                <FileText size={18} />
                Generate Form Data
            </button>

            {generatedJson && (
                <div className="w-full bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-scale-in">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-full text-green-600">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-green-800">Ready for Download</h4>
                            <p className="text-xs text-green-600">Data generated successfully. Click to download JSON.</p>
                        </div>
                    </div>
                    <button 
                        onClick={downloadData}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg shadow-sm flex items-center gap-2 transition-colors"
                    >
                        <Download size={16} />
                        Download JSON
                    </button>
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