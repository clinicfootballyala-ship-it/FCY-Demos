import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceStatus, AttendanceRecord } from '../../types';
import { 
  ClipboardCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Save, 
  Calendar, 
  Users, 
  Sparkles, 
  FileText,
  Search,
  Filter
} from 'lucide-react';

const AGE_COLORS: Record<string, string> = {
  'U-6': '#3b82f6',
  'U-8': '#10b981',
  'U-10': '#059669',
  'U-12': '#3b82f6',
  'U-14': '#6366f1',
  'U-16': '#8b5cf6',
  'U-18': '#ec4899'
};

export const AttendanceManagement: React.FC<{ initialScheduleId?: string }> = ({ initialScheduleId }) => {
  const { schedules, students, coaches, attendanceRecords, saveAttendance, selectedCoachIdForCoach, currentRole } = useApp();

  const [selectedScheduleId, setSelectedScheduleId] = useState<string>(() => {
    return initialScheduleId || schedules[0]?.id || '';
  });

  const [saveFeedback, setSaveFeedback] = useState<{
    show: boolean;
    title: string;
    message: string;
    timestamp: string;
  } | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  const activeSchedule = schedules.find(s => s.id === selectedScheduleId);

  // Target students for this session's category
  const targetStudents = activeSchedule
    ? students.filter(s => activeSchedule.category.includes(s.category))
    : students;

  // Local attendance state for current session
  const [attendanceState, setAttendanceState] = useState<Record<string, { status: AttendanceStatus; notes: string }>>(() => {
    const map: Record<string, { status: AttendanceStatus; notes: string }> = {};
    if (activeSchedule) {
      targetStudents.forEach(st => {
        // Check if existing record exists
        const existing = attendanceRecords.find(a => a.scheduleId === activeSchedule.id && a.studentId === st.id);
        map[st.id] = {
          status: existing ? existing.status : 'present',
          notes: existing?.notes || ''
        };
      });
    }
    return map;
  });

  // When schedule changes, reload mapped states
  const handleSelectSchedule = (id: string) => {
    setSelectedScheduleId(id);
    const sch = schedules.find(s => s.id === id);
    if (sch) {
      const studentsForSch = students.filter(s => sch.category.includes(s.category));
      const map: Record<string, { status: AttendanceStatus; notes: string }> = {};
      studentsForSch.forEach(st => {
        const existing = attendanceRecords.find(a => a.scheduleId === sch.id && a.studentId === st.id);
        map[st.id] = {
          status: existing ? existing.status : 'present',
          notes: existing?.notes || ''
        };
      });
      setAttendanceState(map);
    }
  };

  const setAllStatus = (status: AttendanceStatus) => {
    const updated: Record<string, { status: AttendanceStatus; notes: string }> = {};
    targetStudents.forEach(st => {
      updated[st.id] = {
        status,
        notes: attendanceState[st.id]?.notes || ''
      };
    });
    setAttendanceState(updated);
  };

  // Stats for this session
  const stateValues = Object.values(attendanceState) as { status: AttendanceStatus; notes: string }[];
  const counts = {
    present: stateValues.filter(a => a.status === 'present').length,
    late: stateValues.filter(a => a.status === 'late').length,
    excused: stateValues.filter(a => a.status === 'excused').length,
    absent: stateValues.filter(a => a.status === 'absent').length
  };

  const handleSave = () => {
    if (!activeSchedule) return;

    setIsSaving(true);
    const records = targetStudents.map(st => ({
      studentId: st.id,
      status: attendanceState[st.id]?.status || 'present',
      notes: attendanceState[st.id]?.notes || ''
    }));

    const coachId = currentRole === 'coach' ? selectedCoachIdForCoach : activeSchedule.headCoachId;

    saveAttendance(activeSchedule.id, records, coachId);
    
    setTimeout(() => {
      setIsSaving(false);
      setSaveFeedback({
        show: true,
        title: 'บันทึกการเช็คชื่อสำเร็จแล้ว!',
        message: `บันทึกข้อมูลเรียบร้อย: มา ${counts.present} คน, สาย ${counts.late} คน, ลา ${counts.excused} คน, ขาด ${counts.absent} คน`,
        timestamp: new Date().toLocaleTimeString('th-TH')
      });
    }, 300);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Toast Feedback Notification Banner */}
      {saveFeedback && (
        <div className="bg-emerald-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-between gap-3 animate-fade-in transition-all">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm flex items-center gap-2">
                <span>{saveFeedback.title}</span>
                <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded-full">{saveFeedback.timestamp}</span>
              </div>
              <div className="text-xs text-emerald-100 mt-0.5">{saveFeedback.message}</div>
            </div>
          </div>

          <button
            onClick={() => setSaveFeedback(null)}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-semibold"
          >
            รับทราบ
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">ระบบบันทึกเวลาเรียน (เช็คชื่อเข้าฝึกซ้อม)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            เช็คชื่อรายบุคคล บันทึกเวลามาเรียน มาสาย ลาป่วย หรือขาดซ้อม พร้อมสถิติสะสม
          </p>
        </div>

        {activeSchedule && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 font-medium text-xs text-white shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isSaving ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                <span>กำลังบันทึกข้อมูล...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>บันทึกการเช็คชื่อเซสชันนี้</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Select Session Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <label className="block text-xs font-bold text-slate-800">
          เลือกเซสชันการฝึกซ้อมที่ต้องการเช็คชื่อ:
        </label>
        
        <select
          value={selectedScheduleId}
          onChange={(e) => handleSelectSchedule(e.target.value)}
          className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          {schedules.map(sch => (
            <option key={sch.id} value={sch.id}>
              [{sch.category.join(', ')}] {sch.date} ({sch.startTime}-{sch.endTime} น.) - {sch.title} @ {sch.venue}
            </option>
          ))}
        </select>

        {activeSchedule && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-blue-800">หัวข้อ: {activeSchedule.topic}</span>
              <span className="text-slate-400">•</span>
              <span>จำนวนนักเรียนในรุ่น: {targetStudents.length} คน</span>
            </div>

            {/* Quick batch buttons */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-500">เลือกทั้งหมดเป็น:</span>
              <button
                type="button"
                onClick={() => setAllStatus('present')}
                className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-medium text-[11px] hover:bg-emerald-200"
              >
                มาครบทุกคน (Present)
              </button>
              <button
                type="button"
                onClick={() => setAllStatus('excused')}
                className="px-2.5 py-1 rounded bg-blue-100 text-blue-800 font-medium text-[11px] hover:bg-blue-200"
              >
                ลาทุกคน
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary KPI Bar for this session */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-emerald-700">มาเรียน (Present)</div>
            <div className="text-xl font-bold text-emerald-900 mt-0.5">{counts.present} คน</div>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-amber-700">มาสาย (Late)</div>
            <div className="text-xl font-bold text-amber-900 mt-0.5">{counts.late} คน</div>
          </div>
          <Clock className="w-5 h-5 text-amber-600" />
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-blue-700">ลาป่วย/ลากิจ (Excused)</div>
            <div className="text-xl font-bold text-blue-900 mt-0.5">{counts.excused} คน</div>
          </div>
          <AlertCircle className="w-5 h-5 text-blue-600" />
        </div>

        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-rose-700">ขาดเรียน (Absent)</div>
            <div className="text-xl font-bold text-rose-900 mt-0.5">{counts.absent} คน</div>
          </div>
          <XCircle className="w-5 h-5 text-rose-600" />
        </div>
      </div>

      {/* Student Attendance List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <div className="font-bold text-xs text-slate-800 flex items-center gap-2">
            <span>รายชื่อนักเรียนรุ่น:</span>
            {activeSchedule?.category.map(cat => (
              <span
                key={cat}
                className="px-2 py-0.5 rounded text-[11px] font-bold text-white shadow-xs"
                style={{ backgroundColor: AGE_COLORS[cat] || (cat === 'U-6' ? '#3b82f6' : '#10b981') }}
              >
                {cat}
              </span>
            ))}
            <span className="text-slate-500 font-medium">({targetStudents.length} คน)</span>
          </div>
          <span className="text-[11px] text-slate-500">คลิกเปลี่ยนสถานะรายคนได้ทันที</span>
        </div>

        <div className="divide-y divide-slate-100">
          {targetStudents.map(student => {
            const currentStatus = attendanceState[student.id]?.status || 'present';
            const notes = attendanceState[student.id]?.notes || '';
            const isU6 = student.category === 'U-6';

            return (
              <div key={student.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
                
                {/* Student Info */}
                <div className="flex items-center gap-3">
                  <img 
                    src={student.avatarUrl} 
                    alt={student.fullName} 
                    className={`w-10 h-10 rounded-full object-cover border-2 ${isU6 ? 'border-blue-500' : 'border-emerald-500'}`} 
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                      <span>{student.fullName}</span>
                      <span className="text-slate-700 font-bold">"{student.nickname}"</span>
                      <span 
                        className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs"
                        style={{ backgroundColor: AGE_COLORS[student.category] || (isU6 ? '#3b82f6' : '#10b981') }}
                      >
                        {student.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {student.studentCode} • {student.preferredPosition}
                    </div>
                  </div>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: 'present', label: 'มาเรียน', activeClass: 'bg-emerald-600 text-white font-bold' },
                    { id: 'late', label: 'สาย', activeClass: 'bg-amber-500 text-white font-bold' },
                    { id: 'excused', label: 'ลา', activeClass: 'bg-blue-600 text-white font-bold' },
                    { id: 'absent', label: 'ขาด', activeClass: 'bg-rose-600 text-white font-bold' }
                  ].map(btn => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => {
                        setAttendanceState({
                          ...attendanceState,
                          [student.id]: {
                            status: btn.id as AttendanceStatus,
                            notes
                          }
                        });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                        currentStatus === btn.id
                          ? btn.activeClass
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}

                  {/* Notes input */}
                  <input
                    type="text"
                    placeholder="บันทึกเพิ่มเติม..."
                    value={notes}
                    onChange={(e) => {
                      setAttendanceState({
                        ...attendanceState,
                        [student.id]: {
                          status: currentStatus,
                          notes: e.target.value
                        }
                      });
                    }}
                    className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg w-36 sm:w-44 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

              </div>
            );
          })}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 font-bold text-xs text-white shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            {isSaving ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                <span>กำลังบันทึกข้อมูล...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>บันทึกการเช็คชื่อทั้งหมด</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};
