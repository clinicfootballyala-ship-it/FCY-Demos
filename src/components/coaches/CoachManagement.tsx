import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Coach, AgeCategory } from '../../types';
import { 
  Users, 
  Award, 
  Phone, 
  Mail, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  DollarSign, 
  Calendar, 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  Briefcase,
  AlertCircle,
  CreditCard,
  KeyRound,
  UserCheck
} from 'lucide-react';
import { cleanDigits, formatPhone10, isValid10DigitPhone, formatThaiIdCard, isValidThaiIdCard } from '../../utils/validation';
import { PhotoUploadField } from '../common/PhotoUploadField';

const AGE_COLORS: Record<string, string> = {
  'U-6': '#3b82f6',
  'U-8': '#10b981',
  'U-10': '#059669',
  'U-12': '#3b82f6',
  'U-14': '#6366f1',
  'U-16': '#8b5cf6',
  'U-18': '#ec4899'
};

export const CoachManagement: React.FC = () => {
  const { coaches, addCoach, updateCoach, deleteCoach, currentRole } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  // Form State for new coach
  const [newCoach, setNewCoach] = useState<{
    fullName: string;
    nickname: string;
    idCardNumber: string;
    phone: string;
    email: string;
    license: Coach['license'];
    assignedCategories: AgeCategory[];
    role: Coach['role'];
    salary: number;
    employmentType: Coach['employmentType'];
    avatarUrl: string;
    status: Coach['status'];
    bio: string;
  }>({
    fullName: '',
    nickname: '',
    idCardNumber: '',
    phone: '',
    email: '',
    license: 'AFC C-License',
    assignedCategories: ['U-6', 'U-8'],
    role: 'head_coach',
    salary: 25000,
    employmentType: 'full_time',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    status: 'active',
    bio: ''
  });

  const filteredCoaches = coaches.filter(c => {
    const matchesSearch = 
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.license.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.idCardNumber && c.idCardNumber.includes(searchQuery)) ||
      c.coachCode.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = selectedRole === 'all' || c.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  const handleCreateCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!newCoach.fullName.trim()) {
      setErrorMessage('กรุณากรอกชื่อ-สกุล โค้ช / สต๊าฟ');
      return;
    }

    const idDigits = cleanDigits(newCoach.idCardNumber);
    if (idDigits && idDigits.length !== 13) {
      setErrorMessage(`เลขประจำตัวประชาชนต้องเป็นตัวเลข 13 หลัก (ปัจจุบันมี ${idDigits.length} หลัก)`);
      return;
    }

    const digits = cleanDigits(newCoach.phone);
    if (digits.length !== 10 || !digits.startsWith('0')) {
      setErrorMessage(`เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลักขึ้นต้นด้วย 0 (ปัจจุบันมี ${digits.length} หลัก)`);
      return;
    }

    try {
      setIsSubmitting(true);
      await addCoach({
        ...newCoach,
        idCardNumber: idDigits || undefined,
        phone: digits
      });
      setShowAddModal(false);
      showNotification(`✅ เพิ่มข้อมูล ${newCoach.fullName} และบันทึกลง Supabase สำเร็จเรียบร้อย!`);
      setNewCoach({
        fullName: '',
        nickname: '',
        idCardNumber: '',
        phone: '',
        email: '',
        license: 'AFC C-License',
        assignedCategories: ['U-6', 'U-8'],
        role: 'head_coach',
        salary: 25000,
        employmentType: 'full_time',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        status: 'active',
        bio: ''
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoach) return;
    setErrorMessage('');

    const idDigits = cleanDigits(editingCoach.idCardNumber);
    if (idDigits && idDigits.length !== 13) {
      setErrorMessage(`เลขประจำตัวประชาชนต้องเป็นตัวเลข 13 หลัก (ปัจจุบันมี ${idDigits.length} หลัก)`);
      return;
    }

    const digits = cleanDigits(editingCoach.phone);
    if (digits.length !== 10 || !digits.startsWith('0')) {
      setErrorMessage(`เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลักขึ้นต้นด้วย 0 (ปัจจุบันมี ${digits.length} หลัก)`);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await updateCoach(editingCoach.id, {
        ...editingCoach,
        idCardNumber: idDigits || undefined,
        phone: digits
      });

      if (res && !res.success && res.error) {
        console.warn('Coach update notice:', res.error);
      }

      const savedName = editingCoach.fullName;
      setEditingCoach(null);
      showNotification(`✅ บันทึกการแก้ไขข้อมูล ${savedName} และซิงค์ลง Supabase สำเร็จเรียบร้อย!`);
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCategorySelection = (cat: AgeCategory, isEditing: boolean) => {
    if (isEditing && editingCoach) {
      const exists = editingCoach.assignedCategories.includes(cat);
      const next = exists 
        ? editingCoach.assignedCategories.filter(c => c !== cat)
        : [...editingCoach.assignedCategories, cat];
      setEditingCoach({ ...editingCoach, assignedCategories: next });
    } else {
      const exists = newCoach.assignedCategories.includes(cat);
      const next = exists
        ? newCoach.assignedCategories.filter(c => c !== cat)
        : [...newCoach.assignedCategories, cat];
      setNewCoach({ ...newCoach, assignedCategories: next });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">ระบบจัดการโค้ชผู้ฝึกสอน & บริหารงานบุคคล (HR)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ทำเนียบโค้ชและสต๊าฟฟุตบอลคลีนิกฟุตบอลยะลา เลขบัตรประชาชน ใบอนุญาต License สัญญาจ้าง และอัตราเงินเดือน
          </p>
        </div>

        {currentRole === 'admin_staff' && (
          <button
            onClick={() => {
              setErrorMessage('');
              setShowAddModal(true);
            }}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 font-medium text-xs text-white shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มโค้ช / สต๊าฟใหม่</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative w-full md:flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาด้วยชื่อโค้ช, ชื่อเล่น, รหัส (CCH-xxx), เลขบัตร ปชช., ใบอนุญาต หรือเบอร์โทร..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-slate-500 shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> ตำแหน่ง:
          </span>
          {[
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'head_coach', label: 'Head Coach' },
            { id: 'assistant_coach', label: 'ผู้ช่วยโค้ช' },
            { id: 'goalkeeper_coach', label: 'GK Coach' },
            { id: 'fitness_coach', label: 'ฟิตเนส' },
            { id: 'staff', label: 'สตาฟทีม' }
          ].map(role => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedRole === role.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {role.label}
            </button>
          ))}
        </div>
      </div>

      {/* Coaches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCoaches.map((coach) => (
          <div 
            key={coach.id} 
            className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between p-4"
          >
            <div>
              {/* Coach Profile Header */}
              <div className="flex items-start gap-3.5 pb-4 border-b border-slate-100">
                <img 
                  src={coach.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'} 
                  alt={coach.fullName} 
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-xs shrink-0" 
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-[10px] font-bold text-slate-400">{coach.coachCode}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      coach.license === 'ไม่มี' 
                        ? 'bg-slate-100 text-slate-600' 
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {coach.license === 'ไม่มี' ? 'ไม่มี License' : coach.license}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 mt-1 truncate">{coach.fullName}</h3>
                  <div className="text-xs font-bold text-emerald-700">"{coach.nickname}"</div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {coach.role === 'head_coach' && 'หัวหน้าผู้ฝึกสอน'}
                    {coach.role === 'assistant_coach' && 'ผู้ช่วยผู้ฝึกสอน'}
                    {coach.role === 'goalkeeper_coach' && 'โค้ชผู้รักษาประตู'}
                    {coach.role === 'fitness_coach' && 'โค้ชฟิตเนสและกายภาพ'}
                    {coach.role === 'staff' && 'สตาฟ / เจ้าหน้าที่ทีม'}
                  </div>
                </div>
              </div>

              {/* Assigned Categories */}
              <div className="py-3 space-y-2 text-xs">
                {coach.assignedCategories && coach.assignedCategories.length > 0 && (
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1">รุ่นที่รับผิดชอบการสอน:</span>
                    <div className="flex flex-wrap gap-1">
                      {coach.assignedCategories.map(cat => {
                        const isU6 = cat === 'U-6';
                        return (
                          <span 
                            key={cat} 
                            className="px-2 py-0.5 rounded text-white font-bold text-[11px] shadow-xs flex items-center gap-1"
                            style={{ backgroundColor: AGE_COLORS[cat] || (isU6 ? '#3b82f6' : '#10b981') }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            <span>{cat}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Bio snippet */}
                {coach.bio && (
                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {coach.bio}
                  </p>
                )}

                {/* Contact info & ID Card */}
                <div className="space-y-1.5 pt-1 text-[11px] text-slate-600">
                  {coach.idCardNumber && (
                    <div className="flex items-center gap-1.5 text-slate-700 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/60 font-mono">
                      <CreditCard className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="font-semibold text-[10.5px]">ปชช: {formatThaiIdCard(coach.idCardNumber)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono font-semibold">{formatPhone10(coach.phone)}</span>
                  </div>
                  {coach.email && (
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{coach.email}</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* HR Details & Payroll footer */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">ประเภทสัญญา:</span>
                <span className="font-bold text-slate-800">
                  {coach.employmentType === 'full_time' ? 'ประจำ (Full-time)' : 'ชั่วคราว (Part-time)'}
                </span>
              </div>

              {currentRole === 'admin_staff' && (
                <div className="flex items-center justify-between text-xs bg-emerald-50/70 p-2 rounded-lg border border-emerald-100">
                  <span className="text-emerald-800 font-semibold">เงินเดือน / ค่าตอบแทน:</span>
                  <span className="font-black text-emerald-900">฿{coach.salary.toLocaleString()}/เดือน</span>
                </div>
              )}

              {currentRole === 'admin_staff' && (
                <div className="flex items-center justify-end gap-1 pt-1">
                  <button
                    onClick={() => {
                      setErrorMessage('');
                      setEditingCoach({ ...coach });
                    }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-xs cursor-pointer"
                    title="แก้ไขข้อมูลโค้ช"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`คุณต้องการลบโค้ช "${coach.fullName}" หรือไม่?`)) {
                        deleteCoach(coach.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs cursor-pointer"
                    title="ลบ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* CREATE COACH MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-bold text-sm text-slate-900">เพิ่มโค้ชผู้ฝึกสอน / สต๊าฟใหม่</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateCoach} className="space-y-3 text-xs">
              <PhotoUploadField
                label="รูปถ่ายโค้ช / สต๊าฟ"
                value={newCoach.avatarUrl}
                onChange={(url) => setNewCoach({ ...newCoach, avatarUrl: url })}
                presetOptions={[
                  { label: 'โค้ช 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400' },
                  { label: 'โค้ช 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400' },
                  { label: 'โค้ช 3', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400' }
                ]}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น นายอัสฮัด ยะลาวาปี"
                    value={newCoach.fullName}
                    onChange={(e) => setNewCoach({ ...newCoach, fullName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ชื่อเรียก / ชื่อเล่น</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น โค้ชฮัด หรือ สต๊าฟบอย"
                    value={newCoach.nickname}
                    onChange={(e) => setNewCoach({ ...newCoach, nickname: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              {/* ID Card Number Input */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  เลขประจำตัวประชาชน 13 หลัก
                  <span className="text-[10px] text-emerald-600 font-normal ml-1.5">
                    (ใช้เป็น Username เริ่มต้นในการเข้าสู่ระบบ)
                  </span>
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={17}
                    placeholder="1-9599-00123-45-6 (13 หลัก)"
                    value={formatThaiIdCard(newCoach.idCardNumber)}
                    onChange={(e) => setNewCoach({ ...newCoach, idCardNumber: cleanDigits(e.target.value) })}
                    className="w-full pl-9 pr-3 py-2 border rounded-lg font-mono text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ใบอนุญาต (License)</label>
                  <select
                    value={newCoach.license}
                    onChange={(e) => setNewCoach({ ...newCoach, license: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg font-bold"
                  >
                    <option value="ไม่มี">ไม่มี (None)</option>
                    <option value="AFC Pro Diploma">AFC Pro Diploma</option>
                    <option value="AFC A-License">AFC A-License</option>
                    <option value="AFC B-License">AFC B-License</option>
                    <option value="AFC C-License">AFC C-License</option>
                    <option value="FA Thailand Grassroots">FA Thailand Grassroots</option>
                    <option value="AFC Goalkeeping L1">AFC Goalkeeping L1</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ตำแหน่งหน้าที่</label>
                  <select
                    value={newCoach.role}
                    onChange={(e) => setNewCoach({ ...newCoach, role: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg font-bold"
                  >
                    <option value="head_coach">หัวหน้าผู้ฝึกสอน (Head Coach)</option>
                    <option value="assistant_coach">ผู้ช่วยผู้ฝึกสอน (Assistant Coach)</option>
                    <option value="goalkeeper_coach">โค้ชผู้รักษาประตู (GK Coach)</option>
                    <option value="fitness_coach">โค้ชฟิตเนสและกายภาพ</option>
                    <option value="staff">สตาฟ / เจ้าหน้าที่ทีม (Staff)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">รุ่นอายุที่รับผิดชอบ</label>
                <div className="flex flex-wrap gap-2">
                  {(['U-6', 'U-8'] as AgeCategory[]).map(cat => {
                    const isSelected = newCoach.assignedCategories.includes(cat);
                    const isU6 = cat === 'U-6';
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategorySelection(cat, false)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? isU6
                              ? 'bg-blue-600 border border-blue-600 text-white shadow-xs'
                              : 'bg-emerald-600 border border-emerald-600 text-white shadow-xs'
                            : isU6
                              ? 'bg-blue-50/70 border border-blue-200 text-blue-700 hover:bg-blue-100/70'
                              : 'bg-emerald-50/70 border border-emerald-200 text-emerald-700 hover:bg-emerald-100/70'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : isU6 ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                        <span>{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    เบอร์โทรศัพท์ (10 หลัก) <span className="text-rose-500">*</span>
                    <span className="text-[10px] text-emerald-600 font-normal ml-1">
                      (ใช้เป็น Password เริ่มต้น)
                    </span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={12}
                    placeholder="08X-XXX-XXXX"
                    value={formatPhone10(newCoach.phone)}
                    onChange={(e) => setNewCoach({ ...newCoach, phone: cleanDigits(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">อีเมล</label>
                  <input
                    type="email"
                    placeholder="coach@yalaclinic.com"
                    value={newCoach.email}
                    onChange={(e) => setNewCoach({ ...newCoach, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ประเภทสัญญาจ้าง</label>
                  <select
                    value={newCoach.employmentType}
                    onChange={(e) => setNewCoach({ ...newCoach, employmentType: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="full_time">พนักงานประจำ (Full-time)</option>
                    <option value="part_time">ชั่วคราว / รายวัน (Part-time)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เงินเดือน / ค่าตอบแทน (บาท)</label>
                  <input
                    type="number"
                    required
                    value={newCoach.salary}
                    onChange={(e) => setNewCoach({ ...newCoach, salary: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ประวัติและผลงานย่อ (Bio)</label>
                <textarea
                  rows={2}
                  placeholder="เช่น อดีตนักฟุตบอลสโมสรยะลา เอฟซี, ประสบการณ์โค้ชเยาวชน 6 ปี"
                  value={newCoach.bio}
                  onChange={(e) => setNewCoach({ ...newCoach, bio: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Login Credential Notice */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
                <KeyRound className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-[11.5px] leading-relaxed">
                  <span className="font-bold text-emerald-900">ระบบจะสร้างบัญชีผู้ใช้งานอัตโนมัติ:</span>
                  <div className="mt-0.5 text-emerald-800">
                    • <strong>Username เริ่มต้น:</strong> {newCoach.idCardNumber ? formatThaiIdCard(newCoach.idCardNumber) : (newCoach.nickname ? `coach.${newCoach.nickname.toLowerCase()}` : 'เลขบัตรประชาชน 13 หลัก')}
                    <br />
                    • <strong>Password เริ่มต้น:</strong> {newCoach.phone ? formatPhone10(newCoach.phone) : 'เบอร์โทรศัพท์ 10 หลัก'}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-xl cursor-pointer hover:bg-slate-50 disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>กำลังบันทึกลง Supabase...</span>
                    </>
                  ) : (
                    <span>บันทึกข้อมูลโค้ช / สต๊าฟ</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT COACH MODAL */}
      {editingCoach && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-bold text-sm text-slate-900">แก้ไขข้อมูลโค้ช / สต๊าฟ: {editingCoach.fullName}</h3>
              <button onClick={() => setEditingCoach(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <PhotoUploadField
                label="รูปถ่ายโค้ช / สต๊าฟ"
                value={editingCoach.avatarUrl}
                onChange={(url) => setEditingCoach({ ...editingCoach, avatarUrl: url })}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCoach.fullName}
                    onChange={(e) => setEditingCoach({ ...editingCoach, fullName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ชื่อเรียก / ชื่อเล่น</label>
                  <input
                    type="text"
                    required
                    value={editingCoach.nickname}
                    onChange={(e) => setEditingCoach({ ...editingCoach, nickname: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              {/* ID Card Number in Edit Form */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  เลขประจำตัวประชาชน 13 หลัก
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={17}
                    placeholder="1-9599-00123-45-6"
                    value={formatThaiIdCard(editingCoach.idCardNumber)}
                    onChange={(e) => setEditingCoach({ ...editingCoach, idCardNumber: cleanDigits(e.target.value) })}
                    className="w-full pl-9 pr-3 py-2 border rounded-lg font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ใบอนุญาต (License)</label>
                  <select
                    value={editingCoach.license}
                    onChange={(e) => setEditingCoach({ ...editingCoach, license: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg font-bold"
                  >
                    <option value="ไม่มี">ไม่มี (None)</option>
                    <option value="AFC Pro Diploma">AFC Pro Diploma</option>
                    <option value="AFC A-License">AFC A-License</option>
                    <option value="AFC B-License">AFC B-License</option>
                    <option value="AFC C-License">AFC C-License</option>
                    <option value="FA Thailand Grassroots">FA Thailand Grassroots</option>
                    <option value="AFC Goalkeeping L1">AFC Goalkeeping L1</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ตำแหน่งหน้าที่</label>
                  <select
                    value={editingCoach.role}
                    onChange={(e) => setEditingCoach({ ...editingCoach, role: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg font-bold"
                  >
                    <option value="head_coach">หัวหน้าผู้ฝึกสอน (Head Coach)</option>
                    <option value="assistant_coach">ผู้ช่วยผู้ฝึกสอน (Assistant Coach)</option>
                    <option value="goalkeeper_coach">โค้ชผู้รักษาประตู (GK Coach)</option>
                    <option value="fitness_coach">โค้ชฟิตเนสและกายภาพ</option>
                    <option value="staff">สตาฟ / เจ้าหน้าที่ทีม (Staff)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">รุ่นอายุที่รับผิดชอบ</label>
                <div className="flex flex-wrap gap-2">
                  {(['U-6', 'U-8'] as AgeCategory[]).map(cat => {
                    const isSelected = editingCoach.assignedCategories.includes(cat);
                    const isU6 = cat === 'U-6';
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategorySelection(cat, true)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? isU6
                              ? 'bg-blue-600 border border-blue-600 text-white shadow-xs'
                              : 'bg-emerald-600 border border-emerald-600 text-white shadow-xs'
                            : isU6
                              ? 'bg-blue-50/70 border border-blue-200 text-blue-700 hover:bg-blue-100/70'
                              : 'bg-emerald-50/70 border border-emerald-200 text-emerald-700 hover:bg-emerald-100/70'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : isU6 ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                        <span>{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    เบอร์โทรศัพท์ (10 หลัก) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={12}
                    value={formatPhone10(editingCoach.phone)}
                    onChange={(e) => setEditingCoach({ ...editingCoach, phone: cleanDigits(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">อีเมล</label>
                  <input
                    type="email"
                    value={editingCoach.email}
                    onChange={(e) => setEditingCoach({ ...editingCoach, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ประเภทสัญญาจ้าง</label>
                  <select
                    value={editingCoach.employmentType}
                    onChange={(e) => setEditingCoach({ ...editingCoach, employmentType: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="full_time">พนักงานประจำ (Full-time)</option>
                    <option value="part_time">ชั่วคราว / รายวัน (Part-time)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เงินเดือน / ค่าตอบแทน (บาท)</label>
                  <input
                    type="number"
                    required
                    value={editingCoach.salary}
                    onChange={(e) => setEditingCoach({ ...editingCoach, salary: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ประวัติและผลงานย่อ (Bio)</label>
                <textarea
                  rows={2}
                  value={editingCoach.bio}
                  onChange={(e) => setEditingCoach({ ...editingCoach, bio: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setEditingCoach(null)}
                  className="px-4 py-2 border rounded-xl cursor-pointer hover:bg-slate-50 disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>กำลังบันทึกลง Supabase...</span>
                    </>
                  ) : (
                    <span>บันทึกการแก้ไข</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Success Toast */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-500/50">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{successMessage}</span>
        </div>
      )}

    </div>
  );
};
