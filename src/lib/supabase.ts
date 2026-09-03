import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  Student, 
  Coach, 
  TrainingSchedule, 
  AttendanceRecord, 
  SkillEvaluation, 
  PaymentTransaction, 
  ExpenseItem, 
  ClinicAsset, 
  UserAccount, 
  RolePermissions, 
  UserRole,
  AuthSessionLog
} from '../types';

// Key for saving runtime Supabase credentials in local cache if not provided in env
const SUPABASE_URL_KEY = 'yfc_supabase_url';
const SUPABASE_KEY_KEY = 'yfc_supabase_anon_key';

const cleanDigits = (val?: string | null): string => (val || '').replace(/\D/g, '');

let cachedClient: SupabaseClient | null = null;
let cachedUrl = '';
let cachedKey = '';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  source: 'env' | 'custom' | 'none';
}

/**
 * Normalizes Supabase URL to ensure it is in the exact root format `https://<project-ref>.supabase.co`
 * Handles accidental dashboard links, trailing slashes, /rest/v1 paths, and missing protocols.
 */
export function normalizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim().replace(/^["'`]|["'`]$/g, '').trim();

  // 1. If user pasted the Supabase Dashboard URL:
  // e.g. https://supabase.com/dashboard/project/abcdefghijklmnopqrst/settings/api
  // or https://supabase.com/dashboard/project/abcdefghijklmnopqrst
  const dashboardMatch = url.match(/supabase\.com\/dashboard\/project\/([a-zA-Z0-9_-]+)/i);
  if (dashboardMatch && dashboardMatch[1]) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }

  // 2. If user pasted just the project ref (e.g. 20-character string "abcdefghijklmnopqrst")
  if (/^[a-zA-Z0-9_-]{15,35}$/.test(url) && !url.includes('.') && !url.includes('/')) {
    return `https://${url}.supabase.co`;
  }

  // 3. Ensure protocol
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  // 4. Strip extra path segments like /rest/v1, /auth/v1, /storage/v1, settings, etc.
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return url
      .replace(/\/rest(\/v\d+)?.*$/i, '')
      .replace(/\/auth(\/v\d+)?.*$/i, '')
      .replace(/\/storage(\/v\d+)?.*$/i, '')
      .replace(/\/+$/, '');
  }
}

/**
 * Normalizes Anon API Key by trimming spaces, quotes, and newlines
 */
export function normalizeSupabaseKey(rawKey: string): string {
  if (!rawKey) return '';
  return rawKey.trim().replace(/^["'`]|["'`]$/g, '').trim();
}

export function getSupabaseConfig(): SupabaseConfig {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = typeof localStorage !== 'undefined' ? localStorage.getItem(SUPABASE_URL_KEY) || '' : '';
  const storedKey = typeof localStorage !== 'undefined' ? localStorage.getItem(SUPABASE_KEY_KEY) || '' : '';

  const cleanStoredUrl = normalizeSupabaseUrl(storedUrl);
  const cleanStoredKey = normalizeSupabaseKey(storedKey);

  if (cleanStoredUrl && cleanStoredKey) {
    // If the stored value was malformed, fix it in localStorage automatically
    if (typeof localStorage !== 'undefined' && (cleanStoredUrl !== storedUrl || cleanStoredKey !== storedKey)) {
      localStorage.setItem(SUPABASE_URL_KEY, cleanStoredUrl);
      localStorage.setItem(SUPABASE_KEY_KEY, cleanStoredKey);
    }
    return {
      url: cleanStoredUrl,
      anonKey: cleanStoredKey,
      isConfigured: true,
      source: 'custom'
    };
  }

  const cleanEnvUrl = normalizeSupabaseUrl(envUrl);
  const cleanEnvKey = normalizeSupabaseKey(envKey);

  if (cleanEnvUrl && cleanEnvKey) {
    return {
      url: cleanEnvUrl,
      anonKey: cleanEnvKey,
      isConfigured: true,
      source: 'env'
    };
  }

  return {
    url: '',
    anonKey: '',
    isConfigured: false,
    source: 'none'
  };
}

export function saveCustomSupabaseConfig(url: string, anonKey: string) {
  const cleanUrl = normalizeSupabaseUrl(url);
  const cleanKey = normalizeSupabaseKey(anonKey);

  if (typeof localStorage !== 'undefined') {
    if (cleanUrl && cleanKey) {
      localStorage.setItem(SUPABASE_URL_KEY, cleanUrl);
      localStorage.setItem(SUPABASE_KEY_KEY, cleanKey);
    } else {
      localStorage.removeItem(SUPABASE_URL_KEY);
      localStorage.removeItem(SUPABASE_KEY_KEY);
    }
  }
  // Clear cached client to re-initialize
  cachedClient = null;
  cachedUrl = '';
  cachedKey = '';
}

export function getSupabase(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.isConfigured || !config.url || !config.anonKey) {
    return null;
  }

  if (cachedClient && cachedUrl === config.url && cachedKey === config.anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });
    cachedUrl = config.url;
    cachedKey = config.anonKey;
    return cachedClient;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
}

export async function testSupabaseConnection(customUrl?: string, customKey?: string): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    const rawUrl = customUrl !== undefined ? customUrl : getSupabaseConfig().url;
    const rawKey = customKey !== undefined ? customKey : getSupabaseConfig().anonKey;

    const url = normalizeSupabaseUrl(rawUrl);
    const key = normalizeSupabaseKey(rawKey);

    if (!url || !key) {
      return { success: false, message: 'ยังไม่ได้ระบุ Supabase URL หรือ Anon Key' };
    }

    const client = createClient(url, key, {
      auth: { persistSession: false }
    });

    // Test a basic select count from students or test rest API
    const { data, error } = await client
      .from('students')
      .select('id', { count: 'exact', head: true });

    if (error) {
      // If table doesn't exist yet, but connection reached Supabase
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return { 
          success: true, 
          message: 'เชื่อมต่อ Supabase สำเร็จ แต่ยังไม่ได้รัน SQL Schema (กรุณาคัดลอก SQL Script ไปรันใน Supabase SQL Editor)',
          details: { connected: true, needsSchema: true, normalizedUrl: url }
        };
      }

      if (error.message.includes('Invalid path specified in request URL')) {
        return {
          success: false,
          message: `URL ที่ระบุไม่ถูกต้อง (${url}): กรุณาใช้ Project URL ในรูปแบบ https://xxxx.supabase.co (ไม่ใช่ลิงก์หน้าแดชบอร์ด)`,
          details: { urlError: true, rawUrl }
        };
      }

      return { success: false, message: `เกิดข้อผิดพลาด: ${error.message} (${error.code || 'API_ERROR'})` };
    }

    return { 
      success: true, 
      message: 'เชื่อมต่อฐานข้อมูล Supabase สำเร็จ พร้อมใช้งาน!',
      details: { connected: true, data, normalizedUrl: url }
    };
  } catch (err: any) {
    console.error('Supabase connection test error:', err);
    if (String(err?.message || '').includes('Invalid path specified in request URL')) {
      return {
        success: false,
        message: 'URL ไม่ถูกต้อง กรุณาใช้ Project URL รูปแบบ https://xxxx.supabase.co (ไม่ใช่ลิงก์หน้าแดชบอร์ด และไม่มี /rest/v1)'
      };
    }
    return { 
      success: false, 
      message: `ไม่สามารถเชื่อมต่อได้: ${err.message || 'โปรดตรวจสอบความถูกต้องของ URL และ Key'}` 
    };
  }
}

// -------------------------------------------------------------
// Mapping Helpers (camelCase <-> snake_case) & Date Sanitizers
// -------------------------------------------------------------

/**
 * Normalizes any date string or Date object into PostgreSQL `DATE` format (YYYY-MM-DD).
 * Corrects Thai Buddhist Era years (e.g. 2569 -> 2026), removes trailing time components,
 * and handles localized formats like "DD/MM/YYYY" or "YYYY-MM-DD HH:mm".
 */
export function toValidDbDate(val: any): string | null {
  if (!val) return null;
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    return val.toISOString().split('T')[0];
  }
  let str = String(val).trim();
  if (!str) return null;

  // 1. If format is "DD/MM/YYYY HH:mm:ss" or "D/M/YYYY HH:mm:ss" or "DD/MM/YYYY" or "D/M/YYYY"
  const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dmyMatch) {
    let day = parseInt(dmyMatch[1], 10);
    let month = parseInt(dmyMatch[2], 10);
    let year = parseInt(dmyMatch[3], 10);
    if (year > 2400) {
      year -= 543; // Convert Buddhist Year (e.g. 2569 -> 2026)
    }
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900 && year <= 2200) {
      return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }
  }

  // 2. If format starts with "YYYY-MM-DD" (e.g. "2026-08-21" or "2026-08-21 10:30" or ISO string)
  const ymdMatch = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (ymdMatch) {
    let year = parseInt(ymdMatch[1], 10);
    let month = parseInt(ymdMatch[2], 10);
    let day = parseInt(ymdMatch[3], 10);
    if (year > 2400) {
      year -= 543; // Convert Buddhist Year if needed
    }
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900 && year <= 2200) {
      return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }
  }

  // 3. Fallback: Try native Date parser
  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      let year = d.getFullYear();
      if (year > 2400) year -= 543;
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Normalizes any timestamp string or Date object into PostgreSQL `TIMESTAMPTZ` format (ISO 8601 string).
 * Handles Thai Buddhist Era years properly.
 */
export function toValidDbTimestamp(val: any): string | null {
  if (!val) return null;
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    return val.toISOString();
  }
  let str = String(val).trim();
  if (!str) return null;

  // Check if string has Buddhist Era year in "DD/MM/YYYY HH:mm:ss"
  const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (dmyMatch) {
    let day = parseInt(dmyMatch[1], 10);
    let month = parseInt(dmyMatch[2], 10);
    let year = parseInt(dmyMatch[3], 10);
    let hour = dmyMatch[4] ? parseInt(dmyMatch[4], 10) : 0;
    let min = dmyMatch[5] ? parseInt(dmyMatch[5], 10) : 0;
    let sec = dmyMatch[6] ? parseInt(dmyMatch[6], 10) : 0;
    if (year > 2400) {
      year -= 543;
    }
    const d = new Date(year, month - 1, day, hour, min, sec);
    if (!isNaN(d.getTime())) {
      return d.toISOString();
    }
  }

  // Try standard parse
  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      let year = d.getFullYear();
      if (year > 2400) {
        d.setFullYear(year - 543);
      }
      return d.toISOString();
    }
  } catch {
    // ignore
  }

  return null;
}

export function mapStudentToDb(s: Student) {
  const today = new Date().toISOString().split('T')[0];
  const validGenders = ['male', 'female'];
  const validStatuses = ['active', 'pending_approval', 'leave', 'graduated'];
  
  return {
    id: s.id,
    student_code: s.studentCode,
    full_name: s.fullName?.trim() || '',
    nickname: s.nickname?.trim() || '',
    birth_date: toValidDbDate(s.birthDate) || today,
    age: Number(s.age) || 0,
    gender: validGenders.includes(s.gender) ? s.gender : 'male',
    id_card_number: s.idCardNumber ? cleanDigits(String(s.idCardNumber)) : null,
    school_name: s.schoolName ? String(s.schoolName).trim() : '',
    height_cm: Number(s.heightCm) || 0,
    weight_kg: Number(s.weightKg) || 0,
    blood_type: s.bloodType || 'O',
    medical_conditions: s.medicalConditions || 'ไม่มี',
    preferred_position: s.preferredPosition || 'All-around (ทุกตำแหน่ง)',
    jersey_size: s.jerseySize || 'JM',
    jersey_chest_cm: (s.jerseyChestCm !== undefined && s.jerseyChestCm !== null && String(s.jerseyChestCm).trim() !== '') ? Number(s.jerseyChestCm) : null,
    jersey_length_cm: (s.jerseyLengthCm !== undefined && s.jerseyLengthCm !== null && String(s.jerseyLengthCm).trim() !== '') ? Number(s.jerseyLengthCm) : null,
    shoe_size: s.shoeSize ? String(s.shoeSize).trim() : '',
    category: s.category || 'U-12',
    registered_date: toValidDbDate(s.registeredDate) || today,
    status: validStatuses.includes(s.status) ? s.status : 'active',
    avatar_url: s.avatarUrl ? String(s.avatarUrl).trim() : null,
    parent_name: s.parentName ? String(s.parentName).trim() : '',
    parent_id_card_number: s.parentIdCardNumber ? cleanDigits(String(s.parentIdCardNumber)) : null,
    parent_relationship: s.parentRelationship || 'บิดา',
    parent_phone: s.parentPhone ? cleanDigits(String(s.parentPhone)) : '',
    parent_email: s.parentEmail ? String(s.parentEmail).trim().toLowerCase() : null,
    parent_line_id: s.parentLineId ? String(s.parentLineId).trim() : '',
    parent_occupation: s.parentOccupation ? String(s.parentOccupation).trim() : '',
    parent_avatar_url: s.parentAvatarUrl ? String(s.parentAvatarUrl).trim() : null,
    address: s.address ? String(s.address).trim() : '',
    emergency_contact_name: s.emergencyContactName ? String(s.emergencyContactName).trim() : '',
    emergency_contact_phone: s.emergencyContactPhone ? cleanDigits(String(s.emergencyContactPhone)) : '',
    accepted_terms: s.acceptedTerms ?? true,
    accepted_date: toValidDbDate(s.acceptedDate) || today,
    signature_name: s.signatureName ? String(s.signatureName).trim() : ''
  };
}

export function mapDbToStudent(row: any): Student {
  return {
    id: row.id,
    studentCode: row.student_code,
    fullName: row.full_name,
    nickname: row.nickname,
    birthDate: row.birth_date || '',
    age: Number(row.age) || 0,
    gender: row.gender,
    idCardNumber: row.id_card_number ? cleanDigits(String(row.id_card_number)) : undefined,
    schoolName: row.school_name || '',
    heightCm: Number(row.height_cm) || 0,
    weightKg: Number(row.weight_kg) || 0,
    bloodType: row.blood_type || 'O',
    medicalConditions: row.medical_conditions || 'ไม่มี',
    preferredPosition: row.preferred_position || row.preferredPosition || 'All-around (ทุกตำแหน่ง)',
    jerseySize: row.jersey_size || 'JM',
    jerseyChestCm: (row.jersey_chest_cm !== null && row.jersey_chest_cm !== undefined && String(row.jersey_chest_cm).trim() !== '') ? Number(row.jersey_chest_cm) : undefined,
    jerseyLengthCm: (row.jersey_length_cm !== null && row.jersey_length_cm !== undefined && String(row.jersey_length_cm).trim() !== '') ? Number(row.jersey_length_cm) : undefined,
    shoeSize: row.shoe_size || '',
    category: row.category,
    registeredDate: row.registered_date || '',
    status: row.status,
    avatarUrl: row.avatar_url || undefined,
    parentName: row.parent_name || '',
    parentIdCardNumber: row.parent_id_card_number ? cleanDigits(String(row.parent_id_card_number)) : undefined,
    parentRelationship: row.parent_relationship || 'บิดา',
    parentPhone: row.parent_phone || '',
    parentEmail: row.parent_email || undefined,
    parentLineId: row.parent_line_id || '',
    parentOccupation: row.parent_occupation || '',
    parentAvatarUrl: row.parent_avatar_url || undefined,
    address: row.address || '',
    emergencyContactName: row.emergency_contact_name || '',
    emergencyContactPhone: row.emergency_contact_phone || '',
    acceptedTerms: row.accepted_terms ?? true,
    acceptedDate: row.accepted_date || '',
    signatureName: row.signature_name || undefined
  };
}

export function mapCoachToDb(c: Coach) {
  const today = new Date().toISOString().split('T')[0];
  return {
    id: c.id,
    coach_code: c.coachCode,
    full_name: c.fullName,
    nickname: c.nickname,
    id_card_number: c.idCardNumber ? String(c.idCardNumber).trim() : null,
    phone: c.phone || '',
    email: c.email || '',
    line_id: c.lineId || null,
    license: c.license,
    specialty: c.specialty || null,
    experience_years: c.experienceYears || 0,
    role: c.role,
    salary: c.salary || 0,
    base_salary: c.baseSalary || 0,
    hourly_rate: c.hourlyRate || 0,
    employment_type: c.employmentType || 'part_time',
    assigned_categories: c.assignedCategories || [],
    joined_date: toValidDbDate(c.joinedDate) || today,
    avatar_url: c.avatarUrl || null,
    status: c.status || 'active',
    bio: c.bio || null
  };
}

export function mapDbToCoach(row: any): Coach {
  return {
    id: row.id,
    coachCode: row.coach_code,
    fullName: row.full_name,
    nickname: row.nickname,
    idCardNumber: row.id_card_number || undefined,
    phone: row.phone || '',
    email: row.email || '',
    lineId: row.line_id || undefined,
    license: row.license || 'AFC "C" License',
    specialty: row.specialty || undefined,
    experienceYears: Number(row.experience_years) || 0,
    role: row.role || 'assistant_coach',
    salary: Number(row.salary) || 0,
    baseSalary: Number(row.base_salary) || 0,
    hourlyRate: Number(row.hourly_rate) || 0,
    employmentType: row.employment_type || 'part_time',
    assignedCategories: Array.isArray(row.assigned_categories) ? row.assigned_categories : [],
    joinedDate: row.joined_date || undefined,
    avatarUrl: row.avatar_url || undefined,
    status: row.status || 'active',
    bio: row.bio || undefined
  };
}

export function mapScheduleToDb(s: TrainingSchedule) {
  const today = new Date().toISOString().split('T')[0];
  return {
    id: s.id,
    title: s.title,
    category: s.category || [],
    venue: s.venue,
    date: toValidDbDate(s.date) || today,
    start_time: s.startTime,
    end_time: s.endTime,
    head_coach_id: s.headCoachId || null,
    assistant_coach_ids: s.assistantCoachIds || [],
    topic: s.topic || '',
    drills_summary: s.drillsSummary || '',
    status: s.status || 'scheduled',
    notes: s.notes || null
  };
}

export function mapDbToSchedule(row: any): TrainingSchedule {
  return {
    id: row.id,
    title: row.title,
    category: Array.isArray(row.category) ? row.category : [],
    venue: row.venue,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    headCoachId: row.head_coach_id || '',
    assistantCoachIds: Array.isArray(row.assistant_coach_ids) ? row.assistant_coach_ids : [],
    topic: row.topic || '',
    drillsSummary: row.drills_summary || '',
    status: row.status || 'scheduled',
    notes: row.notes || undefined
  };
}

export function mapAttendanceToDb(a: AttendanceRecord) {
  const today = new Date().toISOString().split('T')[0];
  return {
    id: a.id,
    schedule_id: a.scheduleId,
    date: toValidDbDate(a.date) || today,
    student_id: a.studentId,
    status: a.status,
    recorded_by_coach_id: a.recordedByCoachId || null,
    check_in_time: a.checkInTime || null,
    notes: a.notes || null
  };
}

export function mapDbToAttendance(row: any): AttendanceRecord {
  return {
    id: row.id,
    scheduleId: row.schedule_id,
    date: row.date,
    studentId: row.student_id,
    status: row.status,
    recordedByCoachId: row.recorded_by_coach_id || '',
    checkInTime: row.check_in_time || undefined,
    notes: row.notes || undefined
  };
}

export function mapEvaluationToDb(e: SkillEvaluation) {
  const today = new Date().toISOString().split('T')[0];
  return {
    id: e.id,
    student_id: e.studentId,
    coach_id: e.coachId,
    evaluation_date: toValidDbDate(e.evaluationDate) || today,
    term_period: e.termPeriod,
    skills: e.skills,
    overall_score: e.overallScore,
    overall_grade: e.overallGrade,
    strengths: e.strengths || '',
    areas_for_improvement: e.areasForImprovement || '',
    coach_feedback: e.coachFeedback || '',
    next_goals: e.nextGoals || ''
  };
}

export function mapDbToEvaluation(row: any): SkillEvaluation {
  return {
    id: row.id,
    studentId: row.student_id,
    coachId: row.coach_id,
    evaluationDate: row.evaluation_date,
    termPeriod: row.term_period,
    skills: row.skills,
    overallScore: Number(row.overall_score),
    overallGrade: row.overall_grade,
    strengths: row.strengths || '',
    areasForImprovement: row.areas_for_improvement || '',
    coachFeedback: row.coach_feedback || '',
    nextGoals: row.next_goals || ''
  };
}

export function mapPaymentToDb(p: PaymentTransaction) {
  const today = new Date().toISOString().split('T')[0];
  return {
    id: p.id,
    receipt_number: p.receiptNumber,
    student_id: p.studentId,
    title: p.title,
    category: p.category,
    amount: p.amount,
    due_date: toValidDbDate(p.dueDate) || today,
    paid_date: toValidDbDate(p.paidDate),
    payment_method: p.paymentMethod || null,
    status: p.status,
    slip_url: p.slipUrl || null,
    notes: p.notes || null,
    received_by_staff_name: p.receivedByStaffName || null
  };
}

export function mapDbToPayment(row: any): PaymentTransaction {
  return {
    id: row.id,
    receiptNumber: row.receipt_number,
    studentId: row.student_id,
    title: row.title,
    category: row.category,
    amount: Number(row.amount),
    dueDate: row.due_date,
    paidDate: row.paid_date || undefined,
    paymentMethod: row.payment_method || undefined,
    status: row.status,
    slipUrl: row.slip_url || undefined,
    notes: row.notes || undefined,
    receivedByStaffName: row.received_by_staff_name || undefined
  };
}

export function mapExpenseToDb(e: ExpenseItem) {
  const today = new Date().toISOString().split('T')[0];
  return {
    id: e.id,
    expense_code: e.expenseCode,
    title: e.title,
    category: e.category,
    amount: e.amount,
    date: toValidDbDate(e.date) || today,
    paid_to: e.paidTo,
    recorded_by: e.recordedBy,
    payment_method: e.paymentMethod,
    receipt_proof_url: e.receiptProofUrl || null,
    notes: e.notes || null
  };
}

export function mapDbToExpense(row: any): ExpenseItem {
  return {
    id: row.id,
    expenseCode: row.expense_code,
    title: row.title,
    category: row.category,
    amount: Number(row.amount),
    date: row.date,
    paidTo: row.paid_to,
    recordedBy: row.recorded_by,
    paymentMethod: row.payment_method,
    receiptProofUrl: row.receipt_proof_url || undefined,
    notes: row.notes || undefined
  };
}

export function mapAssetToDb(a: ClinicAsset) {
  const today = new Date().toISOString().split('T')[0];
  return {
    id: a.id,
    asset_code: a.assetCode,
    name: a.name,
    category: a.category,
    total_quantity: a.totalQuantity,
    available_quantity: a.availableQuantity,
    damaged_quantity: a.damagedQuantity,
    unit: a.unit,
    location: a.location,
    condition: a.condition,
    last_checked_date: toValidDbDate(a.lastCheckedDate) || today,
    purchase_date: toValidDbDate(a.purchaseDate),
    cost: a.cost || null,
    notes: a.notes || null
  };
}

export function mapDbToAsset(row: any): ClinicAsset {
  return {
    id: row.id,
    assetCode: row.asset_code,
    name: row.name,
    category: row.category,
    totalQuantity: Number(row.total_quantity),
    availableQuantity: Number(row.available_quantity),
    damagedQuantity: Number(row.damaged_quantity),
    unit: row.unit,
    location: row.location,
    condition: row.condition,
    lastCheckedDate: row.last_checked_date,
    purchaseDate: row.purchase_date || undefined,
    cost: row.cost ? Number(row.cost) : undefined,
    notes: row.notes || undefined
  };
}

export function mapUserToDb(u: UserAccount) {
  const nowIso = new Date().toISOString();
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    phone: u.phone || null,
    password: u.password || null,
    full_name: u.fullName,
    nickname: u.nickname || null,
    role: u.role,
    avatar_url: u.avatarUrl || null,
    title: u.title,
    coach_id: u.coachId || null,
    student_ids: u.studentIds || [],
    custom_permissions: u.customPermissions || null,
    status: u.status || 'active',
    last_login: toValidDbTimestamp(u.lastLogin),
    created_at: toValidDbTimestamp(u.createdAt) || nowIso
  };
}

export function mapDbToUser(row: any): UserAccount {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    phone: row.phone || undefined,
    password: row.password || undefined,
    fullName: row.full_name,
    nickname: row.nickname || undefined,
    role: row.role as UserRole,
    avatarUrl: row.avatar_url || undefined,
    title: row.title,
    coachId: row.coach_id || undefined,
    studentIds: Array.isArray(row.student_ids) ? row.student_ids : [],
    customPermissions: row.custom_permissions || undefined,
    status: row.status || 'active',
    lastLogin: row.last_login || undefined,
    createdAt: row.created_at || new Date().toISOString().split('T')[0]
  };
}

export function mapAuditLogToDb(log: AuthSessionLog) {
  const nowIso = new Date().toISOString();
  return {
    id: log.id,
    user_id: log.userId,
    user_name: log.userName,
    role: log.role,
    timestamp: toValidDbTimestamp(log.timestamp) || nowIso,
    ip_address: log.ipAddress || null,
    device: log.device || null,
    action: log.action
  };
}

export function mapDbToAuditLog(row: any): AuthSessionLog {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    role: row.role as UserRole,
    timestamp: row.timestamp,
    ipAddress: row.ip_address || undefined,
    device: row.device || undefined,
    action: row.action
  };
}

// -------------------------------------------------------------
// Safe Fetch and Resilient Asynchronous Supabase Operations
// -------------------------------------------------------------

async function safeFetchTable(supabase: SupabaseClient, table: string, preferredOrderCol?: string, ascending = false): Promise<any[]> {
  try {
    if (preferredOrderCol) {
      const res = await supabase.from(table).select('*').order(preferredOrderCol, { ascending });
      if (!res.error && res.data) return res.data;
    }
    const fallbackRes = await supabase.from(table).select('*');
    if (!fallbackRes.error && fallbackRes.data) return fallbackRes.data;
    return [];
  } catch (e) {
    console.warn(`[SafeFetch] Table '${table}' fetch caught error:`, e);
    return [];
  }
}

export async function fetchAllDataFromSupabase(): Promise<{
  success: boolean;
  message?: string;
  data?: {
    students?: Student[];
    coaches?: Coach[];
    schedules?: TrainingSchedule[];
    attendanceRecords?: AttendanceRecord[];
    skillEvaluations?: SkillEvaluation[];
    payments?: PaymentTransaction[];
    expenses?: ExpenseItem[];
    assets?: ClinicAsset[];
    userAccounts?: UserAccount[];
    rolePermissions?: Record<UserRole, RolePermissions>;
    sessionLogs?: AuthSessionLog[];
    bankAccountConfig?: any;
    clinicTerms?: any;
  };
}> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, message: 'Supabase client is not initialized' };
  }

  try {
    const [
      studentsData,
      coachesData,
      schedulesData,
      attendanceData,
      evaluationsData,
      paymentsData,
      expensesData,
      assetsData,
      usersData,
      permsData,
      logsData,
      settingsData
    ] = await Promise.all([
      safeFetchTable(supabase, 'students', 'registered_date', false),
      safeFetchTable(supabase, 'coaches', 'coach_code', true),
      safeFetchTable(supabase, 'schedules', 'date', false),
      safeFetchTable(supabase, 'attendance_records', 'date', false),
      safeFetchTable(supabase, 'skill_evaluations', 'evaluation_date', false),
      safeFetchTable(supabase, 'payments', 'due_date', false),
      safeFetchTable(supabase, 'expenses', 'date', false),
      safeFetchTable(supabase, 'assets', 'asset_code', true),
      safeFetchTable(supabase, 'user_accounts', 'created_at', false),
      safeFetchTable(supabase, 'role_permissions'),
      safeFetchTable(supabase, 'audit_logs', 'timestamp', false),
      safeFetchTable(supabase, 'clinic_settings')
    ]);

    const students = (studentsData || []).map(mapDbToStudent);
    const coaches = (coachesData || []).map(mapDbToCoach);
    const schedules = (schedulesData || []).map(mapDbToSchedule);
    const attendanceRecords = (attendanceData || []).map(mapDbToAttendance);
    const skillEvaluations = (evaluationsData || []).map(mapDbToEvaluation);
    const payments = (paymentsData || []).map(mapDbToPayment);
    const expenses = (expensesData || []).map(mapDbToExpense);
    const assets = (assetsData || []).map(mapDbToAsset);
    const userAccounts = (usersData || []).map(mapDbToUser);
    const sessionLogs = (logsData || []).map(mapDbToAuditLog);

    let rolePermissions: Record<UserRole, RolePermissions> | undefined = undefined;
    if (permsData && permsData.length > 0) {
      rolePermissions = {} as any;
      permsData.forEach((row: any) => {
        if (row.role && row.permissions) {
          (rolePermissions as any)[row.role] = row.permissions;
        }
      });
    }

    let bankAccountConfig: any = undefined;
    let clinicTerms: any = undefined;
    if (settingsData && settingsData.length > 0) {
      settingsData.forEach((s: any) => {
        if (s.key === 'bank_account_config') bankAccountConfig = s.value;
        if (s.key === 'clinic_terms') clinicTerms = s.value;
      });
    }

    return {
      success: true,
      data: {
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
      }
    };
  } catch (error: any) {
    console.error('Error fetching all data from Supabase:', error);
    return { success: false, message: error.message || String(error) };
  }
}

// -------------------------------------------------------------
// Bulk Sync Local to Supabase
// -------------------------------------------------------------

function formatSyncError(tableLabel: string, err: any, currentUrl?: string): string {
  const msg = err?.message || String(err || '');
  if (msg.includes('Invalid path specified in request URL')) {
    return `ล้มเหลวขณะซิงค์${tableLabel}: URL ฐานข้อมูล "${currentUrl || ''}" มี Path ไม่ถูกต้อง กรุณาใช้ Project URL ในรูปแบบ https://xxxx.supabase.co (ตัด /rest/v1 หรือไม่ใช่ลิงก์หน้าแดชบอร์ด)`;
  }
  if (msg.includes('relation') && (msg.includes('does not exist') || err?.code === '42P01')) {
    return `ล้มเหลวขณะซิงค์${tableLabel}: ยังไม่พบตารางใน Supabase กรุณาคัดลอก SQL Script ไปรันใน Supabase SQL Editor ก่อน`;
  }
  if (msg.includes('JWT') || msg.includes('API key') || msg.includes('apikey') || err?.code === 'PGRST301') {
    return `ล้มเหลวขณะซิงค์${tableLabel}: Anon Public Key ไม่ถูกต้อง หรือหมดอายุ กรุณาตรวจสอบใน Supabase Dashboard`;
  }
  if (msg.includes('date/time') || msg.includes('out of range')) {
    return `ล้มเหลวขณะซิงค์${tableLabel}: พบรูปแบบวันที่ไม่รองรับ (${msg}) ระบบได้ปรับปรุงให้แปลงเป็นรูปแบบมาตรฐาน YYYY-MM-DD อัตโนมัติแล้ว กรุณาลองใหม่อีกครั้ง`;
  }
  return `ล้มเหลวขณะซิงค์${tableLabel}: ${msg}`;
}

async function resilientBatchUpsert(
  supabase: any,
  table: string,
  rows: Record<string, any>[],
  entityName: string,
  configUrl: string
) {
  if (rows.length === 0) return;
  let currentRows = rows.map(r => ({ ...r }));
  let attempts = 0;
  while (attempts < 10) {
    attempts++;
    const { error } = await supabase.from(table).upsert(currentRows, { onConflict: 'id' });
    if (!error) return;

    const missingCol = extractMissingColumnFromError(error);
    if (missingCol) {
      console.info(`[Supabase Batch] Stripping incompatible column '${missingCol}' from ${table} and retrying...`);
      currentRows = currentRows.map(r => {
        const copy = { ...r };
        delete copy[missingCol];
        return copy;
      });
      continue;
    }

    throw new Error(formatSyncError(entityName, error, configUrl));
  }
}

export async function syncAllLocalDataToSupabase(payload: {
  students: Student[];
  coaches: Coach[];
  schedules: TrainingSchedule[];
  attendanceRecords: AttendanceRecord[];
  skillEvaluations: SkillEvaluation[];
  payments: PaymentTransaction[];
  expenses: ExpenseItem[];
  assets: ClinicAsset[];
  userAccounts: UserAccount[];
  rolePermissions: Record<UserRole, RolePermissions>;
  sessionLogs: AuthSessionLog[];
  bankAccountConfig?: any;
  clinicTerms?: any;
}): Promise<{ success: boolean; message: string; details?: any }> {
  const config = getSupabaseConfig();
  const supabase = getSupabase();
  if (!supabase || !config.url) {
    return { success: false, message: 'กรุณาระบุและเชื่อมต่อ Supabase ก่อนทำการซิงค์' };
  }

  try {
    // 1. Students
    if (payload.students.length > 0) {
      const rows = payload.students.map(mapStudentToDb);
      await resilientBatchUpsert(supabase, 'students', rows, 'นักเรียน', config.url);
    }

    // 2. Coaches
    if (payload.coaches.length > 0) {
      const rows = payload.coaches.map(mapCoachToDb);
      await resilientBatchUpsert(supabase, 'coaches', rows, 'โค้ช', config.url);
    }

    // 3. Schedules
    if (payload.schedules.length > 0) {
      const rows = payload.schedules.map(mapScheduleToDb);
      await resilientBatchUpsert(supabase, 'schedules', rows, 'ตารางซ้อม', config.url);
    }

    // 4. Attendance
    if (payload.attendanceRecords.length > 0) {
      const rows = payload.attendanceRecords.map(mapAttendanceToDb);
      await resilientBatchUpsert(supabase, 'attendance_records', rows, 'เช็คชื่อ', config.url);
    }

    // 5. Skill Evaluations
    if (payload.skillEvaluations.length > 0) {
      const rows = payload.skillEvaluations.map(mapEvaluationToDb);
      await resilientBatchUpsert(supabase, 'skill_evaluations', rows, 'การประเมินทักษะ', config.url);
    }

    // 6. Payments
    if (payload.payments.length > 0) {
      const rows = payload.payments.map(mapPaymentToDb);
      await resilientBatchUpsert(supabase, 'payments', rows, 'การเงิน', config.url);
    }

    // 7. Expenses
    if (payload.expenses.length > 0) {
      const rows = payload.expenses.map(mapExpenseToDb);
      await resilientBatchUpsert(supabase, 'expenses', rows, 'รายจ่าย', config.url);
    }

    // 8. Assets
    if (payload.assets.length > 0) {
      const rows = payload.assets.map(mapAssetToDb);
      await resilientBatchUpsert(supabase, 'assets', rows, 'ครุภัณฑ์', config.url);
    }

    // 9. Users
    if (payload.userAccounts.length > 0) {
      const rows = payload.userAccounts.map(mapUserToDb);
      await resilientBatchUpsert(supabase, 'user_accounts', rows, 'บัญชีผู้ใช้', config.url);
    }

    // 10. Role Permissions
    if (payload.rolePermissions) {
      const rows = Object.entries(payload.rolePermissions).map(([role, permissions]) => ({
        role,
        permissions
      }));
      const { error } = await supabase.from('role_permissions').upsert(rows, { onConflict: 'role' });
      if (error) throw new Error(formatSyncError('สิทธิ์', error, config.url));
    }

    // 11. Audit Logs
    if (payload.sessionLogs.length > 0) {
      const rows = payload.sessionLogs.map(mapAuditLogToDb);
      await supabase.from('audit_logs').upsert(rows, { onConflict: 'id' });
    }

    // 12. Settings (Bank Account & Clinic Terms)
    if (payload.bankAccountConfig || payload.clinicTerms) {
      const settingsRows: { key: string; value: any }[] = [];
      if (payload.bankAccountConfig) {
        settingsRows.push({ key: 'bank_account_config', value: payload.bankAccountConfig });
      }
      if (payload.clinicTerms) {
        settingsRows.push({ key: 'clinic_terms', value: payload.clinicTerms });
      }
      await supabase.from('clinic_settings').upsert(settingsRows, { onConflict: 'key' });
    }

    return {
      success: true,
      message: 'ซิงค์และอัปโหลดข้อมูลทั้งหมดขึ้นฐานข้อมูล Supabase PostgreSQL สำเร็จเรียบร้อย!'
    };
  } catch (error: any) {
    console.error('Sync to Supabase failed:', error);
    return { success: false, message: error.message || String(error) };
  }
}

/**
 * Helper to parse PostgREST and PostgreSQL error messages to extract missing column names
 */
export function extractMissingColumnFromError(error: any): string | null {
  if (!error) return null;
  const msg = typeof error === 'string' ? error : `${error.message || ''} ${error.details || ''} ${error.hint || ''}`;
  if (!msg.trim()) return null;

  // 1. PostgREST schema cache: "Could not find the 'jersey_chest_cm' column of 'students' in the schema cache"
  const m1 = msg.match(/Could not find the ['"]([^'"]+)['"] column/i);
  if (m1 && m1[1]) return m1[1].toLowerCase();

  // 2. Postgres: column "jersey_chest_cm" of relation "students" does not exist
  const m2 = msg.match(/column ["']?([a-zA-Z0-9_]+)["']? of relation/i);
  if (m2 && m2[1]) return m2[1].toLowerCase();

  // 3. Postgres generic: column "jersey_chest_cm" does not exist
  const m3 = msg.match(/column ["']?([a-zA-Z0-9_]+)["']? does not exist/i);
  if (m3 && m3[1]) return m3[1].toLowerCase();

  // 4. Schema cache lookup
  const m4 = msg.match(/column ['"]([^'"]+)['"] does not exist/i);
  if (m4 && m4[1]) return m4[1].toLowerCase();

  return null;
}

/**
 * Helper to delete keys case-insensitively from a plain record
 */
function deleteKeyCaseInsensitive(obj: Record<string, any>, key: string): boolean {
  const target = key.toLowerCase().replace(/[^a-z0-9_]/g, '');
  let found = false;
  for (const k of Object.keys(obj)) {
    if (k.toLowerCase().replace(/[^a-z0-9_]/g, '') === target) {
      delete obj[k];
      found = true;
    }
  }
  return found;
}

/**
 * Safely inserts or updates a single student record in Supabase with auto-retry,
 * resilient schema compatibility (automatically stripping non-existent columns from older schemas),
 * and automatic collision-resolution for student_code unique constraints.
 */
export async function saveSingleStudentToSupabase(s: Student): Promise<{
  success: boolean;
  error?: string;
  savedCode: string;
  missingColumns?: string[];
}> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: true, savedCode: s.studentCode };
  }

  let currentCode = s.studentCode;
  let row: Record<string, any> = mapStudentToDb(s);
  row.updated_at = new Date().toISOString();

  const strippedColumns: string[] = [];

  // List of columns added in newer revisions that might not be in older Supabase databases
  const optionalCols = [
    'updated_at',
    'parent_email',
    'jersey_chest_cm',
    'jersey_length_cm',
    'shoe_size',
    'parent_id_card_number',
    'parent_line_id',
    'parent_occupation',
    'parent_avatar_url',
    'signature_name',
    'emergency_contact_name',
    'emergency_contact_phone',
    'accepted_terms',
    'accepted_date',
    'parent_relationship',
    'address',
    'id_card_number',
    'school_name',
    'medical_conditions',
    'preferred_position',
    'blood_type',
    'height_cm',
    'weight_kg'
  ];

  let attempts = 0;
  while (attempts < 10) {
    attempts++;
    row.student_code = currentCode;

    const { error } = await supabase.from('students').upsert(row, { onConflict: 'id' });

    if (!error) {
      console.info(`✅ [Supabase] Student saved successfully: ${s.fullName} (${currentCode})`);
      return { 
        success: true, 
        savedCode: currentCode, 
        missingColumns: strippedColumns.length > 0 ? strippedColumns : undefined 
      };
    }

    console.warn(`[Supabase Student Save] Attempt ${attempts} error:`, error);

    // 1. Check for missing column in schema cache or table
    const missingCol = extractMissingColumnFromError(error);
    if (missingCol) {
      const removed = deleteKeyCaseInsensitive(row, missingCol);
      if (removed) {
        console.info(`[Supabase] Stripping incompatible column '${missingCol}' from student record and retrying...`);
        if (!strippedColumns.includes(missingCol)) strippedColumns.push(missingCol);
        continue;
      }
    }

    // Check if error message mentions any known optional column
    let stripped = false;
    for (const col of optionalCols) {
      if (error.message?.includes(col) || error.details?.includes(col) || error.hint?.includes(col)) {
        const removed = deleteKeyCaseInsensitive(row, col);
        if (removed) {
          console.info(`[Supabase] Stripping column '${col}' based on error message...`);
          if (!strippedColumns.includes(col)) strippedColumns.push(col);
          stripped = true;
        }
      }
    }
    if (stripped) {
      continue;
    }

    // 2. Check for Duplicate Key violation on student_code (23505)
    if (
      error.code === '23505' ||
      error.message?.includes('student_code') ||
      error.message?.includes('duplicate key') ||
      error.message?.includes('unique')
    ) {
      const year = new Date().getFullYear();
      const rand = Math.floor(100 + Math.random() * 900);
      currentCode = `YFC-${year}-${rand}`;
      row.student_code = currentCode;
      continue;
    }

    // 3. Check for Check Constraint violation (23514)
    if (error.code === '23514') {
      row.gender = 'male';
      row.status = 'active';
      continue;
    }

    // Unrecoverable error
    return { 
      success: false, 
      error: error.message || 'Database error', 
      savedCode: currentCode,
      missingColumns: strippedColumns.length > 0 ? strippedColumns : undefined 
    };
  }

  return { 
    success: false, 
    error: 'Failed to save student after multiple attempts', 
    savedCode: currentCode,
    missingColumns: strippedColumns.length > 0 ? strippedColumns : undefined
  };
}

/**
 * Safely inserts or updates a single coach record in Supabase with auto-retry,
 * resilient schema compatibility (automatically stripping non-existent columns from older schemas),
 * and automatic collision-resolution for coach_code unique constraints.
 */
export async function saveSingleCoachToSupabase(c: Coach): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: true };
  }

  let row: Record<string, any> = mapCoachToDb(c);

  const optionalCols = [
    'id_card_number',
    'base_salary',
    'hourly_rate',
    'specialty',
    'line_id',
    'bio',
    'experience_years',
    'assigned_categories'
  ];

  let attempts = 0;
  while (attempts < 10) {
    attempts++;

    const { error } = await supabase.from('coaches').upsert(row, { onConflict: 'id' });

    if (!error) {
      console.info(`✅ [Supabase] Coach saved successfully: ${c.fullName} (${c.coachCode})`);
      return { success: true };
    }

    console.warn(`[Supabase Coach Save] Attempt ${attempts} error:`, error);

    // 1. Check for missing column in schema cache or table
    const missingCol = extractMissingColumnFromError(error);
    if (missingCol) {
      const removed = deleteKeyCaseInsensitive(row, missingCol);
      if (removed) {
        console.info(`[Supabase] Stripping incompatible column '${missingCol}' from coach record and retrying...`);
        continue;
      }
    }

    // Check if error message mentions any known optional column
    let stripped = false;
    for (const col of optionalCols) {
      if (error.message?.includes(col) || error.details?.includes(col)) {
        const removed = deleteKeyCaseInsensitive(row, col);
        if (removed) {
          console.info(`[Supabase] Stripping column '${col}' based on error message...`);
          stripped = true;
        }
      }
    }
    if (stripped) {
      continue;
    }

    // 2. Check for Role Check Constraint violation (23514)
    if (error.code === '23514' || error.message?.includes('check constraint') || error.message?.includes('role')) {
      if (row.role === 'staff') {
        row.role = 'assistant_coach';
        continue;
      }
      if (row.status && !['active', 'on_leave', 'inactive'].includes(row.status)) {
        row.status = 'active';
        continue;
      }
    }

    // Fallback: If we're midway through attempts and still having schema errors, strip all optional columns
    if (attempts >= 4) {
      let anyLeft = false;
      for (const col of optionalCols) {
        if (row[col] !== undefined) {
          delete row[col];
          anyLeft = true;
        }
      }
      if (anyLeft) continue;
    }

    return { success: false, error: error.message || 'Database error' };
  }

  return { success: false, error: 'Failed to save coach after multiple attempts' };
}

/**
 * Safely inserts or updates a single payment transaction in Supabase with auto-retry,
 * resilient schema compatibility (stripping non-existent columns if older schema),
 * and correct mapping of slip_url and received_by_staff_name.
 */
export async function saveSinglePaymentToSupabase(p: PaymentTransaction): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: true };
  }

  let row: Record<string, any> = mapPaymentToDb(p);

  const optionalCols = [
    'slip_url',
    'received_by_staff_name',
    'paid_date',
    'notes',
    'payment_method',
    'updated_at'
  ];

  let attempts = 0;
  while (attempts < 10) {
    attempts++;

    const { error } = await supabase.from('payments').upsert(row, { onConflict: 'id' });

    if (!error) {
      console.info(`✅ [Supabase] Payment saved successfully: ${p.receiptNumber} (฿${p.amount})`);
      return { success: true };
    }

    console.warn(`[Supabase Payment Save] Attempt ${attempts} error:`, error);

    // 0. Check for unique constraint violation on receipt_number
    if (error.code === '23505' || error.message?.includes('payments_receipt_number_key') || error.message?.includes('receipt_number')) {
      const currentYear = new Date().getFullYear();
      const isInv = row.receipt_number && String(row.receipt_number).startsWith('INV');
      const prefix = isInv ? 'INV' : 'REC';
      const randomSeq = Math.floor(1000 + Math.random() * 9000);
      const newReceiptNumber = `${prefix}-YLA-${currentYear}-${randomSeq}`;
      console.info(`[Supabase] Unique constraint on receipt_number hit. Regenerating receipt_number to '${newReceiptNumber}' and retrying...`);
      row.receipt_number = newReceiptNumber;
      continue;
    }

    // 1. Check for missing column in schema cache or table
    const missingCol = extractMissingColumnFromError(error);
    if (missingCol) {
      const removed = deleteKeyCaseInsensitive(row, missingCol);
      if (removed) {
        console.info(`[Supabase] Stripping incompatible column '${missingCol}' from payment record and retrying...`);
        continue;
      }
    }

    // Check if error message mentions any known optional column
    let stripped = false;
    for (const col of optionalCols) {
      if (error.message?.includes(col) || error.details?.includes(col)) {
        const removed = deleteKeyCaseInsensitive(row, col);
        if (removed) {
          console.info(`[Supabase] Stripping column '${col}' based on error message...`);
          stripped = true;
        }
      }
    }
    if (stripped) {
      continue;
    }

    // Fallback: If we're midway through attempts and still having schema errors, strip all optional columns
    if (attempts >= 4) {
      let anyLeft = false;
      for (const col of optionalCols) {
        if (row[col] !== undefined) {
          delete row[col];
          anyLeft = true;
        }
      }
      if (anyLeft) continue;
    }

    return { success: false, error: error.message || 'Database error' };
  }

  return { success: false, error: 'Failed to save payment after multiple attempts' };
}

