import React from 'react';
import { useApp } from '../../context/AppContext';
import { RolePermissions, PermissionLevel } from '../../types';
import { ShieldAlert, Lock, ArrowRight, UserCheck, Shield } from 'lucide-react';

interface PermissionGuardProps {
  module: keyof RolePermissions;
  requiredLevel?: PermissionLevel;
  children: React.ReactNode;
  moduleNameTh?: string;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  module,
  requiredLevel = 'view_only',
  children,
  moduleNameTh = 'ส่วนงานนี้'
}) => {
  const { hasPermission, currentUser, currentRole, setActiveTab, setShowLoginModal, loginAsDemo } = useApp();

  const isAllowed = hasPermission(module, requiredLevel);

  if (isAllowed) {
    return <>{children}</>;
  }

  const roleLabelMap: Record<string, string> = {
    admin_staff: 'เจ้าหน้าที่ / ผู้ดูแลระบบคลีนิก',
    coach: 'โค้ชผู้ฝึกสอน',
    student_parent: 'นักเรียน / ผู้ปกครอง'
  };

  return (
    <div className="min-h-[500px] flex items-center justify-center p-6">
      <div className="bg-white max-w-lg w-full rounded-2xl border border-slate-200 shadow-xs p-8 text-center space-y-6">
        
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100 shadow-xs">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>สิทธิ์การเข้าถึงถูกจำกัด (Access Restricted)</span>
          </div>
          <h2 className="text-lg font-bold text-slate-800">
            คุณไม่มีสิทธิ์เข้าถึงเมนู "{moduleNameTh}"
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            ระบบความปลอดภัยของคลีนิกฟุตบอลยะลา กำหนดให้เฉพาะบทบาทที่มีสิทธิ์ระดับ{' '}
            <span className="font-semibold text-slate-700">
              {requiredLevel === 'full' ? 'สิทธิ์เต็มรูปแบบ (Full Access)' : 'สิทธิ์ดูข้อมูล (View Access)'}
            </span>{' '}
            เท่านั้นจึงจะสามารถเข้าใช้งานส่วนนี้ได้
          </p>
        </div>

        {/* Current user role info */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            ข้อมูลบัญชีปัจจุบันของคุณ
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img 
                src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
                alt="" 
                className="w-8 h-8 rounded-full border border-slate-200 object-cover" 
              />
              <div>
                <div className="font-bold text-slate-800">{currentUser?.fullName || 'ผู้เยี่ยมชม'}</div>
                <div className="text-[11px] text-slate-500">{roleLabelMap[currentRole] || currentRole}</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-mono font-medium">
              Role: {currentRole}
            </span>
          </div>
        </div>

        {/* Action recommendations */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setActiveTab(currentRole === 'admin_staff' ? 'dashboard' : 'portal')}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            กลับสู่หน้าหลักที่ได้รับอนุญาต
          </button>
          
          <button
            onClick={() => loginAsDemo('admin_staff', 'usr-admin-01')}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>สลับเป็นบัญชีผู้ดูแลระบบ (Admin Demo)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
