import React from 'react';
import { Student, OrganizationConfig } from '../../types';
import { AthleteCard } from './AthleteCard';
import { X, Printer, ShieldCheck, Download, Sparkles, Building2 } from 'lucide-react';

interface AthleteCardModalProps {
  student: Student | null;
  organizationConfig?: OrganizationConfig;
  onClose: () => void;
}

export const AthleteCardModal: React.FC<AthleteCardModalProps> = ({
  student,
  organizationConfig,
  onClose
}) => {
  if (!student) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">บัตรประจำตัวนักกีฬาคลีนิกฟุตบอลยะลา</h2>
              <p className="text-[11px] text-slate-500">Official Youth Athlete Digital ID Pass & QR Code</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* The Card with Organization Logo */}
        <div className="flex justify-center">
          <AthleteCard 
            student={student} 
            organizationConfig={organizationConfig}
            className="w-full max-w-md"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>พิมพ์บัตรประจำตัวนักกีฬา</span>
          </button>
          
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-5 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl transition-all"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
