import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Shield, 
  UserCheck, 
  GraduationCap, 
  UserPlus, 
  Menu,
  LogIn,
  LogOut,
  KeyRound,
  Database
} from 'lucide-react';

export const Navbar: React.FC<{ 
  onOpenRegister?: () => void;
  onOpenSidebar?: () => void;
}> = ({ onOpenRegister, onOpenSidebar }) => {
  const { 
    currentRole, 
    setCurrentRole, 
    activeTab, 
    setActiveTab,
    students,
    selectedStudentIdForParent,
    setSelectedStudentIdForParent,
    coaches,
    selectedCoachIdForCoach,
    setSelectedCoachIdForCoach,
    currentUser,
    logout,
    setShowLoginModal,
    setShowSupabaseModal,
    isSupabaseConfigured,
    supabaseConnected,
    hasPermission
  } = useApp();

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Executive Dashboard (แดชบอร์ดบริหาร)';
      case 'members': return 'Member Management (จัดการสมาชิกนักเรียน)';
      case 'schedule': return 'Training Schedule (ตารางการฝึกซ้อม)';
      case 'attendance': return 'Attendance Records (บันทึกเวลาเรียน)';
      case 'skills': return 'Skill Assessments (ประเมินทักษะ 5 เสาหลัก)';
      case 'payments': return 'Payment & E-Receipts (การชำระเงิน & ใบเสร็จ)';
      case 'finance': return 'Clinic Accounting & Expenses (บัญชีรายรับ-รายจ่าย)';
      case 'coaches': return 'Coaching Staff & HR (ฝ่ายบุคคลและผู้ฝึกสอน)';
      case 'assets': return 'Clinic Asset Inventory (ครุภัณฑ์และอุปกรณ์ซ้อม)';
      case 'access_control': return 'Access Control & RBAC (จัดการผู้ใช้และสิทธิ์ความปลอดภัย)';
      case 'terms': return 'Rules & Code of Conduct (ระเบียบข้อบังคับคลีนิก)';
      case 'portal': return currentRole === 'student_parent' ? 'Student & Parent Portal' : 'Coach Portal';
      default: return 'Yala Football Clinic';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0 z-30">
      
      {/* Left: Mobile Toggle & Tab Title */}
      <div className="flex items-center gap-3">
        {onOpenSidebar && (
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            title="เปิดเมนู"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-tight">
            {getTabTitle(activeTab)}
          </h1>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            ศูนย์พัฒนาทักษะฟุตบอลเยาวชนจังหวัดยะลา • Yala Football Clinic & Youth Academy
          </p>
        </div>
      </div>

      {/* Right: User Badge, Role Switcher, Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Context Selector for Current Role */}
        {currentRole === 'student_parent' && (
          <div className="hidden xl:flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-600 font-medium">ดูข้อมูลของ:</span>
            <select 
              id="parent-student-select"
              value={selectedStudentIdForParent}
              onChange={(e) => setSelectedStudentIdForParent(e.target.value)}
              className="bg-white border border-slate-200 rounded px-2 py-0.5 text-slate-800 font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.nickname} ({s.fullName.split(' ')[1] || s.fullName}) - {s.category}
                </option>
              ))}
            </select>
          </div>
        )}

        {currentRole === 'coach' && (
          <div className="hidden xl:flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-600 font-medium">โปรไฟล์โค้ช:</span>
            <select 
              id="coach-select"
              value={selectedCoachIdForCoach}
              onChange={(e) => setSelectedCoachIdForCoach(e.target.value)}
              className="bg-white border border-slate-200 rounded px-2 py-0.5 text-slate-800 font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {coaches.map(c => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.nickname})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Supabase Cloud DB Indicator Button */}
        <button
          id="supabase-db-btn"
          onClick={() => setShowSupabaseModal(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
            supabaseConnected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : isSupabaseConfigured
              ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
          }`}
          title="จัดการฐานข้อมูล Supabase PostgreSQL (Free Tier)"
        >
          <Database className={`w-3.5 h-3.5 ${supabaseConnected ? 'text-emerald-600 animate-pulse' : 'text-slate-500'}`} />
          <span className="hidden lg:inline font-sans">
            {supabaseConnected ? 'Supabase คลาวด์' : isSupabaseConfigured ? 'Supabase (ซิงค์)' : 'Supabase DB'}
          </span>
          <span className={`w-2 h-2 rounded-full ${supabaseConnected ? 'bg-emerald-500 ring-2 ring-emerald-200' : isSupabaseConfigured ? 'bg-blue-500' : 'bg-slate-400'}`} />
        </button>

        {/* Role Switcher Pills */}
        <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1 border border-slate-200">
          <button
            id="role-btn-admin"
            onClick={() => {
              setCurrentRole('admin_staff');
              if (activeTab === 'portal') setActiveTab('dashboard');
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-all ${
              currentRole === 'admin_staff'
                ? 'bg-white text-blue-600 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
            title="เจ้าหน้าที่คลีนิก / ผู้บริหาร"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden md:inline">ผู้บริหาร</span>
          </button>

          <button
            id="role-btn-coach"
            onClick={() => {
              setCurrentRole('coach');
              setActiveTab('portal');
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-all ${
              currentRole === 'coach'
                ? 'bg-white text-blue-600 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
            title="โค้ชผู้ฝึกสอน"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span className="hidden md:inline">โค้ช</span>
          </button>

          <button
            id="role-btn-student"
            onClick={() => {
              setCurrentRole('student_parent');
              setActiveTab('portal');
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-all ${
              currentRole === 'student_parent'
                ? 'bg-white text-blue-600 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
            title="นักเรียนและผู้ปกครอง"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span className="hidden md:inline">ผู้ปกครอง</span>
          </button>
        </div>

        {/* Current User Pill / Login Trigger */}
        {currentUser ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <button
              onClick={() => {
                if (hasPermission('accessControl', 'view_only')) {
                  setActiveTab('access_control');
                } else {
                  setShowLoginModal(true);
                }
              }}
              className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-lg hover:bg-slate-100 transition-colors text-left"
              title="คลิกเพื่อดูข้อมูลบัญชี / สลับผู้ใช้"
            >
              <img 
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
                alt="" 
                className="w-7 h-7 rounded-full object-cover border border-slate-200" 
              />
              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-bold text-slate-800 leading-none truncate max-w-[110px]">{currentUser.nickname || currentUser.fullName}</span>
                <span className="text-[10px] text-slate-400 font-mono leading-tight truncate">{currentUser.role}</span>
              </div>
            </button>

            <button
              onClick={logout}
              title="ออกจากระบบ (Logout)"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowLoginModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>เข้าสู่ระบบ</span>
          </button>
        )}

        {/* Quick Register Action */}
        {onOpenRegister && (
          <button
            id="btn-register-public"
            onClick={onOpenRegister}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>สมัครเรียน</span>
          </button>
        )}

      </div>
    </header>
  );
};
