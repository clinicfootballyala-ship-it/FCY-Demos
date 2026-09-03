import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Menu,
  LogIn,
  LogOut
} from 'lucide-react';

export const Navbar: React.FC<{ 
  onOpenRegister?: () => void;
  onOpenSidebar?: () => void;
}> = ({ onOpenSidebar }) => {
  const { 
    currentRole, 
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
    hasPermission,
    organizationConfig
  } = useApp();

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Executive Dashboard';
      case 'members': return 'Member Management';
      case 'schedule': return 'Training Schedule';
      case 'attendance': return 'Attendance Records';
      case 'skills': return 'Skill Assessments';
      case 'payments': return 'Payment & E-Receipts';
      case 'finance': return 'Clinic Accounting & Expenses';
      case 'coaches': return 'Coaching Staff & HR';
      case 'assets': return 'Clinic Asset Inventory';
      case 'access_control': return 'Access Control & RBAC';
      case 'terms': return 'Rules & Code of Conduct';
      case 'portal': return currentRole === 'student_parent' ? 'Student & Parent Portal' : 'Coach Portal';
      default: return 'Yala Football Clinic';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0 z-30">
      
      {/* Left: Mobile Toggle, Organization Logo & Tab Title */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        {onOpenSidebar && (
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 shrink-0"
            title="เปิดเมนู"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Organization Logo */}
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center cursor-pointer group shrink-0"
          title="หน้าแรก"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center font-bold text-white shadow-xs overflow-hidden shrink-0 border border-slate-200">
            {organizationConfig?.logoUrl ? (
              <img 
                src={organizationConfig.logoUrl} 
                alt={organizationConfig.name} 
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            ) : (
              <span className="text-xs sm:text-sm font-black tracking-wider text-white">
                {organizationConfig?.shortName || 'YFC'}
              </span>
            )}
          </div>
        </div>

        {/* Vertical divider */}
        <div className="h-6 sm:h-7 w-px bg-slate-200 hidden sm:block shrink-0" />

        {/* Tab Title & Organization Subtitle */}
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight truncate">
            {getTabTitle(activeTab)}
          </h1>
          <p className="text-[11px] text-slate-500 font-medium hidden sm:block truncate">
            {organizationConfig?.nameTh || 'ฟุตบอลคลีนิกยะลา'} • {organizationConfig?.name || 'Yala Football Clinic & Youth Academy'}
          </p>
        </div>
      </div>

      {/* Right: User Badge & Context Selectors */}
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

      </div>
    </header>
  );
};
