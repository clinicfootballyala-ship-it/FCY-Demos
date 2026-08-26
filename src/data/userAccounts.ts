import { UserAccount, RolePermissions, AuthSessionLog } from '../types';

export const DEFAULT_ROLE_PERMISSIONS: Record<'admin_staff' | 'coach' | 'student_parent', RolePermissions> = {
  admin_staff: {
    dashboard: 'full',
    members: 'full',
    schedule: 'full',
    attendance: 'full',
    skills: 'full',
    payments: 'full',
    finance: 'full',
    coaches: 'full',
    assets: 'full',
    terms: 'full',
    accessControl: 'full'
  },
  coach: {
    dashboard: 'view_only',
    members: 'view_only',
    schedule: 'full',
    attendance: 'full',
    skills: 'full',
    payments: 'none',
    finance: 'none',
    coaches: 'view_only',
    assets: 'full',
    terms: 'view_only',
    accessControl: 'none'
  },
  student_parent: {
    dashboard: 'view_own',
    members: 'view_own',
    schedule: 'view_only',
    attendance: 'view_own',
    skills: 'view_own',
    payments: 'view_own',
    finance: 'none',
    coaches: 'view_only',
    assets: 'none',
    terms: 'view_only',
    accessControl: 'none'
  }
};

export const INITIAL_USER_ACCOUNTS: UserAccount[] = [
  {
    id: 'usr-admin-01',
    username: 'admin',
    email: 'clinicfootball.yala@gmail.com',
    phone: '081-999-8877',
    password: 'admin', // Demo password
    fullName: 'อาจารย์อับดุลกอเดร์ ยะลา',
    nickname: 'อ.เดร์',
    role: 'admin_staff',
    title: 'ผู้อำนวยการคลีนิก & ผู้ดูแลระบบส่วนกลาง (Super Admin)',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    lastLogin: '2026-08-20 20:45',
    createdAt: '2024-01-01'
  },
  {
    id: 'usr-coach-01',
    username: 'coach.manop',
    email: 'coach.manop@yalafootball.com',
    phone: '081-890-1234',
    password: 'coach',
    fullName: 'โค้ชมานพ สุวรรณรัตน์',
    nickname: 'โค้ชเบิร์ด',
    role: 'coach',
    title: 'หัวหน้าผู้ฝึกสอน (Head Coach • AFC B-License)',
    coachId: 'cch-001',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    lastLogin: '2026-08-20 18:30',
    createdAt: '2024-05-01'
  },
  {
    id: 'usr-coach-02',
    username: 'coach.rohim',
    email: 'coach.rohim@yalafootball.com',
    phone: '089-234-5678',
    password: 'coach',
    fullName: 'โค้ชอับดุลรอฮิม ดาโอะ',
    nickname: 'โค้ชฮิม',
    role: 'coach',
    title: 'ผู้ฝึกสอนเยาวชน Grassroots (U-8 / U-10)',
    coachId: 'cch-002',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    lastLogin: '2026-08-19 16:10',
    createdAt: '2024-08-15'
  },
  {
    id: 'usr-coach-03',
    username: 'coach.suhaimee',
    email: 'coach.suhaimee@yalafootball.com',
    phone: '086-345-6789',
    password: 'coach',
    fullName: 'โค้ชซูไฮมี มะยูโซ๊ะ',
    nickname: 'โค้ชมี่',
    role: 'coach',
    title: 'โค้ชผู้รักษาประตู (GK Specialist)',
    coachId: 'cch-003',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    lastLogin: '2026-08-18 10:20',
    createdAt: '2025-01-10'
  },
  {
    id: 'usr-parent-01',
    username: '3959900234561',
    email: 'hasan.sam@gmail.com',
    phone: '081-456-7890',
    password: '0814567890',
    fullName: 'นายฮาซัน สะมะแอ',
    nickname: 'คุณฮาซัน',
    role: 'student_parent',
    title: 'ผู้ปกครองของ ด.ช. มูฮัมหมัดอิลฮัม (น้องอิลฮัม U-8)',
    studentIds: ['std-001'],
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    lastLogin: '2026-08-20 19:15',
    createdAt: '2025-11-15'
  },
  {
    id: 'usr-parent-02',
    username: '3959900456782',
    email: 'kanda.jk@gmail.com',
    phone: '086-778-9900',
    password: '0867789900',
    fullName: 'นางสาวกานดา จันทร์แก้ว',
    nickname: 'คุณกานดา',
    role: 'student_parent',
    title: 'ผู้ปกครองของ ด.ช. ภานุวัฒน์ (น้องเจแปน U-6)',
    studentIds: ['std-002'],
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    lastLogin: '2026-08-19 14:00',
    createdAt: '2026-01-10'
  },
  {
    id: 'usr-parent-03',
    username: '3959900678902',
    email: 'rattana.s@gmail.com',
    phone: '087-654-3210',
    password: '0876543210',
    fullName: 'นางรัตนา ศรีสมบูรณ์',
    nickname: 'คุณรัตนา',
    role: 'student_parent',
    title: 'ผู้ปกครองของ ด.ช. ธนกร (น้องวินเนอร์ U-6)',
    studentIds: ['std-004'],
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    lastLogin: '2026-08-18 11:30',
    createdAt: '2026-02-01'
  }
];

export const INITIAL_SESSION_LOGS: AuthSessionLog[] = [
  {
    id: 'log-001',
    userId: 'usr-admin-01',
    userName: 'อาจารย์อับดุลกอเดร์ ยะลา',
    role: 'admin_staff',
    timestamp: '2026-08-20 20:45:12',
    ipAddress: '182.52.204.112 (Yala, TH)',
    device: 'Desktop Chrome 127.0 (macOS)',
    action: 'login'
  },
  {
    id: 'log-002',
    userId: 'usr-coach-01',
    userName: 'โค้ชมานพ สุวรรณรัตน์',
    role: 'coach',
    timestamp: '2026-08-20 18:30:05',
    ipAddress: '182.52.204.145 (Yala, TH)',
    device: 'Mobile Safari (iOS 17.5)',
    action: 'login'
  },
  {
    id: 'log-003',
    userId: 'usr-parent-01',
    userName: 'นายฮาซัน สะมะแอ',
    role: 'student_parent',
    timestamp: '2026-08-20 19:15:33',
    ipAddress: '1.46.128.90 (Yala, TH)',
    device: 'Mobile Chrome (Android 14)',
    action: 'login'
  }
];
