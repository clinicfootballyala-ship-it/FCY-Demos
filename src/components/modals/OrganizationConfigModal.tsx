import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OrganizationConfig } from '../../types';
import { 
  Building2, 
  X, 
  Upload, 
  Check, 
  RefreshCw, 
  Image as ImageIcon, 
  Sparkles, 
  Shield, 
  Phone, 
  MapPin, 
  FileText, 
  Globe, 
  MessageCircle,
  Eye
} from 'lucide-react';

const LOGO_PRESETS = [
  {
    name: 'สัญลักษณ์ฟุตบอลทองคำ (Gold & Emerald)',
    url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=200&auto=format&fit=crop&q=80',
    type: 'image'
  },
  {
    name: 'สัญลักษณ์สโมสรฟุตบอลเยาวชน (Youth Academy Shield)',
    url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=200&auto=format&fit=crop&q=80',
    type: 'image'
  },
  {
    name: 'ลูกฟุตบอลคลาสสิก (Classic Ball)',
    url: 'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=200&auto=format&fit=crop&q=80',
    type: 'image'
  }
];

export const OrganizationConfigModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { organizationConfig, updateOrganizationConfig } = useApp();

  const [form, setForm] = useState<OrganizationConfig>({
    name: organizationConfig?.name || 'YALA FOOTBALL CLINIC',
    nameTh: organizationConfig?.nameTh || 'คลีนิกฟุตบอลยะลา',
    tagline: organizationConfig?.tagline || 'ศูนย์พัฒนาทักษะฟุตบอลเยาวชนจังหวัดยะลา',
    logoUrl: organizationConfig?.logoUrl || '',
    shortName: organizationConfig?.shortName || 'YFC',
    address: organizationConfig?.address || 'สนามหญ้าเทียมยะลา สเตเดียม อ.เมือง จ.ยะลา 95000',
    phone: organizationConfig?.phone || '081-456-7890',
    taxId: organizationConfig?.taxId || '0-9555-69001-23-4',
    establishedYear: organizationConfig?.establishedYear || '2567 (2024)',
    lineId: organizationConfig?.lineId || '@yalafootball',
    facebookOrWebsite: organizationConfig?.facebookOrWebsite || 'fb.com/yalafootballclinic'
  });

  const [isSaved, setIsSaved] = useState(false);
  const [logoInputMode, setLogoInputMode] = useState<'upload' | 'url' | 'presets'>('upload');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('ขนาดไฟล์รูปภาพต้องไม่เกิน 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setForm(prev => ({ ...prev, logoUrl: event.target?.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrganizationConfig(form);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  const handleResetDefaults = () => {
    if (confirm('คุณต้องการรีเซ็ตข้อมูลชื่อและโลโก้กลับเป็นค่าเริ่มต้นหรือไม่?')) {
      const defaultConfig: OrganizationConfig = {
        name: 'YALA FOOTBALL CLINIC',
        nameTh: 'คลีนิกฟุตบอลยะลา',
        tagline: 'ศูนย์พัฒนาทักษะฟุตบอลเยาวชนจังหวัดยะลา',
        logoUrl: '',
        shortName: 'YFC',
        address: 'สนามหญ้าเทียมยะลา สเตเดียม อ.เมือง จ.ยะลา 95000',
        phone: '081-456-7890',
        taxId: '0-9555-69001-23-4',
        establishedYear: '2567 (2024)',
        lineId: '@yalafootball',
        facebookOrWebsite: 'fb.com/yalafootballclinic'
      };
      setForm(defaultConfig);
      updateOrganizationConfig(defaultConfig);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">ตั้งค่าโลโก้และข้อมูลองค์กร (Organization Branding)</h2>
              <p className="text-xs text-slate-400">ปรับเปลี่ยนตราสัญลักษณ์ ชื่อคลีนิก/สโมสร และข้อมูลการติดต่อ</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Logo Section */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                <span>ตราสัญลักษณ์ / รูปภาพโลโก้คลีนิก (Organization Logo)</span>
              </label>
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-[11px]">
                <button
                  type="button"
                  onClick={() => setLogoInputMode('upload')}
                  className={`px-2.5 py-1 rounded font-medium transition-all ${logoInputMode === 'upload' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  อัปโหลดไฟล์
                </button>
                <button
                  type="button"
                  onClick={() => setLogoInputMode('url')}
                  className={`px-2.5 py-1 rounded font-medium transition-all ${logoInputMode === 'url' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  ใส่ลิงก์ URL
                </button>
                <button
                  type="button"
                  onClick={() => setLogoInputMode('presets')}
                  className={`px-2.5 py-1 rounded font-medium transition-all ${logoInputMode === 'presets' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  เลือกรูปตัวอย่าง
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Preview Avatar Box */}
              <div className="w-20 h-20 rounded-2xl bg-slate-900 flex items-center justify-center text-white border-2 border-slate-300 shadow-sm overflow-hidden shrink-0">
                {form.logoUrl ? (
                  <img 
                    src={form.logoUrl} 
                    alt="Logo Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="text-center font-bold">
                    <span className="text-xl text-blue-400 block">{form.shortName || 'YFC'}</span>
                    <span className="text-[9px] text-slate-400">LOGO</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                {logoInputMode === 'upload' && (
                  <div>
                    <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl bg-white cursor-pointer text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                      <Upload className="w-4 h-4 text-blue-600" />
                      <span>คลิกเพื่อเลือกไฟล์รูปภาพ (PNG, JPG, SVG ไม่เกิน 2MB)</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                        className="hidden" 
                      />
                    </label>
                    <p className="text-[10px] text-slate-400 mt-1">แนะนำรูปทรงสี่เหลี่ยมจัตุรัสหรือโปร่งใส (Transparent)</p>
                  </div>
                )}

                {logoInputMode === 'url' && (
                  <div>
                    <input 
                      type="url" 
                      placeholder="https://example.com/your-clinic-logo.png" 
                      value={form.logoUrl} 
                      onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-mono"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">วางลิงก์รูปภาพโลโก้ของคุณ</p>
                  </div>
                )}

                {logoInputMode === 'presets' && (
                  <div className="grid grid-cols-3 gap-2">
                    {LOGO_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setForm({ ...form, logoUrl: preset.url })}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-left text-[11px] transition-all bg-white ${
                          form.logoUrl === preset.url 
                            ? 'border-blue-500 ring-2 ring-blue-100 font-bold text-blue-700' 
                            : 'border-slate-200 hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        <img src={preset.url} alt="" className="w-6 h-6 rounded-full object-cover" />
                        <span className="truncate">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {form.logoUrl && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, logoUrl: '' })}
                    className="text-[11px] text-rose-600 hover:underline inline-block font-medium"
                  >
                    ลบรูปภาพ (ใช้ตัวย่อ {form.shortName || 'YFC'} แทน)
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Names Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ชื่อภาษาไทย (Thai Name) <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                required
                value={form.nameTh} 
                onChange={(e) => setForm({ ...form, nameTh: e.target.value })}
                placeholder="เช่น คลีนิกฟุตบอลยะลา"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ชื่อภาษาอังกฤษ (English Name) <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                required
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="เช่น YALA FOOTBALL CLINIC"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ชื่อย่อ / รหัสสโมสร (Short Name / Code)
              </label>
              <input 
                type="text" 
                value={form.shortName} 
                onChange={(e) => setForm({ ...form, shortName: e.target.value.toUpperCase() })}
                placeholder="เช่น YFC"
                maxLength={8}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold uppercase tracking-wider"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                คำขวัญ / สโลแกน (Tagline / Slogan)
              </label>
              <input 
                type="text" 
                value={form.tagline} 
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                placeholder="เช่น ศูนย์พัฒนาทักษะฟุตบอลเยาวชนจังหวัดยะลา"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>เบอร์โทรศัพท์ติดต่อ</span>
              </label>
              <input 
                type="text" 
                value={form.phone} 
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="เช่น 081-456-7890"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5 text-slate-400" />
                <span>LINE Official Account ID</span>
              </label>
              <input 
                type="text" 
                value={form.lineId || ''} 
                onChange={(e) => setForm({ ...form, lineId: e.target.value })}
                placeholder="เช่น @yalafootball"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Facebook Page / Website</span>
              </label>
              <input 
                type="text" 
                value={form.facebookOrWebsite || ''} 
                onChange={(e) => setForm({ ...form, facebookOrWebsite: e.target.value })}
                placeholder="เช่น fb.com/yalafootballclinic"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>เลขประจำตัวผู้เสียภาษี / เลขทะเบียนนิติบุคคล</span>
              </label>
              <input 
                type="text" 
                value={form.taxId || ''} 
                onChange={(e) => setForm({ ...form, taxId: e.target.value })}
                placeholder="เช่น 0-9555-69001-23-4"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>สถานที่ตั้งสนามฝึกซ้อม / ที่อยู่</span>
            </label>
            <input 
              type="text" 
              value={form.address} 
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="เช่น สนามหญ้าเทียมยะลา สเตเดียม ต.สะเตง อ.เมือง จ.ยะลา 95000"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Live Preview Card */}
          <div className="bg-slate-900 text-white p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1 font-semibold text-blue-400">
                <Eye className="w-3.5 h-3.5" /> ตัวอย่างการแสดงผลในแถบเมนูและหัวเอกสาร (Live Preview)
              </span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                อัปเดตแบบ Real-time
              </span>
            </div>

            <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black overflow-hidden shrink-0 shadow-xs">
                {form.logoUrl ? (
                  <img src={form.logoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{form.shortName || 'YFC'}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-black tracking-wide text-white truncate">
                  {form.name || 'YALA FOOTBALL CLINIC'}
                </div>
                <div className="text-[11px] text-blue-400 font-medium truncate">
                  {form.nameTh || 'คลีนิกฟุตบอลยะลา'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {form.tagline || 'ศูนย์พัฒนาทักษะฟุตบอลเยาวชน'}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>รีเซ็ตค่าเริ่มต้น</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className={`flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white rounded-lg shadow-sm transition-all ${
                  isSaved 
                    ? 'bg-emerald-600' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>บันทึกสำเร็จ!</span>
                  </>
                ) : (
                  <span>บันทึกการตั้งค่าองค์กร</span>
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
