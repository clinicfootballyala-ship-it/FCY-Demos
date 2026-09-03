import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Shield, 
  UserCheck, 
  GraduationCap, 
  KeyRound, 
  Users, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Edit3, 
  Trash2, 
  Plus, 
  Search, 
  Filter, 
  RotateCcw, 
  Save, 
  AlertTriangle,
  History,
  Smartphone,
  Laptop,
  Check,
  Ban,
  RefreshCw,
  Info,
  ShieldCheck,
  UserPlus,
  Database,
  UploadCloud,
  AlertCircle
} from 'lucide-react';
import { UserRole, RolePermissions, PermissionLevel, UserAccount, AuthSessionLog } from '../../types';
import { cleanDigits, formatThaiIdCard, formatPhone10 } from '../../utils/validation';

export const AccessControlManagement: React.FC = () => {
  const { 
    userAccounts, 
    addUserAccount, 
    updateUserAccount, 
    deleteUserAccount, 
    resetUserPassword,
    rolePermissions, 
    updateRolePermissions, 
    resetPermissionsToDefault,
    sessionLogs,
    clearSessionLogs,
    coaches,
    students,
    currentUser,
    loginAsDemo,
    setShowSupabaseModal,
    isSupabaseConfigured,
    supabaseConnected
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'matrix' | 'users' | 'logs'>('matrix');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showToast, setShowToast] = useState<string | null>(null);

  // New User Modal State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    username: '',
    fullName: '',
    nickname: '',
    email: '',
    phone: '',
    password: 'password123',
    role: 'coach' as UserRole,
    title: '',
    coachId: '',
    studentId: ''
  });

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [resetPwNotice, setResetPwNotice] = useState<{ userId: string; newPw: string } | null>(null);

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const moduleDefinitions: { key: keyof RolePermissions; nameTh: string; description: string; icon: string }[] = [
    { key: 'dashboard', nameTh: 'แดชบอร์ดภาพรวมคลีนิก (Dashboard)', description: 'สถิตินักเรียน อัตราเข้าซ้อม และตัวชี้วัดหลัก', icon: '📊' },
    { key: 'members', nameTh: 'ทะเบียนสมาชิกนักเรียน (Members)', description: 'ข้อมูลประวัตินักเรียน ทะเบียนรุ่นอายุ และข้อมูลสุขภาพ', icon: '⚽' },
    { key: 'schedule', nameTh: 'ตารางการฝึกซ้อม (Training Schedule)', description: 'จัดการตารางฝึกซ้อม สนาม และเวลาซ้อม', icon: '📅' },
    { key: 'attendance', nameTh: 'บันทึกเวลาเรียน (Attendance Records)', description: 'เช็คชื่อและบันทึกเวลาเข้าเรียนรายบุคคล', icon: '📋' },
    { key: 'skills', nameTh: 'ประเมินทักษะ 5 เสาหลัก (Skill Assessments)', description: 'บันทึกคะแนนพัฒนาการและรายงานความก้าวหน้า', icon: '⭐' },
    { key: 'payments', nameTh: 'การชำระเงินและใบเสร็จ (Payments & E-Receipts)', description: 'ออกใบแจ้งหนี้ บันทึกการรับชำระเงิน และสลิปโอนเงิน', icon: '💳' },
    { key: 'finance', nameTh: 'บัญชีรายจ่ายคลีนิก (Clinic Expenses)', description: 'บันทึกค่าเช่าสนาม ค่าจ้าง อุปกรณ์ และงบดำเนินงาน', icon: '💰' },
    { key: 'coaches', nameTh: 'บริหารโค้ชและฝ่ายบุคคล (Coaching Staff & HR)', description: 'ประวัติโค้ช ไลเซนส์ สัญญาจ้าง และการมอบหมายงาน', icon: '🧑‍🏫' },
    { key: 'assets', nameTh: 'ครุภัณฑ์และอุปกรณ์ซ้อม (Clinic Assets)', description: 'ตรวจนับลูกฟุตบอล กรวย มาร์กเกอร์ และชุดฝึกซ้อม', icon: '📦' },
    { key: 'terms', nameTh: 'ระเบียบและข้อตกลงคลีนิก (Rules & Terms)', description: 'เงื่อนไขข้อบังคับ จรรยาบรรณ และการยอมรับข้อตกลง', icon: '📝' },
    { key: 'accessControl', nameTh: 'จัดการผู้ใช้และสิทธิ์ความปลอดภัย (RBAC Matrix)', description: 'กำหนดบทบาท สิทธิ์เข้าถึง และบันทึก Audit logs', icon: '🛡️' }
  ];

  const handlePermissionChange = (role: UserRole, moduleKey: keyof RolePermissions, newLevel: PermissionLevel) => {
    updateRolePermissions(role, { [moduleKey]: newLevel });
    triggerToast(`อัปเดตสิทธิ์โมดูลสำหรับ ${role === 'admin_staff' ? 'เจ้าหน้าที่' : role === 'coach' ? 'โค้ช' : 'ผู้ปกครอง'} เรียบร้อยแล้ว`);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.username || !newUserData.fullName) {
      alert('กรุณากรอกชื่อผู้ใช้และชื่อ-นามสกุล');
      return;
    }

    const created = addUserAccount({
      username: newUserData.username.toLowerCase().trim(),
      fullName: newUserData.fullName.trim(),
      nickname: newUserData.nickname.trim() || newUserData.fullName.split(' ')[0],
      email: newUserData.email.trim() || `${newUserData.username}@yalafootball.com`,
      phone: newUserData.phone.trim(),
      password: newUserData.password || '1234',
      role: newUserData.role,
      title: newUserData.title || (newUserData.role === 'coach' ? 'ผู้ฝึกสอน' : newUserData.role === 'admin_staff' ? 'เจ้าหน้าที่บริหาร' : 'ผู้ปกครอง'),
      coachId: newUserData.role === 'coach' ? newUserData.coachId : undefined,
      studentIds: newUserData.role === 'student_parent' && newUserData.studentId ? [newUserData.studentId] : undefined,
      status: 'active'
    });

    setShowAddUserModal(false);
    setNewUserData({
      username: '',
      fullName: '',
      nickname: '',
      email: '',
      phone: '',
      password: 'password123',
      role: 'coach',
      title: '',
      coachId: '',
      studentId: ''
    });
    triggerToast(`เพิ่มบัญชีผู้ใช้ ${created.fullName} สำเร็จแล้ว`);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    updateUserAccount(editingUser.id, editingUser);
    setEditingUser(null);
    triggerToast(`บันทึกการแก้ไขบัญชี ${editingUser.fullName} เรียบร้อยแล้ว`);
  };

  const handleResetPassword = (userId: string, userName: string) => {
    const tempPw = 'Yfc#' + Math.floor(1000 + Math.random() * 9000);
    resetUserPassword(userId, tempPw);
    setResetPwNotice({ userId, newPw: tempPw });
    triggerToast(`รีเซ็ตรหัสผ่านของ ${userName} เป็น ${tempPw}`);
  };

  const filteredUsers = userAccounts.filter(user => {
    const matchesSearch = 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm)) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2.5 text-xs animate-in slide-in-from-bottom duration-200 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{showToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span>จัดการผู้ใช้งานและสิทธิ์การเข้าถึง</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-semibold">
                  Access Control Matrix
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                กำหนดสิทธิ์การเข้าถึง 11 โมดูลตามบทบาท จัดการบัญชีผู้ใช้ และตรวจบันทึกความปลอดภัย
              </p>
            </div>
          </div>
        </div>

        {/* Quick Tabs switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 w-full md:w-auto">
          <button
            onClick={() => setActiveSubTab('matrix')}
            className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeSubTab === 'matrix' 
                ? 'bg-white text-blue-700 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>เมทริกซ์สิทธิ์ตามบทบาท</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab('users')}
            className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeSubTab === 'users' 
                ? 'bg-white text-blue-700 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>ทะเบียนบัญชีผู้ใช้ ({userAccounts.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('logs')}
            className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeSubTab === 'logs' 
                ? 'bg-white text-blue-700 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>บันทึกความปลอดภัย ({sessionLogs.length})</span>
          </button>
        </div>
      </div>

      {/* Supabase PostgreSQL Cloud Integration Status Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 rounded-2xl p-4 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-emerald-800/40">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">ฐานข้อมูลคลาวด์ Supabase PostgreSQL (Free Tier)</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                supabaseConnected 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                  : isSupabaseConfigured
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  : 'bg-slate-700 text-slate-300'
              }`}>
                {supabaseConnected ? '🟢 Live Connected' : isSupabaseConfigured ? '🔵 Configured' : '⚪ Local Storage Fallback'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              จัดเก็บข้อมูลและสิทธิ์ความปลอดภัยในระดับ Row Level Security (RLS) บน PostgreSQL Cloud พร้อมซิงค์ทุกอุปกรณ์
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowSupabaseModal(true)}
            className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>ตั้งค่า & ซิงค์ Supabase</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Role Permission Matrix */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-4">
          
          {/* Permission Legend & Action Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-700">คำอธิบายระดับสิทธิ์:</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="font-semibold">full:</span> สิทธิ์เต็ม (สร้าง/แก้ไข/ลบ/ดูทั้งหมด)
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                <Eye className="w-3 h-3 text-blue-600" />
                <span className="font-semibold">view_only:</span> ดูข้อมูลส่วนกลางเท่านั้น (ห้ามแก้ไข)
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200">
                <GraduationCap className="w-3 h-3 text-amber-600" />
                <span className="font-semibold">view_own:</span> ดูเฉพาะตนเอง / บุตรหลาน
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200">
                <Ban className="w-3 h-3 text-rose-600" />
                <span className="font-semibold">none:</span> ปิดการเข้าถึง (ซ่อนเมนู)
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  resetPermissionsToDefault();
                  triggerToast('รีเซ็ตสิทธิ์เป็นค่ามาตรฐานสำเร็จ');
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>คืนค่าเริ่มต้น</span>
              </button>
            </div>
          </div>

          {/* 1. Mobile Matrix Card List View (md:hidden) */}
          <div className="md:hidden space-y-3">
            {moduleDefinitions.map((mod) => {
              const adminLevel = rolePermissions.admin_staff[mod.key] || 'none';
              const coachLevel = rolePermissions.coach[mod.key] || 'none';
              const parentLevel = rolePermissions.student_parent[mod.key] || 'none';

              return (
                <div 
                  key={mod.key}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3"
                >
                  {/* Module Title */}
                  <div className="flex items-start gap-2.5">
                    <span className="text-xl shrink-0 mt-0.5">{mod.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-800 text-sm">{mod.nameTh}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{mod.description}</div>
                    </div>
                  </div>

                  {/* 3 Role Selectors */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                    {/* Admin */}
                    <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 text-blue-800 font-semibold shrink-0">
                        <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>แอดมิน / เจ้าหน้าที่</span>
                      </div>
                      <select
                        value={adminLevel}
                        onChange={(e) => handlePermissionChange('admin_staff', mod.key, e.target.value as PermissionLevel)}
                        className={`w-full sm:w-auto py-1 px-2 rounded-md border text-xs font-semibold focus:outline-none focus:ring-1 cursor-pointer transition-colors ${
                          adminLevel === 'full' 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : adminLevel === 'view_only'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : adminLevel === 'view_own'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        <option value="full">🟢 สิทธิ์เต็ม (Full)</option>
                        <option value="view_only">🔵 ดูส่วนกลาง (View All)</option>
                        <option value="view_own">🟡 ดูของตนเอง (View Own)</option>
                        <option value="none">🔴 ปิดการเข้าถึง (None)</option>
                      </select>
                    </div>

                    {/* Coach */}
                    <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-semibold shrink-0">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>โค้ชผู้ฝึกสอน</span>
                      </div>
                      <select
                        value={coachLevel}
                        onChange={(e) => handlePermissionChange('coach', mod.key, e.target.value as PermissionLevel)}
                        className={`w-full sm:w-auto py-1 px-2 rounded-md border text-xs font-semibold focus:outline-none focus:ring-1 cursor-pointer transition-colors ${
                          coachLevel === 'full' 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : coachLevel === 'view_only'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : coachLevel === 'view_own'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        <option value="full">🟢 สิทธิ์เต็ม (Full)</option>
                        <option value="view_only">🔵 ดูส่วนกลาง (View All)</option>
                        <option value="view_own">🟡 ดูของตนเอง (View Own)</option>
                        <option value="none">🔴 ปิดการเข้าถึง (None)</option>
                      </select>
                    </div>

                    {/* Parent */}
                    <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 text-amber-800 font-semibold shrink-0">
                        <GraduationCap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>ผู้ปกครอง/นักเรียน</span>
                      </div>
                      <select
                        value={parentLevel}
                        onChange={(e) => handlePermissionChange('student_parent', mod.key, e.target.value as PermissionLevel)}
                        className={`w-full sm:w-auto py-1 px-2 rounded-md border text-xs font-semibold focus:outline-none focus:ring-1 cursor-pointer transition-colors ${
                          parentLevel === 'full' 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : parentLevel === 'view_only'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : parentLevel === 'view_own'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        <option value="full">🟢 สิทธิ์เต็ม (Full)</option>
                        <option value="view_only">🔵 ดูส่วนกลาง (View All)</option>
                        <option value="view_own">🟡 ดูของตนเอง (View Own)</option>
                        <option value="none">🔴 ปิดการเข้าถึง (None)</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. Tablet / Desktop Matrix Table (hidden md:block) */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs uppercase font-semibold">
                    <th className="py-3.5 px-4 w-1/3">ระบบ / ฟังก์ชันงาน (Module)</th>
                    <th className="py-3.5 px-4 w-2/9 text-center bg-blue-50/50">
                      <div className="flex items-center justify-center gap-1.5 text-blue-800">
                        <Shield className="w-4 h-4 text-blue-600" />
                        <span>เจ้าหน้าที่ / แอดมิน (Admin/Staff)</span>
                      </div>
                    </th>
                    <th className="py-3.5 px-4 w-2/9 text-center bg-emerald-50/50">
                      <div className="flex items-center justify-center gap-1.5 text-emerald-800">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <span>โค้ชผู้ฝึกสอน (Coach)</span>
                      </div>
                    </th>
                    <th className="py-3.5 px-4 w-2/9 text-center bg-amber-50/50">
                      <div className="flex items-center justify-center gap-1.5 text-amber-800">
                        <GraduationCap className="w-4 h-4 text-amber-600" />
                        <span>นักเรียน / ผู้ปกครอง (Parent)</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {moduleDefinitions.map((mod) => {
                    const adminLevel = rolePermissions.admin_staff[mod.key] || 'none';
                    const coachLevel = rolePermissions.coach[mod.key] || 'none';
                    const parentLevel = rolePermissions.student_parent[mod.key] || 'none';

                    return (
                      <tr key={mod.key} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-start gap-2.5">
                            <span className="text-base shrink-0 mt-0.5">{mod.icon}</span>
                            <div>
                              <div className="font-bold text-slate-800">{mod.nameTh}</div>
                              <div className="text-[11px] text-slate-500">{mod.description}</div>
                            </div>
                          </div>
                        </td>

                        {/* Admin Role Permission */}
                        <td className="py-3 px-4 text-center bg-blue-50/20">
                          <select
                            value={adminLevel}
                            onChange={(e) => handlePermissionChange('admin_staff', mod.key, e.target.value as PermissionLevel)}
                            className={`w-full max-w-[150px] mx-auto py-1.5 px-2.5 rounded-lg border text-xs font-semibold focus:outline-none focus:ring-1 transition-all ${
                              adminLevel === 'full' 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : adminLevel === 'view_only'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : adminLevel === 'view_own'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                          >
                            <option value="full">🟢 สิทธิ์เต็ม (full)</option>
                            <option value="view_only">🔵 ดูส่วนกลาง (view_only)</option>
                            <option value="view_own">🟡 ดูของตนเอง (view_own)</option>
                            <option value="none">🔴 ปิดการเข้าถึง (none)</option>
                          </select>
                        </td>

                        {/* Coach Role Permission */}
                        <td className="py-3 px-4 text-center bg-emerald-50/20">
                          <select
                            value={coachLevel}
                            onChange={(e) => handlePermissionChange('coach', mod.key, e.target.value as PermissionLevel)}
                            className={`w-full max-w-[150px] mx-auto py-1.5 px-2.5 rounded-lg border text-xs font-semibold focus:outline-none focus:ring-1 transition-all ${
                              coachLevel === 'full' 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : coachLevel === 'view_only'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : coachLevel === 'view_own'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                          >
                            <option value="full">🟢 สิทธิ์เต็ม (full)</option>
                            <option value="view_only">🔵 ดูส่วนกลาง (view_only)</option>
                            <option value="view_own">🟡 ดูของตนเอง (view_own)</option>
                            <option value="none">🔴 ปิดการเข้าถึง (none)</option>
                          </select>
                        </td>

                        {/* Parent Role Permission */}
                        <td className="py-3 px-4 text-center bg-amber-50/20">
                          <select
                            value={parentLevel}
                            onChange={(e) => handlePermissionChange('student_parent', mod.key, e.target.value as PermissionLevel)}
                            className={`w-full max-w-[150px] mx-auto py-1.5 px-2.5 rounded-lg border text-xs font-semibold focus:outline-none focus:ring-1 transition-all ${
                              parentLevel === 'full' 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : parentLevel === 'view_only'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : parentLevel === 'view_own'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                          >
                            <option value="full">🟢 สิทธิ์เต็ม (full)</option>
                            <option value="view_only">🔵 ดูส่วนกลาง (view_only)</option>
                            <option value="view_own">🟡 ดูของตนเอง (view_own)</option>
                            <option value="none">🔴 ปิดการเข้าถึง (none)</option>
                          </select>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: User Accounts Directory */}
      {activeSubTab === 'users' && (
        <div className="space-y-4">
          
          {/* Controls bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
            
            <div className="flex flex-1 items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อผู้ใช้, ชื่อ-นามสกุล, เบอร์โทร..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Role filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="py-2 px-3 border border-slate-200 rounded-lg text-xs bg-white text-slate-700"
              >
                <option value="all">ทุกบทบาท (All Roles)</option>
                <option value="admin_staff">เฉพาะแอดมิน/เจ้าหน้าที่</option>
                <option value="coach">เฉพาะโค้ชผู้ฝึกสอน</option>
                <option value="student_parent">เฉพาะนักเรียน/ผู้ปกครอง</option>
              </select>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-2 px-3 border border-slate-200 rounded-lg text-xs bg-white text-slate-700"
              >
                <option value="all">ทุกสถานะ (All Status)</option>
                <option value="active">ปกติ (Active)</option>
                <option value="suspended">ระงับการใช้งาน (Suspended)</option>
              </select>
            </div>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>เพิ่มบัญชีผู้ใช้ใหม่</span>
            </button>

          </div>

          {/* Reset password alert notification if active */}
          {resetPwNotice && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <span>
                  รหัสผ่านชั่วคราวถูกรีเซ็ตเรียบร้อยแล้ว: <strong className="font-mono bg-white px-2 py-0.5 rounded border border-amber-300">{resetPwNotice.newPw}</strong> (โปรดส่งรหัสนี้ให้ผู้ใช้งาน)
                </span>
              </div>
              <button 
                onClick={() => setResetPwNotice(null)}
                className="text-amber-600 hover:text-amber-900 font-semibold"
              >
                ปิดข้อความ
              </button>
            </div>
          )}

          {/* 1. Mobile Users Card List View (md:hidden) */}
          <div className="md:hidden space-y-3">
            {filteredUsers.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400">
                <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs">ไม่พบบัญชีผู้ใช้ตามเงื่อนไขที่ค้นหา</p>
              </div>
            ) : (
              filteredUsers.map((user) => {
                const isCoach = user.role === 'coach';
                const isParent = user.role === 'student_parent';
                const isAdmin = user.role === 'admin_staff';

                // Find linked coach or student
                const linkedCoach = user.coachId ? coaches.find(c => c.id === user.coachId) : null;
                const linkedStudent = user.studentIds && user.studentIds[0] ? students.find(s => s.id === user.studentIds![0]) : null;

                return (
                  <div 
                    key={user.id}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3"
                  >
                    {/* Top Row: User Avatar, Name, Role & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img 
                          src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
                          alt="" 
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0" 
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5 truncate">
                            <span className="truncate">{user.fullName}</span>
                            {currentUser?.id === user.id && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded font-bold shrink-0">คุณ</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              isAdmin 
                                ? 'bg-blue-100 text-blue-700' 
                                : isCoach 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {isAdmin ? 'แอดมิน/เจ้าหน้าที่' : isCoach ? 'โค้ชผู้ฝึกสอน' : 'ผู้ปกครอง/นักเรียน'}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate">{user.title}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Toggle Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const newStatus = user.status === 'active' ? 'suspended' : 'active';
                          updateUserAccount(user.id, { status: newStatus });
                          triggerToast(`เปลี่ยนสถานะของ ${user.fullName} เป็น ${newStatus === 'active' ? 'ปกติ' : 'ระงับการใช้งาน'}`);
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 transition-all ${
                          user.status === 'active' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {user.status === 'active' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>ปกติ</span>
                          </>
                        ) : (
                          <>
                            <Ban className="w-3 h-3 text-rose-600" />
                            <span>ระงับ</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Linked Entity Info */}
                    {linkedCoach ? (
                      <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-100 text-xs">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">เชื่อมโยง: <strong>{linkedCoach.fullName}</strong> ({linkedCoach.coachCode})</span>
                      </div>
                    ) : linkedStudent ? (
                      <div className="flex items-center gap-1.5 text-amber-800 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-100 text-xs">
                        <GraduationCap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">เชื่อมโยง: <strong>{linkedStudent.fullName}</strong> ({linkedStudent.studentCode})</span>
                      </div>
                    ) : null}

                    {/* 2-Column Info Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">ชื่อผู้ใช้ (Login)</span>
                        <span className="font-mono text-slate-800 font-bold text-xs">{user.username}</span>
                        <span className="text-[10px] text-slate-400 block font-mono mt-0.5 truncate">
                          ID: {user.id}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">เข้าสู่ระบบล่าสุด</span>
                        <span className="text-slate-700 text-xs font-medium block truncate">
                          {user.lastLogin || 'ยังไม่เคยเข้าใช้'}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                          โทร: {user.phone || '-'}
                        </span>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => loginAsDemo(user.role, user.id)}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-xs flex items-center gap-1 border border-blue-200 transition-colors"
                        title="สลับเป็นผู้ใช้นี้ (Fast Login)"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>สลับผู้ใช้</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleResetPassword(user.id, user.fullName)}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold rounded-lg text-xs flex items-center gap-1 border border-amber-200 transition-colors"
                        title="รีเซ็ตรหัสผ่าน"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>รีเซ็ตรหัส</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingUser(user)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
                        title="แก้ไขข้อมูลผู้ใช้"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีของ "${user.fullName}"?`)) {
                            deleteUserAccount(user.id);
                            triggerToast(`ลบบัญชี ${user.fullName} เรียบร้อยแล้ว`);
                          }
                        }}
                        disabled={currentUser?.id === user.id}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors disabled:opacity-30"
                        title="ลบบัญชี"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 2. Tablet / Desktop Users Table (hidden md:block) */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs uppercase font-semibold">
                    <th className="py-3 px-4">ผู้ใช้งาน (User & Role)</th>
                    <th className="py-3 px-4">ชื่อผู้ใช้ (Username / Login)</th>
                    <th className="py-3 px-4">การเชื่อมโยง (Linked Entity)</th>
                    <th className="py-3 px-4">ข้อมูลติดต่อ</th>
                    <th className="py-3 px-4">เข้าสู่ระบบล่าสุด</th>
                    <th className="py-3 px-4 text-center">สถานะ</th>
                    <th className="py-3 px-4 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        ไม่พบบัญชีผู้ใช้ตามเงื่อนไขที่ค้นหา
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const isCoach = user.role === 'coach';
                      const isParent = user.role === 'student_parent';
                      const isAdmin = user.role === 'admin_staff';

                      // Find linked coach or student
                      const linkedCoach = user.coachId ? coaches.find(c => c.id === user.coachId) : null;
                      const linkedStudent = user.studentIds && user.studentIds[0] ? students.find(s => s.id === user.studentIds![0]) : null;

                      return (
                        <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                          
                          {/* User Profile */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
                                alt="" 
                                className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0" 
                              />
                              <div>
                                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                  <span>{user.fullName}</span>
                                  {currentUser?.id === user.id && (
                                    <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded font-medium">คุณ</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                    isAdmin 
                                      ? 'bg-blue-100 text-blue-700' 
                                      : isCoach 
                                      ? 'bg-emerald-100 text-emerald-700' 
                                      : 'bg-amber-100 text-amber-700'
                                  }`}>
                                    {isAdmin ? 'ผู้ดูแล/เจ้าหน้าที่' : isCoach ? 'โค้ชผู้ฝึกสอน' : 'ผู้ปกครอง/นักเรียน'}
                                  </span>
                                  <span className="text-[11px] text-slate-400">{user.title}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Username */}
                          <td className="py-3 px-4">
                            <div className="font-mono text-slate-700 font-semibold">{user.username}</div>
                            <div className="text-[11px] text-slate-400 font-mono">ID: {user.id}</div>
                          </td>

                          {/* Linked Entity */}
                          <td className="py-3 px-4">
                            {linkedCoach ? (
                              <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50/80 px-2.5 py-1 rounded-md border border-emerald-100 w-fit">
                                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{linkedCoach.fullName} ({linkedCoach.coachCode})</span>
                              </div>
                            ) : linkedStudent ? (
                              <div className="flex items-center gap-1.5 text-amber-800 bg-amber-50/80 px-2.5 py-1 rounded-md border border-amber-100 w-fit">
                                <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                                <span>{linkedStudent.fullName} ({linkedStudent.studentCode})</span>
                              </div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>

                          {/* Contact */}
                          <td className="py-3 px-4">
                            <div className="text-slate-700">{user.phone || '-'}</div>
                            <div className="text-[11px] text-slate-400">{user.email || '-'}</div>
                          </td>

                          {/* Last Login */}
                          <td className="py-3 px-4">
                            <div className="text-slate-600">{user.lastLogin || 'ยังไม่เคยเข้าใช้'}</div>
                            <div className="text-[10px] text-slate-400">สร้างเมื่อ {user.createdAt}</div>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => {
                                const newStatus = user.status === 'active' ? 'suspended' : 'active';
                                updateUserAccount(user.id, { status: newStatus });
                                triggerToast(`เปลี่ยนสถานะของ ${user.fullName} เป็น ${newStatus === 'active' ? 'ปกติ' : 'ระงับการใช้งาน'}`);
                              }}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                                user.status === 'active' 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              }`}
                            >
                              {user.status === 'active' ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>ปกติ</span>
                                </>
                              ) : (
                                <>
                                  <Ban className="w-3 h-3" />
                                  <span>ระงับ</span>
                                </>
                              )}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              
                              {/* Fast Login As */}
                              <button
                                onClick={() => loginAsDemo(user.role, user.id)}
                                title="สลับเป็นผู้ใช้นี้ (Impersonate / Fast Login)"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              >
                                <ShieldCheck className="w-4 h-4" />
                              </button>

                              {/* Reset Password */}
                              <button
                                onClick={() => handleResetPassword(user.id, user.fullName)}
                                title="รีเซ็ตรหัสผ่านชั่วคราว"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                              >
                                <KeyRound className="w-4 h-4" />
                              </button>

                              {/* Edit */}
                              <button
                                onClick={() => setEditingUser(user)}
                                title="แก้ไขข้อมูลผู้ใช้"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => {
                                  if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีของ "${user.fullName}"?`)) {
                                    deleteUserAccount(user.id);
                                    triggerToast(`ลบบัญชี ${user.fullName} เรียบร้อยแล้ว`);
                                  }
                                }}
                                disabled={currentUser?.id === user.id}
                                title="ลบบัญชี"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-30"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>

                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: Security & Audit Logs */}
      {activeSubTab === 'logs' && (
        <div className="space-y-4">
          
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-slate-700">ประวัติการเข้าสู่ระบบและบันทึกความปลอดภัย (Real-time Audit Logs)</span>
              <span className="text-slate-400">| จัดเก็บ 50 รายการล่าสุด</span>
            </div>

            <button
              onClick={() => {
                if (confirm('คุณต้องการล้างประวัติบันทึกความปลอดภัยทั้งหมดหรือไม่?')) {
                  clearSessionLogs();
                  triggerToast('ล้างบันทึกความปลอดภัยเรียบร้อยแล้ว');
                }
              }}
              className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
            >
              ล้างประวัติบันทึก
            </button>
          </div>

          {/* 1. Mobile Audit Logs Card List View (md:hidden) */}
          <div className="md:hidden space-y-3">
            {sessionLogs.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400">
                <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs">ยังไม่มีรายการบันทึกความปลอดภัย</p>
              </div>
            ) : (
              sessionLogs.map((log) => {
                const actionLabelMap: Record<AuthSessionLog['action'], { label: string; bg: string; text: string }> = {
                  login: { label: 'เข้าสู่ระบบ (Login)', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
                  logout: { label: 'ออกจากระบบ (Logout)', bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700' },
                  role_switch: { label: 'สลับบทบาท (Role Switch)', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
                  permission_update: { label: 'แก้ไขสิทธิ์ (Permission Update)', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' }
                };

                const actionConfig = actionLabelMap[log.action] || actionLabelMap.login;

                return (
                  <div 
                    key={log.id}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3"
                  >
                    {/* Header: User Name, Role & Action Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-800 text-xs">{log.userName}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">Role: {log.role}</div>
                      </div>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${actionConfig.bg} ${actionConfig.text}`}>
                        {actionConfig.label}
                      </span>
                    </div>

                    {/* 2-Column Details Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">วันและเวลา</span>
                        <span className="font-mono text-slate-700 text-xs font-semibold block truncate mt-0.5">
                          {log.timestamp}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">อุปกรณ์ & เบราว์เซอร์</span>
                        <div className="flex items-center gap-1 text-slate-700 text-xs mt-0.5">
                          {log.device?.includes('Mobile') ? (
                            <Smartphone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          ) : (
                            <Laptop className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span className="truncate">{log.device || 'Desktop Browser'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer: IP & Location */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>IP Address:</span>
                      <span className="text-slate-700 font-medium">{log.ipAddress || '182.52.204.88 (Yala, TH)'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 2. Tablet / Desktop Audit Logs Table (hidden md:block) */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs uppercase font-semibold">
                    <th className="py-3 px-4">วันและเวลา (Timestamp)</th>
                    <th className="py-3 px-4">ผู้ใช้งาน (User & Role)</th>
                    <th className="py-3 px-4">กิจกรรม (Action)</th>
                    <th className="py-3 px-4">อุปกรณ์ & เบราว์เซอร์</th>
                    <th className="py-3 px-4">IP Address & พิกัด</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {sessionLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        ยังไม่มีรายการบันทึกความปลอดภัย
                      </td>
                    </tr>
                  ) : (
                    sessionLogs.map((log) => {
                      const actionLabelMap: Record<AuthSessionLog['action'], { label: string; bg: string; text: string }> = {
                        login: { label: 'เข้าสู่ระบบ (Login)', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
                        logout: { label: 'ออกจากระบบ (Logout)', bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700' },
                        role_switch: { label: 'สลับบทบาท (Role Switch)', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
                        permission_update: { label: 'แก้ไขสิทธิ์ (Permission Update)', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' }
                      };

                      const actionConfig = actionLabelMap[log.action] || actionLabelMap.login;

                      return (
                        <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 font-mono text-slate-600">
                            {log.timestamp}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-800">{log.userName}</div>
                            <div className="text-[11px] text-slate-400 font-mono">Role: {log.role}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold border ${actionConfig.bg} ${actionConfig.text}`}>
                              {actionConfig.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            <div className="flex items-center gap-1.5">
                              {log.device?.includes('Mobile') ? <Smartphone className="w-3.5 h-3.5 text-slate-400" /> : <Laptop className="w-3.5 h-3.5 text-slate-400" />}
                              <span>{log.device || 'Desktop Browser'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500">
                            {log.ipAddress || '182.52.204.88 (Yala, TH)'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Modal: Add New User */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-6">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-400" />
                <span>สร้างบัญชีผู้ใช้งานใหม่</span>
              </h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ชื่อผู้ใช้ (Username) *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น coach.ta, parent.somchai"
                    value={newUserData.username}
                    onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">รหัสผ่านเริ่มต้น *</label>
                  <input
                    type="text"
                    required
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ชื่อ - นามสกุล *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น นายธนากร แสงสุวรรณ"
                    value={newUserData.fullName}
                    onChange={(e) => setNewUserData({ ...newUserData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ชื่อเล่น / คำเรียกสั้นๆ</label>
                  <input
                    type="text"
                    placeholder="เช่น โค้ชต้า, น้าน้อย"
                    value={newUserData.nickname}
                    onChange={(e) => setNewUserData({ ...newUserData, nickname: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">บทบาท (Role) *</label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => {
                      const newRole = e.target.value as UserRole;
                      if (newRole === 'student_parent' && students.length > 0 && !newUserData.studentId) {
                        const firstStd = students[0];
                        const cleanIdCard = firstStd.parentIdCardNumber ? cleanDigits(firstStd.parentIdCardNumber) : '';
                        const cleanPhone = firstStd.parentPhone ? cleanDigits(firstStd.parentPhone) : '';
                        setNewUserData({
                          ...newUserData,
                          role: newRole,
                          studentId: firstStd.id,
                          username: cleanIdCard || cleanPhone || `parent.${firstStd.studentCode.toLowerCase()}`,
                          password: cleanPhone || '1234',
                          fullName: firstStd.parentName || `ผู้ปกครองของ ${firstStd.fullName}`,
                          nickname: firstStd.parentName?.split(' ')[0] || 'ผู้ปกครอง',
                          phone: firstStd.parentPhone || cleanPhone,
                          email: firstStd.parentEmail || '',
                          title: `ผู้ปกครองของ ${firstStd.nickname} (${firstStd.category})`
                        });
                      } else {
                        setNewUserData({ ...newUserData, role: newRole });
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="admin_staff">เจ้าหน้าที่ / ผู้ดูแลระบบ (Admin)</option>
                    <option value="coach">โค้ชผู้ฝึกสอน (Coach)</option>
                    <option value="student_parent">นักเรียน / ผู้ปกครอง (Parent)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ตำแหน่ง / ฉายา</label>
                  <input
                    type="text"
                    placeholder="เช่น โค้ชผู้ช่วย U-10, ผู้ปกครองน้องเจแปน"
                    value={newUserData.title}
                    onChange={(e) => setNewUserData({ ...newUserData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Conditional Linkage */}
              {newUserData.role === 'coach' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เชื่อมโยงกับโปรไฟล์โค้ช / สตาฟ</label>
                  <select
                    value={newUserData.coachId}
                    onChange={(e) => setNewUserData({ ...newUserData, coachId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">-- สร้างโปรไฟล์โค้ช/สตาฟใหม่ในระบบ HR อัตโนมัติ --</option>
                    {coaches.map(c => (
                      <option key={c.id} value={c.id}>{c.fullName} ({c.coachCode}) - {c.license}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">
                    * หากไม่ได้เลือกโค้ชเดิมที่มีอยู่ ระบบจะสร้างโปรไฟล์ในหน้า "ระบบจัดการโค้ช & HR" ให้โดยอัตโนมัติ
                  </p>
                </div>
              )}

              {newUserData.role === 'student_parent' && (
                <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-800 text-xs">
                      เชื่อมโยงกับนักเรียน (ดึงข้อมูลผู้ปกครองอัตโนมัติ)
                    </label>
                    <span className="text-[10px] text-amber-800 font-semibold bg-amber-200/70 px-2 py-0.5 rounded">
                      Parent Default Credentials
                    </span>
                  </div>
                  <select
                    value={newUserData.studentId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const matched = students.find(s => s.id === selectedId);
                      if (matched) {
                        const cleanIdCard = matched.parentIdCardNumber ? cleanDigits(matched.parentIdCardNumber) : '';
                        const cleanPhone = matched.parentPhone ? cleanDigits(matched.parentPhone) : '';
                        setNewUserData({
                          ...newUserData,
                          studentId: selectedId,
                          username: cleanIdCard || cleanPhone || `parent.${matched.studentCode.toLowerCase()}`,
                          password: cleanPhone || '1234',
                          fullName: matched.parentName || `ผู้ปกครองของ ${matched.fullName}`,
                          nickname: matched.parentName?.split(' ')[0] || 'ผู้ปกครอง',
                          phone: matched.parentPhone || cleanPhone,
                          email: matched.parentEmail || '',
                          title: `ผู้ปกครองของ ${matched.nickname} (${matched.category})`
                        });
                      } else {
                        setNewUserData({ ...newUserData, studentId: '' });
                      }
                    }}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-medium"
                  >
                    <option value="">-- เลือกนักเรียนในระบบ --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.nickname}) • รหัส {s.studentCode} • ผู้ปกครอง: {s.parentName || 'ไม่ระบุ'}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-amber-900 leading-tight">
                    💡 <strong>ค่าเริ่มต้นสำหรับผู้ปกครอง:</strong> Username = เลขบัตร ปชช. ผู้ปกครอง 13 หลัก, Password = เบอร์โทรศัพท์ผู้ปกครอง 10 หลัก
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    placeholder="08x-xxx-xxxx"
                    value={newUserData.phone}
                    onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">อีเมล</label>
                  <input
                    type="email"
                    placeholder="user@example.com"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                >
                  บันทึกผู้ใช้
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-6">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-400" />
                <span>แก้ไขข้อมูลบัญชีผู้ใช้ • {editingUser.fullName}</span>
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveEditUser} className="p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ชื่อผู้ใช้ (Username)</label>
                  <input
                    type="text"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">บทบาท (Role)</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="admin_staff">เจ้าหน้าที่ / ผู้ดูแลระบบ (Admin)</option>
                    <option value="coach">โค้ชผู้ฝึกสอน (Coach)</option>
                    <option value="student_parent">นักเรียน / ผู้ปกครอง (Parent)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ชื่อ - นามสกุล</label>
                  <input
                    type="text"
                    value={editingUser.fullName}
                    onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ตำแหน่ง / ฉายา</label>
                  <input
                    type="text"
                    value={editingUser.title || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    value={editingUser.phone || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">อีเมล</label>
                  <input
                    type="email"
                    value={editingUser.email || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">สถานะการใช้งาน</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as 'active' | 'suspended' })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="active">ปกติ (Active)</option>
                    <option value="suspended">ระงับการใช้งาน (Suspended)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">รหัสผ่าน</label>
                  <input
                    type="text"
                    value={editingUser.password || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                >
                  บันทึกการแก้ไข
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
