import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ClinicTermAgreement } from '../../types';
import { 
  FileCheck2, 
  ShieldCheck, 
  Printer, 
  Download, 
  CheckCircle, 
  HeartHandshake, 
  Lock, 
  AlertCircle,
  Building2,
  Calendar,
  Edit3,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  Check,
  X,
  FileText,
  HelpCircle,
  Sparkles,
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import { CLINIC_TERMS_AND_CONDITIONS } from '../../data/mockData';

export const TermsView: React.FC = () => {
  const { 
    clinicTerms, 
    updateClinicTerms, 
    currentRole, 
    hasPermission, 
    organizationConfig 
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [activeEditTab, setActiveEditTab] = useState<'editor' | 'preview'>('editor');
  const [editFormData, setEditFormData] = useState<ClinicTermAgreement>(() => ({
    title: clinicTerms?.title || CLINIC_TERMS_AND_CONDITIONS.title,
    version: clinicTerms?.version || CLINIC_TERMS_AND_CONDITIONS.version,
    sections: clinicTerms?.sections ? JSON.parse(JSON.stringify(clinicTerms.sections)) : JSON.parse(JSON.stringify(CLINIC_TERMS_AND_CONDITIONS.sections))
  }));
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Check if current user can edit
  const canEdit = currentRole === 'admin_staff' || hasPermission('terms', 'full');

  // Start editing
  const handleStartEdit = () => {
    setEditFormData({
      title: clinicTerms?.title || CLINIC_TERMS_AND_CONDITIONS.title,
      version: clinicTerms?.version || CLINIC_TERMS_AND_CONDITIONS.version,
      sections: clinicTerms?.sections ? JSON.parse(JSON.stringify(clinicTerms.sections)) : JSON.parse(JSON.stringify(CLINIC_TERMS_AND_CONDITIONS.sections))
    });
    setIsEditing(true);
    setActiveEditTab('editor');
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setActiveEditTab('editor');
  };

  // Reset to default standard
  const handleResetToDefault = () => {
    if (window.confirm('คุณต้องการรีเซ็ตระเบียบปฏิบัติและเงื่อนไขกลับเป็นค่าเริ่มต้นมาตรฐานใช่หรือไม่?')) {
      const defaultData: ClinicTermAgreement = JSON.parse(JSON.stringify(CLINIC_TERMS_AND_CONDITIONS));
      setEditFormData(defaultData);
    }
  };

  // Save changes
  const handleSaveTerms = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Clean up empty items
    const cleanedSections = editFormData.sections
      .map(sec => ({
        heading: sec.heading.trim() || 'หมวดหมู่ระเบียบ',
        items: sec.items.map(item => item.trim()).filter(item => item.length > 0)
      }))
      .filter(sec => sec.items.length > 0 || sec.heading.length > 0);

    const updatedData: ClinicTermAgreement = {
      title: editFormData.title.trim() || 'ระเบียบปฏิบัติและเงื่อนไขการเป็นนักกีฬาเยาวชน คลีนิกฟุตบอลยะลา',
      version: editFormData.version.trim() || `ปรับปรุงล่าสุด ${new Date().toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}`,
      sections: cleanedSections.length > 0 ? cleanedSections : CLINIC_TERMS_AND_CONDITIONS.sections
    };

    updateClinicTerms(updatedData);
    setIsEditing(false);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 4000);
  };

  // Section manipulation
  const handleAddSection = () => {
    const nextIndex = editFormData.sections.length + 1;
    setEditFormData(prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          heading: `หมวดที่ ${nextIndex}: ระเบียบข้อกำหนดเพิ่มเติม`,
          items: ['ระบุข้อกำหนดและแนวปฏิบัติของหมวดหมู่นี้']
        }
      ]
    }));
  };

  const handleRemoveSection = (sectionIndex: number) => {
    if (editFormData.sections.length <= 1) {
      alert('ต้องมีระเบียบปฏิบัติอย่างน้อย 1 หมวดหมู่');
      return;
    }
    if (window.confirm(`คุณต้องการลบหมวด "${editFormData.sections[sectionIndex].heading}" หรือไม่?`)) {
      setEditFormData(prev => ({
        ...prev,
        sections: prev.sections.filter((_, idx) => idx !== sectionIndex)
      }));
    }
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= editFormData.sections.length) return;

    setEditFormData(prev => {
      const newSections = [...prev.sections];
      const temp = newSections[index];
      newSections[index] = newSections[targetIndex];
      newSections[targetIndex] = temp;
      return { ...prev, sections: newSections };
    });
  };

  const handleHeadingChange = (sectionIndex: number, newHeading: string) => {
    setEditFormData(prev => {
      const newSections = [...prev.sections];
      newSections[sectionIndex] = {
        ...newSections[sectionIndex],
        heading: newHeading
      };
      return { ...prev, sections: newSections };
    });
  };

  // Item manipulation
  const handleAddItem = (sectionIndex: number) => {
    setEditFormData(prev => {
      const newSections = [...prev.sections];
      newSections[sectionIndex] = {
        ...newSections[sectionIndex],
        items: [...newSections[sectionIndex].items, '']
      };
      return { ...prev, sections: newSections };
    });
  };

  const handleRemoveItem = (sectionIndex: number, itemIndex: number) => {
    setEditFormData(prev => {
      const newSections = [...prev.sections];
      const currentItems = newSections[sectionIndex].items;
      if (currentItems.length <= 1) {
        alert('แต่ละหมวดหมู่ควรมีข้อกำหนดอย่างน้อย 1 ข้อ');
        return prev;
      }
      newSections[sectionIndex] = {
        ...newSections[sectionIndex],
        items: currentItems.filter((_, idx) => idx !== itemIndex)
      };
      return { ...prev, sections: newSections };
    });
  };

  const handleItemChange = (sectionIndex: number, itemIndex: number, newText: string) => {
    setEditFormData(prev => {
      const newSections = [...prev.sections];
      const newItems = [...newSections[sectionIndex].items];
      newItems[itemIndex] = newText;
      newSections[sectionIndex] = {
        ...newSections[sectionIndex],
        items: newItems
      };
      return { ...prev, sections: newSections };
    });
  };

  const handleMoveItem = (sectionIndex: number, itemIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
    const currentItems = editFormData.sections[sectionIndex].items;
    if (targetIndex < 0 || targetIndex >= currentItems.length) return;

    setEditFormData(prev => {
      const newSections = [...prev.sections];
      const newItems = [...newSections[sectionIndex].items];
      const temp = newItems[itemIndex];
      newItems[itemIndex] = newItems[targetIndex];
      newItems[targetIndex] = temp;
      newSections[sectionIndex] = {
        ...newSections[sectionIndex],
        items: newItems
      };
      return { ...prev, sections: newSections };
    });
  };

  // Helper for Section Icon
  const getSectionIcon = (heading: string, index: number) => {
    const lower = heading.toLowerCase();
    if (lower.includes('วินัย') || lower.includes('นักเรียน') || lower.includes('conduct')) {
      return <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />;
    }
    if (lower.includes('ผู้ปกครอง') || lower.includes('parent')) {
      return <HeartHandshake className="w-5 h-5 text-emerald-600 shrink-0" />;
    }
    if (lower.includes('เงิน') || lower.includes('ค่าบำรุง') || lower.includes('ชำระ') || lower.includes('fee') || lower.includes('billing')) {
      return <CreditCard className="w-5 h-5 text-amber-600 shrink-0" />;
    }
    if (lower.includes('pdpa') || lower.includes('ภาพถ่าย') || lower.includes('สื่อ') || lower.includes('ความยินยอม') || lower.includes('privacy')) {
      return <Lock className="w-5 h-5 text-purple-600 shrink-0" />;
    }
    return <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />;
  };

  const activeDisplayTerms = isEditing && activeEditTab === 'preview' ? editFormData : (clinicTerms || CLINIC_TERMS_AND_CONDITIONS);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      
      {/* Save Success Alert Banner */}
      {saveSuccessNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>บันทึกการแก้ไขระเบียบปฏิบัติและเงื่อนไขการเป็นนักกีฬาเยาวชนเรียบร้อยแล้ว มีผลต่อระบบทันที!</span>
          </div>
          <button 
            onClick={() => setSaveSuccessNotice(false)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Toolbar */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">
              {isEditing ? 'แก้ไขระเบียบปฏิบัติ & เงื่อนไข' : 'ข้อตกลงและระเบียบข้อบังคับคลีนิกฟุตบอลยะลา'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isEditing 
              ? 'ปรับปรุงข้อบังคับ วินัยนักเรียน บทบาทผู้ปกครอง ค่าบำรุง และความยินยอม PDPA'
              : `Yala Football Clinic Rules, Regulations & Code of Conduct (${activeDisplayTerms.version})`}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!isEditing && canEdit && (
            <button
              id="edit-terms-btn"
              onClick={handleStartEdit}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Edit3 className="w-4 h-4" />
              <span>แก้ไขระเบียบปฏิบัติ</span>
            </button>
          )}

          {!isEditing && (
            <button
              id="print-terms-btn"
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์เอกสารข้อบังคับ</span>
            </button>
          )}

          {isEditing && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>ยกเลิก</span>
              </button>
              <button
                type="button"
                onClick={handleSaveTerms}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>บันทึกการแก้ไข</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* EDITING INTERFACE */}
      {isEditing ? (
        <div className="space-y-6">
          {/* Sub-tab Toggle between Editor & Live Preview */}
          <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs flex gap-1">
            <button
              type="button"
              onClick={() => setActiveEditTab('editor')}
              className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeEditTab === 'editor'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>โหมดแก้ไขข้อความระเบียบ ({editFormData.sections.length} หมวด)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveEditTab('preview')}
              className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeEditTab === 'preview'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>ดูตัวอย่างเอกสารจริง (Live Preview)</span>
            </button>
          </div>

          {activeEditTab === 'editor' && (
            <div className="space-y-6">
              
              {/* Document Meta Configuration */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <h2 className="text-sm font-bold text-slate-900">ข้อมูลหัวเรื่องและงวดการปรับปรุงเอกสาร</h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 font-medium transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>คืนค่าเริ่มต้นมาตรฐาน</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ชื่อเอกสารระเบียบปฏิบัติ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.title}
                      onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                      placeholder="เช่น ระเบียบปฏิบัติและเงื่อนไขการเป็นนักกีฬาเยาวชน คลีนิกฟุตบอลยะลา"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      เวอร์ชัน / วันที่ปรับปรุงล่าสุด <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.version}
                      onChange={(e) => setEditFormData({ ...editFormData, version: e.target.value })}
                      placeholder="เช่น 2026.1 (ปรับปรุงล่าสุด สิงหาคม 2569)"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Sections Editor List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">หมวดหมู่ระเบียบปฏิบัติและข้อบังคับ</h2>
                    <p className="text-xs text-slate-500">สามารถเพิ่ม ลบ ปรับลำดับ และแก้ไขข้อกำหนดย่อยได้อิสระ</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มหมวดหมู่ใหม่</span>
                  </button>
                </div>

                {editFormData.sections.map((section, sIndex) => (
                  <div 
                    key={sIndex} 
                    className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all hover:border-slate-300"
                  >
                    {/* Section Header Bar */}
                    <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold flex items-center justify-center shrink-0">
                          {sIndex + 1}
                        </span>
                        <input
                          type="text"
                          value={section.heading}
                          onChange={(e) => handleHeadingChange(sIndex, e.target.value)}
                          placeholder="ชื่อหมวดหมู่ระเบียบ เช่น หมวดที่ 1: วินัยและการปฏิบัติตน..."
                          className="flex-1 px-3 py-1.5 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      {/* Section Ordering & Delete Controls */}
                      <div className="flex items-center gap-1 self-end sm:self-auto">
                        <button
                          type="button"
                          disabled={sIndex === 0}
                          onClick={() => handleMoveSection(sIndex, 'up')}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded disabled:opacity-30 transition-colors"
                          title="เลื่อนขึ้น"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={sIndex === editFormData.sections.length - 1}
                          onClick={() => handleMoveSection(sIndex, 'down')}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded disabled:opacity-30 transition-colors"
                          title="เลื่อนลง"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-px h-4 bg-slate-200 mx-1" />
                        <button
                          type="button"
                          onClick={() => handleRemoveSection(sIndex)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                          title="ลบหมวดหมู่นี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Section Items */}
                    <div className="p-4 space-y-3">
                      <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                        <span>ข้อกำหนดย่อยในหมวดนี้ ({section.items.length} ข้อ):</span>
                      </div>

                      <div className="space-y-2.5">
                        {section.items.map((itemText, iIndex) => (
                          <div key={iIndex} className="flex items-start gap-2 group">
                            <span className="text-xs font-mono font-bold text-slate-400 mt-2 shrink-0">
                              {sIndex + 1}.{iIndex + 1}
                            </span>
                            
                            <textarea
                              rows={2}
                              value={itemText}
                              onChange={(e) => handleItemChange(sIndex, iIndex, e.target.value)}
                              placeholder={`ระบุข้อกำหนดข้อที่ ${iIndex + 1}...`}
                              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-700 leading-relaxed group-hover:border-slate-300"
                            />

                            {/* Item Controls */}
                            <div className="flex flex-col gap-1 shrink-0 pt-0.5">
                              <button
                                type="button"
                                disabled={iIndex === 0}
                                onClick={() => handleMoveItem(sIndex, iIndex, 'up')}
                                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-20"
                                title="เลื่อนข้อนี้ขึ้น"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={iIndex === section.items.length - 1}
                                onClick={() => handleMoveItem(sIndex, iIndex, 'down')}
                                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-20"
                                title="เลื่อนข้อนี้ลง"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(sIndex, iIndex)}
                                className="p-1 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                                title="ลบข้อนี้"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Item Button */}
                      <div className="pt-2 border-t border-slate-100 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleAddItem(sIndex)}
                          className="px-3 py-1.5 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>เพิ่มข้อกำหนดย่อย (+ข้อย่อย)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Bottom Add Section Box */}
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="w-full py-4 border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 rounded-xl text-xs font-bold text-slate-600 hover:text-blue-700 flex items-center justify-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มหมวดหมู่ระเบียบปฏิบัติใหม่</span>
                </button>
              </div>

              {/* Bottom Action Footer */}
              <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>เมื่อกดบันทึก ข้อมูลระเบียบจะอัปเดตไปยังระบบลงทะเบียนและพอร์ทัลสมาชิกแบบ Real-time</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveTerms}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>บันทึกการแก้ไขระเบียบปฏิบัติ</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {activeEditTab === 'preview' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <span>กำลังแสดงตัวอย่างผลลัพธ์ของระเบียบปฏิบัติที่กำลังแก้ไข (ยังไม่ได้บันทึกถาวร)</span>
              </div>
              
              {/* Document Paper Preview */}
              <DocumentPaperView terms={editFormData} organizationConfig={organizationConfig} getSectionIcon={getSectionIcon} />
            </div>
          )}

        </div>
      ) : (
        /* STANDARD DOCUMENT VIEW */
        <DocumentPaperView terms={activeDisplayTerms} organizationConfig={organizationConfig} getSectionIcon={getSectionIcon} />
      )}

    </div>
  );
};

// Sub-component for rendering the Official Printable Document Paper
interface DocumentPaperViewProps {
  terms: ClinicTermAgreement;
  organizationConfig: any;
  getSectionIcon: (heading: string, index: number) => React.ReactNode;
}

const DocumentPaperView: React.FC<DocumentPaperViewProps> = ({ terms, organizationConfig, getSectionIcon }) => {
  return (
    <div className="bg-white rounded-xl p-8 sm:p-10 border border-slate-200 shadow-xs space-y-8 text-slate-700 leading-relaxed text-sm">
      
      {/* Emblem & Intro */}
      <div className="text-center pb-6 border-b border-slate-200 space-y-2">
        <div className="flex justify-center mb-2">
          {organizationConfig?.logoUrl ? (
            <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-white p-1 flex items-center justify-center">
              <img 
                src={organizationConfig.logoUrl} 
                alt={organizationConfig.nameTh || organizationConfig.name || 'โลโก้องค์กร'} 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white text-xl font-black shadow-xs">
              {organizationConfig?.shortName || 'YFC'}
            </div>
          )}
        </div>
        <h2 className="text-lg font-bold text-slate-900">{terms.title}</h2>
        <p className="text-xs text-slate-500 font-medium">
          {organizationConfig?.name || 'YALA FOOTBALL CLINIC & ACADEMY'} ({organizationConfig?.nameTh || 'ศูนย์พัฒนาทักษะฟุตบอลเยาวชนจังหวัดยะลา'})<br />
          {organizationConfig?.address || 'สนามหญ้าเทียมยะลา สเตเดียม ตำบลสะเตง อำเภอเมือง จังหวัดยะลา 95000'}
        </p>
        <div className="inline-block px-3 py-1 bg-slate-100 rounded-full text-[11px] font-mono text-slate-600 mt-2">
          เวอร์ชันเอกสาร: {terms.version}
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-6">
        {terms.sections && terms.sections.length > 0 ? (
          terms.sections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-3 p-4 rounded-xl bg-slate-50/50 border border-slate-100">
              <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm">
                {getSectionIcon(section.heading, sIdx)}
                <h3>{section.heading}</h3>
              </div>
              <ul className="list-disc pl-6 space-y-2 text-xs text-slate-600 leading-relaxed">
                {section.items.map((item, iIdx) => (
                  <li key={iIdx} className="pl-1">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            ไม่พบข้อกำหนดในเอกสารนี้
          </div>
        )}
      </div>

      {/* Bottom Seal & Legal Notice */}
      <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>นักเรียนและผู้ปกครองทุกคนต้องกดยอมรับเงื่อนไขนี้ก่อนเสร็จสิ้นการลงทะเบียน</span>
        </div>
        <div className="text-right font-semibold text-slate-800">
          <div>คณะกรรมการบริหาร {organizationConfig?.nameTh || 'คลีนิกฟุตบอลยะลา'}</div>
          <div className="text-[10px] text-slate-400 font-normal">เอกสารอ้างอิงทางการ {terms.version}</div>
        </div>
      </div>

    </div>
  );
};
