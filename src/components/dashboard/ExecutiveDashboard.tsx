import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Trophy, 
  AlertCircle, 
  CheckCircle2, 
  Package, 
  UserPlus, 
  FileText,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

const AGE_COLORS: Record<string, string> = {
  'U-6': '#3b82f6',
  'U-8': '#10b981',
  'U-10': '#059669',
  'U-12': '#3b82f6',
  'U-14': '#6366f1',
  'U-16': '#8b5cf6',
  'U-18': '#ec4899'
};

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

export const ExecutiveDashboard: React.FC<{
  onOpenRegister: () => void;
  onNavigateTab: (tab: string) => void;
}> = ({ onOpenRegister, onNavigateTab }) => {
  const { 
    students, 
    coaches, 
    schedules, 
    payments, 
    expenses, 
    assets,
    financialSummary, 
    academyStats,
    attendanceRecords 
  } = useApp();

  const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'overdue');
  const recentStudents = [...students].slice(0, 5);
  const upcomingSchedules = [...schedules]
    .filter(s => s.status !== 'cancelled')
    .slice(0, 3);

  // Age group chart data
  const ageGroupData = Object.entries(academyStats.categoryCounts)
    .filter(([_, count]) => Number(count) > 0)
    .map(([cat, count]) => ({
      name: cat,
      students: Number(count)
    }));

  return (
    <div className="space-y-6">
      
      {/* Header Overview Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Executive Dashboard
            </span>
            <span className="text-xs text-slate-400 font-medium">Yala Football Clinic & Academy</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            ภาพรวมการบริหารคลีนิกฟุตบอลยะลา
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            สรุปข้อมูลสมาชิกล่าสุด สถานะการเงิน ตารางการฝึกซ้อม และการประเมินทักษะนักกีฬา
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            id="dash-btn-register"
            onClick={onOpenRegister}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-xs flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>รับสมัครนักเรียนใหม่</span>
          </button>
          <button
            id="dash-btn-schedule"
            onClick={() => onNavigateTab('schedule')}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            <span>ตารางการฝึกซ้อม</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: นักเรียนทั้งหมด */}
        <div 
          onClick={() => onNavigateTab('members')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">นักเรียนในอคาเดมี (Active)</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{academyStats.totalActiveStudents}</span>
            <span className="text-xs text-slate-500 font-medium">คน</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="font-bold text-blue-700">U-6</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-bold text-emerald-700">U-8</span>
            </span>
            <span className="text-slate-300">•</span>
            <span>{coaches.length} โค้ชผู้ฝึก</span>
          </div>
        </div>

        {/* Card 2: รายรับเดือนนี้ */}
        <div 
          onClick={() => onNavigateTab('payments')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">รายรับค่าเรียนเดือนนี้</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              ฿{financialSummary.totalRevenue.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +12%
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>ค้างชำระ: ฿{financialSummary.pendingRevenue.toLocaleString()}</span>
            <span className="text-blue-600 font-medium group-hover:underline">ดูรายละเอียด →</span>
          </div>
        </div>

        {/* Card 3: รายจ่ายและกำไรสุทธิ */}
        <div 
          onClick={() => onNavigateTab('finance')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">รายจ่ายดำเนินงาน</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              ฿{financialSummary.totalExpense.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-medium">ค่าเช่า/เบี้ยเลี้ยง</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-medium">
            <span className="text-slate-500">กำไรสุทธิ:</span>
            <span className={financialSummary.netProfit >= 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
              ฿{financialSummary.netProfit.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 4: อัตราการมาเรียน */}
        <div 
          onClick={() => onNavigateTab('attendance')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">อัตราการเข้าฝึกซ้อม</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{academyStats.averageAttendanceRate}%</span>
            <span className="text-xs text-emerald-600 font-semibold">เฉลี่ยสูง</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <span>จาก {schedules.length} เซสชันการฝึกซ้อม</span>
          </div>
        </div>

      </div>

      {/* Financial Chart & Age Group Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Revenue vs Expense Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">กระแสการเงิน 6 เดือนย้อนหลัง</h2>
              <p className="text-xs text-slate-500">เปรียบเทียบรายรับค่าเรียนและรายจ่ายการดำเนินงานคลีนิก (บาท)</p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
              สถานะ: สภาพคล่องมั่นคง
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialSummary.monthlyStats} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `฿${val / 1000}k`} />
                <Tooltip 
                  formatter={(value: number) => [`฿${value.toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="revenue" name="รายรับรวม" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="รายจ่ายรวม" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Age Category Breakdown (1 col) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">สัดส่วนตามรุ่นอายุ</h2>
                <p className="text-xs text-slate-500">จำนวนนักเรียนในแต่ละรุ่น (U-6 และ U-8)</p>
              </div>
            </div>

            <div className="h-52 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ageGroupData}
                    dataKey="students"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={45}
                    paddingAngle={4}
                  >
                    {ageGroupData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={AGE_COLORS[entry.name] || PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: number) => [`${val} คน`, 'จำนวนนักเรียน']}
                    contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Legend Grid */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-xs">
            {ageGroupData.map(item => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: AGE_COLORS[item.name] || '#2563eb' }}></span>
                <span className="font-semibold text-slate-700">{item.name}:</span>
                <span className="text-slate-500 font-medium">{item.students}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Two Column Layout: Action Items & Upcoming Training */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Upcoming Training Sessions */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">ตารางฝึกซ้อมที่จะถึงเร็วๆ นี้</h2>
            </div>
            <button 
              onClick={() => onNavigateTab('schedule')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center"
            >
              ดูทั้งหมด ({schedules.length}) <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="space-y-3">
            {upcomingSchedules.map(sch => {
              const headCoach = coaches.find(c => c.id === sch.headCoachId);
              return (
                <div key={sch.id} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {sch.category.map(cat => (
                          <span 
                            key={cat}
                            className="px-2 py-0.5 rounded text-[11px] font-bold text-white shadow-xs"
                            style={{ backgroundColor: AGE_COLORS[cat] || (cat === 'U-6' ? '#3b82f6' : '#10b981') }}
                          >
                            {cat}
                          </span>
                        ))}
                        <h3 className="text-xs font-bold text-slate-900">{sch.title}</h3>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-1">{sch.topic}</p>
                    </div>
                    <span className="shrink-0 text-xs font-bold text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">
                      {sch.startTime} - {sch.endTime}
                    </span>
                  </div>
                  
                  <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                    <span>📍 {sch.venue}</span>
                    <span className="font-semibold text-slate-700">⚽ {headCoach?.fullName || 'ทีมงานโค้ช'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Alerts & Pending Tasks */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <h2 className="text-base font-bold text-slate-900">การแจ้งเตือนและการจัดการที่ต้องติดตาม</h2>
            </div>
          </div>

          <div className="space-y-3">
            {/* Pending Payments Alert */}
            {pendingPayments.length > 0 && (
              <div 
                onClick={() => onNavigateTab('payments')}
                className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 flex items-start justify-between cursor-pointer hover:bg-amber-100/70 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-200 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-amber-900">
                      มียอดค้างชำระค่าเรียน {pendingPayments.length} รายการ
                    </h3>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      รวมเป็นเงิน ฿{financialSummary.pendingRevenue.toLocaleString()} บาท สามารถส่งการแจ้งเตือนผู้ปกครองได้
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-800 shrink-0">จัดการ →</span>
              </div>
            )}

            {/* Equipment status alert */}
            <div 
              onClick={() => onNavigateTab('assets')}
              className="p-3.5 rounded-lg bg-blue-50 border border-blue-200 flex items-start justify-between cursor-pointer hover:bg-blue-100/70 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-200 text-blue-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-blue-900">
                    อุปกรณ์และลูกฟุตบอลพร้อมใช้งาน ({assets.length} หมวดหมู่)
                  </h3>
                  <p className="text-[11px] text-blue-700 mt-0.5">
                    ลูกบอลเบอร์ 4 & 5 ตรวจสอบแรงดันลมและสภาพพร้อมฝึกซ้อมประจำสัปดาห์
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-800 shrink-0">ดูคลัง →</span>
            </div>

            {/* New Registered Student Alert */}
            <div 
              onClick={() => onNavigateTab('members')}
              className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start justify-between cursor-pointer hover:bg-slate-100 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    สมาชิกใหม่ล่าสุด: {recentStudents[0]?.fullName || 'ไม่มี'}
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    รหัส {recentStudents[0]?.studentCode} รุ่น {recentStudents[0]?.category} ยอมรับเงื่อนไขคลีนิกเรียบร้อย
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-600 shrink-0">ดูประวัติ →</span>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Students Table Snapshot */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">รายชื่อนักเรียนในสังกัดคลีนิกฟุตบอลยะลา</h2>
            <p className="text-xs text-slate-500">ข้อมูลสมาชิกล่าสุดพร้อมสถานะการยินยอมและสังกัดรุ่น</p>
          </div>
          <button 
            onClick={() => onNavigateTab('members')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center"
          >
            ดูทะเบียนทั้งหมด ({students.length}) <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">รหัส / ชื่อ-นามสกุล</th>
                <th className="py-3 px-4">รุ่นอายุ</th>
                <th className="py-3 px-4">ตำแหน่ง</th>
                <th className="py-3 px-4">ผู้ปกครอง / เบอร์ติดต่อ</th>
                <th className="py-3 px-4">ข้อตกลงคลีนิก</th>
                <th className="py-3 px-4">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentStudents.map(st => (
                <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={st.avatarUrl} 
                        alt={st.fullName} 
                        className="w-8 h-8 rounded-full object-cover border border-slate-200" 
                      />
                      <div>
                        <div className="font-bold text-slate-900">{st.fullName} ({st.nickname})</div>
                        <div className="text-[11px] text-slate-400 font-mono">{st.studentCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span 
                      className="px-2 py-0.5 rounded text-[11px] font-bold text-white shadow-xs"
                      style={{ backgroundColor: AGE_COLORS[st.category] || (st.category === 'U-6' ? '#3b82f6' : '#10b981') }}
                    >
                      {st.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">{st.preferredPosition}</td>
                  <td className="py-3 px-4">
                    <div className="text-slate-800 font-medium">{st.parentName} ({st.parentRelationship})</div>
                    <div className="text-[11px] text-slate-500 font-mono">{st.parentPhone}</div>
                  </td>
                  <td className="py-3 px-4">
                    {st.acceptedTerms ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ยินยอมแล้ว
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                        รอยืนยัน
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
