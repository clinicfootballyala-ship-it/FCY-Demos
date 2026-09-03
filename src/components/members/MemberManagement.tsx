import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student, AgeCategory, Position } from '../../types';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  CreditCard, 
  Trophy, 
  Printer, 
  Edit, 
  Trash2, 
  Eye, 
  Phone, 
  Mail,
  MapPin, 
  HeartPulse, 
  CheckCircle2, 
  X,
  FileText,
  Shield,
  Download,
  Shirt,
  AlertCircle
} from 'lucide-react';
import { 
  cleanDigits, 
  isValid10DigitPhone, 
  formatPhone10, 
  isValidThaiIdCard, 
  formatThaiIdCard, 
  STANDARD_JERSEY_SIZES 
} from '../../utils/validation';
import { PhotoUploadField } from '../common/PhotoUploadField';
import { AthleteCardModal } from '../common/AthleteCardModal';

const AGE_COLORS: Record<string, string> = {
  'U-6': '#3b82f6',
  'U-8': '#10b981',
  'U-10': '#059669',
  'U-12': '#3b82f6',
  'U-14': '#6366f1',
  'U-16': '#8b5cf6',
  'U-18': '#ec4899',
  'Senior/Open': '#64748b'
};

export const MemberManagement: React.FC<{
  onOpenRegister: () => void;
  onSelectStudentForEval?: (studentId: string) => void;
}> = ({ onOpenRegister, onSelectStudentForEval }) => {
  const { students, updateStudent, deleteStudent, currentRole, skillEvaluations, payments, attendanceRecords, organizationConfig } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStudentForView, setSelectedStudentForView] = useState<Student | null>(null);
  const [selectedStudentForIDCard, setSelectedStudentForIDCard] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editError, setEditError] = useState<string>('');
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.idCardNumber && student.idCardNumber.includes(searchQuery)) ||
      student.parentPhone.includes(searchQuery);

    const matchesCategory = selectedCategory === 'all' || student.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`คุณต้องการลบข้อมูลสมาชิก "${name}" หรือไม่?`)) {
      deleteStudent(id);
      if (selectedStudentForView?.id === id) setSelectedStudentForView(null);
    }
  };

  const handleStartEdit = (student: Student) => {
    setEditError('');
    setEditingStudent({ ...student });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setEditError('');

    if (!editingStudent.fullName.trim()) {
      setEditError('กรุณาระบุชื่อ-นามสกุลนักเรียน');
      return;
    }
    if (!editingStudent.nickname.trim()) {
      setEditError('กรุณาระบุชื่อเล่น');
      return;
    }

    if (!editingStudent.parentName.trim()) {
      setEditError('กรุณาระบุชื่อ-นามสกุล ผู้ปกครอง');
      return;
    }

    const parentDigits = cleanDigits(editingStudent.parentPhone);
    if (parentDigits.length !== 10 || !parentDigits.startsWith('0')) {
      setEditError(`เบอร์โทรศัพท์ผู้ปกครองต้องเป็น 10 หลักขึ้นต้นด้วย 0 (ปัจจุบันมี ${parentDigits.length} หลัก)`);
      return;
    }

    if (editingStudent.idCardNumber && cleanDigits(editingStudent.idCardNumber).length !== 13) {
      setEditError('เลขบัตรประชาชนนักเรียนต้องมีครบ 13 หลัก');
      return;
    }

    if (editingStudent.parentIdCardNumber && cleanDigits(editingStudent.parentIdCardNumber).length !== 13) {
      setEditError('เลขบัตรประชาชนผู้ปกครองต้องมีครบ 13 หลัก');
      return;
    }

    setIsSavingEdit(true);

    const chestVal = (editingStudent.jerseyChestCm !== undefined && editingStudent.jerseyChestCm !== null && String(editingStudent.jerseyChestCm).trim() !== '') 
      ? Number(editingStudent.jerseyChestCm) 
      : undefined;
    const lengthVal = (editingStudent.jerseyLengthCm !== undefined && editingStudent.jerseyLengthCm !== null && String(editingStudent.jerseyLengthCm).trim() !== '') 
      ? Number(editingStudent.jerseyLengthCm) 
      : undefined;

    const cleanedStudent: Student = {
      ...editingStudent,
      parentPhone: parentDigits,
      parentEmail: editingStudent.parentEmail ? editingStudent.parentEmail.trim().toLowerCase() : undefined,
      emergencyContactPhone: editingStudent.emergencyContactPhone ? cleanDigits(editingStudent.emergencyContactPhone) : '',
      idCardNumber: editingStudent.idCardNumber ? cleanDigits(editingStudent.idCardNumber) : undefined,
      parentIdCardNumber: editingStudent.parentIdCardNumber ? cleanDigits(editingStudent.parentIdCardNumber) : undefined,
      parentAvatarUrl: editingStudent.parentAvatarUrl ? editingStudent.parentAvatarUrl.trim() : undefined,
      avatarUrl: editingStudent.avatarUrl ? editingStudent.avatarUrl.trim() : undefined,
      jerseyChestCm: chestVal,
      jerseyLengthCm: lengthVal,
      jerseySize: editingStudent.jerseySize || (chestVal ? `รอบอก ${chestVal} ซม. / ยาว ${lengthVal || '-'} ซม.` : 'JM'),
      shoeSize: editingStudent.shoeSize?.trim() || undefined,
      parentLineId: editingStudent.parentLineId?.trim() || '',
      parentOccupation: editingStudent.parentOccupation?.trim() || '',
      address: editingStudent.address?.trim() || ''
    };

    try {
      const res = await updateStudent(editingStudent.id, cleanedStudent);
      if (!res.success) {
        setEditError(res.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลลงฐานข้อมูล Supabase');
        return;
      }
      if (selectedStudentForView?.id === editingStudent.id) {
        setSelectedStudentForView(cleanedStudent);
      }
      setEditingStudent(null);
      setSaveSuccessMsg(`บันทึกและอัปเดตข้อมูล ${cleanedStudent.fullName} ลงฐานข้อมูล Supabase สำเร็จเรียบร้อย!`);
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err: any) {
      setEditError(err?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {saveSuccessMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-700 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}
      
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">ระบบบริหารจัดการสมาชิก</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ข้อมูลสมาชิก ข้อมูลผู้ปกครอง และบัตรประจำตัว
          </p>
        </div>

        <button
          onClick={onOpenRegister}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 font-medium text-xs text-white rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>ลงทะเบียนสมาชิกใหม่</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative w-full md:flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาด้วยชื่อ, ชื่อเล่น, รหัส,  เลขบัตร "
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-slate-500 shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> รุ่น:
          </span>
          {['all', 'U-6', 'U-8'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'ทั้งหมด' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Student List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((student) => {
          const evalCount = skillEvaluations.filter(e => e.studentId === student.id).length;
          const studentAtts = attendanceRecords.filter(a => a.studentId === student.id);
          const presentAtts = studentAtts.filter(a => a.status === 'present' || a.status === 'late').length;
          const attRate = studentAtts.length > 0 ? Math.round((presentAtts / studentAtts.length) * 100) : 100;

          return (
            <div 
              key={student.id} 
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
            >
              <div className="p-4">
                
                {/* Card Top / Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={student.avatarUrl} 
                      alt={student.fullName}
                      className="w-13 h-13 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0" 
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold text-slate-400">{student.studentCode}</span>
                        <span 
                          className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs"
                          style={{ backgroundColor: AGE_COLORS[student.category] || '#3b82f6' }}
                        >
                          {student.category}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 mt-0.5">{student.fullName}</h3>
                      <div className="text-xs text-slate-500 font-medium">"{student.nickname}" • {student.preferredPosition}</div>
                    </div>
                  </div>
                </div>

                {/* Info Badges & Details */}
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">ผู้ปกครอง</span>
                    <span className="font-semibold text-slate-700 truncate block">{student.parentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">เบอร์โทร</span>
                    <span className="font-mono font-semibold text-slate-700 block">{formatPhone10(student.parentPhone)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">ขนาดเสื้อ</span>
                    <span className="font-semibold text-emerald-800 block">
                      {student.jerseyChestCm ? `อก ${student.jerseyChestCm} / ยาว ${student.jerseyLengthCm || '-'} ซม.` : student.jerseySize}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">การเข้าฝึกซ้อม</span>
                    <span className={`font-bold block ${attRate >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {attRate}% ({presentAtts}/{studentAtts.length} ครั้ง)
                    </span>
                  </div>
                </div>

                {student.idCardNumber && (
                  <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1 mb-2 px-1">
                    <CreditCard className="w-3 h-3 text-slate-400" />
                    <span>เลขบัตรประชาชน: {formatThaiIdCard(student.idCardNumber)}</span>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="bg-slate-50/80 px-4 py-2.5 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedStudentForView(student)}
                    className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    title="ดูรายละเอียดข้อมูลทั้งหมด"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>ข้อมูล</span>
                  </button>

                  <button
                    onClick={() => setSelectedStudentForIDCard(student)}
                    className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    title="พิมพ์บัตรประจำตัวสมาชิก"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>บัตร</span>
                  </button>
                </div>

                {currentRole === 'admin_staff' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(student)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="แก้ไขข้อมูล"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(student.id, student.fullName)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="ลบข้อมูล"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* STUDENT DETAIL MODAL */}
      {selectedStudentForView && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img 
                  src={selectedStudentForView.avatarUrl} 
                  alt={selectedStudentForView.fullName} 
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow shrink-0" 
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold">{selectedStudentForView.fullName}</h2>
                    <span className="px-2 py-0.5 rounded text-xs font-black bg-amber-400 text-slate-950">
                      {selectedStudentForView.category}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200 mt-0.5">
                    ชื่อเล่น: {selectedStudentForView.nickname} • รหัสสมาชิก: {selectedStudentForView.studentCode}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedStudentForView(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              
              {/* Medical & Physical Info */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-xs">
                  <HeartPulse className="w-4 h-4 text-rose-500" />
                  <span>ข้อมูลทางกายภาพ สุขภาพ และชุดฝึกซ้อม</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <span className="text-slate-500 block">อายุ / วันเกิด:</span>
                    <span className="font-bold text-slate-800">{selectedStudentForView.age} ปี ({selectedStudentForView.birthDate})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">ส่วนสูง / น้ำหนัก:</span>
                    <span className="font-bold text-slate-800">{selectedStudentForView.heightCm} ซม. / {selectedStudentForView.weightKg} กก.</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">กรุ๊ปเลือด:</span>
                    <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-block">{selectedStudentForView.bloodType || 'O'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">เลขบัตรประชาชน:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {selectedStudentForView.idCardNumber ? formatThaiIdCard(selectedStudentForView.idCardNumber) : 'ยังไม่ระบุ'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">ขนาดเสื้อ:</span>
                    <span className="font-bold text-emerald-800">
                      {selectedStudentForView.jerseyChestCm ? `อก ${selectedStudentForView.jerseyChestCm} ซม. / ยาว ${selectedStudentForView.jerseyLengthCm || '-'} ซม.` : selectedStudentForView.jerseySize}
                    </span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200 text-slate-700 flex flex-wrap justify-between gap-2">
                  <div>
                    <span className="font-semibold text-slate-500">โรงเรียน: </span>
                    <span>{selectedStudentForView.schoolName || '-'}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">โรคประจำตัว/แพ้ยา: </span>
                    <span className="text-rose-700 font-medium">{selectedStudentForView.medicalConditions || 'ไม่มี'}</span>
                  </div>
                </div>
              </div>

              {/* Parent & Emergency Contacts */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900 mb-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>ข้อมูลผู้ปกครอง</span>
                  </div>
                  {selectedStudentForView.parentAvatarUrl && (
                    <span className="text-[10px] text-emerald-600 font-semibold">มีรูปถ่าย</span>
                  )}
                </div>

                <div className="flex gap-4 items-start">
                  {selectedStudentForView.parentAvatarUrl && (
                    <img 
                      src={selectedStudentForView.parentAvatarUrl} 
                      alt={selectedStudentForView.parentName}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-300 shrink-0" 
                    />
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                    <div>
                      <span className="text-slate-500 block">ความสัมพันธ์ ({selectedStudentForView.parentRelationship}):</span>
                      <span className="font-bold text-slate-800">{selectedStudentForView.parentName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">เลขบัตรประชาชน:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {selectedStudentForView.parentIdCardNumber ? formatThaiIdCard(selectedStudentForView.parentIdCardNumber) : 'ยังไม่ระบุ'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">เบอร์โทรศัพท์:</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {formatPhone10(selectedStudentForView.parentPhone)} (LINE: {selectedStudentForView.parentLineId || '-'})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">อีเมล:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedStudentForView.parentEmail ? (
                          <span className="text-blue-700">{selectedStudentForView.parentEmail}</span>
                        ) : (
                          <span className="text-slate-400">ยังไม่ระบุ</span>
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">ผู้ติดต่อฉุกเฉิน:</span>
                      <span className="font-bold text-slate-800">
                        {selectedStudentForView.emergencyContactName} ({selectedStudentForView.emergencyContactPhone ? formatPhone10(selectedStudentForView.emergencyContactPhone) : '-'})
                      </span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-500 block">ที่อยู่:</span>
                      <span className="font-bold text-slate-800">{selectedStudentForView.address}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinic Terms Status */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-bold text-emerald-900">ยินยอมข้อตกลงคลีนิกฟุตบอลยะลาเรียบร้อย</div>
                    <div className="text-[11px] text-emerald-700">ลงชื่อโดย: {selectedStudentForView.signatureName || selectedStudentForView.parentName} ({selectedStudentForView.acceptedDate})</div>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg">สมบูรณ์</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    const st = selectedStudentForView;
                    setSelectedStudentForView(null);
                    setSelectedStudentForIDCard(st);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl flex items-center gap-1.5"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>ออกบัตรสมาชิกดิจิทัล</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* DIGITAL MEMBER ID CARD MODAL */}
      {selectedStudentForIDCard && (
        <AthleteCardModal 
          student={selectedStudentForIDCard}
          organizationConfig={organizationConfig}
          onClose={() => setSelectedStudentForIDCard(null)}
        />
      )}

      {/* EDIT STUDENT MODAL */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">แก้ไขข้อมูลสมาชิก & ผู้ปกครอง</h3>
                <p className="text-[11px] text-slate-400">รหัส: {editingStudent.studentCode} | {editingStudent.fullName}</p>
              </div>
              <button 
                type="button"
                onClick={() => setEditingStudent(null)} 
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
              {/* Photo Uploads for Student & Parent */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <PhotoUploadField
                  label="รูปถ่ายนักเรียน"
                  value={editingStudent.avatarUrl}
                  onChange={(url) => setEditingStudent({ ...editingStudent, avatarUrl: url })}
                />
                <PhotoUploadField
                  label="รูปถ่ายผู้ปกครอง"
                  value={editingStudent.parentAvatarUrl || ''}
                  onChange={(url) => setEditingStudent({ ...editingStudent, parentAvatarUrl: url })}
                />
              </div>

              {/* Section 1: ข้อมูลนักเรียน */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs border-b border-slate-200 pb-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>ข้อมูลส่วนตัวนักเรียน</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">ชื่อ-นามสกุล <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={editingStudent.fullName}
                      onChange={(e) => setEditingStudent({ ...editingStudent, fullName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">ชื่อเล่น <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={editingStudent.nickname}
                      onChange={(e) => setEditingStudent({ ...editingStudent, nickname: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">เลขบัตรประชาชน</label>
                    <input
                      type="text"
                      maxLength={17}
                      placeholder="1-9599-00123-45-1"
                      value={formatThaiIdCard(editingStudent.idCardNumber || '')}
                      onChange={(e) => setEditingStudent({ ...editingStudent, idCardNumber: cleanDigits(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg font-mono bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">รุ่นอายุ</label>
                    <select
                      value={editingStudent.category}
                      onChange={(e) => setEditingStudent({ ...editingStudent, category: e.target.value as AgeCategory })}
                      className="w-full px-3 py-2 border rounded-lg font-bold text-emerald-800 bg-white"
                    >
                      <option value="U-6">U-6 (อายุ 4 - 6 ปี)</option>
                      <option value="U-8">U-8 (อายุ 7 - 8 ปี)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">ตำแหน่งที่ถนัด</label>
                    <select
                      value={editingStudent.preferredPosition}
                      onChange={(e) => setEditingStudent({ ...editingStudent, preferredPosition: e.target.value as Position })}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    >
                      <option value="Forward (FW)">Forward (FW)</option>
                      <option value="Midfielder (MF)">Midfielder (MF)</option>
                      <option value="Defender (DF)">Defender (DF)</option>
                      <option value="Goalkeeper (GK)">Goalkeeper (GK)</option>
                      <option value="All-around (ทุกตำแหน่ง)">All-around (ทุกตำแหน่ง)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">เพศ</label>
                    <select
                      value={editingStudent.gender || 'male'}
                      onChange={(e) => setEditingStudent({ ...editingStudent, gender: e.target.value as 'male' | 'female' })}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    >
                      <option value="male">ชาย (Male)</option>
                      <option value="female">หญิง (Female)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">วัน/เดือน/ปีเกิด</label>
                    <input
                      type="date"
                      value={editingStudent.birthDate ? editingStudent.birthDate.split('T')[0] : ''}
                      onChange={(e) => {
                        const birth = e.target.value;
                        let age = editingStudent.age;
                        if (birth) {
                          const diff = Date.now() - new Date(birth).getTime();
                          age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)) || 0;
                        }
                        setEditingStudent({ ...editingStudent, birthDate: birth, age });
                      }}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">อายุ (ปี)</label>
                    <input
                      type="number"
                      value={editingStudent.age || 0}
                      onChange={(e) => setEditingStudent({ ...editingStudent, age: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">สถานะสมาชิก</label>
                    <select
                      value={editingStudent.status}
                      onChange={(e) => setEditingStudent({ ...editingStudent, status: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-lg bg-white font-medium text-emerald-700"
                    >
                      <option value="active">Active (กำลังเรียน)</option>
                      <option value="pending_approval">Pending (รออนุมัติ)</option>
                      <option value="leave">Leave (พักการเรียน)</option>
                      <option value="graduated">Graduated (จบหลักสูตร)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">โรงเรียนที่ศึกษา</label>
                    <input
                      type="text"
                      value={editingStudent.schoolName}
                      onChange={(e) => setEditingStudent({ ...editingStudent, schoolName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">ส่วนสูง (ซม.)</label>
                    <input
                      type="number"
                      value={editingStudent.heightCm || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, heightCm: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                      placeholder="เช่น 115"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">น้ำหนัก (กก.)</label>
                    <input
                      type="number"
                      value={editingStudent.weightKg || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, weightKg: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                      placeholder="เช่น 20"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">กรุ๊ปเลือด</label>
                    <select
                      value={editingStudent.bloodType || 'O'}
                      onChange={(e) => setEditingStudent({ ...editingStudent, bloodType: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="AB">AB</option>
                      <option value="O">O</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">โรคประจำตัว / ข้อควรระวังทางการแพทย์</label>
                    <input
                      type="text"
                      value={editingStudent.medicalConditions || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, medicalConditions: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                      placeholder="เช่น ไม่มี หรือ แพ้อาหารทะเล"
                    />
                  </div>
                </div>

                {/* Jersey Dimensions & Shoe */}
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2 mt-2">
                  <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <Shirt className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ขนาดเสื้อและรองเท้า</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">รอบอกเสื้อ (ซม.)</label>
                      <input
                        type="number"
                        min="40"
                        max="150"
                        value={editingStudent.jerseyChestCm !== undefined && editingStudent.jerseyChestCm !== null ? editingStudent.jerseyChestCm : ''}
                        onChange={(e) => {
                          const val = e.target.value !== '' ? Number(e.target.value) : undefined;
                          const currentLength = editingStudent.jerseyLengthCm;
                          setEditingStudent({ 
                            ...editingStudent, 
                            jerseyChestCm: val,
                            jerseySize: val ? `รอบอก ${val} ซม. / ยาว ${currentLength || '-'} ซม.` : editingStudent.jerseySize
                          });
                        }}
                        className="w-full px-3 py-1.5 border rounded-lg bg-white"
                        placeholder="เช่น 72"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">ความยาวเสื้อ (ซม.)</label>
                      <input
                        type="number"
                        min="30"
                        max="120"
                        value={editingStudent.jerseyLengthCm !== undefined && editingStudent.jerseyLengthCm !== null ? editingStudent.jerseyLengthCm : ''}
                        onChange={(e) => {
                          const val = e.target.value !== '' ? Number(e.target.value) : undefined;
                          const currentChest = editingStudent.jerseyChestCm;
                          setEditingStudent({ 
                            ...editingStudent, 
                            jerseyLengthCm: val,
                            jerseySize: currentChest ? `รอบอก ${currentChest} ซม. / ยาว ${val || '-'} ซม.` : editingStudent.jerseySize
                          });
                        }}
                        className="w-full px-3 py-1.5 border rounded-lg bg-white"
                        placeholder="เช่น 51"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">เบอร์รองเท้า (Shoe Size / EU)</label>
                      <input
                        type="text"
                        value={editingStudent.shoeSize || ''}
                        onChange={(e) => setEditingStudent({ ...editingStudent, shoeSize: e.target.value })}
                        className="w-full px-3 py-1.5 border rounded-lg bg-white"
                        placeholder="เช่น EU 32 หรือ 20.5 cm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: ข้อมูลผู้ปกครอง */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs border-b border-slate-200 pb-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>ข้อมูลผู้ปกครอง</span>
                </div>

                {/* Parent Avatar Upload Field */}
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <PhotoUploadField
                    label="รูปถ่ายผู้ปกครอง"
                    value={editingStudent.parentAvatarUrl || ''}
                    onChange={(url) => setEditingStudent({ ...editingStudent, parentAvatarUrl: url })}
                    helperText="อัปโหลดรูปภาพผู้ปกครองสำหรับระบุตัวตนและบัตรสมาชิกดิจิทัล"
                    placeholder="คลิกเพื่ออัปโหลด หรือลากไฟล์ภาพผู้ปกครองมาวางที่นี่"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">ชื่อ-นามสกุล<span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={editingStudent.parentName}
                      onChange={(e) => setEditingStudent({ ...editingStudent, parentName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">ความสัมพันธ์กับนักกีฬา</label>
                    <select
                      value={editingStudent.parentRelationship || 'บิดา'}
                      onChange={(e) => setEditingStudent({ ...editingStudent, parentRelationship: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    >
                      <option value="บิดา">บิดา</option>
                      <option value="มารดา">มารดา</option>
                      <option value="ผู้ปกครอง">ผู้ปกครอง</option>
                      <option value="ญาติ">ญาติ / อื่นๆ</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">เลขบัตรประชาชน</label>
                    <input
                      type="text"
                      maxLength={17}
                      placeholder="3-9599-00234-56-1"
                      value={formatThaiIdCard(editingStudent.parentIdCardNumber || '')}
                      onChange={(e) => setEditingStudent({ ...editingStudent, parentIdCardNumber: cleanDigits(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg font-mono bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      เบอร์โทรศัพท์<span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={12}
                      placeholder="081-234-5678"
                      value={formatPhone10(editingStudent.parentPhone)}
                      onChange={(e) => setEditingStudent({ ...editingStudent, parentPhone: cleanDigits(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg font-mono bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">อีเมล</label>
                    <input
                      type="email"
                      value={editingStudent.parentEmail || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, parentEmail: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                      placeholder="parent@example.com"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">LINE ID ผู้ปกครอง</label>
                    <input
                      type="text"
                      value={editingStudent.parentLineId || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, parentLineId: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                      placeholder="Line ID"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">อาชีพ</label>
                    <input
                      type="text"
                      value={editingStudent.parentOccupation || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, parentOccupation: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                      placeholder="เช่น ข้าราชการ, ค้าขาย"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block font-semibold text-slate-700 mb-1">ที่อยู่ปัจจุบัน</label>
                    <textarea
                      rows={2}
                      value={editingStudent.address || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, address: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                      placeholder="ที่อยู่ อ.เมือง จ.ยะลา"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">ชื่อผู้ติดต่อฉุกเฉิน</label>
                    <input
                      type="text"
                      value={editingStudent.emergencyContactName || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, emergencyContactName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                      placeholder="ชื่อผู้ติดต่อฉุกเฉิน"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์ติดต่อฉุกเฉิน</label>
                    <input
                      type="tel"
                      maxLength={12}
                      value={formatPhone10(editingStudent.emergencyContactPhone || '')}
                      onChange={(e) => setEditingStudent({ ...editingStudent, emergencyContactPhone: cleanDigits(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg font-mono bg-white"
                      placeholder="081-xxx-xxxx"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  disabled={isSavingEdit}
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 border rounded-xl hover:bg-slate-50 transition-all text-slate-700"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow flex items-center gap-2 transition-all"
                >
                  {isSavingEdit ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>กำลังบันทึกและอัปเดตลง Supabase...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>บันทึกการแก้ไข</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
