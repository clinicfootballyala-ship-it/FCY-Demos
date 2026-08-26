export const SUPABASE_SQL_SCHEMA = `-- ======================================================================
-- YALA FOOTBALL CLINIC & YOUTH ACADEMY (คลีนิกฟุตบอลยะลา)
-- Supabase PostgreSQL Schema & Initial Data Migration Script (Free Tier)
-- ======================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Students Table (ทะเบียนสมาชิกนักเรียน)
CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY,
    student_code TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    nickname TEXT NOT NULL,
    birth_date DATE,
    age INT,
    gender TEXT CHECK (gender IN ('male', 'female')),
    id_card_number TEXT,
    school_name TEXT,
    height_cm NUMERIC,
    weight_kg NUMERIC,
    blood_type TEXT,
    medical_conditions TEXT,
    preferred_position TEXT,
    jersey_size TEXT,
    jersey_chest_cm NUMERIC,
    jersey_length_cm NUMERIC,
    shoe_size TEXT,
    category TEXT NOT NULL,
    registered_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending_approval', 'leave', 'graduated')),
    avatar_url TEXT,
    parent_name TEXT,
    parent_id_card_number TEXT,
    parent_relationship TEXT,
    parent_phone TEXT,
    parent_email TEXT,
    parent_line_id TEXT,
    parent_occupation TEXT,
    parent_avatar_url TEXT,
    address TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    accepted_terms BOOLEAN DEFAULT true,
    accepted_date DATE DEFAULT CURRENT_DATE,
    signature_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Coaches Table (บุคลากรผู้ฝึกสอนและสต๊าฟ)
CREATE TABLE IF NOT EXISTS public.coaches (
    id TEXT PRIMARY KEY,
    coach_code TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    nickname TEXT NOT NULL,
    id_card_number TEXT,
    phone TEXT,
    email TEXT,
    line_id TEXT,
    license TEXT NOT NULL,
    specialty TEXT,
    experience_years INT DEFAULT 0,
    role TEXT DEFAULT 'assistant_coach',
    salary NUMERIC DEFAULT 0,
    base_salary NUMERIC DEFAULT 0,
    hourly_rate NUMERIC DEFAULT 0,
    employment_type TEXT DEFAULT 'part_time',
    assigned_categories TEXT[] DEFAULT '{}',
    joined_date DATE DEFAULT CURRENT_DATE,
    avatar_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'inactive')),
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Training Schedules Table (ตารางฝึกซ้อม)
CREATE TABLE IF NOT EXISTS public.schedules (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT[] DEFAULT '{}',
    venue TEXT NOT NULL,
    date DATE NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    head_coach_id TEXT,
    assistant_coach_ids TEXT[] DEFAULT '{}',
    topic TEXT,
    drills_summary TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Attendance Records Table (บันทึกเวลาเรียน / เช็คชื่อ)
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id TEXT PRIMARY KEY,
    schedule_id TEXT NOT NULL,
    date DATE NOT NULL,
    student_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'late', 'excused', 'absent')),
    recorded_by_coach_id TEXT,
    check_in_time TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Skill Evaluations Table (ประเมินทักษะ 5 เสาหลัก)
CREATE TABLE IF NOT EXISTS public.skill_evaluations (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    coach_id TEXT NOT NULL,
    evaluation_date DATE DEFAULT CURRENT_DATE,
    term_period TEXT NOT NULL,
    skills JSONB NOT NULL,
    overall_score NUMERIC NOT NULL,
    overall_grade TEXT NOT NULL,
    strengths TEXT,
    areas_for_improvement TEXT,
    coach_feedback TEXT,
    next_goals TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Payment Transactions Table (การชำระเงินและใบเสร็จ)
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY,
    receipt_number TEXT NOT NULL UNIQUE,
    student_id TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    due_date DATE NOT NULL,
    paid_date TEXT,
    payment_method TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue', 'cancelled')),
    slip_url TEXT,
    notes TEXT,
    received_by_staff_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Clinic Expenses Table (บัญชีรายจ่ายคลีนิก)
CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY,
    expense_code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    date DATE NOT NULL,
    paid_to TEXT NOT NULL,
    recorded_by TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    receipt_proof_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Clinic Assets Table (ครุภัณฑ์และอุปกรณ์)
CREATE TABLE IF NOT EXISTS public.assets (
    id TEXT PRIMARY KEY,
    asset_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    total_quantity INT NOT NULL DEFAULT 0,
    available_quantity INT NOT NULL DEFAULT 0,
    damaged_quantity INT NOT NULL DEFAULT 0,
    unit TEXT NOT NULL,
    location TEXT NOT NULL,
    condition TEXT DEFAULT 'good',
    last_checked_date DATE DEFAULT CURRENT_DATE,
    purchase_date DATE,
    cost NUMERIC,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. User Accounts Table (บัญชีผู้ใช้งานระบบ RBAC)
CREATE TABLE IF NOT EXISTS public.user_accounts (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    phone TEXT,
    password TEXT,
    full_name TEXT NOT NULL,
    nickname TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin_staff', 'coach', 'student_parent')),
    avatar_url TEXT,
    title TEXT NOT NULL,
    coach_id TEXT,
    student_ids TEXT[] DEFAULT '{}',
    custom_permissions JSONB,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    last_login TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Role Permissions Matrix Table (ตารางสิทธิ์บทบาท)
CREATE TABLE IF NOT EXISTS public.role_permissions (
    role TEXT PRIMARY KEY,
    permissions JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Security Audit Logs (ประวัติความปลอดภัย)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    role TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    ip_address TEXT,
    device TEXT,
    action TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Clinic System Settings (การตั้งค่าบัญชีธนาคารและระเบียบข้อบังคับ)
CREATE TABLE IF NOT EXISTS public.clinic_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ======================================================================
-- Row Level Security (RLS) Policies
-- Enables seamless access for Supabase anon public key & authenticated users
-- ======================================================================

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;

-- Allow full access to anon / service role for application read/write
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow public all students" ON public.students;
    CREATE POLICY "Allow public all students" ON public.students FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public all coaches" ON public.coaches;
    CREATE POLICY "Allow public all coaches" ON public.coaches FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public all schedules" ON public.schedules;
    CREATE POLICY "Allow public all schedules" ON public.schedules FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public all attendance" ON public.attendance_records;
    CREATE POLICY "Allow public all attendance" ON public.attendance_records FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public all skill_evaluations" ON public.skill_evaluations;
    CREATE POLICY "Allow public all skill_evaluations" ON public.skill_evaluations FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public all payments" ON public.payments;
    CREATE POLICY "Allow public all payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public all expenses" ON public.expenses;
    CREATE POLICY "Allow public all expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public all assets" ON public.assets;
    CREATE POLICY "Allow public all assets" ON public.assets FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public all user_accounts" ON public.user_accounts;
    CREATE POLICY "Allow public all user_accounts" ON public.user_accounts FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public all role_permissions" ON public.role_permissions;
    CREATE POLICY "Allow public all role_permissions" ON public.role_permissions FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public all audit_logs" ON public.audit_logs;
    CREATE POLICY "Allow public all audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public all clinic_settings" ON public.clinic_settings;
    CREATE POLICY "Allow public all clinic_settings" ON public.clinic_settings FOR ALL USING (true) WITH CHECK (true);
END $$;

-- 13. Migration helper: Safely add optional/newer columns to existing tables
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS parent_email TEXT;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS jersey_chest_cm NUMERIC;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS jersey_length_cm NUMERIC;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS shoe_size TEXT;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS parent_id_card_number TEXT;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS parent_line_id TEXT;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS parent_occupation TEXT;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS parent_avatar_url TEXT;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS signature_name TEXT;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE IF EXISTS public.coaches ADD COLUMN IF NOT EXISTS id_card_number TEXT;
ALTER TABLE IF EXISTS public.coaches ADD COLUMN IF NOT EXISTS base_salary NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.coaches ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.coaches ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
`;

export const SUPABASE_QUICK_MIGRATION_SQL = `-- ======================================================================
-- YALA FOOTBALL CLINIC - Quick Database Schema Migration / Column Update
-- Run this in Supabase SQL Editor to add missing student & parent columns
-- ======================================================================

-- 1. Students Table Columns
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS id_card_number TEXT;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS school_name TEXT;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS height_cm NUMERIC;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS weight_kg NUMERIC;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS blood_type TEXT;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS medical_conditions TEXT;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS preferred_position TEXT;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS jersey_size TEXT;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS jersey_chest_cm NUMERIC;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS jersey_length_cm NUMERIC;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS shoe_size TEXT;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS parent_name TEXT;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS parent_id_card_number TEXT;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS parent_relationship TEXT;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS parent_phone TEXT;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS parent_email TEXT;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS parent_line_id TEXT;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS parent_occupation TEXT;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS parent_avatar_url TEXT;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS accepted_terms BOOLEAN DEFAULT true;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS accepted_date DATE;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS signature_name TEXT;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Coaches Table Columns
ALTER TABLE IF EXISTS public.coaches ADD COLUMN IF NOT EXISTS id_card_number TEXT;
ALTER TABLE IF EXISTS public.coaches ADD COLUMN IF NOT EXISTS base_salary NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.coaches ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.coaches ADD COLUMN IF NOT EXISTS employment_type TEXT DEFAULT 'part_time';
ALTER TABLE IF EXISTS public.coaches ADD COLUMN IF NOT EXISTS assigned_categories TEXT[] DEFAULT '{}';
ALTER TABLE IF EXISTS public.coaches ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE IF EXISTS public.coaches ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE IF EXISTS public.coaches ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE IF EXISTS public.coaches ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Payments Table Columns
ALTER TABLE IF EXISTS public.payments ADD COLUMN IF NOT EXISTS slip_url TEXT;
ALTER TABLE IF EXISTS public.payments ADD COLUMN IF NOT EXISTS received_by_staff_name TEXT;
ALTER TABLE IF EXISTS public.payments ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE IF EXISTS public.payments ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE IF EXISTS public.payments ADD COLUMN IF NOT EXISTS paid_date TEXT;
ALTER TABLE IF EXISTS public.payments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
`;

