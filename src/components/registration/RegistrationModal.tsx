import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student, AgeCategory, Position } from '../../types';
import { 
  X, 
  User, 
  Users, 
  CheckCircle2, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft,
  Phone,
  Mail,
  CreditCard,
  Shirt,
  Sparkles,
  AlertCircle,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  cleanDigits, 
  isValid10DigitPhone, 
  formatPhone10, 
  isValidThaiIdCard, 
  formatThaiIdCard, 
  STANDARD_JERSEY_SIZES 
} from '../../utils/validation';
import { PhotoUploadField } from '../common/PhotoUploadField';

interface RegistrationModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onSuccessCreated?: (student: Student) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({ 
  isOpen = true, 
  onClose, 
  onSuccessCreated 
}) => {
  const { addStudent, setActiveTab, clinicTerms, organizationConfig } = useApp();

  const [step, setStep] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdStudent, setCreatedStudent] = useState<Student | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Student info
    fullName: '',
    nickname: '',
    birthDate: '2015-06-15',
    age: 11,
    gender: 'male' as 'male' | 'female',
    idCardNumber: '',
    schoolName: '',
    heightCm: 140,
    weightKg: 35,
    bloodType: 'O',
    medicalConditions: 'ไม่มีโรคประจำตัว',
    preferredPosition: 'Midfielder (MF)' as Position,
    jerseySize: 'JM (รอบอก 72 ซม. / ยาว 51 ซม.)',
    jerseyChestCm: 72,
    jerseyLengthCm: 51,
    shoeSize: '36 EUR',
    category: 'U-12' as AgeCategory,
    status: 'active' as const,
    avatarUrl: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=150&auto=format&fit=crop&q=80',

    // Parent info
    parentName: '',
    parentIdCardNumber: '',
    parentRelationship: 'บิดา' as 'บิดา' | 'มารดา' | 'ผู้ปกครอง' | 'ญาติ',
    parentPhone: '',
    parentEmail: '',
    parentLineId: '',
    parentOccupation: '',
    parentAvatarUrl: '',
    address: 'ต.สะเตง อ.เมือง จ.ยะลา 95000',
    emergencyContactName: '',
    emergencyContactPhone: '',

    // Agreement
    acceptedTerms: false,
    signatureName: ''
  });

  if (!isOpen) return null;

  // Auto-calculate age from birthdate
  const handleBirthDateChange = (dateStr: string) => {
    setErrorMessage('');
    const birthYear = new Date(dateStr).getFullYear();
    const currentYear = new Date().getFullYear();
    const calculatedAge = Math.max(5, currentYear - birthYear);
    
    // Suggest category
    let cat: AgeCategory = 'U-6';
    if (calculatedAge <= 6) cat = 'U-6';
    else cat = 'U-8';

    setFormData(prev => ({
      ...prev,
      birthDate: dateStr,
      age: calculatedAge,
      category: cat
    }));
  };

  const handleJerseySizePreset = (spec: typeof STANDARD_JERSEY_SIZES[0]) => {
    setFormData(prev => ({
      ...prev,
      jerseySize: `${spec.size} (รอบอก ${spec.chestCm} ซม. / ยาว ${spec.lengthCm} ซม.)`,
      jerseyChestCm: spec.chestCm,
      jerseyLengthCm: spec.lengthCm
    }));
  };

  const handleNext = () => {
    setErrorMessage('');
    if (step === 1) {
      if (!formData.fullName.trim()) {
        setErrorMessage('กรุณาระบุชื่อ-นามสกุล ของนักเรียนผู้สมัคร');
        return;
      }
      if (!formData.nickname.trim()) {
        setErrorMessage('กรุณาระบุชื่อเล่นของนักเรียน');
        return;
      }
      if (formData.idCardNumber && cleanDigits(formData.idCardNumber).length !== 13) {
        setErrorMessage('เลขบัตรประชาชนนักเรียนต้องมีครบ 13 หลัก (ปัจจุบันมี ' + cleanDigits(formData.idCardNumber).length + ' หลัก)');
        return;
      }
      if (!formData.jerseyChestCm || formData.jerseyChestCm <= 0) {
        setErrorMessage('กรุณาระบุขนาดรอบอกเสื้อเป็นเซนติเมตร');
        return;
      }
      if (!formData.jerseyLengthCm || formData.jerseyLengthCm <= 0) {
        setErrorMessage('กรุณาระบุความยาวเสื้อเป็นเซนติเมตร');
        return;
      }
    } else if (step === 2) {
      if (!formData.parentName.trim()) {
        setErrorMessage('กรุณาระบุชื่อ-นามสกุล ของผู้ปกครอง');
        return;
      }
      if (!formData.parentPhone.trim()) {
        setErrorMessage('กรุณาระบุเบอร์โทรศัพท์ผู้ปกครอง');
        return;
      }
      const parentDigits = cleanDigits(formData.parentPhone);
      if (parentDigits.length !== 10 || !parentDigits.startsWith('0')) {
        setErrorMessage(`เบอร์โทรศัพท์ผู้ปกครองต้องเป็นตัวเลข 10 หลักและขึ้นต้นด้วย 0 (ปัจจุบันมี ${parentDigits.length} หลัก)`);
        return;
      }
      if (formData.parentIdCardNumber && cleanDigits(formData.parentIdCardNumber).length !== 13) {
        setErrorMessage('เลขบัตรประชาชนผู้ปกครองต้องมีครบ 13 หลัก (ปัจจุบันมี ' + cleanDigits(formData.parentIdCardNumber).length + ' หลัก)');
        return;
      }
      if (formData.emergencyContactPhone) {
        const emDigits = cleanDigits(formData.emergencyContactPhone);
        if (emDigits.length !== 10 || !emDigits.startsWith('0')) {
          setErrorMessage(`เบอร์โทรศัพท์ฉุกเฉินต้องเป็นตัวเลข 10 หลัก (ปัจจุบันมี ${emDigits.length} หลัก)`);
          return;
        }
      }
    }
    setStep(prev => prev + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.acceptedTerms) {
      setErrorMessage('กรุณากดยอมรับเงื่อนไขและข้อตกลงของคลีนิกฟุตบอลยะลาก่อนดำเนินการต่อ');
      return;
    }
    if (!formData.signatureName.trim()) {
      setErrorMessage('กรุณาพิมพ์ชื่อ-นามสกุลผู้ปกครองเพื่อยืนยันข้อตกลงและลายเซ็นดิจิทัล');
      return;
    }

    setIsSubmitting(true);
    try {
      const defaultAvatar = formData.gender === 'male'
        ? 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

      const cleanedParentPhone = cleanDigits(formData.parentPhone);
      const cleanedEmergencyPhone = cleanDigits(formData.emergencyContactPhone);
      const cleanedStudentIdCard = cleanDigits(formData.idCardNumber);
      const cleanedParentIdCard = cleanDigits(formData.parentIdCardNumber);

      const newStudent = await addStudent({
        ...formData,
        idCardNumber: cleanedStudentIdCard || undefined,
        parentIdCardNumber: cleanedParentIdCard || undefined,
        parentPhone: cleanedParentPhone,
        parentEmail: formData.parentEmail?.trim() || undefined,
        emergencyContactPhone: cleanedEmergencyPhone || '',
        avatarUrl: formData.avatarUrl || defaultAvatar,
        parentAvatarUrl: formData.parentAvatarUrl || undefined,
        acceptedDate: new Date().toISOString().split('T')[0]
      });

      setCreatedStudent(newStudent);
      setStep(4); // Success step

      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }

      if (onSuccessCreated) {
        onSuccessCreated(newStudent);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrorMessage(`เกิดข้อผิดพลาดในการบันทึกข้อมูล: ${err?.message || String(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setErrorMessage('');
    setCreatedStudent(null);
    onClose();
  };

  const handleRegisterAnother = () => {
    setStep(1);
    setErrorMessage('');
    setCreatedStudent(null);
    setFormData({
      fullName: '',
      nickname: '',
      birthDate: '2015-06-15',
      age: 11,
      gender: 'male',
      idCardNumber: '',
      schoolName: '',
      heightCm: 140,
      weightKg: 35,
      bloodType: 'O',
      medicalConditions: 'ไม่มีโรคประจำตัว',
      preferredPosition: 'Midfielder (MF)',
      jerseySize: 'JM (รอบอก 72 ซม. / ยาว 51 ซม.)',
      jerseyChestCm: 72,
      jerseyLengthCm: 51,
      shoeSize: '36 EUR',
      category: 'U-12',
      status: 'active',
      avatarUrl: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=150&auto=format&fit=crop&q=80',
      parentName: '',
      parentIdCardNumber: '',
      parentRelationship: 'บิดา',
      parentPhone: '',
      parentEmail: '',
      parentLineId: '',
      parentOccupation: '',
      parentAvatarUrl: '',
      address: 'ต.สะเตง อ.เมือง จ.ยะลา 95000',
      emergencyContactName: '',
      emergencyContactPhone: '',
      acceptedTerms: false,
      signatureName: ''
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            {organizationConfig?.logoUrl ? (
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-white p-0.5 border border-slate-700 shrink-0">
                <img 
                  src={organizationConfig.logoUrl} 
                  alt="Logo" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                {organizationConfig?.shortName || 'YFC'}
              </div>
            )}
            <div>
              <h2 className="text-base font-bold text-white">ใบสมัครลงทะเบียนเรียน • {organizationConfig?.nameTh || 'คลีนิกฟุตบอลยะลา'}</h2>
              <p className="text-xs text-slate-400">{organizationConfig?.name || 'Yala Football Clinic & Youth Academy Registration'}</p>
            </div>
          </div>
          <button 
            onClick={resetAndClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator */}
        {step < 4 && (
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3">
            <div className="flex items-center justify-between max-w-lg mx-auto">
              <button 
                type="button" 
                onClick={() => { setErrorMessage(''); setStep(1); }}
                className={`flex items-center gap-2 ${step >= 1 ? 'text-emerald-700 font-semibold' : 'text-slate-400 font-normal'} text-xs`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${step >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  1
                </span>
                <span>ข้อมูลนักเรียน</span>
              </button>
              <div className="w-8 h-0.5 bg-slate-200"></div>

              <button 
                type="button" 
                onClick={() => {
                  if (formData.fullName.trim() && formData.nickname.trim()) {
                    setErrorMessage('');
                    setStep(2);
                  }
                }}
                className={`flex items-center gap-2 ${step >= 2 ? 'text-emerald-700 font-semibold' : 'text-slate-400 font-normal'} text-xs`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${step >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  2
                </span>
                <span>ข้อมูลผู้ปกครอง</span>
              </button>
              <div className="w-8 h-0.5 bg-slate-200"></div>

              <button 
                type="button" 
                onClick={() => {
                  if (formData.fullName.trim() && formData.nickname.trim() && formData.parentName.trim() && formData.parentPhone.trim()) {
                    setErrorMessage('');
                    setStep(3);
                  }
                }}
                className={`flex items-center gap-2 ${step >= 3 ? 'text-emerald-700 font-semibold' : 'text-slate-400 font-normal'} text-xs`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${step >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  3
                </span>
                <span>ข้อตกลง & ยืนยัน</span>
              </button>
            </div>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6">
          
          {/* Error Message Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}
          
          {/* STEP 1: Student Information */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <User className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">ส่วนที่ 1: ข้อมูลนักเรียนผู้สมัคร</h3>
              </div>

              {/* Photo Upload for Student */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <PhotoUploadField
                  label="แนบรูปถ่ายนักเรียน (สำหรับติดบัตรสมาชิก)"
                  value={formData.avatarUrl}
                  onChange={(url) => setFormData(prev => ({ ...prev, avatarUrl: url }))}
                  helperText="รองรับไฟล์ภาพ JPG, PNG หรือ URL รูปภาพ"
                  presetOptions={[
                    { label: 'เด็กชาย 1', url: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=150&auto=format&fit=crop&q=80' },
                    { label: 'เด็กชาย 2', url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80' },
                    { label: 'เด็กหญิง', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' }
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อ-นามสกุล นักเรียน <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ด.ช. ฮาฟิซ มะแซ"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อเล่น <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ฟิซ, เจมส์, นาดิม"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เลขประจำตัวประชาชนนักเรียน (13 หลัก)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={17}
                      placeholder="1-9599-00123-45-1"
                      value={formatThaiIdCard(formData.idCardNumber)}
                      onChange={(e) => setFormData({ ...formData, idCardNumber: cleanDigits(e.target.value) })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                  </div>
                  <span className="text-[10px] text-slate-400">ระบุเลข 13 หลักสำหรับประกันกลุ่มและขึ้นทะเบียนนักกีฬา</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">วันเกิด</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleBirthDateChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">เพศ / อายุ</label>
                  <div className="flex gap-2">
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-1/2 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="male">ชาย</option>
                      <option value="female">หญิง</option>
                    </select>
                    <div className="w-1/2 px-3 py-2 text-xs bg-slate-100 border border-slate-300 rounded-lg font-bold text-slate-700 flex items-center justify-between">
                      <span>อายุ</span>
                      <span>{formData.age} ปี</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">รุ่นอายุที่สมัคร</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as AgeCategory })}
                    className="w-full px-3 py-2 text-xs border border-emerald-300 bg-emerald-50/50 rounded-lg font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="U-6">รุ่น U-6 (อายุ 4 - 6 ปี)</option>
                    <option value="U-8">รุ่น U-8 (อายุ 7 - 8 ปี)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ตำแหน่งที่ชอบเล่น</label>
                  <select
                    value={formData.preferredPosition}
                    onChange={(e) => setFormData({ ...formData, preferredPosition: e.target.value as Position })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Forward (FW)">กองหน้า (Forward / Striker)</option>
                    <option value="Midfielder (MF)">กองกลาง (Midfielder)</option>
                    <option value="Defender (DF)">กองหลัง (Defender)</option>
                    <option value="Goalkeeper (GK)">ผู้รักษาประตู (Goalkeeper)</option>
                    <option value="All-around (ทุกตำแหน่ง)">เล่นได้ทุกตำแหน่ง (All-around)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">โรงเรียนปัจจุบัน</label>
                  <input
                    type="text"
                    placeholder="เช่น โรงเรียนเทศบาล ๑ ยะลา"
                    value={formData.schoolName}
                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ส่วนสูง (ซม.) / น้ำหนัก (กก.)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="สูง ซม."
                      value={formData.heightCm}
                      onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                      className="w-1/2 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="น้ำหนัก กก."
                      value={formData.weightKg}
                      onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                      className="w-1/2 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    กรุ๊ปเลือด (Blood Type)
                  </label>
                  <select
                    value={formData.bloodType}
                    onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium text-slate-800"
                  >
                    <option value="O">กรุ๊ป O (หมู่เลือด O)</option>
                    <option value="A">กรุ๊ป A (หมู่เลือด A)</option>
                    <option value="B">กรุ๊ป B (หมู่เลือด B)</option>
                    <option value="AB">กรุ๊ป AB (หมู่เลือด AB)</option>
                    <option value="ไม่ระบุ">ไม่ระบุ / ยังไม่ทราบ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ไซส์รองเท้า</label>
                  <input
                    type="text"
                    placeholder="ไซส์ เช่น 36 EUR / 23.5 CM"
                    value={formData.shoeSize}
                    onChange={(e) => setFormData({ ...formData, shoeSize: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Jersey Size with Chest & Length Spec */}
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-950">
                    <Shirt className="w-4 h-4 text-emerald-600" />
                    <span>ขนาดเสื้อฝึกซ้อม (กำหนดตามขนาดรอบอกและความยาวเสื้อ)</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700">
                    {formData.jerseyChestCm} ซม. / ยาว {formData.jerseyLengthCm} ซม.
                  </span>
                </div>

                {/* Quick size selection chips */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {STANDARD_JERSEY_SIZES.map((spec) => {
                    const isSelected = formData.jerseyChestCm === spec.chestCm && formData.jerseyLengthCm === spec.lengthCm;
                    return (
                      <button
                        key={spec.size}
                        type="button"
                        onClick={() => handleJerseySizePreset(spec)}
                        className={`p-2 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                        }`}
                      >
                        <div className="font-bold text-xs">{spec.size}</div>
                        <div className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                          อก {spec.chestCm} ซม.
                        </div>
                        <div className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                          ยาว {spec.lengthCm} ซม.
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom CM Input fields */}
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-emerald-100">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      ขนาดรอบอก (เซนติเมตร) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.jerseyChestCm}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setFormData(prev => ({
                          ...prev,
                          jerseyChestCm: val,
                          jerseySize: `รอบอก ${val} ซม. / ยาว ${prev.jerseyLengthCm} ซม.`
                        }));
                      }}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                      placeholder="เช่น 72"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      ความยาวเสื้อ (เซนติเมตร) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.jerseyLengthCm}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setFormData(prev => ({
                          ...prev,
                          jerseyLengthCm: val,
                          jerseySize: `รอบอก ${prev.jerseyChestCm} ซม. / ยาว ${val} ซม.`
                        }));
                      }}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                      placeholder="เช่น 51"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ประวัติสุขภาพ / โรคประจำตัว / การแพ้ยาหรืออาหาร</label>
                <input
                  type="text"
                  placeholder="เช่น ไม่มีโรคประจำตัว, มีประวัติหอบหืด, แพ้อาหารทะเล"
                  value={formData.medicalConditions}
                  onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <span>ถัดไป: ข้อมูลผู้ปกครอง</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Parent Information */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Users className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">ส่วนที่ 2: ข้อมูลผู้ปกครองและช่องทางติดต่อฉุกเฉิน</h3>
              </div>

              {/* Photo Upload for Parent */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <PhotoUploadField
                  label="แนบรูปถ่ายผู้ปกครอง (สำหรับยืนยันสิทธิ์การรับ-ส่งนักเรียน)"
                  value={formData.parentAvatarUrl}
                  onChange={(url) => setFormData(prev => ({ ...prev, parentAvatarUrl: url }))}
                  helperText="รองรับไฟล์ภาพ JPG, PNG หรือ URL รูปภาพ"
                  presetOptions={[
                    { label: 'ผู้ปกครอง 1', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
                    { label: 'ผู้ปกครอง 2', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' }
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อ-นามสกุล ผู้ปกครอง <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น นายอับดุลเราะห์มาน มะแซ"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เลขประจำตัวประชาชนผู้ปกครอง (13 หลัก)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={17}
                      placeholder="3-9599-00234-56-1"
                      value={formatThaiIdCard(formData.parentIdCardNumber)}
                      onChange={(e) => setFormData({ ...formData, parentIdCardNumber: cleanDigits(e.target.value) })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                  </div>
                  <span className="text-[10px] text-slate-400">เลข 13 หลักของผู้ปกครองเพื่อความปลอดภัย</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ความสัมพันธ์กับนักเรียน</label>
                  <select
                    value={formData.parentRelationship}
                    onChange={(e) => setFormData({ ...formData, parentRelationship: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="บิดา">บิดา</option>
                    <option value="มารดา">มารดา</option>
                    <option value="ผู้ปกครอง">ผู้ปกครอง</option>
                    <option value="ญาติ">ญาติ / อื่นๆ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เบอร์โทรศัพท์ผู้ปกครอง (10 หลัก) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      maxLength={12}
                      placeholder="081-234-5678"
                      value={formatPhone10(formData.parentPhone)}
                      onChange={(e) => setFormData({ ...formData, parentPhone: cleanDigits(e.target.value) })}
                      className={`w-full px-3 py-2 text-xs border rounded-lg font-mono focus:ring-2 focus:outline-none ${
                        formData.parentPhone && !isValid10DigitPhone(formData.parentPhone)
                          ? 'border-amber-400 bg-amber-50/40 focus:ring-amber-500'
                          : 'border-slate-300 focus:ring-emerald-500'
                      }`}
                    />
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[10px] text-slate-400">บังคับเบอร์โทร 10 หลักขึ้นต้นด้วย 0</span>
                    <span className={`text-[10px] font-mono font-semibold ${
                      cleanDigits(formData.parentPhone).length === 10 ? 'text-emerald-600' : 'text-slate-400'
                    }`}>
                      {cleanDigits(formData.parentPhone).length}/10 หลัก
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    อีเมลผู้ปกครอง (Parent Email)
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="parent@example.com"
                      value={formData.parentEmail}
                      onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none pr-8"
                    />
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                  </div>
                  <span className="text-[10px] text-slate-400">สำหรับรับใบเสร็จ, ตารางซ้อม และหนังสือแจ้งข่าวสาร</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">LINE ID</label>
                  <input
                    type="text"
                    placeholder="สำหรับรับการแจ้งเตือนตารางซ้อม"
                    value={formData.parentLineId}
                    onChange={(e) => setFormData({ ...formData, parentLineId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">อาชีพ / สถานที่ทำงาน</label>
                  <input
                    type="text"
                    placeholder="เช่น ข้าราชการ, ค้าขาย, รพ.ยะลา"
                    value={formData.parentOccupation}
                    onChange={(e) => setFormData({ ...formData, parentOccupation: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">บุคคลและเบอร์ติดต่อฉุกเฉินสำรอง (10 หลัก)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="ชื่อผู้ติดต่อฉุกเฉิน"
                      value={formData.emergencyContactName}
                      onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                      className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                    <input
                      type="tel"
                      maxLength={12}
                      placeholder="เบอร์ฉุกเฉิน 10 หลัก (0XX-XXX-XXXX)"
                      value={formatPhone10(formData.emergencyContactPhone)}
                      onChange={(e) => setFormData({ ...formData, emergencyContactPhone: cleanDigits(e.target.value) })}
                      className="px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ที่อยู่ปัจจุบันในจังหวัดยะลา / พื้นที่ใกล้เคียง</label>
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs flex items-center gap-1 hover:bg-slate-50 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>ย้อนกลับ</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <span>ถัดไป: ข้อตกลงคลีนิก</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Terms, Conditions, Waiver & Confirmation */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">ส่วนที่ 3: ข้อกำหนด เงื่อนไข และการยอมรับข้อตกลงคลีนิกฟุตบอลยะลา</h3>
              </div>

              {/* Terms scrollbox reading from live clinicTerms */}
              <div className="max-h-56 overflow-y-auto bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-3 text-slate-700 leading-relaxed">
                <div className="font-bold text-slate-900">{clinicTerms.title}</div>
                <div className="text-[11px] text-slate-500 font-mono">เวอร์ชัน: {clinicTerms.version}</div>

                {clinicTerms.sections.map((sec, i) => (
                  <div key={i} className="space-y-1">
                    <div className="font-semibold text-emerald-800">{sec.heading}</div>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                      {sec.items.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Acceptance Checkbox */}
              <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/80 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={formData.acceptedTerms}
                    onChange={(e) => setFormData({ ...formData, acceptedTerms: e.target.checked })}
                    className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <div className="text-xs text-slate-800">
                    <span className="font-bold text-emerald-900">
                      ข้าพเจ้ายินยอมและยอมรับเงื่อนไข ระเบียบข้อบังคับ และหนังสือยินยอมทางการแพทย์/การฝึกซ้อมของคลีนิกฟุตบอลยะลาทุกประการ
                    </span>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      ข้าพเจ้าขอยืนยันว่าข้อมูลข้างต้นเป็นความจริง และอนุญาตให้บุตรหลานเข้าร่วมกิจกรรมการฝึกซ้อมของคลีนิกฟุตบอลยะลา
                    </p>
                  </div>
                </label>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ลงชื่อผู้ปกครองผู้ให้ความยินยอม <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="พิมพ์ชื่อ-นามสกุล เพื่อเป็นลายเซ็นดิจิทัล"
                    value={formData.signatureName}
                    onChange={(e) => setFormData({ ...formData, signatureName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-emerald-300 bg-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs flex items-center gap-1 hover:bg-slate-50 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>ย้อนกลับ</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>กำลังบันทึกข้อมูลลงฐานข้อมูล...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>ยืนยันการสมัครเรียนและออกรหัสสมาชิก</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Success & Member Card Preview */}
          {step === 4 && createdStudent && (
            <div className="text-center space-y-5 py-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">ลงทะเบียนสำเร็จเรียบร้อย!</h3>
                <p className="text-xs text-slate-600 mt-1">
                  ยินดีต้อนรับสู่ครอบครัวคลีนิกฟุตบอลยะลา ระบบได้ออกรหัสสมาชิกและบัตรประจำตัวดิจิทัลให้เรียบร้อยแล้ว
                </p>
              </div>

              {/* Digital Pass Preview Card */}
              <div className="max-w-sm mx-auto bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 text-white rounded-2xl p-5 shadow-xl border border-amber-400/40 text-left relative overflow-hidden">
                <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-amber-400/10 rounded-full blur-xl pointer-events-none"></div>
                
                <div className="flex items-center justify-between border-b border-emerald-700/60 pb-3 mb-3">
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-amber-300 uppercase">YALA FOOTBALL CLINIC</span>
                    <h4 className="text-xs font-bold text-white">บัตรประจำตัวนักฟุตบอลเยาวชน</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950">
                    {createdStudent.category}
                  </span>
                </div>

                <div className="flex items-center gap-3.5">
                  <img 
                    src={createdStudent.avatarUrl} 
                    alt={createdStudent.fullName} 
                    className="w-16 h-16 rounded-xl object-cover border-2 border-amber-400/60 shadow shrink-0"
                  />
                  <div>
                    <div className="font-extrabold text-sm text-white">{createdStudent.fullName}</div>
                    <div className="text-xs text-amber-200 font-semibold">ชื่อเล่น: "{createdStudent.nickname}"</div>
                    <div className="text-[11px] text-emerald-200 font-mono mt-0.5">รหัส: {createdStudent.studentCode}</div>
                    <div className="text-[10px] text-slate-300">
                      ขนาดเสื้อ: อก {createdStudent.jerseyChestCm || '-'} ซม. • กรุ๊ปเลือด: {createdStudent.bloodType || 'O'}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-700/60 flex items-center justify-between text-[10px] text-slate-300">
                  <div>
                    <span>ผู้ปกครอง: {createdStudent.parentName}</span>
                    {createdStudent.parentEmail && (
                      <div className="text-emerald-200 text-[10px]">อีเมล: {createdStudent.parentEmail}</div>
                    )}
                  </div>
                  <span className="text-amber-300 font-mono">TEL: {formatPhone10(createdStudent.parentPhone)}</span>
                </div>
              </div>

              {/* Parent Credentials Info Box */}
              <div className="max-w-sm mx-auto bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>ข้อมูลเข้าสู่ระบบสำหรับผู้ปกครอง (Parent Portal)</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-amber-100 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-[11px]">ชื่อผู้ใช้ (Username):</span>
                    <span className="font-mono font-bold text-slate-900">
                      {createdStudent.parentIdCardNumber ? formatThaiIdCard(createdStudent.parentIdCardNumber) : (createdStudent.parentPhone || createdStudent.studentCode)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-[11px]">รหัสผ่านเริ่มต้น (Password):</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {createdStudent.parentPhone ? formatPhone10(createdStudent.parentPhone) : '1234'}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-amber-800 leading-tight">
                  📌 ค่าเริ่มต้นของระบบ: <strong>Username = เลขบัตร ปชช. ผู้ปกครอง 13 หลัก</strong> และ <strong>Password = เบอร์โทรศัพท์ผู้ปกครอง 10 หลัก</strong>
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('members');
                    resetAndClose();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Users className="w-4 h-4" />
                  <span>ดูรายชื่อสมาชิกนักเรียนทั้งหมด</span>
                </button>

                <button
                  type="button"
                  onClick={handleRegisterAnother}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
                >
                  <User className="w-4 h-4" />
                  <span>รับสมัครนักเรียนคนถัดไป</span>
                </button>

                <button
                  type="button"
                  onClick={resetAndClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600 font-medium text-xs transition-all"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
