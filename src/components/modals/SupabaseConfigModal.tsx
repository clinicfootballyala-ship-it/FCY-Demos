import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  RefreshCw, 
  UploadCloud, 
  DownloadCloud, 
  ExternalLink, 
  Key, 
  Server, 
  ShieldCheck, 
  X,
  Code2,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  getSupabaseConfig, 
  saveCustomSupabaseConfig, 
  testSupabaseConnection, 
  fetchAllDataFromSupabase, 
  syncAllLocalDataToSupabase,
  normalizeSupabaseUrl,
  normalizeSupabaseKey
} from '../../lib/supabase';
import { SUPABASE_SQL_SCHEMA, SUPABASE_QUICK_MIGRATION_SQL } from '../../lib/supabaseSchema';
import { useApp } from '../../context/AppContext';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const { 
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
    resetToDefaultData
  } = useApp();

  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedMigrationSql, setCopiedMigrationSql] = useState(false);
  const [showSqlPreview, setShowSqlPreview] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'settings' | 'guide' | 'schema'>('settings');

  useEffect(() => {
    if (isOpen) {
      const config = getSupabaseConfig();
      setUrl(config.url);
      setAnonKey(config.anonKey);
      setTestResult(null);
      setSyncResult(null);
      // Run quick test if already configured
      if (config.isConfigured) {
        handleTest(config.url, config.anonKey);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async (testUrl = url, testKey = anonKey) => {
    const cleanUrl = normalizeSupabaseUrl(testUrl);
    const cleanKey = normalizeSupabaseKey(testKey);
    setUrl(cleanUrl);
    setAnonKey(cleanKey);

    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection(cleanUrl, cleanKey);
      setTestResult(res);
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const cleanUrl = normalizeSupabaseUrl(url);
    const cleanKey = normalizeSupabaseKey(anonKey);
    setUrl(cleanUrl);
    setAnonKey(cleanKey);
    saveCustomSupabaseConfig(cleanUrl, cleanKey);
    handleTest(cleanUrl, cleanKey);
  };

  const handleClear = () => {
    setUrl('');
    setAnonKey('');
    saveCustomSupabaseConfig('', '');
    setTestResult(null);
    setSyncResult(null);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleCopyMigrationSql = () => {
    navigator.clipboard.writeText(SUPABASE_QUICK_MIGRATION_SQL);
    setCopiedMigrationSql(true);
    setTimeout(() => setCopiedMigrationSql(false), 2500);
  };

  const handleSyncToSupabase = async () => {
    const cleanUrl = normalizeSupabaseUrl(url);
    const cleanKey = normalizeSupabaseKey(anonKey);
    setUrl(cleanUrl);
    setAnonKey(cleanKey);

    setIsSyncing(true);
    setSyncResult(null);
    try {
      // Save current credentials first
      saveCustomSupabaseConfig(cleanUrl, cleanKey);
      const res = await syncAllLocalDataToSupabase({
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
        sessionLogs
      });
      setSyncResult(res);
      if (res.success) {
        handleTest(cleanUrl, cleanKey);
      }
    } catch (err: any) {
      setSyncResult({ success: false, message: err.message || 'ซิงค์ข้อมูลไม่สำเร็จ' });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 text-white p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">จัดการฐานข้อมูล Supabase PostgreSQL (Cloud Database)</h2>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-medium border border-emerald-500/30">
                  Full Cloud Database
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                เชื่อมต่อและจัดเก็บข้อมูลขึ้นคลาวด์ดาต้าเบส Supabase PostgreSQL แบบรวมศูนย์ รองรับ Realtime Sync ทุกอุปกรณ์
              </p>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex gap-2 mt-4 pt-3 border-t border-slate-700/60">
            <button
              onClick={() => setActiveSubTab('settings')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeSubTab === 'settings' 
                  ? 'bg-emerald-500 text-white shadow-sm' 
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              การเชื่อมต่อ & ซิงค์ข้อมูล
            </button>
            <button
              onClick={() => setActiveSubTab('guide')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeSubTab === 'guide' 
                  ? 'bg-emerald-500 text-white shadow-sm' 
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              คู่มือเปิดใช้ Supabase ฟรี
            </button>
            <button
              onClick={() => setActiveSubTab('schema')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeSubTab === 'schema' 
                  ? 'bg-emerald-500 text-white shadow-sm' 
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              SQL Schema Script (13 ตาราง)
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          
          {/* TAB 1: Settings & Sync */}
          {activeSubTab === 'settings' && (
            <div className="space-y-6">
              
              {/* Status Banner */}
              <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                testResult?.success && !testResult.details?.needsSchema
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : testResult?.details?.needsSchema
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : url && anonKey
                  ? 'bg-blue-50 border-blue-200 text-blue-900'
                  : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}>
                <div className="mt-0.5">
                  {testResult?.success && !testResult.details?.needsSchema ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : testResult?.details?.needsSchema ? (
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  ) : (
                    <Server className="w-5 h-5 text-slate-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm flex items-center gap-2">
                    <span>สถานะปัจจุบัน:</span>
                    {testResult?.success && !testResult.details?.needsSchema ? (
                      <span className="text-emerald-700 font-semibold">🟢 เชื่อมต่อ Supabase PostgreSQL สมบูรณ์ (Cloud Live)</span>
                    ) : testResult?.details?.needsSchema ? (
                      <span className="text-amber-700 font-semibold">🟡 เชื่อมต่อได้ แต่ยังไม่พบ Schema ตาราง</span>
                    ) : url && anonKey ? (
                      <span className="text-blue-700 font-semibold">🔵 มีข้อมูลเชื่อมต่อ (กดทดสอบเพื่อยืนยัน)</span>
                    ) : (
                      <span className="text-slate-600 font-semibold">⚪ กำลังรอการระบุ Supabase URL และ Key</span>
                    )}
                  </div>
                  <p className="text-xs mt-1 text-slate-600">
                    {testResult ? testResult.message : 'ระบบพร้อมทำงานร่วมกับ Supabase PostgreSQL Cloud Database แบบเรียลไทม์ กรุณาระบุ Project URL และ Anon Key เพื่อเริ่มใช้งาน'}
                  </p>
                </div>
              </div>

              {/* Form Credentials */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <Key className="w-4 h-4 text-emerald-600" />
                    ข้อมูลการเชื่อมต่อ Supabase API (Free Tier)
                  </h3>
                  <a 
                    href="https://supabase.com/dashboard" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                  >
                    เปิด Supabase Dashboard <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Supabase Project URL <span className="text-red-500">*</span>
                      </label>
                      {url && url.includes('supabase.com/dashboard') && (
                        <span className="text-[10px] text-amber-600 font-medium">
                          ⚡ ตรวจพบ Dashboard URL (ระบบจะแปลงอัตโนมัติ)
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="https://abcdefghijklm.supabase.co"
                      value={url}
                      onChange={(e) => {
                        const val = e.target.value;
                        // If user pasted dashboard link or full URL with path, auto-normalize
                        if (val.includes('supabase.com/dashboard') || val.includes('/rest/v1')) {
                          setUrl(normalizeSupabaseUrl(val));
                        } else {
                          setUrl(val);
                        }
                      }}
                      onBlur={() => {
                        if (url.trim()) {
                          setUrl(normalizeSupabaseUrl(url));
                        }
                      }}
                      className="w-full text-xs font-mono px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      รูปแบบ: <code className="text-slate-600 font-mono">https://[project-ref].supabase.co</code> (ดูได้ที่ Settings &gt; Data API &gt; Project URL)
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Anon Public API Key <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={anonKey}
                      onChange={(e) => setAnonKey(e.target.value.trim())}
                      onBlur={() => {
                        if (anonKey.trim()) {
                          setAnonKey(normalizeSupabaseKey(anonKey));
                        }
                      }}
                      className="w-full text-xs font-mono px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      ดูได้ที่: Supabase Dashboard &gt; Project Settings &gt; Data API &gt; Project API keys (anon public)
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTest()}
                      disabled={isTesting || !url || !anonKey}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {isTesting ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      ทดสอบการเชื่อมต่อ
                    </button>

                    <button
                      onClick={handleSave}
                      disabled={!url || !anonKey}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      บันทึกการตั้งค่า
                    </button>
                  </div>

                  <button
                    onClick={handleClear}
                    className="px-3 py-2 text-slate-500 hover:text-red-600 text-xs font-medium transition-colors"
                  >
                    ล้างข้อมูล / ใช้ Local Storage
                  </button>
                </div>
              </div>

              {/* Data Migration Section */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-emerald-600" />
                    เครื่องมือย้ายข้อมูล (Data Migration & Sync Tools)
                  </h3>
                  <span className="text-xs text-slate-500">
                    ข้อมูลปัจจุบันในระบบ: {students.length} นักเรียน | {coaches.length} โค้ช | {payments.length} การเงิน
                  </span>
                </div>

                <p className="text-xs text-slate-600">
                  หลังจากสร้างตารางใน Supabase แล้ว ท่านสามารถกดปุ่มด้านล่างเพื่ออัปโหลดข้อมูลจากคลีนิกปัจจุบันขึ้นฐานข้อมูล Supabase ทันที
                </p>

                {syncResult && (
                  <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    syncResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {syncResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                    <span>{syncResult.message}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleSyncToSupabase}
                    disabled={isSyncing || !url || !anonKey}
                    className="flex-1 min-w-[240px] px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                  >
                    {isSyncing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <UploadCloud className="w-4 h-4" />
                    )}
                    อัปโหลดข้อมูลทั้งหมดขึ้น Supabase (Initial Migration)
                  </button>

                  <button
                    onClick={handleCopyMigrationSql}
                    className="px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer border border-emerald-200"
                    title="สำหรับผู้ที่สร้างตารางไว้แล้วและต้องการเพิ่มคอลัมน์ใหม่ (รูปผู้ปกครอง, เลขบัตร, ไซส์เสื้อ)"
                  >
                    {copiedMigrationSql ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-emerald-600" />}
                    {copiedMigrationSql ? 'คัดลอก Migration SQL แล้ว!' : 'คัดลอก SQL อัปเดตคอลัมน์ (Quick Migration)'}
                  </button>

                  <button
                    onClick={handleCopySql}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer border border-slate-200"
                  >
                    {copiedSql ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                    {copiedSql ? 'คัดลอก Full SQL แล้ว!' : 'คัดลอก Full SQL Schema ทั้งหมด'}
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: Guide */}
          {activeSubTab === 'guide' && (
            <div className="space-y-4">
              <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-xl text-emerald-900">
                <h3 className="font-bold text-sm flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  สิทธิประโยชน์ของ Supabase Free Tier สำหรับคลีนิกฟุตบอลยะลา
                </h3>
                <ul className="text-xs space-y-1 list-disc list-inside text-emerald-800 mt-2">
                  <li><strong>ฟรีตลอดการใช้งาน (Free Tier Forever)</strong>: พื้นที่จัดเก็บ PostgreSQL 500 MB (เพียงพอสำหรับข้อมูลนักเรียนและประวัติหลายปี)</li>
                  <li><strong>ความปลอดภัยสูง (Row Level Security - RLS)</strong>: ป้องกันการดึงข้อมูลโดยไม่ได้รับอนุญาต</li>
                  <li><strong>ผู้ใช้งาน (MAU)</strong>: รองรับได้สูงสุด 50,000 บัญชีผู้ใช้งานต่อเดือน</li>
                  <li><strong>การทำงานข้ามอุปกรณ์</strong>: โค้ชเช็คชื่อในสนามผ่านมือถือ ผู้บริหารดูยอดชำระเงินจากคอมพิวเตอร์แบบเรียลไทม์</li>
                </ul>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <h4 className="font-bold text-sm text-slate-900 border-b pb-2">ขั้นตอนการตั้งค่า 4 ขั้นตอนง่ายๆ:</h4>
                
                <div className="space-y-3.5 text-xs text-slate-700">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      1
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">สร้างบัญชีและโปรเจกต์ Supabase</p>
                      <p className="text-slate-600 mt-0.5">
                        เข้าไปที่ <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-semibold">https://supabase.com</a> แล้วกด "New Project" ตั้งชื่อเช่น <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">yala-football-clinic</code> และเลือก Region <strong>Singapore (ap-southeast-1)</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      2
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">รัน SQL Script สร้างตารางอัตโนมัติ</p>
                      <p className="text-slate-600 mt-0.5">
                        ในหน้าโปรเจกต์ Supabase ให้ไปที่เมนู <strong>SQL Editor</strong> ทางซ้ายมือ &gt; คลิก <strong>New Query</strong> &gt; กดปุ่ม <strong>"คัดลอก SQL Schema"</strong> จากแท็บด้านบนของหน้านี้ แล้วนำไป Paste ลงใน SQL Editor แล้วกดปุ่ม <strong>Run</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      3
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">คัดลอก API Credentials</p>
                      <p className="text-slate-600 mt-0.5">
                        ไปที่เมนู <strong>Project Settings (รูปฟันเฟือง) &gt; Data API</strong> คัดลอก <strong>Project URL</strong> และ <strong>anon public Key</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      4
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">บันทึกและซิงค์ข้อมูล</p>
                      <p className="text-slate-600 mt-0.5">
                        นำมากรอกในแท็บ <strong>"การเชื่อมต่อ & ซิงค์ข้อมูล"</strong> ด้านบน แล้วกด <strong>"บันทึกและอัปโหลดข้อมูล"</strong> ระบบจะเชื่อมโยงเข้าฐานข้อมูลคลาวด์ทันที
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Schema Script */}
          {activeSubTab === 'schema' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-800">PostgreSQL SQL Scripts & Schema Migration</h3>
                  <p className="text-xs text-slate-500">คัดลอกไปรันใน Supabase SQL Editor เพื่ออัปเดตตารางและคอลัมน์ทั้งหมด</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyMigrationSql}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedMigrationSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedMigrationSql ? 'คัดลอก Migration แล้ว!' : 'คัดลอก Migration SQL'}
                  </button>
                  <button
                    onClick={handleCopySql}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedSql ? 'คัดลอก Full แล้ว!' : 'คัดลอก Full Schema'}
                  </button>
                </div>
              </div>

              {/* Migration script highlight banner */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">แนะนำสำหรับระบบที่มีตารางเดิมอยู่แล้วใน Supabase:</span>
                  <p className="text-emerald-800 mt-0.5">
                    นำ <strong>Quick Migration SQL</strong> ด้านล่างไปรันใน SQL Editor ของ Supabase เพื่อเพิ่มคอลัมน์อีเมลผู้ปกครอง (<code className="font-mono text-emerald-950 font-bold">parent_email</code>), รูปผู้ปกครอง (<code className="font-mono text-emerald-950 font-bold">parent_avatar_url</code>), บัตร ปชช. (<code className="font-mono text-emerald-950 font-bold">parent_id_card_number</code>), และขนาดรอบอก/ความยาวเสื้อ (<code className="font-mono text-emerald-950 font-bold">jersey_chest_cm, jersey_length_cm</code>)
                  </p>
                </div>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                <div className="bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 flex items-center justify-between border-b border-slate-800">
                  <span>SQL Quick Migration Script (Safe Add Columns & Constraints)</span>
                  <span className="text-[11px] text-emerald-400 font-mono">SUPABASE_QUICK_MIGRATION_SQL</span>
                </div>
                <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto max-h-[340px] leading-relaxed select-all">
                  {SUPABASE_QUICK_MIGRATION_SQL}
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>สถาปัตยกรรม Hybrid Cloud + Local Cache สำรองข้อมูลอัตโนมัติ</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
