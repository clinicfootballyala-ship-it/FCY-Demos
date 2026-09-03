import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentTransaction, PaymentStatus, AgeCategory } from '../../types';
import { 
  CreditCard, 
  DollarSign, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Printer, 
  Plus, 
  FileText, 
  X, 
  ShieldCheck, 
  QrCode,
  Download,
  Building2,
  Calendar,
  Eye,
  Paperclip,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  User,
  CreditCard as PaymentIcon
} from 'lucide-react';

export const PaymentManagement: React.FC = () => {
  const { payments, students, addPayment, addPaymentsBatch, updatePaymentStatus, currentRole, financialSummary } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<PaymentTransaction | null>(null);
  const [viewingSlipUrl, setViewingSlipUrl] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);

  // Record Payment Modal State
  const [paymentToRecord, setPaymentToRecord] = useState<PaymentTransaction | null>(null);
  const [recordMethod, setRecordMethod] = useState<'promptpay' | 'bank_transfer' | 'cash' | 'credit_card'>('promptpay');
  const [recordStaffName, setRecordStaffName] = useState('เจ้าหน้าที่การเงินคลีนิกฟุตบอลยะลา');
  const [recordPaidDate, setRecordPaidDate] = useState(new Date().toISOString().split('T')[0]);
  const [recordSlipUrl, setRecordSlipUrl] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Single Payment Form State
  const [newPay, setNewPay] = useState({
    studentId: students[0]?.id || '',
    title: 'ค่าเรียนรายเดือน กันยายน 2569',
    category: 'tuition' as PaymentTransaction['category'],
    amount: 1500,
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: 'ชำระผ่านระบบคลีนิกฟุตบอลยะลา'
  });

  // Batch fee form
  const [batchPay, setBatchPay] = useState({
    category: 'all' as string,
    title: 'ค่าเรียนรายเดือน กันยายน 2569',
    amount: 1500,
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // Filter payments
  const filteredPayments = payments.filter(pay => {
    const student = students.find(s => s.id === pay.studentId);
    const matchesSearch = 
      pay.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pay.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student && (
        student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentCode.toLowerCase().includes(searchQuery.toLowerCase())
      ));

    const matchesStatus = selectedStatus === 'all' || pay.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || pay.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleCreateSinglePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPay.studentId) {
      setToastMessage('กรุณาเลือกนักเรียน');
      return;
    }

    addPayment({
      ...newPay,
      status: 'pending'
    });

    setShowAddModal(false);
    setToastMessage('สร้างใบเรียกเก็บเงินสำเร็จแล้ว');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateBatchPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const targetStudents = batchPay.category === 'all' 
      ? students 
      : students.filter(s => s.category === batchPay.category);

    if (targetStudents.length === 0) {
      setToastMessage('ไม่พบนักเรียนในรุ่นที่เลือก');
      return;
    }

    const batchItems = targetStudents.map(st => ({
      studentId: st.id,
      title: batchPay.title,
      category: 'tuition' as const,
      amount: batchPay.amount,
      dueDate: batchPay.dueDate,
      status: 'pending' as const,
      notes: `สร้างใบแจ้งหนี้อัตโนมัติประจำรุ่น ${st.category}`
    }));

    addPaymentsBatch(batchItems);

    setShowBatchModal(false);
    setToastMessage(`สร้างใบเรียกเก็บเงินเรียบร้อยแล้ว จำนวน ${targetStudents.length} รายการ`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenRecordPayment = (pay: PaymentTransaction) => {
    setPaymentToRecord(pay);
    setRecordPaidDate(new Date().toISOString().split('T')[0]);
    setRecordMethod('promptpay');
    setRecordSlipUrl(pay.slipUrl || '');
  };

  const handleConfirmRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentToRecord) return;

    const student = students.find(s => s.id === paymentToRecord.studentId);
    updatePaymentStatus(
      paymentToRecord.id, 
      'paid', 
      recordMethod, 
      recordStaffName,
      recordSlipUrl || paymentToRecord.slipUrl
    );
    
    const paidReceiptNumber = paymentToRecord.receiptNumber;
    setPaymentToRecord(null);
    setRecordSlipUrl('');
    setToastMessage(`บันทึกการรับชำระเงินเรียบร้อยแล้ว: ${student?.fullName || 'นักเรียน'} (เลขที่ ${paidReceiptNumber})`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-between gap-3 animate-fade-in transition-all">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div className="font-bold text-xs">{toastMessage}</div>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded text-xs text-white"
          >
            ปิด
          </button>
        </div>
      )}
      
      {/* Top Banner & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">ระบบการชำระเงินสมาชิก</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            บันทึกการชำระค่าเรียน ออกใบเสร็จรับเงิน และติดตามยอดค้างชำระ
          </p>
        </div>

        {currentRole === 'admin_staff' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBatchModal(true)}
              className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>เรียกเก็บทั้งรุ่น (Batch)</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 font-medium text-xs text-white shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>ออกใบแจ้งหนี้ใหม่</span>
            </button>
          </div>
        )}
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">ยอดชำระแล้วทั้งหมด (Paid)</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            ฿{financialSummary.totalRevenue.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">เชื่อมต่อกับระบบบัญชีคลีนิกโดยตรง</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">ยอดรอชำระ / ค้างชำระ (Pending)</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            ฿{financialSummary.pendingRevenue.toLocaleString()}
          </div>
          <span className="text-[11px] text-amber-700 font-medium">
            {payments.filter(p => p.status === 'pending').length} รายการรอดำเนินการ
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">ถุงเงิน ฟุตบอลคลีนิกยะลา</span>
          <div className="text-base font-bold text-slate-800 mt-1 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-600" />
            <span>081-456-7890</span>
          </div>
          <span className="text-[11px] text-slate-400">ชื่อบัญชี: นายฟารีส ฆอแด๊ะ</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาตามรหัสใบเสร็จ หรือชื่อนักเรียน"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs font-semibold text-slate-500 shrink-0">สถานะ:</span>
          {[
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'paid', label: 'ชำระแล้ว' },
            { id: 'pending', label: 'รอชำระ' }
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                selectedStatus === st.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Mobile Card List View (md:hidden) */}
      <div className="md:hidden space-y-3">
        {filteredPayments.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400">
            <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-xs">ไม่พบรายการชำระเงินตามเงื่อนไขที่ค้นหา</p>
          </div>
        ) : (
          filteredPayments.map(pay => {
            const student = students.find(s => s.id === pay.studentId);
            const isPaid = pay.status === 'paid';

            const categoryLabel = 
              pay.category === 'registration_fee' ? 'ค่าแรกเข้า' :
              pay.category === 'tuition' ? 'ค่าเรียนรายเดือน' :
              pay.category === 'uniform_kit' ? 'ชุด/อุปกรณ์' : 'อื่นๆ';

            const methodLabel = 
              pay.paymentMethod === 'promptpay' ? 'PromptPay QR' :
              pay.paymentMethod === 'bank_transfer' ? 'โอนเงินธนาคาร' :
              pay.paymentMethod === 'cash' ? 'เงินสดที่คลีนิก' :
              pay.paymentMethod === 'credit_card' ? 'บัตรเครดิต' : '-';

            return (
              <div 
                key={pay.id} 
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3"
              >
                {/* Card Header: Receipt #, Category & Status Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-mono text-blue-600 font-bold bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                      {pay.receiptNumber}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                      {categoryLabel}
                    </span>
                  </div>
                  {isPaid ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ชำระแล้ว
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 shrink-0">
                      <Clock className="w-3 h-3 text-amber-600" /> รอชำระ
                    </span>
                  )}
                </div>

                {/* Title */}
                <div className="font-bold text-slate-900 text-sm">
                  {pay.title}
                </div>

                {/* Student Info Row */}
                {student && (
                  <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <img 
                      src={student.avatarUrl} 
                      alt={student.fullName}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0" 
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-800 text-xs truncate">
                        {student.fullName} ({student.nickname})
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                        <span>{student.studentCode}</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700">{student.category}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2-Column Info Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">จำนวนเงิน</span>
                    <span className="text-sm font-black text-slate-900 font-mono">
                      ฿{pay.amount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">
                      {methodLabel}
                    </span>
                  </div>

                  <div>
                    {isPaid ? (
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">วันที่ชำระ</span>
                        <span className="font-bold text-emerald-700 text-xs">{pay.paidDate}</span>
                        <span className="text-[10px] text-slate-400 block truncate" title={pay.receivedByStaffName || 'เจ้าหน้าที่'}>
                          ผู้รับ: {pay.receivedByStaffName || 'เจ้าหน้าที่'}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">กำหนดชำระ</span>
                        <span className="font-semibold text-amber-800 text-xs">{pay.dueDate || '-'}</span>
                        <span className="text-[10px] text-amber-600 block">รอการชำระเงิน</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                  {pay.slipUrl && (
                    <button
                      type="button"
                      onClick={() => setViewingSlipUrl(pay.slipUrl || null)}
                      className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-lg text-xs flex items-center gap-1 border border-emerald-200 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>ดูสลิป</span>
                    </button>
                  )}
                  {isPaid ? (
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentForReceipt(pay)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs flex items-center gap-1 border border-emerald-200 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>ใบเสร็จ</span>
                    </button>
                  ) : (
                    currentRole === 'admin_staff' && (
                      <button
                        type="button"
                        onClick={() => handleOpenRecordPayment(pay)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>บันทึกจ่ายเงิน</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 2. Desktop Data Table View (hidden md:block) */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">เลขที่ใบเสร็จ / รายการ</th>
                <th className="py-3 px-4">นักเรียน / ผู้ปกครอง</th>
                <th className="py-3 px-4">จำนวนเงิน</th>
                <th className="py-3 px-4">กำหนดชำระ / วันที่จ่าย</th>
                <th className="py-3 px-4">ช่องทาง</th>
                <th className="py-3 px-4">สถานะ</th>
                <th className="py-3 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    ไม่พบรายการชำระเงินตามเงื่อนไขที่ค้นหา
                  </td>
                </tr>
              ) : (
                filteredPayments.map(pay => {
                  const student = students.find(s => s.id === pay.studentId);
                  const isPaid = pay.status === 'paid';

                  const categoryLabel = 
                    pay.category === 'registration_fee' ? 'ค่าแรกเข้า' :
                    pay.category === 'tuition' ? 'ค่าเรียนรายเดือน' :
                    pay.category === 'uniform_kit' ? 'ชุด/อุปกรณ์' : 'อื่นๆ';

                  const methodLabel = 
                    pay.paymentMethod === 'promptpay' ? 'PromptPay QR' :
                    pay.paymentMethod === 'bank_transfer' ? 'โอนเงินธนาคาร' :
                    pay.paymentMethod === 'cash' ? 'เงินสดที่คลีนิก' :
                    pay.paymentMethod === 'credit_card' ? 'บัตรเครดิต' : '-';

                  return (
                    <tr key={pay.id} className="hover:bg-slate-50 transition-colors">
                      {/* Item & Code */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{pay.title}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-mono text-blue-600 font-semibold">{pay.receiptNumber}</span>
                          <span className="text-[10px] text-slate-400">•</span>
                          <span className="text-[10px] text-slate-500 font-medium">{categoryLabel}</span>
                        </div>
                      </td>

                      {/* Student info */}
                      <td className="py-3.5 px-4">
                        {student ? (
                          <div>
                            <div className="font-bold text-slate-800 flex items-center gap-1">
                              <span>{student.fullName}</span>
                              <span className="text-slate-500 font-medium text-xs">({student.nickname})</span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {student.studentCode} • <span className="font-semibold text-slate-700">{student.category}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              ผู้ปกครอง: {student.parentName} ({student.parentPhone})
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">ไม่พบนักเรียน</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4">
                        <span className="text-sm font-black text-slate-900 font-mono">
                          ฿{pay.amount.toLocaleString()}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4">
                        {isPaid ? (
                          <div>
                            <div className="text-emerald-700 font-bold">{pay.paidDate}</div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[130px]" title={pay.receivedByStaffName || 'เจ้าหน้าที่'}>
                              รับโดย: {pay.receivedByStaffName || 'เจ้าหน้าที่'}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-amber-800 font-semibold">ครบกำหนด: {pay.dueDate || '-'}</div>
                            <div className="text-[10px] text-amber-600">รอการชำระเงิน</div>
                          </div>
                        )}
                      </td>

                      {/* Method */}
                      <td className="py-3.5 px-4">
                        {pay.paymentMethod ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                            {methodLabel}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ชำระแล้ว
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3 text-amber-600" /> รอชำระ
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {pay.slipUrl && (
                            <button
                              type="button"
                              onClick={() => setViewingSlipUrl(pay.slipUrl || null)}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-lg text-xs flex items-center gap-1 border border-emerald-200 transition-colors cursor-pointer"
                              title="ดูหลักฐานสลิปการโอนเงิน"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span className="hidden lg:inline">สลิป</span>
                            </button>
                          )}
                          {isPaid ? (
                            <button
                              type="button"
                              onClick={() => setSelectedPaymentForReceipt(pay)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs flex items-center gap-1 border border-emerald-200 transition-colors cursor-pointer shadow-2xs"
                              title="ดู/พิมพ์ใบเสร็จรับเงิน"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>ใบเสร็จ</span>
                            </button>
                          ) : (
                            currentRole === 'admin_staff' && (
                              <button
                                type="button"
                                onClick={() => handleOpenRecordPayment(pay)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>บันทึกจ่าย</span>
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* OFFICIAL DIGITAL RECEIPT MODAL */}
      {selectedPaymentForReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-2xl border border-slate-200 space-y-6 my-8">
            
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <span className="font-bold text-slate-800 text-sm">ใบเสร็จรับเงินอิเล็กทรอนิกส์</span>
              </div>
              <button 
                onClick={() => setSelectedPaymentForReceipt(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Receipt Paper */}
            <div id="printable-receipt" className="border-2 border-dashed border-slate-300 rounded-2xl p-6 bg-slate-50/50 space-y-4 text-xs text-slate-700">
              
              {/* Receipt Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">คลีนิกฟุตบอลยะลา</h2>
                  <div className="text-[11px] text-slate-500">CLINIC FOOTBALL YALA</div>
                  <div className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                    ยะลาสเตเดียม อ.เมือง จ.ยะลา 95000<br />
                    เลขประจำตัวผู้เสียภาษี: 0-9555-69001-23-4 | โทร: 081-456-7890
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-black text-sm text-emerald-800">ใบเสร็จรับเงิน</div>
                  <div className="text-[11px] font-mono font-bold text-slate-900">{selectedPaymentForReceipt.receiptNumber}</div>
                  <div className="text-[10px] text-slate-500 mt-1">วันที่ชำระ: {selectedPaymentForReceipt.paidDate}</div>
                </div>
              </div>

              {/* Student & Payer Info */}
              {(() => {
                const st = students.find(s => s.id === selectedPaymentForReceipt.studentId);
                return st ? (
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 block">ชื่อนักเรียน:</span>
                      <span className="font-bold text-slate-900">{st.fullName} ({st.nickname})</span>
                      <span className="text-[10px] text-slate-400 block font-mono">รหัส: {st.studentCode} | รุ่น: {st.category}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">ผู้ชำระเงิน:</span>
                      <span className="font-bold text-slate-900">{st.parentName}</span>
                      <span className="text-[10px] text-slate-400 block">เบอร์ติดต่อ: {st.parentPhone}</span>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Item Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 text-left">รายการ</th>
                      <th className="py-2.5 px-3 text-right">จำนวนเงิน (บาท)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{selectedPaymentForReceipt.title}</div>
                        <div className="text-[10px] text-slate-500">{selectedPaymentForReceipt.notes || 'การชำระเงินค่าบำรุงการฝึกซ้อม'}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-black text-slate-900 text-sm">
                        ฿{selectedPaymentForReceipt.amount.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="border-t border-slate-200 bg-slate-50">
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-800 text-right">ยอดรวมสุทธิ:</td>
                      <td className="py-2.5 px-3 text-right font-black text-emerald-800 text-base">
                        ฿{selectedPaymentForReceipt.amount.toLocaleString()} บาท
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Footer Stamp & Signatures */}
              <div className="pt-4 flex justify-between items-end text-[10px] text-slate-500">
                <div>
                  <div>ช่องทางชำระ: <span className="font-bold text-slate-700 uppercase">{selectedPaymentForReceipt.paymentMethod}</span></div>
                  <div>สถานะ: <span className="font-bold text-emerald-700">ชำระเงินครบถ้วนสมบูรณ์ (PAID)</span></div>
                  {selectedPaymentForReceipt.slipUrl && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => setViewingSlipUrl(selectedPaymentForReceipt.slipUrl || null)}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[10px] flex items-center gap-1 border border-emerald-300 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>ดูหลักฐานสลิปการโอนเงินที่แนบไว้</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <div className="w-32 border-b border-slate-400 pb-1 font-bold text-slate-800">
                    {selectedPaymentForReceipt.receivedByStaffName || 'เจ้าหน้าที่การเงิน'}
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5">ผู้รับเงิน / ออกใบเสร็จ</div>
                </div>
              </div>

            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>พิมพ์ใบเสร็จรับเงิน (Print)</span>
              </button>
              <button
                onClick={() => setSelectedPaymentForReceipt(null)}
                className="py-2.5 px-4 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                ปิด
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CREATE SINGLE INVOICE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-bold text-sm text-slate-900">ออกใบแจ้งหนี้ / เรียกเก็บเงินรายบุคคล</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSinglePayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">เลือกนักเรียน</label>
                <select
                  value={newPay.studentId}
                  onChange={(e) => setNewPay({ ...newPay, studentId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.nickname}) - {s.category} ({s.studentCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">หัวข้อรายการ</label>
                <input
                  type="text"
                  required
                  value={newPay.title}
                  onChange={(e) => setNewPay({ ...newPay, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">จำนวนเงิน (บาท)</label>
                  <input
                    type="number"
                    required
                    value={newPay.amount}
                    onChange={(e) => setNewPay({ ...newPay, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">วันครบกำหนดชำระ</label>
                  <input
                    type="date"
                    value={newPay.dueDate}
                    onChange={(e) => setNewPay({ ...newPay, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl"
                >
                  สร้างใบเรียกเก็บเงิน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BATCH BILLING MODAL */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-bold text-sm text-slate-900">เรียกเก็บค่าเรียนประจำเดือนทั้งรุ่น (Batch)</h3>
              <button onClick={() => setShowBatchModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBatchPayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">เลือกรุ่นอายุเป้าหมาย</label>
                <select
                  value={batchPay.category}
                  onChange={(e) => setBatchPay({ ...batchPay, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-bold"
                >
                  <option value="all">นักเรียนทุกคนในคลีนิก ({students.length} คน)</option>
                  <option value="U-6">รุ่น U-6</option>
                  <option value="U-8">รุ่น U-8</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">หัวข้อรายการ</label>
                <input
                  type="text"
                  required
                  value={batchPay.title}
                  onChange={(e) => setBatchPay({ ...batchPay, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ค่าเรียนต่อคน (บาท)</label>
                  <input
                    type="number"
                    required
                    value={batchPay.amount}
                    onChange={(e) => setBatchPay({ ...batchPay, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">กำหนดชำระ</label>
                  <input
                    type="date"
                    value={batchPay.dueDate}
                    onChange={(e) => setBatchPay({ ...batchPay, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2 border rounded-xl cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  สร้างรายการทั้งหมด
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT (บันทึกจ่าย) MODAL */}
      {paymentToRecord && (() => {
        const student = students.find(s => s.id === paymentToRecord.studentId);
        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 border border-slate-200">
              
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900">บันทึกการรับชำระเงิน</h3>
                    <p className="text-[11px] text-slate-500 font-mono">เลขที่ใบเรียกเก็บ: {paymentToRecord.receiptNumber}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setPaymentToRecord(null)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Student & Invoice Summary Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">นักเรียนผู้รับบริการ</div>
                    <div className="text-sm font-bold text-slate-900">
                      {student ? `${student.fullName} (${student.nickname})` : 'นักเรียน'}
                    </div>
                    <div className="text-slate-500 font-mono text-[11px]">
                      {student ? `${student.studentCode} • รุ่น ${student.category}` : '-'}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400">ยอดที่ต้องชำระ</div>
                    <div className="text-xl font-black text-emerald-600">
                      ฿{paymentToRecord.amount.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between text-slate-600">
                  <span>รายการ: <strong className="text-slate-800">{paymentToRecord.title}</strong></span>
                  <span>ครบกำหนด: {paymentToRecord.dueDate}</span>
                </div>
              </div>

              {/* Form to submit payment */}
              <form onSubmit={handleConfirmRecordPayment} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-2">ช่องทางการชำระเงิน</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'promptpay', label: 'PromptPay QR (พร้อมเพย์)', icon: QrCode },
                      { id: 'bank_transfer', label: 'โอนเงินบัญชีธนาคาร', icon: Building2 },
                      { id: 'cash', label: 'เงินสดที่คลีนิก', icon: DollarSign },
                      { id: 'credit_card', label: 'บัตรเครดิต / เดบิต', icon: CreditCard }
                    ].map(m => {
                      const Icon = m.icon;
                      const isSel = recordMethod === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setRecordMethod(m.id as any)}
                          className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                            isSel 
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs' 
                              : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isSel ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <span className="text-[11px] leading-tight">{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">วันที่ได้รับชำระเงิน</label>
                    <input
                      type="date"
                      required
                      value={recordPaidDate}
                      onChange={(e) => setRecordPaidDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">เจ้าหน้าที่ผู้รับเงิน</label>
                    <input
                      type="text"
                      required
                      value={recordStaffName}
                      onChange={(e) => setRecordStaffName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Slip upload / attachment */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">แนบรูปสลิปหลักฐานการชำระเงิน (ไม่บังคับ)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => setRecordSlipUrl(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                    />
                  </div>
                  {recordSlipUrl && (
                    <div className="mt-2 p-2 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={recordSlipUrl} alt="Slip Preview" className="w-10 h-10 object-cover rounded-lg border border-emerald-300" />
                        <span className="text-[11px] font-semibold text-emerald-800">มีรูปสลิปแนบอยู่</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setViewingSlipUrl(recordSlipUrl)}
                          className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold underline cursor-pointer"
                        >
                          ดูภาพขยาย
                        </button>
                        <button
                          type="button"
                          onClick={() => setRecordSlipUrl('')}
                          className="text-[11px] text-red-600 hover:text-red-800 font-semibold cursor-pointer"
                        >
                          ลบรูป
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentToRecord(null);
                      setRecordSlipUrl('');
                    }}
                    className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ยืนยันบันทึกรับเงิน</span>
                  </button>
                </div>
              </form>

            </div>
          </div>
        );
      })()}

      {/* VIEW SLIP LIGHTBOX MODAL */}
      {viewingSlipUrl && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 shadow-2xl space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>หลักฐานสลิปการโอนเงิน</span>
              </h3>
              <button 
                onClick={() => setViewingSlipUrl(null)} 
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-2 border border-slate-200 flex items-center justify-center max-h-[60vh] overflow-hidden">
              <img 
                src={viewingSlipUrl} 
                alt="Payment Slip Proof" 
                className="max-h-[55vh] w-auto object-contain rounded-lg shadow-xs" 
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setViewingSlipUrl(null)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
