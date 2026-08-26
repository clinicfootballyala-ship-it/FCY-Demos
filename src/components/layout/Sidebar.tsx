import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  ClipboardCheck, 
  Trophy, 
  CreditCard, 
  Receipt, 
  UserCheck, 
  Package, 
  Award, 
  ScrollText,
  UserPlus,
  X,
  Shield,
  Lock,
  LogIn,
  LogOut,
  ChevronRight,
  Settings,
  Building2,
  Edit3
} from 'lucide-react';
import { RolePermissions } from '../../types';

interface SidebarProps {
  activeTab?: string;
  onSelectTab?: (tab: string, extraParam?: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  onOpenRegister?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab: propActiveTab, 
  onSelectTab,
  isOpen = false,
  onClose,
  onOpenRegister
}) => {
  const { 
    currentRole, 
    activeTab: contextActiveTab, 
    setActiveTab: setContextActiveTab, 
    payments, 
    assets,
    currentUser,
    logout,
    setShowLoginModal,
    hasPermission,
    organizationConfig,
    setShowOrgConfigModal
  } = useApp();

  const currentTab = propActiveTab || contextActiveTab;
  const handleTabClick = (tabId: string) => {
    if (onSelectTab) {
      onSelectTab(tabId);
    } else {
      setContextActiveTab(tabId);
    }
    if (onClose) {
      onClose();
    }
  };

  const pendingPaymentsCount = payments.filter(p => p.status === 'pending' || p.status === 'overdue').length;
  const maintenanceAssetsCount = assets.filter(a => a.condition === 'needs_repair' || a.condition === 'depleted').length;

  const navItems: {
    id: string;
    label: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string }>;
    permissionKey: keyof RolePermissions;
    badge: string | null;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Executive Dashboard',
      sublabel: 'แดชบอร์ดผู้บริหาร',
      icon: LayoutDashboard,
      permissionKey: 'dashboard',
      badge: null
    },
    {
      id: 'portal',
      label: currentRole === 'student_parent' ? 'Student Profile & Results' : currentRole === 'coach' ? 'Coach Daily Workflow' : 'Member Portal',
      sublabel: currentRole === 'student_parent' ? 'ผลประเมิน & ประวัติ' : 'เช็คชื่อ & วางแผนฝึก',
      icon: currentRole === 'student_parent' ? Award : UserCheck,
      permissionKey: 'dashboard',
      badge: null
    },
    {
      id: 'members',
      label: 'Member Management',
      sublabel: 'จัดการสมาชิกนักเรียน',
      icon: Users,
      permissionKey: 'members',
      badge: null
    },
    {
      id: 'schedule',
      label: 'Training Schedule',
      sublabel: 'ตารางการฝึกซ้อม',
      icon: Calendar,
      permissionKey: 'schedule',
      badge: null
    },
    {
      id: 'attendance',
      label: 'Attendance Tracking',
      sublabel: 'บันทึกเวลาเรียน (เช็คชื่อ)',
      icon: ClipboardCheck,
      permissionKey: 'attendance',
      badge: null
    },
    {
      id: 'skills',
      label: 'Skill Assessments',
      sublabel: 'ประเมินทักษะ 5 เสาหลัก',
      icon: Trophy,
      permissionKey: 'skills',
      badge: null
    },
    {
      id: 'payments',
      label: 'Payment & Finance',
      sublabel: 'การชำระเงิน & ใบเสร็จ',
      icon: CreditCard,
      permissionKey: 'payments',
      badge: pendingPaymentsCount > 0 && currentRole === 'admin_staff' ? `${pendingPaymentsCount}` : null,
      badgeColor: 'bg-amber-500 text-white'
    },
    {
      id: 'finance',
      label: 'Clinic Accounting',
      sublabel: 'รายรับ-รายจ่ายคลีนิก',
      icon: Receipt,
      permissionKey: 'finance',
      badge: null
    },
    {
      id: 'coaches',
      label: 'Human Resources',
      sublabel: 'จัดการโค้ช & งานบุคคล',
      icon: UserCheck,
      permissionKey: 'coaches',
      badge: null
    },
    {
      id: 'assets',
      label: 'Asset Tracking',
      sublabel: 'ครุภัณฑ์และอุปกรณ์ซ้อม',
      icon: Package,
      permissionKey: 'assets',
      badge: maintenanceAssetsCount > 0 ? `${maintenanceAssetsCount}` : null,
      badgeColor: 'bg-rose-500 text-white'
    },
    {
      id: 'access_control',
      label: 'Access Control & RBAC',
      sublabel: 'จัดการผู้ใช้ & สิทธิ์ระบบ',
      icon: Shield,
      permissionKey: 'accessControl',
      badge: 'RBAC',
      badgeColor: 'bg-blue-500 text-white'
    },
    {
      id: 'terms',
      label: 'Rules & Agreements',
      sublabel: 'ระเบียบ & ข้อตกลงคลีนิก',
      icon: ScrollText,
      permissionKey: 'terms',
      badge: null
    }
  ];

  // Dynamic filter: Show item if user has permission (not 'none')
  const visibleItems = navItems.filter(item => hasPermission(item.permissionKey, 'view_only'));

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#1E293B] text-white">
      
      {/* Brand Header */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-700 bg-slate-900/40">
        <div 
          className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0" 
          onClick={() => handleTabClick('dashboard')}
          title="ไปหน้าแรก / คลิกเพื่อดูภาพรวม"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center font-bold text-white shadow-md overflow-hidden shrink-0 border border-blue-400/30">
            {organizationConfig?.logoUrl ? (
              <img 
                src={organizationConfig.logoUrl} 
                alt={organizationConfig.name} 
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            ) : (
              <span className="text-sm font-black tracking-wider text-white">
                {organizationConfig?.shortName || 'YFC'}
              </span>
            )}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs sm:text-sm font-black leading-tight text-white tracking-tight truncate group-hover:text-blue-400 transition-colors">
              {organizationConfig?.name || 'YALA FOOTBALL CLINIC'}
            </span>
            <span className="text-[10px] text-blue-400 font-medium truncate">
              {organizationConfig?.nameTh || 'คลีนิกฟุตบอลยะลา'}
            </span>
            <span className="text-[9px] text-slate-400 truncate">
              {organizationConfig?.tagline || 'Youth Academy'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowOrgConfigModal(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/80 transition-colors"
            title="แก้ไขรูปภาพโลโก้ และชื่อองค์กร"
          >
            <Edit3 className="w-4 h-4 text-slate-400 hover:text-blue-400" />
          </button>
          {onClose && (
            <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center justify-between p-3 rounded-lg text-sm transition-colors text-left ${
                isActive
                  ? 'bg-blue-600 text-white font-medium shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'opacity-70'}`} />
                <div className="flex flex-col truncate">
                  <span className="truncate">{item.label}</span>
                  <span className="text-[10px] text-slate-400 font-normal truncate">{item.sublabel}</span>
                </div>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ml-2 ${item.badgeColor || 'bg-blue-500/30 text-blue-200'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Action CTA Button */}
      <div className="px-4 pb-2 space-y-1.5">
        {onOpenRegister && (
          <button
            onClick={() => {
              if (onClose) onClose();
              onOpenRegister();
            }}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
          >
            <UserPlus className="w-4 h-4" />
            <span>รับสมัครนักเรียนใหม่</span>
          </button>
        )}

        <button
          onClick={() => {
            if (onClose) onClose();
            setShowOrgConfigModal(true);
          }}
          className="w-full py-2 px-3 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white rounded-xl text-[11px] font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-700/60"
        >
          <Building2 className="w-3.5 h-3.5 text-blue-400" />
          <span>ตั้งค่าองค์กร & ตราสโมสร</span>
        </button>
      </div>

      {/* Footer Profile Info & Auth Buttons */}
      <div className="p-4 border-t border-slate-700 space-y-2">
        {currentUser ? (
          <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <img 
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
                alt="" 
                className="w-8 h-8 rounded-full object-cover border border-slate-600 shrink-0" 
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-200 truncate">{currentUser.fullName}</span>
                <span className="text-[10px] text-slate-400 truncate font-mono">@{currentUser.username}</span>
              </div>
            </div>
            
            <button
              onClick={logout}
              title="ออกจากระบบ (Sign Out)"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/80 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowLoginModal(true)}
            className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <LogIn className="w-4 h-4" />
            <span>เข้าสู่ระบบ (Sign In)</span>
          </button>
        )}
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="w-64 bg-[#1E293B] text-white hidden lg:flex flex-col shrink-0 border-r border-slate-700 h-full">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
