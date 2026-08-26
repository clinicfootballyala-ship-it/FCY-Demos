export type UserRole = 'admin_staff' | 'coach' | 'student_parent';

export type AgeCategory = 'U-6' | 'U-8';
export const ACTIVE_AGE_CATEGORIES: AgeCategory[] = ['U-6', 'U-8'];

export interface OrganizationConfig {
  name: string; // e.g. 'YALA FOOTBALL CLINIC'
  nameTh: string; // e.g. 'คลีนิกฟุตบอลยะลา'
  tagline: string; // e.g. 'ศูนย์พัฒนาทักษะฟุตบอลเยาวชนจังหวัดยะลา'
  logoUrl: string; // Image URL / Base64 image
  shortName: string; // e.g. 'YFC'
  address: string; // e.g. 'สนามหญ้าเทียมยะลา สเตเดียม อ.เมือง จ.ยะลา 95000'
  phone: string; // e.g. '081-456-7890'
  taxId?: string; // e.g. '0-9555-69001-23-4'
  establishedYear?: string; // e.g. '2567 (2024)'
  lineId?: string;
  facebookOrWebsite?: string;
}

export type Position = 'Goalkeeper (GK)' | 'Defender (DF)' | 'Midfielder (MF)' | 'Forward (FW)' | 'All-around (ทุกตำแหน่ง)';

export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'cancelled';

export type AttendanceStatus = 'present' | 'late' | 'excused' | 'absent';

export type StudentStatus = 'active' | 'pending_approval' | 'leave' | 'graduated';

export interface Student {
  id: string;
  studentCode: string; // e.g. YFC-2026-001
  fullName: string;
  nickname: string;
  birthDate: string;
  age: number;
  gender: 'male' | 'female';
  idCardNumber?: string; // เลขประจำตัวประชาชนนักเรียน 13 หลัก
  schoolName: string;
  heightCm: number;
  weightKg: number;
  bloodType: string;
  medicalConditions: string; // โรคประจำตัว / การแพ้อาหาร
  preferredPosition: Position;
  jerseySize: string; // e.g. 'JM (รอบอก 72 ซม. / ยาว 51 ซม.)' or 'JS' | 'JM' | 'JL' | 'S' | 'M' | 'L' | 'XL' | '2XL'
  jerseyChestCm?: number; // ขนาดรอบอก (เซนติเมตร)
  jerseyLengthCm?: number; // ความยาวเสื้อ (เซนติเมตร)
  shoeSize: string;
  category: AgeCategory;
  registeredDate: string;
  status: StudentStatus;
  avatarUrl?: string;

  // Parent Information
  parentName: string;
  parentIdCardNumber?: string; // เลขประจำตัวประชาชนผู้ปกครอง 13 หลัก
  parentRelationship: 'บิดา' | 'มารดา' | 'ผู้ปกครอง' | 'ญาติ';
  parentPhone: string;
  parentEmail?: string; // อีเมลผู้ปกครอง
  parentLineId: string;
  parentOccupation: string;
  parentAvatarUrl?: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  
  // Agreement details
  acceptedTerms: boolean;
  acceptedDate: string;
  signatureName?: string;
}

export interface BankAccountConfig {
  bankName: string; // e.g. ธนาคารกสิกรไทย (KBANK)
  accountNumber: string; // e.g. 098-2-34567-8
  accountName: string; // e.g. คลีนิกฟุตบอลยะลา (Yala Football Clinic)
  promptPayId: string; // e.g. 0812345678 or 0950000000000
  qrCodeUrl: string; // Image URL or uploaded custom PromptPay QR code
  clinicBranch?: string; // e.g. สาขายะลา
}

export interface Coach {
  id: string;
  coachCode: string;
  fullName: string;
  nickname: string;
  idCardNumber?: string;
  phone: string;
  email: string;
  lineId?: string;
  license: string;
  specialty?: string;
  experienceYears?: number;
  role: 'head_coach' | 'assistant_coach' | 'goalkeeper_coach' | 'fitness_coach' | 'staff';
  salary: number;
  baseSalary?: number;
  hourlyRate?: number;
  employmentType: 'full_time' | 'part_time';
  assignedCategories: AgeCategory[];
  joinedDate?: string;
  avatarUrl?: string;
  status: 'active' | 'on_leave' | 'inactive';
  bio?: string;
}

export interface TrainingSchedule {
  id: string;
  title: string;
  category: AgeCategory[];
  venue: string;
  date: string;
  startTime: string;
  endTime: string;
  headCoachId: string;
  assistantCoachIds: string[];
  topic: string;
  drillsSummary: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  scheduleId: string;
  date: string;
  studentId: string;
  status: AttendanceStatus;
  recordedByCoachId: string;
  checkInTime?: string;
  notes?: string;
}

export interface SkillPillars {
  technical: {
    ballControl: number; // 1-10
    passing: number;
    dribbling: number;
    shooting: number;
    headingOrGoalkeeping: number;
    average: number;
  };
  tactical: {
    gameVision: number;
    positioning: number;
    decisionMaking: number;
    transitionSpeed: number;
    average: number;
  };
  physical: {
    speed: number;
    agility: number;
    stamina: number;
    strength: number;
    average: number;
  };
  psychological: {
    focus: number;
    confidence: number;
    determination: number;
    emotionalControl: number;
    average: number;
  };
  social: {
    discipline: number;
    teamwork: number;
    communication: number;
    respectAndSportsmanship: number;
    average: number;
  };
  // Optional backward compatibility
  mentalSocial?: {
    discipline: number;
    focus: number;
    teamwork: number;
    respectAndSportsmanship: number;
    average: number;
  };
}

export interface SkillEvaluation {
  id: string;
  studentId: string;
  coachId: string;
  evaluationDate: string;
  termPeriod: string;
  skills: SkillPillars;
  overallScore: number; // 10-100
  overallGrade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D';
  strengths: string;
  areasForImprovement: string;
  coachFeedback: string;
  nextGoals: string;
}

export interface PaymentTransaction {
  id: string;
  receiptNumber: string;
  studentId: string;
  title: string;
  category: 'tuition' | 'uniform_equipment' | 'registration_fee' | 'tournament_fee' | 'special_camp';
  amount: number;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: 'promptpay' | 'bank_transfer' | 'cash' | 'credit_card';
  status: PaymentStatus;
  slipUrl?: string;
  notes?: string;
  receivedByStaffName?: string;
}

export interface ExpenseItem {
  id: string;
  expenseCode: string;
  title: string;
  category: 'pitch_rental' | 'coach_salary' | 'equipment_purchase' | 'tournament_travel' | 'medical_refreshment' | 'utilities_maintenance' | 'other';
  amount: number;
  date: string;
  paidTo: string;
  recordedBy: string;
  paymentMethod: 'bank_transfer' | 'cash' | 'promptpay';
  receiptProofUrl?: string;
  notes?: string;
}

export interface ClinicAsset {
  id: string;
  assetCode: string;
  name: string;
  category: 'balls' | 'training_gear' | 'medical_firstaid' | 'apparel' | 'facility' | 'goalkeeping' | 'first_aid';
  totalQuantity: number;
  availableQuantity: number;
  damagedQuantity: number;
  unit: string;
  location: string;
  condition: 'new' | 'good' | 'fair' | 'damaged' | 'ready' | 'needs_repair';
  lastCheckedDate: string;
  purchaseDate?: string;
  cost?: number;
  notes?: string;
}

export interface ClinicTermAgreement {
  title: string;
  version: string;
  sections: {
    heading: string;
    items: string[];
  }[];
}

export type PermissionLevel = 'full' | 'view_only' | 'view_own' | 'none';

export interface RolePermissions {
  dashboard: PermissionLevel;
  members: PermissionLevel;
  schedule: PermissionLevel;
  attendance: PermissionLevel;
  skills: PermissionLevel;
  payments: PermissionLevel;
  finance: PermissionLevel;
  coaches: PermissionLevel;
  assets: PermissionLevel;
  terms: PermissionLevel;
  accessControl: PermissionLevel;
}

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  phone?: string;
  password?: string;
  fullName: string;
  nickname?: string;
  role: UserRole;
  avatarUrl?: string;
  title: string; // e.g. "ผู้อำนวยการคลีนิก / Super Admin", "หัวหน้าผู้ฝึกสอน", "ผู้ปกครอง"
  coachId?: string; // Linked coach if role === 'coach'
  studentIds?: string[]; // Linked student IDs if role === 'student_parent'
  customPermissions?: Partial<RolePermissions>;
  status: 'active' | 'suspended';
  lastLogin?: string;
  createdAt: string;
}

export interface AuthSessionLog {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  timestamp: string;
  ipAddress?: string;
  device?: string;
  action: 'login' | 'logout' | 'role_switch' | 'permission_update';
}
