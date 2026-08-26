import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student, PaymentTransaction, AttendanceRecord, SkillEvaluation, AgeCategory } from '../../types';
import { 
  Users, 
  Award, 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  HeartPulse, 
  Shirt, 
  Phone, 
  QrCode, 
  Upload, 
  FileText, 
  Eye, 
  Trophy, 
  Printer, 
  ChevronRight,
  ShieldCheck,
  Zap,
  DollarSign,
  Brain,
  Flame,
  Sparkles,
  Building2,
  X
} from 'lucide-react';
import { formatPhone10, formatThaiIdCard } from '../../utils/validation';

export const MemberPortal: React.FC<{
  onNavigateTab: (tab: string, extraParam?: string) => void;
  onOpenRegister?: () => void;
}> = ({ onNavigateTab, onOpenRegister }) => {
  const { 
    currentRole, 
    students, 
    selectedStudentIdForParent, 
    setSelectedStudentIdForParent,
    coaches,
    selectedCoachIdForCoach,
    setSelectedCoachIdForCoach,
    schedules,
    attendanceRecords,
    payments,
    skillEvaluations,
    bankAccountConfig,
    updatePaymentStatus
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'payments' | 'attendance' | 'skills' | 'terms'>('overview');
  const [selectedPaymentForPay, setSelectedPaymentForPay] = useState<PaymentTransaction | null>(null);
  const [paySlipFile, setPaySlipFile] = useState<string>('');
  const [paySuccessMessage, setPaySuccessMessage] = useState<string>('');

  // Find active student
  const activeStudent = students.find(s => s.id === selectedStudentIdForParent) || students[0];
  // Find active coach
  const activeCoach = coaches.find(c => c.id === selectedCoachIdForCoach) || coaches[0];

  // Student specific data
  const studentPayments = activeStudent ? payments.filter(p => p.studentId === activeStudent.id) : [];
  const studentAttendance = activeStudent ? attendanceRecords.filter(a => a.studentId === activeStudent.id) : [];
  const studentEvaluations = activeStudent ? skillEvaluations.filter(e => e.studentId === activeStudent.id) : [];
  const latestEvaluation = studentEvaluations.length > 0 ? studentEvaluations[studentEvaluations.length - 1] : null;

  const presentCount = studentAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const attendanceRate = studentAttendance.length > 0 ? Math.round((presentCount / studentAttendance.length) * 100) : 100;
  const pendingPayments = studentPayments.filter(p => p.status === 'pending' || p.status === 'overdue');

  // Slip & Receipt preview modal states
  const [viewingSlipUrl, setViewingSlipUrl] = useState<string | null>(null);
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<PaymentTransaction | null>(null);

  // Handle Pay submit
  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentForPay) return;

    const payerName = activeStudent?.parentName 
      ? `${activeStudent.parentName} (ผู้ปกครอง - ระบบออนไลน์)` 
      : 'ผู้ปกครอง (ระบบออนไลน์)';

    // Fallback simulated slip image if none selected
    const finalSlipUrl = paySlipFile || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400';

    updatePaymentStatus(
      selectedPaymentForPay.id, 
      'paid', 
      'bank_transfer', 
      payerName,
      finalSlipUrl
    );

    setPaySuccessMessage(`แจ้งชำระเงินรายการ ${selectedPaymentForPay.title} เรียบร้อยแล้ว! แนบสลิปสำเร็จ`);
    setSelectedPaymentForPay(null);
    setPaySlipFile('');
    setTimeout(() => setPaySuccessMessage(''), 4000);
  };

  // If role is Coach
  if (currentRole === 'coach' && activeCoach) {
    const coachSchedules = schedules.filter(s => 
      s.headCoachId === activeCoach.id || 
      (s.assistantCoachIds && s.assistantCoachIds.includes(activeCoach.id)) ||
      s.category.some(cat => activeCoach.assignedCategories.includes(cat))
    );

    return (
      <div className="space-y-6 pb-12">
        {/* Coach Header */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-emerald-800/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <img 
              src={activeCoach.avatarUrl} 
              alt={activeCoach.fullName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400 shadow-md shrink-0" 
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500 text-slate-950">
                  {activeCoach.license}
                </span>
                <span className="text-xs font-mono text-emerald-300">{activeCoach.coachCode}</span>
              </div>
              <h1 className="text-xl font-bold mt-1">ยินดีต้อนรับ {activeCoach.fullName} (โค้ช{activeCoach.nickname})</h1>
              <p className="text-xs text-slate-300">
                ตำแหน่ง: {activeCoach.role === 'head_coach' ? 'หัวหน้าผู้ฝึกสอน' : 'ผู้ช่วยผู้ฝึกสอน'} • รุ่นที่ดูแล: {activeCoach.assignedCategories.join(', ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-300">สลับโปรไฟล์โค้ช:</label>
            <select
              value={selectedCoachIdForCoach}
              onChange={(e) => setSelectedCoachIdForCoach(e.target.value)}
              className="bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none"
            >
              {coaches.map(c => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.nickname})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Coach Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">ตารางฝึกซ้อมในความรับผิดชอบ</div>
              <div className="text-lg font-bold text-slate-900">{coachSchedules.length} คลาส</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">นักเรียนในรุ่นที่ดูแล</div>
              <div className="text-lg font-bold text-slate-900">
                {students.filter(s => activeCoach.assignedCategories.includes(s.category)).length} คน
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">ประเมินทักษะสะสม</div>
              <div className="text-lg font-bold text-slate-900">
                {skillEvaluations.filter(e => e.coachId === activeCoach.id).length} ครั้ง
              </div>
            </div>
          </div>
        </div>

        {/* Coach Schedules Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>คลาสฝึกซ้อมของโค้ช {activeCoach.nickname}</span>
            </h2>
            <button
              onClick={() => onNavigateTab('attendance')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>ไปที่ระบบเช็คชื่อทั้งหมด</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {coachSchedules.map(sch => (
              <div key={sch.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-slate-50 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
                      {sch.category.join(', ')}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900">{sch.topic}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {sch.date} ({sch.startTime} - {sch.endTime}) • สถานที่: {sch.venue}
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => onNavigateTab('attendance', sch.id)}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>เช็คชื่อฝึกซ้อม</span>
                  </button>
                  <button
                    onClick={() => onNavigateTab('skills')}
                    className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs rounded-xl"
                  >
                    ประเมินทักษะ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Student / Parent Portal View
  if (!activeStudent) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4">
        <Users className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-base font-bold text-slate-800">ยังไม่พบข้อมูลนักเรียนในระบบ</h2>
        <p className="text-xs text-slate-500">กรุณาลงทะเบียนสมาชิกใหม่เพื่อเข้าใช้งาน Portal</p>
        {onOpenRegister && (
          <button
            onClick={onOpenRegister}
            className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow"
          >
            ลงทะเบียนสมาชิก
          </button>
        )}
      </div>
    );
  }

  const evalCoach = latestEvaluation ? coaches.find(c => c.id === latestEvaluation.coachId) : null;

  return (
    <div className="space-y-6 pb-12">
      
      {paySuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{paySuccessMessage}</span>
        </div>
      )}

      {/* Student Profile Overview Header */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-emerald-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div className="flex items-center gap-4">
          <img 
            src={activeStudent.avatarUrl} 
            alt={activeStudent.fullName}
            className="w-18 h-18 rounded-2xl object-cover border-2 border-amber-400 shadow-md shrink-0" 
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-black bg-amber-400 text-slate-950 shadow-xs">
                {activeStudent.category}
              </span>
              <span className="text-xs font-mono text-emerald-200 font-bold">{activeStudent.studentCode}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black mt-1 text-white">
              {activeStudent.fullName} <span className="text-amber-300 font-normal text-base">("{activeStudent.nickname}")</span>
            </h1>
            <div className="text-xs text-emerald-100 flex flex-wrap items-center gap-y-1 gap-x-3 mt-1">
              <span>ตำแหน่ง: {activeStudent.preferredPosition}</span>
              <span>•</span>
              <span>ขนาดเสื้อ: {activeStudent.jerseyChestCm ? `อก ${activeStudent.jerseyChestCm} / ยาว ${activeStudent.jerseyLengthCm || '-'} ซม.` : activeStudent.jerseySize}</span>
              <span>•</span>
              <span>ผู้ปกครอง: {activeStudent.parentName} ({formatPhone10(activeStudent.parentPhone)})</span>
            </div>
          </div>
        </div>

        {/* Student Switcher for multi-children parents */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <div className="bg-white/10 backdrop-blur-xs px-3 py-2 rounded-xl border border-white/20 text-xs">
            <span className="text-emerald-200 block text-[10px]">สลับโปรไฟล์นักเรียน:</span>
            <select
              value={selectedStudentIdForParent}
              onChange={(e) => setSelectedStudentIdForParent(e.target.value)}
              className="bg-transparent text-white font-bold text-xs focus:outline-none w-full cursor-pointer"
            >
              {students.map(s => (
                <option key={s.id} value={s.id} className="text-slate-900">
                  {s.nickname} ({s.fullName.split(' ')[0]}) - {s.category}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => onNavigateTab('members')}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>บัตรประจำตัว</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
        {[
          { id: 'overview', label: 'ภาพรวม & กิจกรรม', icon: Users },
          { id: 'payments', label: `การเงิน & ค่าเล่าเรียน (${pendingPayments.length > 0 ? `ค้าง ${pendingPayments.length}` : 'เรียบร้อย'})`, icon: CreditCard, alert: pendingPayments.length > 0 },
          { id: 'attendance', label: `เวลาเรียน (${attendanceRate}%)`, icon: Calendar },
          { id: 'skills', label: 'ผลประเมินทักษะ 4 ด้านหลัก', icon: Trophy },
          { id: 'terms', label: 'ระเบียบ & ข้อตกลงคลีนิก', icon: ShieldCheck }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.alert && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Payment Status Card */}
            <div className={`p-5 rounded-2xl border shadow-xs flex flex-col justify-between ${
              pendingPayments.length > 0 
                ? 'bg-amber-50/70 border-amber-200 text-amber-950' 
                : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">สถานะค่าเล่าเรียน</span>
                <CreditCard className="w-5 h-5 text-amber-600" />
              </div>
              <div className="my-2">
                <div className="text-2xl font-black">
                  {pendingPayments.length > 0 ? `มียอดค้าง ${pendingPayments.length} รายการ` : 'ชำระครบถ้วน'}
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  {pendingPayments.length > 0 ? `ยอดรวม ฿${pendingPayments.reduce((acc, p) => acc + p.amount, 0).toLocaleString()}` : 'ไม่มีค้างชำระ'}
                </div>
              </div>
              {pendingPayments.length > 0 ? (
                <button
                  onClick={() => setActiveSubTab('payments')}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors text-center"
                >
                  ชำระเงินทันที
                </button>
              ) : (
                <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> ประวัติชำระปกติ
                </div>
              )}
            </div>

            {/* Attendance Rate Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">อัตราการเข้าฝึกซ้อม</span>
                <Calendar className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="my-2">
                <div className="text-2xl font-black text-slate-900">{attendanceRate}%</div>
                <div className="text-xs text-slate-500 mt-0.5">เข้าซ้อม {presentCount} จาก {studentAttendance.length} ครั้ง</div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${attendanceRate}%` }}></div>
              </div>
            </div>

            {/* Skill Level Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">คะแนนทักษะโดยรวม</span>
                <Trophy className="w-5 h-5 text-amber-500" />
              </div>
              <div className="my-2">
                <div className="text-2xl font-black text-slate-900">
                  {latestEvaluation ? `${latestEvaluation.overallScore} / 100 (${latestEvaluation.overallGrade})` : 'รอประเมิน'}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {latestEvaluation ? `ประเมินรอบ: ${latestEvaluation.termPeriod}` : 'รอบประเมินถัดไปเร็วๆ นี้'}
                </div>
              </div>
              <button
                onClick={() => setActiveSubTab('skills')}
                className="text-xs font-bold text-emerald-700 hover:underline text-left flex items-center gap-1"
              >
                <span>ดูรายละเอียดทักษะ 5 ด้าน</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Student Profile Card Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>ข้อมูลประจำตัวนักกีฬา & เอกสารผู้ปกครอง</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="font-bold text-slate-800">ข้อมูลนักเรียน</div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>วันเกิด/อายุ: <span className="font-semibold text-slate-900">{activeStudent.birthDate} ({activeStudent.age} ปี)</span></div>
                  <div>กรุ๊ปเลือด: <span className="font-semibold text-slate-900">{activeStudent.bloodType || 'ไม่ระบุ'}</span></div>
                  <div>ส่วนสูง / น้ำหนัก: <span className="font-semibold text-slate-900">{activeStudent.heightCm} ซม. / {activeStudent.weightKg} กก.</span></div>
                  <div>เลขบัตร ปชช.: <span className="font-mono font-semibold text-slate-900">{activeStudent.idCardNumber ? formatThaiIdCard(activeStudent.idCardNumber) : 'ยังไม่ระบุ'}</span></div>
                  <div className="col-span-2">โรงเรียน: <span className="font-semibold text-slate-900">{activeStudent.schoolName || '-'}</span></div>
                  <div className="col-span-2">โรคประจำตัว/แพ้ยา: <span className="font-semibold text-rose-700">{activeStudent.medicalConditions || 'ไม่มี'}</span></div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="font-bold text-slate-800">ข้อมูลผู้ปกครองและติดต่อฉุกเฉิน</div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>ผู้ปกครอง: <span className="font-semibold text-slate-900">{activeStudent.parentName} ({activeStudent.parentRelationship})</span></div>
                  <div>เบอร์โทรศัพท์: <span className="font-mono font-semibold text-emerald-700">{formatPhone10(activeStudent.parentPhone)}</span></div>
                  <div>เลขบัตร ปชช. ผู้ปกครอง: <span className="font-mono font-semibold text-slate-900">{activeStudent.parentIdCardNumber ? formatThaiIdCard(activeStudent.parentIdCardNumber) : 'ยังไม่ระบุ'}</span></div>
                  <div>อีเมล: <span className="font-semibold text-slate-900">{activeStudent.parentEmail || '-'}</span></div>
                  <div>LINE ID: <span className="font-semibold text-slate-900">{activeStudent.parentLineId || '-'}</span></div>
                  <div>อาชีพ: <span className="font-semibold text-slate-900">{activeStudent.parentOccupation || '-'}</span></div>
                  <div className="col-span-2">ติดต่อฉุกเฉิน: <span className="font-semibold text-slate-900">{activeStudent.emergencyContactName} ({activeStudent.emergencyContactPhone ? formatPhone10(activeStudent.emergencyContactPhone) : '-'})</span></div>
                  <div className="col-span-2">ที่อยู่: <span className="font-semibold text-slate-900">{activeStudent.address}</span></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT: PAYMENTS */}
      {activeSubTab === 'payments' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">ประวัติค่าเล่าเรียนและการชำระเงิน</h2>
              <p className="text-xs text-slate-500">จัดการใบแจ้งหนี้ สแกนจ่าย QR Code บัญชีคลีนิก และดูใบเสร็จรับเงิน</p>
            </div>
            
            {/* Clinic Bank Info Mini Box */}
            <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 text-xs">
              <div className="font-bold text-emerald-950">{bankAccountConfig.bankName} - {bankAccountConfig.accountName}</div>
              <div className="font-mono font-bold text-emerald-700">{bankAccountConfig.accountNumber}</div>
            </div>
          </div>

          {/* Payment List */}
          <div className="space-y-3">
            {studentPayments.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                ไม่มีรายการชำระเงิน
              </div>
            ) : (
              studentPayments.map(p => {
                const isPaid = p.status === 'paid';
                return (
                  <div key={p.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isPaid ? 'ชำระแล้ว' : 'รอชำระเงิน'}
                        </span>
                        <span className="font-mono text-xs text-slate-400">{p.receiptNumber}</span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 mt-1">{p.title}</h3>
                      <p className="text-xs text-slate-500">
                        ครบกำหนด: {p.dueDate} {p.paidDate && `• ชำระเมื่อ: ${p.paidDate}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-base font-black text-slate-900">฿{p.amount.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-400">{p.category}</div>
                      </div>

                      {!isPaid ? (
                        <button
                          onClick={() => setSelectedPaymentForPay(p)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <QrCode className="w-4 h-4" />
                          <span>ชำระเงิน</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          {p.slipUrl && (
                            <button
                              onClick={() => setViewingSlipUrl(p.slipUrl || null)}
                              className="px-2.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-xl flex items-center gap-1 border border-emerald-200 cursor-pointer"
                              title="ดูหลักฐานสลิปการโอนเงิน"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">ดูสลิป</span>
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedPaymentForReceipt(p)}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>ดูใบเสร็จ</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: ATTENDANCE */}
      {activeSubTab === 'attendance' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">ประวัติการเข้าฝึกซ้อม</h2>
              <p className="text-xs text-slate-500">บันทึกเวลาเรียนและการฝึกซ้อมภาคสนาม</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-emerald-600">{attendanceRate}%</div>
              <div className="text-[10px] text-slate-400">อัตราการเข้าซ้อม</div>
            </div>
          </div>

          <div className="space-y-2">
            {studentAttendance.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                ยังไม่มีประวัติการเช็คชื่อ
              </div>
            ) : (
              studentAttendance.map(att => {
                const sch = schedules.find(s => s.id === att.scheduleId);
                return (
                  <div key={att.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{sch ? sch.topic : `ฝึกซ้อม (${att.date})`}</div>
                      <div className="text-[11px] text-slate-500">
                        วันที่: {att.date} {att.checkInTime && `• เวลา: ${att.checkInTime}`} {sch && `• สถานที่: ${sch.venue}`}
                      </div>
                      {att.notes && <div className="text-[11px] text-slate-600 mt-0.5 italic">{att.notes}</div>}
                    </div>

                    <div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        att.status === 'present' ? 'bg-emerald-100 text-emerald-800' :
                        att.status === 'late' ? 'bg-amber-100 text-amber-800' :
                        att.status === 'sick' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {att.status === 'present' ? 'มาซ้อม' : att.status === 'late' ? 'มาสาย' : att.status === 'sick' ? 'ลาป่วย' : 'ขาดซ้อม'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: SKILLS */}
      {activeSubTab === 'skills' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-base font-bold text-slate-900">ผลการประเมินทักษะ 5 ด้านหลัก (FA Grassroots & AFC 5-Pillar Standard)</h2>
            <p className="text-xs text-slate-500 mt-1">1. Technical (เทคนิค), 2. Tactical (แท็กติก), 3. Physical (กายภาพ), 4. Psychological (จิตวิทยา), 5. Social & Teamwork (สังคมและวินัย)</p>
          </div>

          {studentEvaluations.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
              ยังไม่มีการประเมินทักษะสำหรับนักกีฬาคนนี้
            </div>
          ) : (
            studentEvaluations.map(evalItem => {
              const coach = coaches.find(c => c.id === evalItem.coachId);
              const psychScore = evalItem.skills.psychological?.average ?? evalItem.skills.mentalSocial?.average ?? 8.5;
              const socScore = evalItem.skills.social?.average ?? evalItem.skills.mentalSocial?.average ?? 8.5;

              return (
                <div key={evalItem.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-xs font-bold text-slate-400">รอบการประเมิน: {evalItem.termPeriod} ({evalItem.evaluationDate})</span>
                      <h3 className="font-bold text-sm text-slate-900">ผู้ประเมิน: {coach ? coach.fullName : 'โค้ชประจำคลีนิก'}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-emerald-600">{evalItem.overallScore}</span>
                      <span className="text-xs text-slate-400"> / 100 (เกรด {evalItem.overallGrade})</span>
                    </div>
                  </div>

                  {/* 5 Pillars Progress Bars */}
                  <div className="space-y-3 text-xs">
                    {/* 1. Technical */}
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="flex items-center gap-1.5 text-amber-900 font-bold">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          1. ทักษะเทคนิคฟุตบอล (Technical): {evalItem.skills.technical.average} / 10
                        </span>
                        <span className="text-slate-500 text-[11px]">การจับ บอลแรก เลี้ยง ส่ง ยิง และโหม่ง</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5">
                        <div className="bg-amber-500 h-2.5 rounded-full transition-all" style={{ width: `${evalItem.skills.technical.average * 10}%` }}></div>
                      </div>
                    </div>

                    {/* 2. Tactical */}
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="flex items-center gap-1.5 text-blue-900 font-bold">
                          <Brain className="w-3.5 h-3.5 text-blue-500" />
                          2. ความเข้าใจทางแท็กติก (Tactical): {evalItem.skills.tactical.average} / 10
                        </span>
                        <span className="text-slate-500 text-[11px]">การตัดสินใจ ยืนตำแหน่ง และวิสัยทัศน์</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5">
                        <div className="bg-blue-500 h-2.5 rounded-full transition-all" style={{ width: `${evalItem.skills.tactical.average * 10}%` }}></div>
                      </div>
                    </div>

                    {/* 3. Physical */}
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="flex items-center gap-1.5 text-rose-900 font-bold">
                          <Flame className="w-3.5 h-3.5 text-rose-500" />
                          3. สมรรถภาพร่างกาย (Physical): {evalItem.skills.physical.average} / 10
                        </span>
                        <span className="text-slate-500 text-[11px]">ความเร็ว สปีด คล่องตัว ความอึด แข็งแกร่ง</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5">
                        <div className="bg-rose-500 h-2.5 rounded-full transition-all" style={{ width: `${evalItem.skills.physical.average * 10}%` }}></div>
                      </div>
                    </div>

                    {/* 4. Psychological */}
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="flex items-center gap-1.5 text-purple-900 font-bold">
                          <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                          4. สภาพจิตวิทยาและความมั่นใจ (Psychological): {psychScore} / 10
                        </span>
                        <span className="text-slate-500 text-[11px]">สมาธิ ความมั่นใจ ความมุ่งมั่น และคุมอารมณ์</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5">
                        <div className="bg-purple-500 h-2.5 rounded-full transition-all" style={{ width: `${psychScore * 10}%` }}></div>
                      </div>
                    </div>

                    {/* 5. Social */}
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="flex items-center gap-1.5 text-emerald-900 font-bold">
                          <Users className="w-3.5 h-3.5 text-emerald-500" />
                          5. สังคม วินัย และทีมเวิร์ก (Social & Teamwork): {socScore} / 10
                        </span>
                        <span className="text-slate-500 text-[11px]">ตรงต่อเวลา วินัย สื่อสาร และน้ำใจนักกีฬา</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5">
                        <div className="bg-emerald-500 h-2.5 rounded-full transition-all" style={{ width: `${socScore * 10}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {evalItem.coachFeedback && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                      <span className="font-bold text-slate-900 block mb-0.5">ข้อเสนอแนะจากโค้ช:</span>
                      {evalItem.coachFeedback}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB CONTENT: TERMS */}
      {activeSubTab === 'terms' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b">
            <div>
              <h2 className="text-base font-bold text-slate-900">ระเบียบและข้อตกลงคลีนิกฟุตบอลยะลา</h2>
              <p className="text-slate-500">สถานะความยินยอมและข้อบังคับในการเข้าร่วมฝึกซ้อม</p>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> ยินยอมเรียบร้อย
            </span>
          </div>

          <div className="space-y-3 text-slate-600 leading-relaxed">
            <p>
              ผู้ปกครอง <strong>{activeStudent.parentName}</strong> ได้ลงชื่อยินยอมให้นักกีฬา <strong>{activeStudent.fullName}</strong> เข้าร่วมการฝึกสอนฟุตบอล ณ คลีนิกฟุตบอลยะลา
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <div>วันที่ยินยอม: <span className="font-bold text-slate-900">{activeStudent.acceptedDate}</span></div>
              <div>ชื่อผู้ลงนาม: <span className="font-bold text-slate-900">{activeStudent.signatureName || activeStudent.parentName}</span></div>
              <div>เลขบัตร ปชช. ผู้ปกครอง: <span className="font-mono font-bold text-slate-900">{activeStudent.parentIdCardNumber ? formatThaiIdCard(activeStudent.parentIdCardNumber) : '-'}</span></div>
            </div>
            <button
              onClick={() => onNavigateTab('terms')}
              className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>อ่านระเบียบข้อบังคับและกฎระเบียบฉบับเต็ม</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* QR CODE PAYMENT MODAL */}
      {selectedPaymentForPay && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <div>
                <h3 className="font-bold text-sm text-slate-900">ชำระเงินค่าเล่าเรียน</h3>
                <p className="text-[11px] text-slate-500">{selectedPaymentForPay.title}</p>
              </div>
              <button onClick={() => setSelectedPaymentForPay(null)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            {/* QR PromptPay Display */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-2">
              <div className="font-black text-xl text-emerald-700">฿{selectedPaymentForPay.amount.toLocaleString()}</div>
              
              <div className="bg-white p-3 rounded-xl border border-slate-200 inline-block shadow-xs mx-auto">
                <img 
                  src={bankAccountConfig.qrCodeUrl} 
                  alt="QR PromptPay" 
                  className="w-44 h-44 object-contain mx-auto"
                />
              </div>

              <div className="text-xs text-slate-700">
                <div className="font-bold">{bankAccountConfig.bankName} • {bankAccountConfig.accountName}</div>
                <div className="font-mono text-emerald-800 font-bold">{bankAccountConfig.accountNumber}</div>
                {bankAccountConfig.promptPayNumber && (
                  <div className="text-[11px] text-slate-500">พร้อมเพย์: {bankAccountConfig.promptPayNumber}</div>
                )}
              </div>
            </div>

            {/* Slip Upload & Confirm Form */}
            <form onSubmit={handleConfirmPayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">แนบรูปสลิปการโอนเงิน (จำลอง/อัปโหลด)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => setPaySlipFile(ev.target?.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                  />
                </div>
                {paySlipFile && (
                  <div className="mt-2 p-2 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={paySlipFile} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-emerald-300" />
                      <span className="text-[11px] font-semibold text-emerald-800">แนบรูปสลิปแล้ว พร้อมส่งข้อมูล</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPaySlipFile('')}
                      className="text-[11px] text-red-600 hover:text-red-800 font-semibold cursor-pointer"
                    >
                      ลบรูป
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPaymentForPay(null);
                    setPaySlipFile('');
                  }}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow cursor-pointer"
                >
                  ยืนยันการชำระเงิน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW SLIP LIGHTBOX MODAL */}
      {viewingSlipUrl && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 shadow-2xl space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>หลักฐานสลิปการโอนเงิน</span>
              </h3>
              <button 
                onClick={() => setViewingSlipUrl(null)} 
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-2 border border-slate-200 flex items-center justify-center max-h-[60vh] overflow-hidden">
              <img 
                src={viewingSlipUrl} 
                alt="Payment Slip Proof" 
                className="max-h-[55vh] w-auto object-contain rounded-lg shadow-xs" 
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setViewingSlipUrl(null)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ELECTRONIC RECEIPT PREVIEW MODAL (E-RECEIPT) */}
      {selectedPaymentForReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 my-8">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">ใบเสร็จรับเงินอิเล็กทรอนิกส์ (E-Receipt)</h3>
                  <p className="text-[11px] text-slate-500">คลีนิกฟุตบอลยะลา • Yala Football Clinic</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPaymentForReceipt(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Receipt Canvas */}
            <div id="printable-member-receipt" className="border-2 border-dashed border-slate-300 rounded-2xl p-6 bg-slate-50/50 space-y-4 text-xs text-slate-700">
              
              {/* Receipt Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">คลีนิกฟุตบอลยะลา</h2>
                  <div className="text-[11px] text-slate-500">YALA FOOTBALL CLINIC & ACADEMY</div>
                  <div className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                    สนามหญ้าเทียมยะลา สเตเดียม อ.เมือง จ.ยะลา 95000<br />
                    เลขประจำตัวผู้เสียภาษี: 0-9555-69001-23-4 | โทร: 081-456-7890
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-black text-sm text-emerald-800">ใบเสร็จรับเงิน</div>
                  <div className="text-[11px] font-mono font-bold text-slate-900">{selectedPaymentForReceipt.receiptNumber}</div>
                  <div className="text-[10px] text-slate-500 mt-1">วันที่ชำระ: {selectedPaymentForReceipt.paidDate || 'ชำระแล้ว'}</div>
                </div>
              </div>

              {/* Student & Payer Info */}
              {(() => {
                const st = students.find(s => s.id === selectedPaymentForReceipt.studentId) || activeStudent;
                return st ? (
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 block">ชื่อนักเรียน:</span>
                      <span className="font-bold text-slate-900">{st.fullName} ({st.nickname})</span>
                      <span className="text-[10px] text-slate-400 block font-mono">รหัส: {st.studentCode} | รุ่น: {st.category}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">ผู้ชำระเงิน (ผู้ปกครอง):</span>
                      <span className="font-bold text-slate-900">{st.parentName}</span>
                      <span className="text-[10px] text-slate-400 block">เบอร์ติดต่อ: {st.parentPhone ? formatPhone10(st.parentPhone) : '-'}</span>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Item Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 text-left">ลำดับ / รายการ</th>
                      <th className="py-2.5 px-3 text-right">จำนวนเงิน (บาท)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{selectedPaymentForReceipt.title}</div>
                        <div className="text-[10px] text-slate-500">{selectedPaymentForReceipt.notes || 'การชำระเงินค่าบำรุงการฝึกซ้อมฟุตบอล'}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-black text-slate-900 text-sm">
                        ฿{selectedPaymentForReceipt.amount.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="border-t border-slate-200 bg-slate-50">
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-800 text-right">ยอดรวมสุทธิ:</td>
                      <td className="py-2.5 px-3 text-right font-black text-emerald-800 text-base">
                        ฿{selectedPaymentForReceipt.amount.toLocaleString()} บาท
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Footer Stamp & Signatures */}
              <div className="pt-4 flex justify-between items-end text-[10px] text-slate-500">
                <div>
                  <div>ช่องทางชำระ: <span className="font-bold text-slate-700 uppercase">{selectedPaymentForReceipt.paymentMethod || 'PROMPTPAY / โอนเงิน'}</span></div>
                  <div>สถานะ: <span className="font-bold text-emerald-700">ชำระเงินครบถ้วนสมบูรณ์ (PAID)</span></div>
                  {selectedPaymentForReceipt.slipUrl && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => setViewingSlipUrl(selectedPaymentForReceipt.slipUrl || null)}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[10px] flex items-center gap-1 border border-emerald-300 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>ดูหลักฐานสลิปการโอนเงินที่แนบไว้</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <div className="w-32 border-b border-slate-400 pb-1 font-bold text-slate-800">
                    {selectedPaymentForReceipt.receivedByStaffName || 'เจ้าหน้าที่การเงิน'}
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5">ผู้รับเงิน / ออกใบเสร็จ</div>
                </div>
              </div>

            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>พิมพ์ใบเสร็จรับเงิน (Print)</span>
              </button>
              <button
                onClick={() => setSelectedPaymentForReceipt(null)}
                className="py-2.5 px-4 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                ปิด
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
