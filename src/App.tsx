/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { MemberManagement } from './components/members/MemberManagement';
import { PaymentManagement } from './components/payments/PaymentManagement';
import { FinanceManagement } from './components/finance/FinanceManagement';
import { ScheduleManagement } from './components/schedule/ScheduleManagement';
import { AttendanceManagement } from './components/attendance/AttendanceManagement';
import { SkillAssessmentManagement } from './components/skills/SkillAssessmentManagement';
import { CoachManagement } from './components/coaches/CoachManagement';
import { AssetManagement } from './components/assets/AssetManagement';
import { TermsView } from './components/terms/TermsView';
import { MemberPortal } from './components/portal/MemberPortal';
import { RegistrationModal } from './components/registration/RegistrationModal';
import { LoginModal } from './components/auth/LoginModal';
import { PermissionGuard } from './components/auth/PermissionGuard';
import { AccessControlManagement } from './components/admin/AccessControlManagement';
import { SupabaseConfigModal } from './components/modals/SupabaseConfigModal';
import { OrganizationConfigModal } from './components/modals/OrganizationConfigModal';

const MainAppContent: React.FC = () => {
  const { 
    currentRole, 
    activeTab, 
    setActiveTab, 
    showLoginModal, 
    setShowLoginModal,
    showSupabaseModal,
    setShowSupabaseModal,
    showOrgConfigModal,
    setShowOrgConfigModal,
    organizationConfig
  } = useApp();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  // Helper context navigation props
  const [selectedScheduleForAttendance, setSelectedScheduleForAttendance] = useState<string | undefined>(undefined);
  const [selectedStudentForSkill, setSelectedStudentForSkill] = useState<string | undefined>(undefined);

  const handleNavigate = (tab: string, extraParam?: string) => {
    if (tab === 'attendance' && extraParam) {
      setSelectedScheduleForAttendance(extraParam);
    }
    if (tab === 'skills' && extraParam) {
      setSelectedStudentForSkill(extraParam);
    }
    setActiveTab(tab);
  };

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] font-sans overflow-hidden antialiased text-slate-800">
      
      {/* Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleNavigate}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenRegister={() => setShowRegistrationModal(true)}
      />

      {/* Main App Stage */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Navbar Header */}
        <Navbar 
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenRegister={() => setShowRegistrationModal(true)}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F8FAFC] space-y-6">
          <div className="max-w-7xl mx-auto w-full space-y-6">
            
            {activeTab === 'dashboard' && (
              <PermissionGuard module="dashboard" moduleNameTh="แดชบอร์ดภาพรวมคลีนิก">
                <ExecutiveDashboard 
                  onOpenRegister={() => setShowRegistrationModal(true)}
                  onNavigateTab={handleNavigate}
                />
              </PermissionGuard>
            )}

            {activeTab === 'members' && (
              <PermissionGuard module="members" moduleNameTh="ทะเบียนสมาชิกนักเรียน">
                <MemberManagement 
                  onOpenRegister={() => setShowRegistrationModal(true)}
                  onSelectStudentForEval={(studentId) => handleNavigate('skills', studentId)}
                />
              </PermissionGuard>
            )}

            {activeTab === 'payments' && (
              <PermissionGuard module="payments" moduleNameTh="การเงินและค่าเล่าเรียน">
                <PaymentManagement />
              </PermissionGuard>
            )}

            {activeTab === 'finance' && (
              <PermissionGuard module="finance" moduleNameTh="บัญชีรายจ่ายคลีนิก">
                <FinanceManagement />
              </PermissionGuard>
            )}

            {activeTab === 'schedule' && (
              <PermissionGuard module="schedule" moduleNameTh="ตารางการฝึกซ้อม">
                <ScheduleManagement 
                  onTakeAttendance={(scheduleId) => handleNavigate('attendance', scheduleId)}
                />
              </PermissionGuard>
            )}

            {activeTab === 'attendance' && (
              <PermissionGuard module="attendance" moduleNameTh="บันทึกเวลาเรียนและการเช็คชื่อ">
                <AttendanceManagement 
                  initialScheduleId={selectedScheduleForAttendance}
                />
              </PermissionGuard>
            )}

            {activeTab === 'skills' && (
              <PermissionGuard module="skills" moduleNameTh="ประเมินทักษะและพัฒนาการ">
                <SkillAssessmentManagement 
                  initialStudentId={selectedStudentForSkill}
                />
              </PermissionGuard>
            )}

            {activeTab === 'coaches' && (
              <PermissionGuard module="coaches" moduleNameTh="ฝ่ายบุคคลและผู้ฝึกสอน">
                <CoachManagement />
              </PermissionGuard>
            )}

            {activeTab === 'assets' && (
              <PermissionGuard module="assets" moduleNameTh="ครุภัณฑ์และอุปกรณ์ฝึกซ้อม">
                <AssetManagement />
              </PermissionGuard>
            )}

            {activeTab === 'access_control' && (
              <PermissionGuard module="accessControl" requiredLevel="view_only" moduleNameTh="จัดการผู้ใช้และสิทธิ์ความปลอดภัย (RBAC)">
                <AccessControlManagement />
              </PermissionGuard>
            )}

            {activeTab === 'terms' && (
              <TermsView />
            )}

            {activeTab === 'portal' && (
              <MemberPortal 
                onNavigateTab={handleNavigate}
                onOpenRegister={() => setShowRegistrationModal(true)}
              />
            )}

            {/* Footer Notice */}
            <footer className="pt-8 pb-4 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span className="font-semibold text-slate-700">
                  {organizationConfig?.nameTh || 'คลีนิกฟุตบอลยะลา'} 
                </span>
                <span>• ๋หลักสูตร Japan Football Academy </span>
              </div>
            </footer>
          </div>
        </main>

      </div>

      {/* Registration Modal */}
      {showRegistrationModal && (
        <RegistrationModal onClose={() => setShowRegistrationModal(false)} />
      )}

      {/* Organization Config & Logo Modal */}
      {showOrgConfigModal && (
        <OrganizationConfigModal 
          isOpen={showOrgConfigModal} 
          onClose={() => setShowOrgConfigModal(false)} 
        />
      )}

      {/* Login & Auth Modal */}
      {showLoginModal && (
        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
          onOpenRegister={() => {
            setShowLoginModal(false);
            setShowRegistrationModal(true);
          }}
        />
      )}

      {/* Supabase Database Configuration & Migration Modal */}
      {showSupabaseModal && (
        <SupabaseConfigModal 
          isOpen={showSupabaseModal} 
          onClose={() => setShowSupabaseModal(false)} 
        />
      )}

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
