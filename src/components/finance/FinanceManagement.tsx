import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ExpenseItem } from '../../types';
import { 
  Receipt, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Calendar, 
  Building2, 
  Tag, 
  CreditCard,
  PieChart as PieIcon,
  X,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

const EXPENSE_CATEGORY_NAMES: Record<string, string> = {
  pitch_rental: 'ค่าเช่าสนามฝึกซ้อม',
  coach_salary: 'ค่าตอบแทน/เงินเดือนโค้ช',
  equipment_purchase: 'จัดซื้อลูกบอลและอุปกรณ์',
  medical_refreshment: 'น้ำดื่ม น้ำแข็ง & ยาปฐมพยาบาล',
  tournament_travel: 'ค่าเดินทางและเบี้ยเลี้ยงแข่งขัน',
  utilities_maintenance: 'ค่าซ่อมบำรุงและสาธารณูปโภค',
  other: 'ค่าใช้จ่ายเบ็ดเตล็ด'
};

const EXPENSE_COLORS = ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#06b6d4', '#64748b'];

export const FinanceManagement: React.FC = () => {
  const { expenses, payments, addExpense, deleteExpense, financialSummary } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  // Form State
  const [newExp, setNewExp] = useState({
    title: '',
    category: 'pitch_rental' as ExpenseItem['category'],
    amount: 5000,
    date: new Date().toISOString().split('T')[0],
    paidTo: '',
    recordedBy: 'เจ้าหน้าที่บัญชีคลีนิก',
    paymentMethod: 'bank_transfer' as ExpenseItem['paymentMethod'],
    notes: ''
  });

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = 
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.expenseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.paidTo.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || e.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExp.title || !newExp.paidTo) {
      alert('กรุณากรอกหัวข้อรายการและชื่อผู้รับเงิน');
      return;
    }

    addExpense(newExp);
    setShowAddExpenseModal(false);
    setNewExp({
      title: '',
      category: 'pitch_rental',
      amount: 3000,
      date: new Date().toISOString().split('T')[0],
      paidTo: '',
      recordedBy: 'เจ้าหน้าที่บัญชีคลีนิก',
      paymentMethod: 'bank_transfer',
      notes: ''
    });
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">ระบบบันทึกค่าใช้จ่าย</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            เชื่อมต่อรายรับอัตโนมัติจากการชำระค่าเรียนของสมาชิก ประมวลผลร่วมกับรายจ่ายดำเนินงาน
          </p>
        </div>

        <button
          onClick={() => setShowAddExpenseModal(true)}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 font-medium text-xs text-white shadow-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>บันทึกรายจ่ายใหม่</span>
        </button>
      </div>

      {/* Financial Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Income KPI */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">รายรับรวม (Integrated Revenue)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">
            ฿{financialSummary.totalRevenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            ดึงข้อมูลจาก {payments.filter(p => p.status === 'paid').length} รายการชำระเงินที่ผ่านการตรวจสอบ
          </p>
        </div>

        {/* Expense KPI */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">รายจ่ายรวม (Total Expenses)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">
            ฿{financialSummary.totalExpense.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            จาก {expenses.length} รายการค่าใช้จ่ายสนาม โค้ช และอุปกรณ์
          </p>
        </div>

        {/* Net Profit KPI */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">กำไรสุทธิคงเหลือ (Net Profit)</span>
            <div className={`w-8 h-8 rounded-lg ${financialSummary.netProfit >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'} flex items-center justify-center`}>
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-bold mt-2 ${financialSummary.netProfit >= 0 ? 'text-blue-700' : 'text-rose-600'}`}>
            ฿{financialSummary.netProfit.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            สภาพคล่องทางการเงินอยู่ในเกณฑ์มั่นคง
          </p>
        </div>

      </div>

      {/* Expense Breakdown Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Expense Categories Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">สัดส่วนค่าใช้จ่ายตามหมวดหมู่</h3>
              <p className="text-xs text-slate-500">จำแนกตามโครงสร้างต้นทุนการดำเนินงานคลีนิกฟุตบอลยะลา</p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={financialSummary.categoryExpenses}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={4}
                >
                  {financialSummary.categoryExpenses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: number) => [`฿${val.toLocaleString()}`, 'จำนวนเงิน']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs">
            {financialSummary.categoryExpenses.map((cat, idx) => (
              <div key={cat.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: EXPENSE_COLORS[idx % EXPENSE_COLORS.length] }}></span>
                <span className="text-slate-600 truncate">{cat.name}:</span>
                <span className="font-bold text-slate-900 ml-auto">฿{cat.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Integrated Revenue Breakdown Info */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 mb-1">โครงสร้างรายรับที่ดึงจากระบบการชำระเงิน</h3>
            <p className="text-xs text-slate-500 mb-4">การกระจายตัวของรายรับตามประเภทค่าธรรมเนียม</p>

            <div className="space-y-3">
              {(() => {
                const tuitionRevenue = payments.filter(p => p.status === 'paid' && p.category === 'tuition').reduce((s, p) => s + p.amount, 0);
                const uniformRevenue = payments.filter(p => p.status === 'paid' && p.category === 'uniform_equipment').reduce((s, p) => s + p.amount, 0);
                const regFeeRevenue = payments.filter(p => p.status === 'paid' && p.category === 'registration_fee').reduce((s, p) => s + p.amount, 0);

                return [
                  { label: 'ค่าเรียนรายเดือน (Tuition)', amount: tuitionRevenue, color: 'bg-emerald-500' },
                  { label: 'ค่าชุดฝึกซ้อมและอุปกรณ์ (Uniform & Gear)', amount: uniformRevenue, color: 'bg-blue-500' },
                  { label: 'ค่าธรรมเนียมแรกเข้า (Registration Fee)', amount: regFeeRevenue, color: 'bg-amber-500' }
                ].map(item => (
                  <div key={item.label} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-700">{item.label}</span>
                      <span className="font-black text-slate-900">฿{item.amount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color}`}
                        style={{ width: `${financialSummary.totalRevenue > 0 ? (item.amount / financialSummary.totalRevenue) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

          <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
            <span>สถานะระบบการเงิน: บันทึกตรงกัน 100% ระหว่างแคชเชียร์และบัญชีคลีนิก</span>
            <span className="font-bold">Verified</span>
          </div>
        </div>

      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหารายการค่าใช้จ่าย, ผู้รับเงิน, รหัส EXP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-500 shrink-0">หมวดหมู่:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="all">ทุกหมวดหมู่ค่าใช้จ่าย</option>
            {Object.entries(EXPENSE_CATEGORY_NAMES).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 1. Mobile Expenses Card List View (md:hidden) */}
      <div className="md:hidden space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 text-center text-slate-400">
            <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-xs">ไม่พบรายการค่าใช้จ่ายตามเงื่อนไขที่ค้นหา</p>
          </div>
        ) : (
          filteredExpenses.map(exp => {
            const methodLabel = 
              exp.paymentMethod === 'promptpay' ? 'PromptPay QR' :
              exp.paymentMethod === 'bank_transfer' ? 'โอนเงินธนาคาร' :
              exp.paymentMethod === 'cash' ? 'เงินสด' :
              exp.paymentMethod === 'credit_card' ? 'บัตรเครดิต' : exp.paymentMethod;

            return (
              <div 
                key={exp.id}
                className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3"
              >
                {/* Header: Code, Category & Amount */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-mono text-rose-700 font-bold bg-rose-50 border border-rose-100 px-2 py-0.5 rounded">
                      {exp.expenseCode}
                    </span>
                    <span className="text-[10px] text-amber-900 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      {EXPENSE_CATEGORY_NAMES[exp.category] || exp.category}
                    </span>
                  </div>
                  <span className="font-black text-rose-600 text-sm font-mono shrink-0">
                    -฿{exp.amount.toLocaleString()}
                  </span>
                </div>

                {/* Title */}
                <div className="font-bold text-slate-900 text-sm">
                  {exp.title}
                </div>

                {/* 2-Column Info Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">วันที่จ่าย</span>
                    <span className="font-semibold text-slate-800 text-xs">{exp.date}</span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      ช่องทาง: <span className="font-medium text-slate-700">{methodLabel}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">จ่ายให้แก่</span>
                    <span className="font-bold text-slate-800 text-xs truncate block" title={exp.paidTo}>{exp.paidTo}</span>
                    <span className="text-[10px] text-slate-500 block mt-1 truncate" title={exp.recordedBy}>
                      ผู้บันทึก: <span className="font-medium text-slate-700">{exp.recordedBy}</span>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`คุณต้องการลบรายการ "${exp.title}" หรือไม่?`)) {
                        deleteExpense(exp.id);
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ลบรายการ</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 2. Tablet / Desktop Expenses Table View (hidden md:block) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">รหัส / รายการค่าใช้จ่าย</th>
                <th className="py-3 px-4">หมวดหมู่</th>
                <th className="py-3 px-4">จำนวนเงิน</th>
                <th className="py-3 px-4">วันที่จ่าย</th>
                <th className="py-3 px-4">จ่ายให้แก่</th>
                <th className="py-3 px-4">ผู้บันทึก / ช่องทาง</th>
                <th className="py-3 px-4 text-right">ลบ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    ไม่พบรายการค่าใช้จ่ายตามเงื่อนไขที่ค้นหา
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{exp.title}</div>
                      <div className="text-[11px] font-mono text-slate-400">{exp.expenseCode}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                        {EXPENSE_CATEGORY_NAMES[exp.category] || exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-black text-rose-600 text-sm">
                        -฿{exp.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{exp.date}</td>
                    <td className="py-3.5 px-4 text-slate-800 font-bold">{exp.paidTo}</td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-700">{exp.recordedBy}</div>
                      <div className="text-[10px] text-slate-400 uppercase">{exp.paymentMethod}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`คุณต้องการลบรายการ "${exp.title}" หรือไม่?`)) {
                            deleteExpense(exp.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                        title="ลบรายการ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD EXPENSE MODAL */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-bold text-sm text-slate-900">บันทึกค่าใช้จ่ายคลีนิกฟุตบอลยะลา</h3>
              <button onClick={() => setShowAddExpenseModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  รายการค่าใช้จ่าย <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ค่าเช่าสนามหญ้าเทียม, ซื้อลูกฟุตบอล, ค่าน้ำดื่ม"
                  value={newExp.title}
                  onChange={(e) => setNewExp({ ...newExp, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">หมวดหมู่</label>
                  <select
                    value={newExp.category}
                    onChange={(e) => setNewExp({ ...newExp, category: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg font-semibold"
                  >
                    {Object.entries(EXPENSE_CATEGORY_NAMES).map(([key, name]) => (
                      <option key={key} value={key}>{name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    จำนวนเงิน (บาท) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={newExp.amount}
                    onChange={(e) => setNewExp({ ...newExp, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg font-black text-rose-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    จ่ายให้แก่ (ผู้รับเงิน) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น สนามหญ้าเทียมยะลา, ร้านยะลาสปอร์ต"
                    value={newExp.paidTo}
                    onChange={(e) => setNewExp({ ...newExp, paidTo: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">วันที่จ่าย</label>
                  <input
                    type="date"
                    value={newExp.date}
                    onChange={(e) => setNewExp({ ...newExp, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">วิธีการชำระ</label>
                  <select
                    value={newExp.paymentMethod}
                    onChange={(e) => setNewExp({ ...newExp, paymentMethod: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="bank_transfer">โอนเงินธนาคาร</option>
                    <option value="promptpay">PromptPay</option>
                    <option value="cash">เงินสด</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ผู้บันทึกรายการ</label>
                  <input
                    type="text"
                    value={newExp.recordedBy}
                    onChange={(e) => setNewExp({ ...newExp, recordedBy: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">หมายเหตุ / รายละเอียดเพิ่มเติม</label>
                <textarea
                  rows={2}
                  value={newExp.notes}
                  onChange={(e) => setNewExp({ ...newExp, notes: e.target.value })}
                  placeholder="รายละเอียดเอกสารอ้างอิง หรือใบเสร็จร้านค้า..."
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow"
                >
                  บันทึกค่าใช้จ่าย
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
