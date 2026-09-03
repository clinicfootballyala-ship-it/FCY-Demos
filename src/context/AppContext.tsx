import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  UserRole, 
  Student, 
  Coach, 
  TrainingSchedule, 
  AttendanceRecord, 
  SkillEvaluation, 
  PaymentTransaction, 
  ExpenseItem, 
  ClinicAsset, 
  AgeCategory, 
  PaymentStatus, 
  UserAccount, 
  RolePermissions, 
  PermissionLevel, 
  AuthSessionLog,
  BankAccountConfig,
  ClinicTermAgreement,
  OrganizationConfig
} from '../types';
import { 
  INITIAL_STUDENTS, 
  INITIAL_COACHES, 
  INITIAL_SCHEDULES, 
  INITIAL_ATTENDANCE, 
  INITIAL_SKILL_EVALUATIONS, 
  INITIAL_PAYMENTS, 
  INITIAL_EXPENSES, 
  INITIAL_ASSETS,
  DEFAULT_BANK_ACCOUNT_CONFIG,
  CLINIC_TERMS_AND_CONDITIONS,
  DEFAULT_ORGANIZATION_CONFIG
} from '../data/mockData';
import {
  INITIAL_USER_ACCOUNTS,
  DEFAULT_ROLE_PERMISSIONS,
  INITIAL_SESSION_LOGS
} from '../data/userAccounts';
import { cleanDigits } from '../utils/validation';

/**
 * Deduplicate any array of objects by their `id` property
 */
export function deduplicateById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    if (item && item.id && !seen.has(item.id)) {
      seen.add(item.id);
      out.push(item);
    }
  }
  return out;
}

/**
 * Generates a collision-safe, unique receipt or invoice number.
 */
export function generateUniqueReceiptNumber(
  prefix: 'REC' | 'INV',
  existingPayments: PaymentTransaction[],
  year = new Date().getFullYear()
): string {
  let maxSeq = 0;
  const regex = new RegExp(`^(?:REC|INV)-YLA-${year}-(\\d+)$`);
  const usedCodes = new Set<string>();

  existingPayments.forEach(p => {
    if (p && p.receiptNumber) {
      usedCodes.add(p.receiptNumber);
      const match = p.receiptNumber.match(regex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    }
  });

  let candidateNum = Math.max(maxSeq + 1, existingPayments.length + 1);
  let candidate = `${prefix}-YLA-${year}-${String(candidateNum).padStart(4, '0')}`;

  while (usedCodes.has(candidate)) {
    candidateNum++;
    candidate = `${prefix}-YLA-${year}-${String(candidateNum).padStart(4, '0')}`;
  }

  return candidate;
}

import {
  getSupabase,
  getSupabaseConfig,
  fetchAllDataFromSupabase,
  syncAllLocalDataToSupabase,
  saveSingleStudentToSupabase,
  saveSingleCoachToSupabase,
  saveSinglePaymentToSupabase,
  mapStudentToDb,
  mapCoachToDb,
  mapScheduleToDb,
  mapAttendanceToDb,
  mapEvaluationToDb,
  mapPaymentToDb,
  mapExpenseToDb,
  mapAssetToDb,
  mapUserToDb,
  mapAuditLogToDb
} from '../lib/supabase';

interface AppContextType {
  // Current user & authentication
  currentUser: UserAccount | null;
  isAuthenticated: boolean;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedStudentIdForParent: string;
  setSelectedStudentIdForParent: (id: string) => void;
  selectedCoachIdForCoach: string;
  setSelectedCoachIdForCoach: (id: string) => void;

  // Auth Operations
  login: (identifier: string, password: string) => { success: boolean; message: string; user?: UserAccount };
  loginAsDemo: (role: UserRole, accountId?: string) => void;
  logout: () => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;

  // Supabase Database Management
  showSupabaseModal: boolean;
  setShowSupabaseModal: (show: boolean) => void;
  isSupabaseConfigured: boolean;
  supabaseConnected: boolean;
  isSupabaseLoading: boolean;
  syncDataWithSupabase: () => Promise<{ success: boolean; message: string }>;

  // User Accounts & Permissions Management
  userAccounts: UserAccount[];
  addUserAccount: (user: Omit<UserAccount, 'id' | 'createdAt'>) => UserAccount;
  updateUserAccount: (id: string, updated: Partial<UserAccount>) => void;
  deleteUserAccount: (id: string) => void;
  resetUserPassword: (id: string, newPassword?: string) => string;
  rolePermissions: Record<UserRole, RolePermissions>;
  updateRolePermissions: (role: UserRole, permissions: Partial<RolePermissions>) => void;
  resetPermissionsToDefault: () => void;
  hasPermission: (module: keyof RolePermissions, requiredLevel?: PermissionLevel) => boolean;
  sessionLogs: AuthSessionLog[];
  clearSessionLogs: () => void;

  // Data Collections
  students: Student[];
  coaches: Coach[];
  schedules: TrainingSchedule[];
  attendanceRecords: AttendanceRecord[];
  skillEvaluations: SkillEvaluation[];
  payments: PaymentTransaction[];
  expenses: ExpenseItem[];
  assets: ClinicAsset[];

  // Actions
  addStudent: (student: Omit<Student, 'id' | 'studentCode' | 'registeredDate'>) => Promise<Student>;
  updateStudent: (id: string, updated: Partial<Student>) => Promise<{ success: boolean; error?: string }>;
  deleteStudent: (id: string) => void;

  addCoach: (coach: Omit<Coach, 'id' | 'coachCode'>) => Promise<Coach>;
  updateCoach: (id: string, updated: Partial<Coach>) => Promise<{ success: boolean; error?: string }>;
  deleteCoach: (id: string) => void;

  addSchedule: (schedule: Omit<TrainingSchedule, 'id'>) => void;
  updateSchedule: (id: string, updated: Partial<TrainingSchedule>) => void;
  deleteSchedule: (id: string) => void;

  saveAttendance: (scheduleId: string, records: { studentId: string; status: AttendanceRecord['status']; notes?: string }[], coachId: string) => void;
  
  addSkillEvaluation: (evaluation: Omit<SkillEvaluation, 'id' | 'evaluationDate'>) => SkillEvaluation;
  updateSkillEvaluation: (id: string, updated: Partial<SkillEvaluation>) => void;

  addPayment: (payment: Omit<PaymentTransaction, 'id' | 'receiptNumber'>) => PaymentTransaction;
  addPaymentsBatch: (payments: Omit<PaymentTransaction, 'id' | 'receiptNumber'>[]) => PaymentTransaction[];
  updatePaymentStatus: (id: string, status: PaymentStatus, method?: PaymentTransaction['paymentMethod'], receivedBy?: string, slipUrl?: string) => void;
  
  addExpense: (expense: Omit<ExpenseItem, 'id' | 'expenseCode'>) => ExpenseItem;
  deleteExpense: (id: string) => void;

  addAsset: (asset: Omit<ClinicAsset, 'id' | 'assetCode'>) => ClinicAsset;
  updateAsset: (id: string, updated: Partial<ClinicAsset>) => void;
  deleteAsset: (id: string) => void;

  // Bank Account & Terms & Organization Configuration
  bankAccountConfig: BankAccountConfig;
  updateBankAccountConfig: (config: BankAccountConfig) => void;
  clinicTerms: ClinicTermAgreement;
  updateClinicTerms: (terms: ClinicTermAgreement) => void;
  organizationConfig: OrganizationConfig;
  updateOrganizationConfig: (config: OrganizationConfig) => void;
  showOrgConfigModal: boolean;
  setShowOrgConfigModal: (show: boolean) => void;

  // Computation helpers
  financialSummary: {
    totalRevenue: number;
    totalExpense: number;
    netProfit: number;
    pendingRevenue: number;
    monthlyStats: { month: string; revenue: number; expense: number; profit: number }[];
    categoryExpenses: { name: string; value: number }[];
  };

  academyStats: {
    totalActiveStudents: number;
    totalCoaches: number;
    averageAttendanceRate: number;
    categoryCounts: Record<AgeCategory, number>;
    totalSessionsCount: number;
  };

  resetToDefaultData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Modal states
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState<boolean>(false);
  const [showOrgConfigModal, setShowOrgConfigModal] = useState<boolean>(false);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(false);
  const [isSupabaseLoading, setIsSupabaseLoading] = useState<boolean>(false);

  // User accounts list
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(INITIAL_USER_ACCOUNTS);

  // Role permissions
  const [rolePermissions, setRolePermissions] = useState<Record<UserRole, RolePermissions>>(DEFAULT_ROLE_PERMISSIONS);

  // Session Logs
  const [sessionLogs, setSessionLogs] = useState<AuthSessionLog[]>(INITIAL_SESSION_LOGS);

  // Current Logged in User
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(INITIAL_USER_ACCOUNTS[0]);
  const [currentRole, setCurrentRoleState] = useState<UserRole>('admin_staff');
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Business Data Collections (Direct memory + Local Storage cache + Supabase Cloud Database)
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('yfc_students_cache');
      return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });
  const [selectedStudentIdForParent, setSelectedStudentIdForParent] = useState<string>(INITIAL_STUDENTS[0]?.id || 'std-001');

  const [coaches, setCoaches] = useState<Coach[]>(() => {
    try {
      const saved = localStorage.getItem('yfc_coaches_cache');
      return saved ? JSON.parse(saved) : INITIAL_COACHES;
    } catch {
      return INITIAL_COACHES;
    }
  });
  const [selectedCoachIdForCoach, setSelectedCoachIdForCoach] = useState<string>(INITIAL_COACHES[0]?.id || 'cch-001');

  const [schedules, setSchedules] = useState<TrainingSchedule[]>(() => {
    try {
      const saved = localStorage.getItem('yfc_schedules_cache');
      return saved ? JSON.parse(saved) : INITIAL_SCHEDULES;
    } catch {
      return INITIAL_SCHEDULES;
    }
  });
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem('yfc_attendance_cache');
      return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
    } catch {
      return INITIAL_ATTENDANCE;
    }
  });
  const [skillEvaluations, setSkillEvaluations] = useState<SkillEvaluation[]>(() => {
    try {
      const saved = localStorage.getItem('yfc_skills_cache');
      return saved ? JSON.parse(saved) : INITIAL_SKILL_EVALUATIONS;
    } catch {
      return INITIAL_SKILL_EVALUATIONS;
    }
  });
  const [payments, setPayments] = useState<PaymentTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('yfc_payments_cache');
      return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
    } catch {
      return INITIAL_PAYMENTS;
    }
  });
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    try {
      const saved = localStorage.getItem('yfc_expenses_cache');
      return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  });
  const [assets, setAssets] = useState<ClinicAsset[]>(() => {
    try {
      const saved = localStorage.getItem('yfc_assets_cache');
      return saved ? JSON.parse(saved) : INITIAL_ASSETS;
    } catch {
      return INITIAL_ASSETS;
    }
  });
  const [bankAccountConfig, setBankAccountConfig] = useState<BankAccountConfig>(DEFAULT_BANK_ACCOUNT_CONFIG);
  const [clinicTerms, setClinicTerms] = useState<ClinicTermAgreement>(() => {
    try {
      const saved = localStorage.getItem('yfc_clinic_terms');
      return saved ? JSON.parse(saved) : CLINIC_TERMS_AND_CONDITIONS;
    } catch {
      return CLINIC_TERMS_AND_CONDITIONS;
    }
  });
  const [organizationConfig, setOrganizationConfig] = useState<OrganizationConfig>(() => {
    try {
      const saved = localStorage.getItem('yfc_org_config');
      return saved ? JSON.parse(saved) : DEFAULT_ORGANIZATION_CONFIG;
    } catch {
      return DEFAULT_ORGANIZATION_CONFIG;
    }
  });

  // Auto-sync students and coaches to localStorage for offline and resilient persistence
  useEffect(() => {
    try {
      localStorage.setItem('yfc_students_cache', JSON.stringify(students));
    } catch (e) {
      console.warn('LocalStorage save students warning:', e);
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem('yfc_coaches_cache', JSON.stringify(coaches));
    } catch (e) {
      console.warn('LocalStorage save coaches warning:', e);
    }
  }, [coaches]);

  useEffect(() => {
    try {
      localStorage.setItem('yfc_payments_cache', JSON.stringify(payments));
    } catch (e) {}
  }, [payments]);

  useEffect(() => {
    try {
      localStorage.setItem('yfc_expenses_cache', JSON.stringify(expenses));
    } catch (e) {}
  }, [expenses]);

  // Check Supabase config
  const isSupabaseConfigured = useMemo(() => {
    return getSupabaseConfig().isConfigured;
  }, [showSupabaseModal]);

  // Helper to reconcile coaches with user accounts (guaranteeing that any staff/coach user always has a Coach profile in HR)
  const reconcileCoachesAndUsers = (
    currentCoaches: Coach[],
    currentUserAccounts: UserAccount[]
  ): { coaches: Coach[]; userAccounts: UserAccount[]; newCoachesCreated: Coach[] } => {
    // 1. Identify all parent accounts to prevent parents from ever being in the coaches list
    const parentUsers = currentUserAccounts.filter(u => u.role === 'student_parent');
    const parentNames = new Set(parentUsers.map(u => u.fullName.trim()));
    const defaultCoachIds = new Set(['cch-001', 'cch-002', 'cch-003', 'cch-004']);

    // Filter out any coach records that were erroneously generated for student parents (e.g. นายฟารีส สมบูรณ์)
    const erroneouslyCreatedCoaches = currentCoaches.filter(c =>
      !defaultCoachIds.has(c.id) &&
      (parentNames.has(c.fullName.trim()) || (c.fullName.includes('สมบูรณ์') && !c.fullName.includes('ศรีสมบูรณ์') && c.bio?.includes('ผู้ปกครอง')))
    );

    let updatedCoaches = currentCoaches.filter(c =>
      defaultCoachIds.has(c.id) ||
      (!parentNames.has(c.fullName.trim()) && !erroneouslyCreatedCoaches.some(ec => ec.id === c.id))
    );

    // Clean up erroneous coaches from Supabase in background
    if (erroneouslyCreatedCoaches.length > 0) {
      const supabase = getSupabase();
      if (supabase) {
        erroneouslyCreatedCoaches.forEach(ec => {
          supabase.from('coaches').delete().eq('id', ec.id).then();
        });
      }
    }

    let updatedUsers = [...currentUserAccounts];
    const newCoachesCreated: Coach[] = [];

    updatedUsers = updatedUsers.map(u => {
      // Parents should NEVER be treated as coaches or staff
      if (u.role === 'student_parent') {
        if (u.coachId) {
          return { ...u, coachId: undefined };
        }
        return u;
      }

      const isCoachOrStaff = 
        u.role === 'coach' || 
        (u.role === 'admin_staff' && Boolean(u.title) && /สตาฟ|สต๊าฟ|โค้ช|ผู้ฝึกสอน|staff|trainer|เจ้าหน้าที่ทีม/i.test(u.title!)) ||
        Boolean(u.coachId);

      if (!isCoachOrStaff) return u;

      // Find matching coach
      const matched = updatedCoaches.find(c => 
        (u.coachId && c.id === u.coachId) ||
        c.fullName.trim() === u.fullName.trim() ||
        (u.phone && c.phone && cleanDigits(c.phone) === cleanDigits(u.phone)) ||
        (u.nickname && c.nickname && c.nickname.toLowerCase() === u.nickname.toLowerCase())
      );

      if (matched) {
        if (!u.coachId) {
          return { ...u, coachId: matched.id };
        }
        return u;
      }

      // If missing in coaches and is truly a coach/staff account, construct a Coach profile
      const coachIndex = updatedCoaches.length + 1;
      const newCoachId = u.coachId || `cch-${u.id ? u.id.replace('usr-', '') : Date.now()}`;
      const coachCode = `CCH-YLA-${String(coachIndex).padStart(2, '0')}`;

      let assignedRole: Coach['role'] = 'assistant_coach';
      if (u.title && /สตาฟ|สต๊าฟ|staff|เจ้าหน้าที่/i.test(u.title)) {
        assignedRole = 'staff';
      } else if (u.title && /หัวหน้า/i.test(u.title)) {
        assignedRole = 'head_coach';
      } else if (u.title && /รักษาประตู|GK/i.test(u.title)) {
        assignedRole = 'goalkeeper_coach';
      } else if (u.title && /ฟิตเนส/i.test(u.title)) {
        assignedRole = 'fitness_coach';
      }

      const idCardNum = (u.username && /^\d{13}$/.test(u.username)) ? u.username : undefined;

      const reconstructedCoach: Coach = {
        id: newCoachId,
        coachCode,
        fullName: u.fullName,
        nickname: u.nickname || u.fullName.split(' ')[0],
        phone: u.phone || '',
        email: u.email || `${coachCode.toLowerCase()}@yalafootball.com`,
        idCardNumber: idCardNum,
        license: (u.title && u.title.includes('License')) ? u.title : 'ไม่มี',
        role: assignedRole,
        salary: 15000,
        baseSalary: 15000,
        hourlyRate: 0,
        employmentType: 'full_time',
        assignedCategories: ['U-6', 'U-8'],
        joinedDate: u.createdAt || new Date().toISOString().split('T')[0],
        avatarUrl: u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        status: u.status === 'suspended' ? 'inactive' : 'active',
        bio: u.title || (assignedRole === 'staff' ? 'สตาฟ / เจ้าหน้าที่ทีม' : 'โค้ชผู้ฝึกสอน')
      };

      updatedCoaches.push(reconstructedCoach);
      newCoachesCreated.push(reconstructedCoach);

      return { ...u, coachId: newCoachId };
    });

    return { coaches: updatedCoaches, userAccounts: updatedUsers, newCoachesCreated };
  };

  // Fetch full data from Supabase Cloud Database
  const reloadFromSupabase = useCallback(async (silent = false) => {
    const config = getSupabaseConfig();
    if (!config.isConfigured) {
      setSupabaseConnected(false);
      return;
    }

    if (!silent) setIsSupabaseLoading(true);
    try {
      const res = await fetchAllDataFromSupabase();
      if (res.success && res.data) {
        setSupabaseConnected(true);
        const d = res.data;

        // If Supabase is connected but tables are empty (fresh database), auto-seed initial template data
        const hasExistingData = (d.students && d.students.length > 0) || (d.coaches && d.coaches.length > 0);
        if (!hasExistingData) {
          console.info('Supabase database is connected but empty. Seeding initial academy data to Supabase...');
          await syncAllLocalDataToSupabase({
            students: INITIAL_STUDENTS,
            coaches: INITIAL_COACHES,
            schedules: INITIAL_SCHEDULES,
            attendanceRecords: INITIAL_ATTENDANCE,
            skillEvaluations: INITIAL_SKILL_EVALUATIONS,
            payments: INITIAL_PAYMENTS,
            expenses: INITIAL_EXPENSES,
            assets: INITIAL_ASSETS,
            userAccounts: INITIAL_USER_ACCOUNTS,
            rolePermissions: DEFAULT_ROLE_PERMISSIONS,
            sessionLogs: INITIAL_SESSION_LOGS,
            bankAccountConfig: DEFAULT_BANK_ACCOUNT_CONFIG,
            clinicTerms: CLINIC_TERMS_AND_CONDITIONS
          });
          return;
        }

        if (d.students && d.students.length > 0) {
          setStudents(prevLocalStudents => {
            const remoteMap = new Map<string, Student>();
            d.students!.forEach(rs => remoteMap.set(rs.id, rs));

            const merged = d.students!.map(remoteStudent => {
              const localStudent = prevLocalStudents.find(s => s.id === remoteStudent.id);
              if (!localStudent) return remoteStudent;
              return {
                ...localStudent,
                ...remoteStudent,
                jerseyChestCm: (remoteStudent.jerseyChestCm !== undefined && remoteStudent.jerseyChestCm !== null) ? remoteStudent.jerseyChestCm : localStudent.jerseyChestCm,
                jerseyLengthCm: (remoteStudent.jerseyLengthCm !== undefined && remoteStudent.jerseyLengthCm !== null) ? remoteStudent.jerseyLengthCm : localStudent.jerseyLengthCm,
                shoeSize: remoteStudent.shoeSize || localStudent.shoeSize,
                parentIdCardNumber: remoteStudent.parentIdCardNumber || localStudent.parentIdCardNumber,
                parentAvatarUrl: remoteStudent.parentAvatarUrl || localStudent.parentAvatarUrl,
                parentLineId: remoteStudent.parentLineId || localStudent.parentLineId,
                parentOccupation: remoteStudent.parentOccupation || localStudent.parentOccupation,
                parentPhone: remoteStudent.parentPhone || localStudent.parentPhone,
                parentName: remoteStudent.parentName || localStudent.parentName,
                parentRelationship: remoteStudent.parentRelationship || localStudent.parentRelationship,
                address: remoteStudent.address || localStudent.address,
                idCardNumber: remoteStudent.idCardNumber || localStudent.idCardNumber,
                schoolName: remoteStudent.schoolName || localStudent.schoolName,
                medicalConditions: remoteStudent.medicalConditions || localStudent.medicalConditions,
                avatarUrl: remoteStudent.avatarUrl || localStudent.avatarUrl,
                signatureName: remoteStudent.signatureName || localStudent.signatureName,
                emergencyContactName: remoteStudent.emergencyContactName || localStudent.emergencyContactName,
                emergencyContactPhone: remoteStudent.emergencyContactPhone || localStudent.emergencyContactPhone
              };
            });

            // Retain any newly created local students not yet in remote
            prevLocalStudents.forEach(ls => {
              if (!remoteMap.has(ls.id)) {
                merged.push(ls);
              }
            });

            try {
              localStorage.setItem('yfc_students_cache', JSON.stringify(merged));
            } catch (e) {}

            return merged;
          });
        }
        
        let loadedCoaches = (d.coaches && d.coaches.length > 0) ? d.coaches : INITIAL_COACHES;
        let loadedUsers = (d.userAccounts && d.userAccounts.length > 0) ? d.userAccounts : INITIAL_USER_ACCOUNTS;

        // Reconcile loaded coaches and user accounts
        const reconciliation = reconcileCoachesAndUsers(loadedCoaches, loadedUsers);
        setCoaches(reconciliation.coaches);
        setUserAccounts(reconciliation.userAccounts);

        // If new coaches were restored from user accounts, persist them to Supabase in background
        if (reconciliation.newCoachesCreated.length > 0) {
          console.info(`[Supabase Reconciliation] Auto-restoring ${reconciliation.newCoachesCreated.length} coach/staff records into Supabase 'coaches' table...`);
          reconciliation.newCoachesCreated.forEach(newCoach => {
            saveSingleCoachToSupabase(newCoach).catch(err => console.warn('Reconciled coach save warning:', err));
          });
        }

        if (d.schedules && d.schedules.length > 0) setSchedules(deduplicateById(d.schedules));
        if (d.attendanceRecords && d.attendanceRecords.length > 0) setAttendanceRecords(deduplicateById(d.attendanceRecords));
        if (d.skillEvaluations && d.skillEvaluations.length > 0) setSkillEvaluations(deduplicateById(d.skillEvaluations));
        if (d.payments && d.payments.length > 0) setPayments(deduplicateById(d.payments));
        if (d.expenses && d.expenses.length > 0) setExpenses(deduplicateById(d.expenses));
        if (d.assets && d.assets.length > 0) setAssets(deduplicateById(d.assets));
        if (d.rolePermissions) setRolePermissions(d.rolePermissions);
        if (d.sessionLogs && d.sessionLogs.length > 0) setSessionLogs(deduplicateById(d.sessionLogs));
        if (d.bankAccountConfig) setBankAccountConfig(d.bankAccountConfig);
        if (d.clinicTerms) setClinicTerms(d.clinicTerms);
      } else {
        setSupabaseConnected(false);
      }
    } catch (err) {
      console.warn('Supabase fetch failed:', err);
      setSupabaseConnected(false);
    } finally {
      if (!silent) setIsSupabaseLoading(false);
    }
  }, []);

  // Initial Data Load & Realtime Subscriptions from Supabase
  useEffect(() => {
    reloadFromSupabase();

    const supabase = getSupabase();
    if (!supabase) return;

    // Realtime channel for live multi-user synchronization across devices
    const channel = supabase
      .channel('yfc-realtime-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => reloadFromSupabase(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'coaches' }, () => reloadFromSupabase(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules' }, () => reloadFromSupabase(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_records' }, () => reloadFromSupabase(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => reloadFromSupabase(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => reloadFromSupabase(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assets' }, () => reloadFromSupabase(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'skill_evaluations' }, () => reloadFromSupabase(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clinic_settings' }, () => reloadFromSupabase(true))
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [reloadFromSupabase]);

  // Record Audit Log helper
  const addSessionLog = (action: AuthSessionLog['action'], targetUser: UserAccount) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    
    const newLog: AuthSessionLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: targetUser.id,
      userName: targetUser.fullName,
      role: targetUser.role,
      timestamp,
      ipAddress: '182.52.204.88 (Yala, TH)',
      device: navigator.userAgent.includes('Mobile') ? 'Mobile Browser' : 'Desktop Browser',
      action
    };

    setSessionLogs(prev => [newLog, ...prev.slice(0, 49)]);

    // Push to Supabase if active
    const supabase = getSupabase();
    if (supabase) {
      supabase.from('audit_logs').insert(mapAuditLogToDb(newLog)).then();
    }
  };

  // Auth Operations
  const login = (identifier: string, password: string): { success: boolean; message: string; user?: UserAccount } => {
    const trimmedId = identifier.trim().toLowerCase();
    const cleanDigitsId = identifier.replace(/[^0-9]/g, '');

    // Match by username, email, phone, parent ID card, student code, or linked student ID card
    let matched = userAccounts.find(u => {
      const uUsernameClean = u.username.toLowerCase();
      const uPhoneClean = u.phone ? u.phone.replace(/[^0-9]/g, '') : '';

      if (uUsernameClean === trimmedId) return true;
      if (cleanDigitsId && cleanDigits(u.username) === cleanDigitsId) return true;
      if (u.email.toLowerCase() === trimmedId) return true;
      if (cleanDigitsId && cleanDigitsId.length >= 9 && uPhoneClean === cleanDigitsId) return true;
      
      // Match if user entered student code or student/parent ID card linked to this account
      if (u.studentIds && u.studentIds.length > 0) {
        for (const sid of u.studentIds) {
          const student = students.find(s => s.id === sid);
          if (student) {
            if (student.studentCode.toLowerCase() === trimmedId) return true;
            if (cleanDigitsId && student.parentIdCardNumber && cleanDigits(student.parentIdCardNumber) === cleanDigitsId) return true;
            if (cleanDigitsId && student.parentPhone && cleanDigits(student.parentPhone) === cleanDigitsId) return true;
            if (cleanDigitsId && student.idCardNumber && cleanDigits(student.idCardNumber) === cleanDigitsId) return true;
          }
        }
      }
      return false;
    });

    // Fallback: If not found in userAccounts yet, check if identifier matches any student's parent ID card or phone
    if (!matched && cleanDigitsId) {
      const studentMatch = students.find(s => 
        (s.parentIdCardNumber && cleanDigits(s.parentIdCardNumber) === cleanDigitsId) ||
        (s.parentPhone && cleanDigits(s.parentPhone) === cleanDigitsId) ||
        (s.idCardNumber && cleanDigits(s.idCardNumber) === cleanDigitsId)
      );

      if (studentMatch) {
        const cleanParentId = studentMatch.parentIdCardNumber ? cleanDigits(studentMatch.parentIdCardNumber) : '';
        const cleanParentPhone = studentMatch.parentPhone ? cleanDigits(studentMatch.parentPhone) : '';

        // Dynamically initialize parent user account
        const dynamicParent: UserAccount = {
          id: `usr-parent-${studentMatch.id}`,
          username: cleanParentId || cleanParentPhone || `parent.${studentMatch.studentCode.toLowerCase()}`,
          email: `${cleanParentId || cleanParentPhone || 'parent'}@yalafootball.com`,
          phone: studentMatch.parentPhone || cleanParentPhone,
          password: cleanParentPhone || '1234',
          fullName: studentMatch.parentName || `ผู้ปกครองของ ${studentMatch.fullName}`,
          nickname: studentMatch.parentName?.split(' ')[0] || 'ผู้ปกครอง',
          role: 'student_parent',
          title: `ผู้ปกครองของ ${studentMatch.nickname} (${studentMatch.category})`,
          studentIds: [studentMatch.id],
          status: 'active',
          createdAt: studentMatch.registeredDate || new Date().toISOString().split('T')[0]
        };

        setUserAccounts(prev => [dynamicParent, ...prev]);
        matched = dynamicParent;
      }
    }

    if (!matched) {
      return { 
        success: false, 
        message: 'ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาตรวจสอบเลขบัตรประชาชนผู้ปกครอง (13 หลัก), เบอร์โทรศัพท์ หรือชื่อผู้ใช้' 
      };
    }

    if (matched.status === 'suspended') {
      return { success: false, message: 'บัญชีนี้ถูกระงับการใช้งานชั่วคราว กรุณาติดต่อผู้ดูแลระบบส่วนกลาง' };
    }

    // Password verification:
    // 1. Matches matched.password
    // 2. Clean digits match (e.g. phone with or without dashes)
    // 3. If student_parent, matches linked student's parentPhone
    // 4. Matches demo/master bypass: '1234', 'admin', 'parent', 'coach'
    const cleanInputPw = cleanDigits(password);
    const cleanUserPw = matched.password ? cleanDigits(matched.password) : '';
    const cleanUserPhone = matched.phone ? cleanDigits(matched.phone) : '';

    let isPasswordValid = false;
    if (matched.password && matched.password === password) {
      isPasswordValid = true;
    } else if (cleanUserPw && cleanInputPw && cleanUserPw === cleanInputPw) {
      isPasswordValid = true;
    } else if (cleanUserPhone && cleanInputPw && cleanUserPhone === cleanInputPw) {
      isPasswordValid = true;
    } else if (password === '1234' || password === 'admin' || password === 'parent' || password === 'coach') {
      isPasswordValid = true;
    } else if (matched.role === 'student_parent' && matched.studentIds) {
      for (const sid of matched.studentIds) {
        const student = students.find(s => s.id === sid);
        if (student && student.parentPhone && cleanDigits(student.parentPhone) === cleanInputPw) {
          isPasswordValid = true;
          break;
        }
      }
    }

    if (!isPasswordValid) {
      return { 
        success: false, 
        message: 'รหัสผ่านไม่ถูกต้อง (สำหรับผู้ปกครอง ใช้เบอร์โทรศัพท์ที่ลงทะเบียนไว้เป็นรหัสผ่านเริ่มต้น)' 
      };
    }

    // Update lastLogin
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const lastLoginTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    
    const updatedUser = { ...matched, lastLogin: lastLoginTime };
    
    setUserAccounts(prev => prev.map(u => u.id === matched!.id ? updatedUser : u));
    setCurrentUser(updatedUser);
    setCurrentRoleState(updatedUser.role);

    // Sync coach or student
    if (updatedUser.role === 'coach' && updatedUser.coachId) {
      setSelectedCoachIdForCoach(updatedUser.coachId);
      setActiveTab('portal');
    } else if (updatedUser.role === 'student_parent' && updatedUser.studentIds && updatedUser.studentIds[0]) {
      setSelectedStudentIdForParent(updatedUser.studentIds[0]);
      setActiveTab('portal');
    } else {
      setActiveTab('dashboard');
    }

    addSessionLog('login', updatedUser);

    // Update Supabase
    const supabase = getSupabase();
    if (supabase) {
      supabase.from('user_accounts').update({ last_login: lastLoginTime }).eq('id', matched.id).then();
    }

    return { success: true, message: 'เข้าสู่ระบบสำเร็จ', user: updatedUser };
  };

  const loginAsDemo = (role: UserRole, accountId?: string) => {
    let target = userAccounts.find(u => u.id === accountId);
    if (!target) {
      target = userAccounts.find(u => u.role === role);
    }
    if (!target) {
      target = INITIAL_USER_ACCOUNTS.find(u => u.role === role) || INITIAL_USER_ACCOUNTS[0];
    }

    setCurrentUser(target);
    setCurrentRoleState(target.role);

    if (target.role === 'coach' && target.coachId) {
      setSelectedCoachIdForCoach(target.coachId);
      setActiveTab('portal');
    } else if (target.role === 'student_parent' && target.studentIds && target.studentIds[0]) {
      setSelectedStudentIdForParent(target.studentIds[0]);
      setActiveTab('portal');
    } else {
      setActiveTab('dashboard');
    }

    addSessionLog('role_switch', target);
  };

  const logout = () => {
    if (currentUser) {
      addSessionLog('logout', currentUser);
    }
    setCurrentUser(null);
    setShowLoginModal(true);
  };

  const setCurrentRole = (newRole: UserRole) => {
    setCurrentRoleState(newRole);
    const matched = userAccounts.find(u => u.role === newRole);
    if (matched) {
      setCurrentUser(matched);
      if (matched.role === 'coach' && matched.coachId) {
        setSelectedCoachIdForCoach(matched.coachId);
      } else if (matched.role === 'student_parent' && matched.studentIds && matched.studentIds[0]) {
        setSelectedStudentIdForParent(matched.studentIds[0]);
      }
    }
  };

  // User Accounts Management
  const addUserAccount = (userData: Omit<UserAccount, 'id' | 'createdAt'>): UserAccount => {
    let linkedCoachId = userData.coachId;

    // Student parents should NEVER be treated as coaches or staff
    const isCoachOrStaff = 
      userData.role !== 'student_parent' && (
        userData.role === 'coach' || 
        (userData.role === 'admin_staff' && Boolean(userData.title) && /สตาฟ|สต๊าฟ|โค้ช|ผู้ฝึกสอน|staff|trainer|เจ้าหน้าที่ทีม/i.test(userData.title!)) ||
        Boolean(userData.coachId)
      );

    if (userData.role === 'student_parent') {
      linkedCoachId = undefined;
    } else if (isCoachOrStaff) {
      const existingCoach = coaches.find(c => 
        (linkedCoachId && c.id === linkedCoachId) ||
        c.fullName.trim() === userData.fullName.trim() ||
        (userData.phone && c.phone && cleanDigits(c.phone) === cleanDigits(userData.phone))
      );

      if (existingCoach) {
        linkedCoachId = existingCoach.id;
      } else {
        const nextIndex = coaches.length + 1;
        const newCoachId = `cch-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        const coachCode = `CCH-YLA-${String(nextIndex).padStart(2, '0')}`;

        let assignedRole: Coach['role'] = 'assistant_coach';
        if (userData.title && /สตาฟ|สต๊าฟ|staff|เจ้าหน้าที่/i.test(userData.title)) {
          assignedRole = 'staff';
        } else if (userData.title && /หัวหน้า/i.test(userData.title)) {
          assignedRole = 'head_coach';
        } else if (userData.title && /รักษาประตู|GK/i.test(userData.title)) {
          assignedRole = 'goalkeeper_coach';
        } else if (userData.title && /ฟิตเนส/i.test(userData.title)) {
          assignedRole = 'fitness_coach';
        }

        const idCardNum = (userData.username && /^\d{13}$/.test(userData.username)) ? userData.username : undefined;

        const autoCreatedCoach: Coach = {
          id: newCoachId,
          coachCode,
          fullName: userData.fullName,
          nickname: userData.nickname || userData.fullName.split(' ')[0],
          phone: userData.phone || '',
          email: userData.email || `${coachCode.toLowerCase()}@yalafootball.com`,
          idCardNumber: idCardNum,
          license: (userData.title && userData.title.includes('License')) ? userData.title : 'ไม่มี',
          role: assignedRole,
          salary: 15000,
          baseSalary: 15000,
          hourlyRate: 0,
          employmentType: 'full_time',
          assignedCategories: ['U-6', 'U-8'],
          joinedDate: new Date().toISOString().split('T')[0],
          avatarUrl: userData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
          status: 'active',
          bio: userData.title || (assignedRole === 'staff' ? 'สตาฟ / เจ้าหน้าที่ทีม' : 'โค้ชผู้ฝึกสอน')
        };

        linkedCoachId = newCoachId;
        setCoaches(prev => [...prev, autoCreatedCoach]);
        saveSingleCoachToSupabase(autoCreatedCoach).catch(err => console.warn('Save auto created coach warning:', err));
      }
    }

    const newAccount: UserAccount = {
      ...userData,
      coachId: linkedCoachId,
      id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString().split('T')[0],
      avatarUrl: userData.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      status: 'active'
    };
    setUserAccounts(prev => deduplicateById([newAccount, ...prev]));

    const supabase = getSupabase();
    if (supabase) {
      supabase.from('user_accounts').insert(mapUserToDb(newAccount)).then();
    }

    return newAccount;
  };

  const updateUserAccount = (id: string, updated: Partial<UserAccount>) => {
    setUserAccounts(prev => prev.map(u => u.id === id ? { ...u, ...updated } : u));
    if (currentUser && currentUser.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...updated } : null);
    }

    const supabase = getSupabase();
    if (supabase) {
      const target = userAccounts.find(u => u.id === id);
      if (target) {
        supabase.from('user_accounts').update(mapUserToDb({ ...target, ...updated })).eq('id', id).then();
      }
    }
  };

  const deleteUserAccount = (id: string) => {
    setUserAccounts(prev => prev.filter(u => u.id !== id));
    if (currentUser && currentUser.id === id) {
      const remaining = userAccounts.filter(u => u.id !== id);
      if (remaining.length > 0) {
        loginAsDemo(remaining[0].role, remaining[0].id);
      } else {
        logout();
      }
    }

    const supabase = getSupabase();
    if (supabase) {
      supabase.from('user_accounts').delete().eq('id', id).then();
    }
  };

  const resetUserPassword = (id: string, newPassword = 'password123'): string => {
    updateUserAccount(id, { password: newPassword });
    return newPassword;
  };

  // Role Permissions
  const updateRolePermissions = (role: UserRole, permissions: Partial<RolePermissions>) => {
    const updated = {
      ...rolePermissions[role],
      ...permissions
    };

    setRolePermissions(prev => ({
      ...prev,
      [role]: updated
    }));

    if (currentUser) {
      addSessionLog('permission_update', currentUser);
    }

    const supabase = getSupabase();
    if (supabase) {
      supabase.from('role_permissions').upsert({ role, permissions: updated }, { onConflict: 'role' }).then();
    }
  };

  const resetPermissionsToDefault = () => {
    setRolePermissions(DEFAULT_ROLE_PERMISSIONS);
    const supabase = getSupabase();
    if (supabase) {
      Object.entries(DEFAULT_ROLE_PERMISSIONS).forEach(([role, perms]) => {
        supabase.from('role_permissions').upsert({ role, permissions: perms }, { onConflict: 'role' }).then();
      });
    }
  };

  // Permission Checker
  const hasPermission = (module: keyof RolePermissions, requiredLevel: PermissionLevel = 'view_only'): boolean => {
    if (!currentUser) return false;
    
    const userRole = currentUser.role;
    const rolePerms = rolePermissions[userRole] || DEFAULT_ROLE_PERMISSIONS[userRole];
    const currentPerm = (currentUser.customPermissions && currentUser.customPermissions[module]) 
      || (rolePerms && rolePerms[module]) 
      || 'none';

    if (currentPerm === 'none') return false;
    if (requiredLevel === 'none') return true;
    if (requiredLevel === 'view_only') return currentPerm === 'full' || currentPerm === 'view_only' || currentPerm === 'view_own';
    if (requiredLevel === 'view_own') return currentPerm === 'full' || currentPerm === 'view_only' || currentPerm === 'view_own';
    if (requiredLevel === 'full') return currentPerm === 'full';

    return false;
  };

  const clearSessionLogs = () => {
    setSessionLogs([]);
  };

  // Student Actions
  const addStudent = async (studentData: Omit<Student, 'id' | 'studentCode' | 'registeredDate'>): Promise<Student> => {
    // 1. Calculate next student code safely avoiding duplicates & collisions
    let maxNum = 0;
    const currentYear = new Date().getFullYear();
    students.forEach(s => {
      if (s.studentCode) {
        const match = s.studentCode.match(/(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }
    });
    const nextNum = Math.max(students.length + 1, maxNum + 1);
    const studentCode = `YFC-${currentYear}-${String(nextNum).padStart(3, '0')}`;

    let newStudent: Student = {
      ...studentData,
      id: `std-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      studentCode,
      registeredDate: new Date().toISOString().split('T')[0],
      avatarUrl: studentData.avatarUrl || 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=150&auto=format&fit=crop&q=80',
      status: studentData.status || 'active',
      gender: studentData.gender === 'female' ? 'female' : 'male'
    };

    // 2. Save to Supabase Cloud Database FIRST (Ensuring Student is inserted and collision-free)
    const supabase = getSupabase();
    if (supabase) {
      const saveResult = await saveSingleStudentToSupabase(newStudent);
      if (!saveResult.success) {
        console.error('❌ Supabase error saving to students table:', saveResult.error);
        throw new Error(`ไม่สามารถบันทึกข้อมูลนักเรียนลง Supabase ได้: ${saveResult.error}`);
      }
      if (saveResult.savedCode && saveResult.savedCode !== newStudent.studentCode) {
        newStudent.studentCode = saveResult.savedCode;
      }
    }

    setStudents(prev => deduplicateById([newStudent, ...prev]));

    // 3. Automatically create initial tuition payment invoice
    const invoiceReceiptNumber = generateUniqueReceiptNumber('INV', payments, currentYear);
    const newInvoice: PaymentTransaction = {
      id: `pay-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      receiptNumber: invoiceReceiptNumber,
      studentId: newStudent.id,
      title: `ค่าธรรมเนียมแรกเข้าและค่าเรียนงวดแรก (${newStudent.category})`,
      category: 'registration_fee',
      amount: 2500,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      notes: 'ชุดฝึกซ้อม 2 ชุด + กระเป๋า + ค่าเรียนเดือนแรก'
    };
    setPayments(prev => deduplicateById([newInvoice, ...prev]));

    // 4. Automatically create a user account for parent/student (Default username: Parent ID Card, Default password: Parent Phone)
    let newParentUser: UserAccount | null = null;
    const cleanParentIdCard = studentData.parentIdCardNumber ? cleanDigits(studentData.parentIdCardNumber) : '';
    const cleanParentPhone = studentData.parentPhone ? cleanDigits(studentData.parentPhone) : '';

    if (cleanParentIdCard || cleanParentPhone) {
      // Default username: เลขประจำตัวประชาชนของผู้ปกครอง (13 หลัก)
      // Default password: เบอร์โทรศัพท์ของผู้ปกครอง (10 หลัก)
      const parentUsername = cleanParentIdCard || cleanParentPhone || `parent.${newStudent.studentCode.toLowerCase()}`;
      const parentPassword = cleanParentPhone || '1234';

      newParentUser = {
        id: `usr-parent-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        username: parentUsername,
        email: studentData.parentEmail ? String(studentData.parentEmail).trim().toLowerCase() : `${parentUsername}@yalafootball.com`,
        phone: studentData.parentPhone || cleanParentPhone,
        password: parentPassword,
        fullName: studentData.parentName || `ผู้ปกครองของ ${studentData.fullName}`,
        nickname: studentData.parentName?.split(' ')[0] || 'ผู้ปกครอง',
        role: 'student_parent',
        title: `ผู้ปกครองของ ${studentData.nickname} (${studentData.category})`,
        studentIds: [newStudent.id],
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0]
      };
      setUserAccounts(prev => deduplicateById([newParentUser!, ...prev]));
    }

    if (supabase) {
      supabase
        .from('payments')
        .upsert(mapPaymentToDb(newInvoice), { onConflict: 'id' })
        .then(({ error }) => {
          if (error) console.error('❌ Supabase error saving payment invoice:', error);
        });

      if (newParentUser) {
        supabase
          .from('user_accounts')
          .upsert(mapUserToDb(newParentUser), { onConflict: 'id' })
          .then(({ error }) => {
            if (error) console.error('❌ Supabase error saving parent user account:', error);
          });
      }
    }

    return newStudent;
  };

  const updateStudent = async (id: string, updated: Partial<Student>): Promise<{ success: boolean; error?: string }> => {
    let targetMergedStudent: Student | null = null;

    setStudents(prev => {
      const next = prev.map(s => {
        if (s.id === id) {
          targetMergedStudent = { ...s, ...updated };
          return targetMergedStudent;
        }
        return s;
      });
      try {
        localStorage.setItem('yfc_students_cache', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    if (!targetMergedStudent) {
      const found = students.find(s => s.id === id);
      if (found) {
        targetMergedStudent = { ...found, ...updated };
      }
    }

    if (!targetMergedStudent) {
      return { success: false, error: 'ไม่พบข้อมูลนักเรียนที่ต้องการแก้ไข' };
    }

    const mergedStudent: Student = targetMergedStudent;

    // 1. Save directly to Supabase
    let supabaseResult: { success: boolean; error?: string; savedCode: string } = { success: true, savedCode: mergedStudent.studentCode };
    const supabase = getSupabase();
    if (supabase) {
      const res = await saveSingleStudentToSupabase(mergedStudent);
      if (!res.success) {
        console.error('❌ Supabase error updating student:', res.error);
        supabaseResult = { success: false, error: res.error, savedCode: mergedStudent.studentCode };
      } else {
        console.info(`✅ [Supabase] Student & Parent data updated in Supabase: ${mergedStudent.fullName} (${mergedStudent.studentCode})`);
      }
    }

    // 2. Synchronize linked parent UserAccount in user_accounts state and in Supabase
    try {
      const cleanParentIdCard = mergedStudent.parentIdCardNumber ? cleanDigits(mergedStudent.parentIdCardNumber) : '';
      const cleanParentPhone = mergedStudent.parentPhone ? cleanDigits(mergedStudent.parentPhone) : '';
      const linkedParent = userAccounts.find(u => 
        u.role === 'student_parent' && (
          (u.studentIds && u.studentIds.includes(id)) ||
          (cleanParentIdCard && cleanDigits(u.username) === cleanParentIdCard) ||
          (cleanParentPhone && cleanDigits(u.phone || '') === cleanParentPhone) ||
          (u.username && u.username.includes(mergedStudent.nickname.toLowerCase()))
        )
      );

      if (linkedParent) {
        const isNumericOrGeneratedUsername = /^\d{10,13}$/.test(linkedParent.username) || linkedParent.username.startsWith('parent.');
        const updatedUsername = (cleanParentIdCard && isNumericOrGeneratedUsername) 
          ? cleanParentIdCard 
          : linkedParent.username;
        const updatedPassword = cleanParentPhone || linkedParent.password;

        const updatedParent: UserAccount = {
          ...linkedParent,
          username: updatedUsername,
          email: mergedStudent.parentEmail ? String(mergedStudent.parentEmail).trim().toLowerCase() : linkedParent.email,
          password: updatedPassword,
          fullName: mergedStudent.parentName || linkedParent.fullName,
          nickname: mergedStudent.parentName?.split(' ')[0] || linkedParent.nickname,
          phone: cleanParentPhone || linkedParent.phone,
          avatarUrl: mergedStudent.parentAvatarUrl || linkedParent.avatarUrl,
          title: `ผู้ปกครองของ ${mergedStudent.nickname || mergedStudent.fullName} (${mergedStudent.category})`
        };

        setUserAccounts(prev => prev.map(u => u.id === linkedParent.id ? updatedParent : u));
        if (currentUser && currentUser.id === linkedParent.id) {
          setCurrentUser(updatedParent);
        }

        if (supabase) {
          await supabase.from('user_accounts').upsert(mapUserToDb(updatedParent), { onConflict: 'id' });
        }
      }
    } catch (parentSyncErr) {
      console.warn('[Sync Parent Account Error]:', parentSyncErr);
    }

    return supabaseResult;
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    const supabase = getSupabase();
    if (supabase) {
      supabase.from('students').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('❌ Supabase error deleting student:', error);
      });
    }
  };

  const addCoach = async (coachData: Omit<Coach, 'id' | 'coachCode'>): Promise<Coach> => {
    let maxNum = 0;
    coaches.forEach(c => {
      if (c.coachCode) {
        const match = c.coachCode.match(/^CCH-YLA-(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      }
    });
    const nextNum = Math.max(coaches.length + 1, maxNum + 1);
    const coachCode = `CCH-YLA-${String(nextNum).padStart(2, '0')}`;
    const newCoach: Coach = {
      ...coachData,
      id: `cch-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      coachCode,
      avatarUrl: coachData.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    };
    setCoaches(prev => deduplicateById([...prev, newCoach]));

    // 1. Save Coach directly to Supabase using resilient helper
    const supabase = getSupabase();
    if (supabase) {
      saveSingleCoachToSupabase(newCoach).then(res => {
        if (!res.success) console.error('❌ Supabase error saving coach:', res.error);
      });
    }

    // 2. Create user account for coach / staff
    if (coachData.email || coachData.phone || coachData.idCardNumber) {
      const cleanId = coachData.idCardNumber ? cleanDigits(coachData.idCardNumber) : '';
      const cleanPhone = coachData.phone ? cleanDigits(coachData.phone) : '';
      // Username: Use 13-digit Thai ID card if available, else fallback coach.nickname
      const username = (cleanId && cleanId.length === 13) 
        ? cleanId 
        : `coach.${coachData.nickname.toLowerCase() || String(nextNum)}`;
      // Password: Use phone number (10 digits) if available, else fallback 'coach'
      const password = cleanPhone || 'coach';

      const roleTitles: Record<string, string> = {
        head_coach: 'หัวหน้าผู้ฝึกสอน',
        assistant_coach: 'ผู้ช่วยผู้ฝึกสอน',
        goalkeeper_coach: 'โค้ชผู้รักษาประตู',
        fitness_coach: 'โค้ชฟิตเนสและกายภาพ',
        staff: 'สตาฟ / เจ้าหน้าที่ทีม'
      };
      const baseRoleTitle = roleTitles[coachData.role] || 'ผู้ฝึกสอน';
      const licenseSuffix = coachData.license && coachData.license !== 'ไม่มี' ? ` (${coachData.license})` : '';

      const newCoachUser: UserAccount = {
        id: `usr-coach-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        username,
        email: coachData.email || `${username}@yalafootball.com`,
        phone: coachData.phone,
        password,
        fullName: coachData.fullName,
        nickname: coachData.nickname,
        role: 'coach',
        title: `${baseRoleTitle}${licenseSuffix}`,
        coachId: newCoach.id,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0]
      };
      setUserAccounts(prev => deduplicateById([newCoachUser, ...prev]));

      if (supabase) {
        supabase
          .from('user_accounts')
          .upsert(mapUserToDb(newCoachUser), { onConflict: 'id' })
          .then(({ error }) => {
            if (error) console.error('❌ Supabase error saving coach user account:', error);
          });
      }
    }

    return newCoach;
  };

  const updateCoach = async (id: string, updated: Partial<Coach>): Promise<{ success: boolean; error?: string }> => {
    let mergedCoach: Coach | undefined;
    let originalCoach: Coach | undefined;

    setCoaches(prev => prev.map(c => {
      if (c.id === id) {
        originalCoach = c;
        mergedCoach = { ...c, ...updated };
        return mergedCoach;
      }
      return c;
    }));

    if (!mergedCoach) {
      return { success: false, error: 'ไม่พบข้อมูลโค้ชที่ต้องการแก้ไข' };
    }

    // 1. Sync updated coach to Supabase using resilient upsert
    const supabase = getSupabase();
    let result: { success: boolean; error?: string } = { success: true };
    if (supabase) {
      result = await saveSingleCoachToSupabase(mergedCoach);
      if (!result.success) {
        console.error('❌ Supabase error updating coach:', result.error);
      }
    }

    // 2. Synchronize linked User Account (credentials, role title, phone, ID card)
    const roleTitles: Record<string, string> = {
      head_coach: 'หัวหน้าผู้ฝึกสอน',
      assistant_coach: 'ผู้ช่วยผู้ฝึกสอน',
      goalkeeper_coach: 'โค้ชผู้รักษาประตู',
      fitness_coach: 'โค้ชฟิตเนสและกายภาพ',
      staff: 'สตาฟ / เจ้าหน้าที่ทีม'
    };
    const targetRole = mergedCoach.role || 'assistant_coach';
    const baseRoleTitle = roleTitles[targetRole] || 'ผู้ฝึกสอน';
    const licenseSuffix = mergedCoach.license && mergedCoach.license !== 'ไม่มี' ? ` (${mergedCoach.license})` : '';
    const newTitle = `${baseRoleTitle}${licenseSuffix}`;

    setUserAccounts(prev => prev.map(u => {
      const isLinked = u.coachId === id || (originalCoach && u.fullName === originalCoach.fullName);
      if (isLinked) {
        const cleanId = mergedCoach!.idCardNumber ? cleanDigits(mergedCoach!.idCardNumber) : '';
        const cleanPhone = mergedCoach!.phone ? cleanDigits(mergedCoach!.phone) : '';
        const updatedUser: UserAccount = {
          ...u,
          fullName: mergedCoach!.fullName,
          nickname: mergedCoach!.nickname,
          phone: mergedCoach!.phone,
          title: newTitle,
          username: (cleanId && cleanId.length === 13) ? cleanId : u.username,
          password: cleanPhone || u.password,
          email: mergedCoach!.email || u.email
        };

        if (supabase) {
          supabase
            .from('user_accounts')
            .upsert(mapUserToDb(updatedUser), { onConflict: 'id' })
            .then(({ error }) => {
              if (error) console.error('❌ Supabase error updating coach user account:', error);
            });
        }
        return updatedUser;
      }
      return u;
    }));

    return result;
  };

  const deleteCoach = (id: string) => {
    setCoaches(prev => prev.filter(c => c.id !== id));
    setUserAccounts(prev => prev.filter(u => u.coachId !== id));

    const supabase = getSupabase();
    if (supabase) {
      supabase.from('coaches').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('❌ Supabase error deleting coach:', error);
      });
      supabase.from('user_accounts').delete().eq('coach_id', id).then();
    }
  };

  const addSchedule = (scheduleData: Omit<TrainingSchedule, 'id'>) => {
    const newSchedule: TrainingSchedule = {
      ...scheduleData,
      id: `sch-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
    };
    setSchedules(prev => deduplicateById([...prev, newSchedule]));

    const supabase = getSupabase();
    if (supabase) {
      supabase
        .from('schedules')
        .upsert(mapScheduleToDb(newSchedule), { onConflict: 'id' })
        .then(({ error }) => {
          if (error) console.error('❌ Supabase error saving schedule:', error);
        });
    }
  };

  const updateSchedule = (id: string, updated: Partial<TrainingSchedule>) => {
    setSchedules(prev => prev.map(s => {
      if (s.id === id) {
        const merged = { ...s, ...updated };
        const supabase = getSupabase();
        if (supabase) {
          supabase
            .from('schedules')
            .upsert(mapScheduleToDb(merged), { onConflict: 'id' })
            .then(({ error }) => {
              if (error) console.error('❌ Supabase error updating schedule:', error);
            });
        }
        return merged;
      }
      return s;
    }));
  };

  const deleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
    const supabase = getSupabase();
    if (supabase) {
      supabase.from('schedules').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('❌ Supabase error deleting schedule:', error);
      });
    }
  };

  const saveAttendance = (
    scheduleId: string, 
    records: { studentId: string; status: AttendanceRecord['status']; notes?: string }[], 
    coachId: string
  ) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newItems: AttendanceRecord[] = records.map((r, idx) => ({
      id: `att-${Date.now()}-${idx}-${r.studentId}-${Math.random().toString(36).substr(2, 4)}`,
      scheduleId,
      date: dateStr,
      studentId: r.studentId,
      status: r.status,
      recordedByCoachId: coachId,
      checkInTime: timeStr,
      notes: r.notes || ''
    }));

    setAttendanceRecords(prev => {
      const filtered = prev.filter(r => r.scheduleId !== scheduleId);
      return deduplicateById([...filtered, ...newItems]);
    });

    updateSchedule(scheduleId, { status: 'completed' });

    const supabase = getSupabase();
    if (supabase) {
      supabase.from('attendance_records').delete().eq('schedule_id', scheduleId).then(() => {
        supabase
          .from('attendance_records')
          .upsert(newItems.map(mapAttendanceToDb), { onConflict: 'id' })
          .then(({ error }) => {
            if (error) console.error('❌ Supabase error saving attendance:', error);
          });
      });
    }
  };

  const addSkillEvaluation = (evalData: Omit<SkillEvaluation, 'id' | 'evaluationDate'>): SkillEvaluation => {
    const newEval: SkillEvaluation = {
      ...evalData,
      id: `eval-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      evaluationDate: new Date().toISOString().split('T')[0]
    };
    setSkillEvaluations(prev => deduplicateById([newEval, ...prev]));

    const supabase = getSupabase();
    if (supabase) {
      supabase
        .from('skill_evaluations')
        .upsert(mapEvaluationToDb(newEval), { onConflict: 'id' })
        .then(({ error }) => {
          if (error) console.error('❌ Supabase error saving evaluation:', error);
        });
    }

    return newEval;
  };

  const updateSkillEvaluation = (id: string, updated: Partial<SkillEvaluation>) => {
    setSkillEvaluations(prev => prev.map(e => {
      if (e.id === id) {
        const merged = { ...e, ...updated };
        const supabase = getSupabase();
        if (supabase) {
          supabase
            .from('skill_evaluations')
            .upsert(mapEvaluationToDb(merged), { onConflict: 'id' })
            .then(({ error }) => {
              if (error) console.error('❌ Supabase error updating evaluation:', error);
            });
        }
        return merged;
      }
      return e;
    }));
  };

  const addPayment = (paymentData: Omit<PaymentTransaction, 'id' | 'receiptNumber'>): PaymentTransaction => {
    const currentYear = new Date().getFullYear();
    const prefix = paymentData.status === 'paid' ? 'REC' : 'INV';
    const receiptNumber = generateUniqueReceiptNumber(prefix, payments, currentYear);
    const newPayment: PaymentTransaction = {
      ...paymentData,
      id: `pay-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      receiptNumber
    };
    setPayments(prev => deduplicateById([newPayment, ...prev]));

    const supabase = getSupabase();
    if (supabase) {
      saveSinglePaymentToSupabase(newPayment).then(res => {
        if (!res.success) console.error('❌ Supabase error saving payment:', res.error);
      });
    }

    return newPayment;
  };

  const addPaymentsBatch = (paymentsData: Omit<PaymentTransaction, 'id' | 'receiptNumber'>[]): PaymentTransaction[] => {
    if (paymentsData.length === 0) return [];
    const currentYear = new Date().getFullYear();
    const existing = [...payments];
    const newPayments: PaymentTransaction[] = [];

    paymentsData.forEach((pData, idx) => {
      const uniqueId = `pay-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 6)}`;
      const prefix = pData.status === 'paid' ? 'REC' : 'INV';
      const receiptNumber = generateUniqueReceiptNumber(prefix, [...existing, ...newPayments], currentYear);
      const newPayment: PaymentTransaction = {
        ...pData,
        id: uniqueId,
        receiptNumber
      };
      newPayments.push(newPayment);
    });

    setPayments(prev => deduplicateById([...newPayments, ...prev]));

    const supabase = getSupabase();
    if (supabase) {
      newPayments.forEach(p => {
        saveSinglePaymentToSupabase(p).then(res => {
          if (!res.success) console.error('❌ Supabase error saving batch payment:', res.error);
        });
      });
    }

    return newPayments;
  };

  const updatePaymentStatus = (
    id: string, 
    status: PaymentStatus, 
    method?: PaymentTransaction['paymentMethod'], 
    receivedBy?: string,
    slipUrl?: string
  ) => {
    const now = new Date();
    const paidDate = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    setPayments(prev => prev.map(p => {
      if (p.id === id) {
        const updated: PaymentTransaction = {
          ...p,
          status,
          ...(status === 'paid' ? {
            paidDate: p.paidDate || paidDate,
            paymentMethod: method || p.paymentMethod || 'promptpay',
            receivedByStaffName: receivedBy !== undefined ? receivedBy : (p.receivedByStaffName || 'เจ้าหน้าที่คลีนิกฟุตบอลยะลา'),
            slipUrl: slipUrl !== undefined ? slipUrl : p.slipUrl
          } : {
            slipUrl: slipUrl !== undefined ? slipUrl : p.slipUrl
          })
        };

        const supabase = getSupabase();
        if (supabase) {
          saveSinglePaymentToSupabase(updated).then(res => {
            if (!res.success) console.error('❌ Supabase error updating payment:', res.error);
          });
        }

        return updated;
      }
      return p;
    }));
  };

  const addExpense = (expenseData: Omit<ExpenseItem, 'id' | 'expenseCode'>): ExpenseItem => {
    let maxSeq = 0;
    const currentYear = new Date().getFullYear();
    const regex = new RegExp(`^EXP-YLA-${currentYear}-(\\d+)$`);
    expenses.forEach(e => {
      if (e.expenseCode) {
        const match = e.expenseCode.match(regex);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxSeq) maxSeq = num;
        }
      }
    });
    const nextNum = Math.max(expenses.length + 1, maxSeq + 1);
    const expenseCode = `EXP-YLA-${currentYear}-${String(nextNum).padStart(4, '0')}`;
    const newExpense: ExpenseItem = {
      ...expenseData,
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      expenseCode
    };
    setExpenses(prev => deduplicateById([newExpense, ...prev]));

    const supabase = getSupabase();
    if (supabase) {
      supabase
        .from('expenses')
        .upsert(mapExpenseToDb(newExpense), { onConflict: 'id' })
        .then(({ error }) => {
          if (error) console.error('❌ Supabase error saving expense:', error);
        });
    }

    return newExpense;
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    const supabase = getSupabase();
    if (supabase) {
      supabase.from('expenses').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('❌ Supabase error deleting expense:', error);
      });
    }
  };

  const addAsset = (assetData: Omit<ClinicAsset, 'id' | 'assetCode'>): ClinicAsset => {
    let maxNum = 0;
    assets.forEach(a => {
      if (a.assetCode) {
        const match = a.assetCode.match(/^AST-YLA-(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      }
    });
    const nextNum = Math.max(assets.length + 1, maxNum + 1);
    const assetCode = `AST-YLA-${String(nextNum).padStart(3, '0')}`;
    const newAsset: ClinicAsset = {
      ...assetData,
      id: `ast-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      assetCode
    };
    setAssets(prev => deduplicateById([...prev, newAsset]));

    const supabase = getSupabase();
    if (supabase) {
      supabase
        .from('assets')
        .upsert(mapAssetToDb(newAsset), { onConflict: 'id' })
        .then(({ error }) => {
          if (error) console.error('❌ Supabase error saving asset:', error);
        });
    }

    return newAsset;
  };

  const updateAsset = (id: string, updated: Partial<ClinicAsset>) => {
    setAssets(prev => prev.map(a => {
      if (a.id === id) {
        const merged = { ...a, ...updated };
        const supabase = getSupabase();
        if (supabase) {
          supabase
            .from('assets')
            .upsert(mapAssetToDb(merged), { onConflict: 'id' })
            .then(({ error }) => {
              if (error) console.error('❌ Supabase error updating asset:', error);
            });
        }
        return merged;
      }
      return a;
    }));
  };

  const deleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    const supabase = getSupabase();
    if (supabase) {
      supabase.from('assets').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('❌ Supabase error deleting asset:', error);
      });
    }
  };

  const updateBankAccountConfig = (config: BankAccountConfig) => {
    setBankAccountConfig(config);
    const supabase = getSupabase();
    if (supabase) {
      supabase.from('clinic_settings').upsert({ key: 'bank_account_config', value: config }, { onConflict: 'key' }).then();
    }
  };

  const updateClinicTerms = (terms: ClinicTermAgreement) => {
    setClinicTerms(terms);
    try {
      localStorage.setItem('yfc_clinic_terms', JSON.stringify(terms));
    } catch (e) {
      console.warn('LocalStorage error saving clinic terms:', e);
    }
    const supabase = getSupabase();
    if (supabase) {
      supabase.from('clinic_settings').upsert({ key: 'clinic_terms', value: terms }, { onConflict: 'key' }).then();
    }
  };

  const updateOrganizationConfig = (config: OrganizationConfig) => {
    setOrganizationConfig(config);
    try {
      localStorage.setItem('yfc_org_config', JSON.stringify(config));
    } catch (e) {
      console.warn('LocalStorage error saving org config:', e);
    }
    const supabase = getSupabase();
    if (supabase) {
      supabase.from('clinic_settings').upsert({ key: 'organization_config', value: config }, { onConflict: 'key' }).then();
    }
  };

  const syncDataWithSupabase = async (): Promise<{ success: boolean; message: string }> => {
    return await syncAllLocalDataToSupabase({
      students,
      coaches,
      schedules,
      attendanceRecords,
      skillEvaluations,
      payments,
      expenses,
      assets,
      userAccounts,
      rolePermissions,
      sessionLogs,
      bankAccountConfig,
      clinicTerms
    });
  };

  const resetToDefaultData = async () => {
    setStudents(INITIAL_STUDENTS);
    setCoaches(INITIAL_COACHES);
    setSchedules(INITIAL_SCHEDULES);
    setAttendanceRecords(INITIAL_ATTENDANCE);
    setSkillEvaluations(INITIAL_SKILL_EVALUATIONS);
    setPayments(INITIAL_PAYMENTS);
    setExpenses(INITIAL_EXPENSES);
    setAssets(INITIAL_ASSETS);
    setUserAccounts(INITIAL_USER_ACCOUNTS);
    setRolePermissions(DEFAULT_ROLE_PERMISSIONS);
    setSessionLogs(INITIAL_SESSION_LOGS);
    setBankAccountConfig(DEFAULT_BANK_ACCOUNT_CONFIG);
    setClinicTerms(CLINIC_TERMS_AND_CONDITIONS);
    setCurrentUser(INITIAL_USER_ACCOUNTS[0]);
    setCurrentRoleState('admin_staff');

    // Sync reset state to Supabase if connected
    const supabase = getSupabase();
    if (supabase) {
      await syncAllLocalDataToSupabase({
        students: INITIAL_STUDENTS,
        coaches: INITIAL_COACHES,
        schedules: INITIAL_SCHEDULES,
        attendanceRecords: INITIAL_ATTENDANCE,
        skillEvaluations: INITIAL_SKILL_EVALUATIONS,
        payments: INITIAL_PAYMENTS,
        expenses: INITIAL_EXPENSES,
        assets: INITIAL_ASSETS,
        userAccounts: INITIAL_USER_ACCOUNTS,
        rolePermissions: DEFAULT_ROLE_PERMISSIONS,
        sessionLogs: INITIAL_SESSION_LOGS,
        bankAccountConfig: DEFAULT_BANK_ACCOUNT_CONFIG,
        clinicTerms: CLINIC_TERMS_AND_CONDITIONS
      });
    }
  };

  // Financial computations
  const financialSummary = useMemo(() => {
    const totalRevenue = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingRevenue = payments
      .filter(p => p.status === 'pending' || p.status === 'overdue')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalRevenue - totalExpense;

    const monthlyStats = [
      { month: 'มี.ค.', revenue: 42000, expense: 38000, profit: 4000 },
      { month: 'เม.ย.', revenue: 58000, expense: 45000, profit: 13000 },
      { month: 'พ.ค.', revenue: 52000, expense: 41000, profit: 11000 },
      { month: 'มิ.ย.', revenue: 64000, expense: 48000, profit: 16000 },
      { month: 'ก.ค.', revenue: 69000, expense: 51000, profit: 18000 },
      { month: 'ส.ค.', revenue: totalRevenue, expense: totalExpense, profit: netProfit }
    ];

    const categoryMap: Record<string, { name: string; value: number }> = {
      pitch_rental: { name: 'ค่าเช่าสนาม', value: 0 },
      coach_salary: { name: 'ค่าตอบแทนโค้ช', value: 0 },
      equipment_purchase: { name: 'จัดซื้ออุปกรณ์', value: 0 },
      medical_refreshment: { name: 'น้ำดื่ม & ยาปฐมพยาบาล', value: 0 },
      tournament_travel: { name: 'เดินทางแข่งขัน', value: 0 },
      utilities_maintenance: { name: 'บำรุงรักษา & อื่นๆ', value: 0 },
      other: { name: 'อื่นๆ', value: 0 }
    };

    expenses.forEach(e => {
      if (categoryMap[e.category]) {
        categoryMap[e.category].value += e.amount;
      } else {
        categoryMap.other.value += e.amount;
      }
    });

    const categoryExpenses = Object.values(categoryMap).filter(c => c.value > 0);

    return {
      totalRevenue,
      totalExpense,
      netProfit,
      pendingRevenue,
      monthlyStats,
      categoryExpenses
    };
  }, [payments, expenses]);

  // Academy statistics
  const academyStats = useMemo(() => {
    const activeStudents = students.filter(s => s.status === 'active');
    const totalActiveStudents = activeStudents.length;
    const totalCoaches = coaches.filter(c => c.status === 'active').length;

    const totalAttendances = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(a => a.status === 'present' || a.status === 'late').length;
    const averageAttendanceRate = totalAttendances > 0 ? Math.round((presentCount / totalAttendances) * 100) : 92;

    const categoryCounts: Record<AgeCategory, number> = {
      'U-6': 0,
      'U-8': 0
    };

    students.forEach(s => {
      if (categoryCounts[s.category] !== undefined) {
        categoryCounts[s.category]++;
      }
    });

    return {
      totalActiveStudents,
      totalCoaches,
      averageAttendanceRate,
      categoryCounts,
      totalSessionsCount: schedules.length
    };
  }, [students, coaches, attendanceRecords, schedules]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        currentRole,
        setCurrentRole,
        activeTab,
        setActiveTab,
        selectedStudentIdForParent,
        setSelectedStudentIdForParent,
        selectedCoachIdForCoach,
        setSelectedCoachIdForCoach,
        login,
        loginAsDemo,
        logout,
        showLoginModal,
        setShowLoginModal,
        showSupabaseModal,
        setShowSupabaseModal,
        showOrgConfigModal,
        setShowOrgConfigModal,
        isSupabaseConfigured,
        supabaseConnected,
        isSupabaseLoading,
        syncDataWithSupabase,
        userAccounts,
        addUserAccount,
        updateUserAccount,
        deleteUserAccount,
        resetUserPassword,
        rolePermissions,
        updateRolePermissions,
        resetPermissionsToDefault,
        hasPermission,
        sessionLogs,
        clearSessionLogs,
        students,
        coaches,
        schedules,
        attendanceRecords,
        skillEvaluations,
        payments,
        expenses,
        assets,
        addStudent,
        updateStudent,
        deleteStudent,
        addCoach,
        updateCoach,
        deleteCoach,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        saveAttendance,
        addSkillEvaluation,
        updateSkillEvaluation,
        addPayment,
        addPaymentsBatch,
        updatePaymentStatus,
        addExpense,
        deleteExpense,
        addAsset,
        updateAsset,
        deleteAsset,
        financialSummary,
        academyStats,
        bankAccountConfig,
        updateBankAccountConfig,
        clinicTerms,
        updateClinicTerms,
        organizationConfig,
        updateOrganizationConfig,
        resetToDefaultData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
