import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Lock, 
  User, 
  X, 
  Eye, 
  EyeOff, 
  LogIn, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onOpenRegister }) => {
  const { login, organizationConfig } = useApp();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!identifier.trim()) {
      setErrorMessage('กรุณาระบุชื่อผู้ใช้ อีเมล เบอร์โทร หรือรหัสนักเรียน');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = login(identifier, password);
      setLoading(false);
      if (res.success) {
        onClose();
      } else {
        setErrorMessage(res.message);
      }
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center font-bold text-white shadow-md overflow-hidden shrink-0 border border-blue-400/30">
              {organizationConfig?.logoUrl ? (
                <img 
                  src={organizationConfig.logoUrl} 
                  alt={organizationConfig.nameTh || organizationConfig.name || 'Logo'} 
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              ) : (
                <span className="text-sm font-black tracking-wider text-white">
                  {organizationConfig?.shortName || 'YFC'}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>เข้าสู่ระบบ • {organizationConfig?.nameTh || 'ฟุตบอลคลีนิกยะลา'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-normal">
                  RBAC System
                </span>
              </h2>
              <p className="text-xs text-slate-400">{organizationConfig?.name || 'Clinic Football Yala Portal'}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          
          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Standard Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ชื่อผู้ใช้ (Username)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="เลขบัตรประชาชน เช่น 3959900234561"
                  className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium"
                />
              </div>
              <p className="text-[11px] text-emerald-700 mt-1">
                💡 <strong>ผู้ปกครอง:</strong> เข้าสู่ระบบด้วย <u>เลขบัตรประชาชน 13 หลัก</u> (Username) และ <u>เบอร์โทรศัพท์ 10 หลัก</u> (Password)
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  รหัสผ่าน (Password)
                </label>
                <span className="text-[11px] text-slate-400">
                  (ผู้ปกครอง: เบอร์โทร 10 หลัก)
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านของคุณ"
                  className="w-full pl-9 pr-10 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span>จดจำการเข้าสู่ระบบ</span>
              </label>
              <button 
                type="button" 
                onClick={() => setErrorMessage('สำหรับการรีเซ็ตรหัสผ่าน กรุณาติดต่อผู้ดูแลระบบคลีนิกที่สำนักงาน หรือโทร 081-999-8877')}
                className="text-blue-600 hover:underline cursor-pointer"
              >
                ลืมรหัสผ่าน?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>กำลังตรวจสอบ...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>เข้าสู่ระบบ (Sign In)</span>
                </>
              )}
            </button>

          </form>

          {/* New Registration Prompt */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-500">ยังไม่ได้ลงทะเบียนเป็นสมาชิกคลีนิก?</span>
            {onOpenRegister && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRegister();
                }}
                className="font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>ยื่นใบสมัครเรียนออนไลน์</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
