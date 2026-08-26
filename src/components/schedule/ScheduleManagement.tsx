import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TrainingSchedule, AgeCategory } from '../../types';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  Plus, 
  ClipboardCheck, 
  Edit, 
  Trash2, 
  Filter, 
  ChevronRight, 
  X, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const AGE_COLORS: Record<string, string> = {
  'U-6': '#3b82f6',
  'U-8': '#10b981',
  'U-10': '#059669',
  'U-12': '#3b82f6',
  'U-14': '#6366f1',
  'U-16': '#8b5cf6',
  'U-18': '#ec4899',
  'Senior/Open': '#64748b'
};

export const ScheduleManagement: React.FC<{
  onTakeAttendance?: (scheduleId: string) => void;
}> = ({ onTakeAttendance }) => {
  const { schedules, coaches, addSchedule, updateSchedule, deleteSchedule, currentRole, attendanceRecords } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<TrainingSchedule | null>(null);

  // New Session Form State
  const [newSch, setNewSch] = useState({
    title: '',
    category: ['U-8'] as AgeCategory[],
    venue: 'สนามหญ้าเทียมยะลา สเตเดียม (สนาม A)',
    date: new Date().toISOString().split('T')[0],
    startTime: '16:30',
    endTime: '18:00',
    headCoachId: coaches[0]?.id || '',
    assistantCoachIds: [] as string[],
    topic: 'Passing & Receiving, Movement off the ball',
    drillsSummary: 'Warm-up 15 นาที, Passing drills 30 นาที, Small-sided game 30 นาที',
    status: 'scheduled' as const,
    notes: 'ให้นักเรียนเตรียมกระบอกน้ำและสวมสนับแข้งครบถ้วน'
  });

  const filteredSchedules = schedules.filter(sch => {
    if (selectedCategory === 'all') return true;
    return sch.category.includes(selectedCategory as AgeCategory);
  });

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSch.title || !newSch.headCoachId) {
      alert('กรุณากรอกหัวข้อเซสชันและเลือกโค้ชผู้รับผิดชอบ');
      return;
    }

    addSchedule(newSch);
    setShowAddModal(false);
    setNewSch({
      title: '',
      category: ['U-6'],
      venue: 'สนามหญ้าเทียมยะลา สเตเดียม (สนาม A)',
      date: new Date().toISOString().split('T')[0],
      startTime: '16:30',
      endTime: '18:00',
      headCoachId: coaches[0]?.id || '',
      assistantCoachIds: [],
      topic: '',
      drillsSummary: '',
      status: 'scheduled',
      notes: ''
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchedule) return;
    if (!editingSchedule.title.trim()) {
      alert('กรุณาระบุหัวข้อเซสชันการฝึกซ้อม');
      return;
    }
    updateSchedule(editingSchedule.id, editingSchedule);
    setEditingSchedule(null);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">ระบบจัดการตารางการฝึกซ้อม & หลักสูตร</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            กำหนดการฝึกซ้อมประจำสัปดาห์ สถานที่ฝึกซ้อมใน จ.ยะลา และมอบหมายโค้ชผู้รับผิดชอบ
          </p>
        </div>

        {currentRole === 'admin_staff' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 font-medium text-xs text-white shadow-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มตารางฝึกซ้อมใหม่</span>
          </button>
        )}
      </div>

      {/* Filter by Category */}
      <div className="flex items-center gap-2 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
        <span className="text-xs font-semibold text-slate-500 shrink-0 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> รุ่นอายุ:
        </span>
        {['all', 'U-6', 'U-8'].map(cat => {
          const isSelected = selectedCategory === cat;
          const isU6 = cat === 'U-6';
          const isU8 = cat === 'U-8';

          let activeClass = 'bg-slate-900 text-white shadow-xs';
          let inactiveClass = 'bg-slate-100 text-slate-600 hover:bg-slate-200';

          if (isU6) {
            activeClass = 'bg-blue-600 text-white shadow-xs';
            inactiveClass = 'bg-blue-50/80 text-blue-700 border border-blue-200/80 hover:bg-blue-100';
          } else if (isU8) {
            activeClass = 'bg-emerald-600 text-white shadow-xs';
            inactiveClass = 'bg-emerald-50/80 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100';
          }

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                isSelected ? activeClass : inactiveClass
              }`}
            >
              {isU6 && (
                <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />
              )}
              {isU8 && (
                <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
              )}
              <span>{cat === 'all' ? 'ทุกรุ่นอายุ' : cat}</span>
            </button>
          );
        })}
      </div>

      {/* Schedule Sessions List */}
      <div className="space-y-4">
        {filteredSchedules.map(sch => {
          const headCoach = coaches.find(c => c.id === sch.headCoachId);
          const attCount = attendanceRecords.filter(a => a.scheduleId === sch.id).length;
          const isCompleted = sch.status === 'completed';

          return (
            <div 
              key={sch.id} 
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-6 relative overflow-hidden"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Left details */}
                <div className="space-y-2 flex-1">
                  
                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-2">
                    {sch.category.map(cat => (
                      <span 
                        key={cat}
                        className="px-2 py-0.5 rounded text-[11px] font-bold text-white shadow-xs flex items-center gap-1"
                        style={{ backgroundColor: AGE_COLORS[cat] || (cat === 'U-6' ? '#3b82f6' : '#10b981') }}
                      >
                        {cat}
                      </span>
                    ))}

                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3 text-slate-500" />
                      {sch.date}
                    </span>

                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      {sch.startTime} - {sch.endTime} น.
                    </span>

                    {isCompleted ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border">
                        เสร็จสิ้นแล้ว (เช็คชื่อ {attCount} คน)
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        พร้อมฝึกซ้อม
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900">{sch.title}</h3>
                  
                  <div className="text-xs text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="font-semibold text-slate-800">{sch.venue}</span>
                  </div>

                  {/* Topic & Drills */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs space-y-1.5">
                    <div>
                      <span className="font-bold text-emerald-900">หัวข้อการฝึกซ้อม: </span>
                      <span className="text-slate-700">{sch.topic}</span>
                    </div>
                    {sch.drillsSummary && (
                      <div className="text-slate-600">
                        <span className="font-semibold text-slate-500">รูปแบบการฝึก: </span>
                        <span>{sch.drillsSummary}</span>
                      </div>
                    )}
                    {sch.notes && (
                      <div className="text-amber-800 font-medium text-[11px]">
                        ⚠️ คำแนะนำผู้ปกครอง: {sch.notes}
                      </div>
                    )}
                  </div>

                </div>

                {/* Right: Coach info & Actions */}
                <div className="flex lg:flex-col items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                  
                  {headCoach && (
                    <div className="flex items-center gap-2.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80">
                      <img 
                        src={headCoach.avatarUrl} 
                        alt={headCoach.fullName} 
                        className="w-9 h-9 rounded-full object-cover border border-emerald-500"
                      />
                      <div className="text-left">
                        <div className="text-[10px] text-slate-400 font-semibold">หัวหน้าผู้ฝึกสอน</div>
                        <div className="text-xs font-bold text-slate-900">{headCoach.fullName}</div>
                        <div className="text-[10px] text-emerald-700 font-medium">{headCoach.license}</div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {(currentRole === 'admin_staff' || currentRole === 'coach') && (
                      <button
                        onClick={() => {
                          if (onTakeAttendance) onTakeAttendance(sch.id);
                        }}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
                      >
                        <ClipboardCheck className="w-4 h-4" />
                        <span>เช็คชื่อเข้าเรียน</span>
                      </button>
                    )}

                    {currentRole === 'admin_staff' && (
                      <>
                        <button
                          onClick={() => setEditingSchedule(sch)}
                          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="แก้ไข"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`คุณต้องการลบตารางการซ้อม "${sch.title}" หรือไม่?`)) {
                              deleteSchedule(sch.id);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="ลบ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE SCHEDULE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-bold text-sm text-slate-900">เพิ่มตารางการฝึกซ้อมใหม่</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  หัวข้อเซสชันการฝึกซ้อม <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ซ้อมแท็กติกเกมรุกและจบสกอร์ (Finishing Drills)"
                  value={newSch.title}
                  onChange={(e) => setNewSch({ ...newSch, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">รุ่นอายุ (Age Category)</label>
                  <div className="flex gap-2">
                    {(['U-6', 'U-8'] as AgeCategory[]).map(cat => {
                      const isSelected = newSch.category.includes(cat);
                      const isU6 = cat === 'U-6';
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            let newCats = [...newSch.category];
                            if (isSelected) {
                              if (newCats.length > 1) {
                                newCats = newCats.filter(c => c !== cat);
                              }
                            } else {
                              newCats.push(cat);
                            }
                            setNewSch({ ...newSch, category: newCats });
                          }}
                          className={`flex-1 py-2 px-3 rounded-lg border font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? isU6
                                ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                                : 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                              : isU6
                                ? 'bg-blue-50/60 border-blue-200 text-blue-700 hover:bg-blue-100/60'
                                : 'bg-emerald-50/60 border-emerald-200 text-emerald-700 hover:bg-emerald-100/60'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : isU6 ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                          <span>{cat}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">หัวหน้าผู้ฝึกสอน</label>
                  <select
                    value={newSch.headCoachId}
                    onChange={(e) => setNewSch({ ...newSch, headCoachId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    {coaches.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} ({c.nickname}) - {c.license}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">สนามฝึกซ้อม (Venue)</label>
                <select
                  value={newSch.venue}
                  onChange={(e) => setNewSch({ ...newSch, venue: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="สนามหญ้าเทียมยะลา สเตเดียม (สนาม A)">สนามหญ้าเทียมยะลา สเตเดียม (สนาม A)</option>
                  <option value="สนามหญ้าเทียมยะลา สเตเดียม (สนาม B)">สนามหญ้าเทียมยะลา สเตเดียม (สนาม B)</option>
                  <option value="สนามฟุตบอลเทศบาลนครยะลา (สนามหญ้าจริง)">สนามฟุตบอลเทศบาลนครยะลา (สนามหญ้าจริง)</option>
                  <option value="ศูนย์เยาวชนเทศบาลนครยะลา">ศูนย์เยาวชนเทศบาลนครยะลา</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">วันที่</label>
                  <input
                    type="date"
                    value={newSch.date}
                    onChange={(e) => setNewSch({ ...newSch, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เวลาเริ่ม</label>
                  <input
                    type="time"
                    value={newSch.startTime}
                    onChange={(e) => setNewSch({ ...newSch, startTime: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เวลาสิ้นสุด</label>
                  <input
                    type="time"
                    value={newSch.endTime}
                    onChange={(e) => setNewSch({ ...newSch, endTime: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">เนื้อหาหลักสูตรการสอน (Topic)</label>
                <input
                  type="text"
                  placeholder="เช่น Ball Mastery, 1v1 Defending, Small-sided Games"
                  value={newSch.topic}
                  onChange={(e) => setNewSch({ ...newSch, topic: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ขั้นตอนและแบบฝึก (Drills Summary)</label>
                <textarea
                  rows={2}
                  placeholder="เช่น วอร์มอัพ 15 นาที + ดริลล์ส่งบอล 20 นาที + แมตช์เพลย์ 25 นาที"
                  value={newSch.drillsSummary}
                  onChange={(e) => setNewSch({ ...newSch, drillsSummary: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ข้อความแจ้งเตือนผู้ปกครอง</label>
                <input
                  type="text"
                  placeholder="เช่น ให้นักเรียนสวมเสื้อสีเขียว และเตรียมน้ำดื่มส่วนตัว"
                  value={newSch.notes}
                  onChange={(e) => setNewSch({ ...newSch, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs text-xs transition-colors"
                >
                  บันทึกตารางฝึกซ้อม
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SCHEDULE MODAL */}
      {editingSchedule && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Edit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">แก้ไขข้อมูลตารางการฝึกซ้อม</h3>
                  <p className="text-xs text-slate-500">ปรับปรุงรายละเอียดวัน เวลา สถานที่ และโค้ชผู้ฝึกสอน</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingSchedule(null)} 
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  หัวข้อเซสชันการฝึกซ้อม <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ซ้อมแท็กติกเกมรุกและจบสกอร์ (Finishing Drills)"
                  value={editingSchedule.title}
                  onChange={(e) => setEditingSchedule({ ...editingSchedule, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">รุ่นอายุ (Age Category)</label>
                  <div className="flex gap-2">
                    {(['U-6', 'U-8'] as AgeCategory[]).map(cat => {
                      const isSelected = editingSchedule.category.includes(cat);
                      const isU6 = cat === 'U-6';
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            let newCats = [...editingSchedule.category];
                            if (isSelected) {
                              if (newCats.length > 1) {
                                newCats = newCats.filter(c => c !== cat);
                              }
                            } else {
                              newCats.push(cat);
                            }
                            setEditingSchedule({ ...editingSchedule, category: newCats });
                          }}
                          className={`flex-1 py-1.5 px-3 rounded-lg border font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                            isSelected 
                              ? isU6
                                ? 'bg-blue-600 border-blue-600 text-white shadow-xs' 
                                : 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                              : isU6
                                ? 'bg-blue-50/60 border-blue-200 text-blue-700 hover:bg-blue-100/60'
                                : 'bg-emerald-50/60 border-emerald-200 text-emerald-700 hover:bg-emerald-100/60'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : isU6 ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                          <span>{cat}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">หัวหน้าผู้ฝึกสอน (Head Coach)</label>
                  <select
                    value={editingSchedule.headCoachId}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, headCoachId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    {coaches.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} ({c.nickname}) - {c.license}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">สนามฝึกซ้อม (Venue)</label>
                  <select
                    value={editingSchedule.venue}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, venue: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="สนามหญ้าเทียมยะลา สเตเดียม (สนาม A)">สนามหญ้าเทียมยะลา สเตเดียม (สนาม A)</option>
                    <option value="สนามหญ้าเทียมยะลา สเตเดียม (สนาม B)">สนามหญ้าเทียมยะลา สเตเดียม (สนาม B)</option>
                    <option value="สนามฟุตบอลเทศบาลนครยะลา (สนามหญ้าจริง)">สนามฟุตบอลเทศบาลนครยะลา (สนามหญ้าจริง)</option>
                    <option value="ศูนย์เยาวชนเทศบาลนครยะลา">ศูนย์เยาวชนเทศบาลนครยะลา</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">สถานะตารางฝึกซ้อม</label>
                  <select
                    value={editingSchedule.status}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="scheduled">🟢 นัดหมายล่วงหน้า (Scheduled)</option>
                    <option value="in_progress">🟡 กำลังดำเนินการฝึกซ้อม (In Progress)</option>
                    <option value="completed">⚪ เสร็จสิ้นแล้ว (Completed)</option>
                    <option value="cancelled">🔴 ยกเลิก (Cancelled)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">วันที่</label>
                  <input
                    type="date"
                    value={editingSchedule.date}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">เวลาเริ่ม</label>
                  <input
                    type="time"
                    value={editingSchedule.startTime}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">เวลาสิ้นสุด</label>
                  <input
                    type="time"
                    value={editingSchedule.endTime}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">เนื้อหาหลักสูตรการสอน (Topic)</label>
                <input
                  type="text"
                  placeholder="เช่น Ball Mastery, 1v1 Defending, Small-sided Games"
                  value={editingSchedule.topic}
                  onChange={(e) => setEditingSchedule({ ...editingSchedule, topic: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ขั้นตอนและแบบฝึก (Drills Summary)</label>
                <textarea
                  rows={2}
                  placeholder="เช่น วอร์มอัพ 15 นาที + ดริลล์ส่งบอล 20 นาที + แมตช์เพลย์ 25 นาที"
                  value={editingSchedule.drillsSummary}
                  onChange={(e) => setEditingSchedule({ ...editingSchedule, drillsSummary: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ข้อความแจ้งเตือนผู้ปกครอง (Notes)</label>
                <input
                  type="text"
                  placeholder="เช่น ให้นักเรียนสวมเสื้อสีเขียว และเตรียมน้ำดื่มส่วนตัว"
                  value={editingSchedule.notes || ''}
                  onChange={(e) => setEditingSchedule({ ...editingSchedule, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingSchedule(null)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs text-xs transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>บันทึกการแก้ไข</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
