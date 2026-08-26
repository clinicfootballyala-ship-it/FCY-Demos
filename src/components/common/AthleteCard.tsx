import React from 'react';
import { Student, OrganizationConfig } from '../../types';
import { Shield, QrCode, Phone, MapPin, CheckCircle2, Award, Calendar, Sparkles } from 'lucide-react';
import { formatPhone10 } from '../../utils/validation';

interface AthleteCardProps {
  student: Student;
  organizationConfig?: OrganizationConfig;
  className?: string;
  showPrintStyles?: boolean;
}

export const AthleteCard: React.FC<AthleteCardProps> = ({
  student,
  organizationConfig,
  className = '',
  showPrintStyles = true
}) => {
  const orgName = organizationConfig?.name || 'YALA FOOTBALL CLINIC';
  const orgNameTh = organizationConfig?.nameTh || 'ศูนย์พัฒนาทักษะฟุตบอลเยาวชนจังหวัดยะลา';
  const shortName = organizationConfig?.shortName || 'YFC';
  const logoUrl = organizationConfig?.logoUrl;
  const orgPhone = organizationConfig?.phone || '081-456-7890';
  const established = organizationConfig?.establishedYear || '2567';

  // Category Color Badge
  const getCategoryBadgeClass = (cat: string) => {
    switch (cat) {
      case 'U-6':
        return 'bg-blue-500 text-white border-blue-300';
      case 'U-8':
        return 'bg-emerald-500 text-white border-emerald-300';
      case 'U-10':
        return 'bg-teal-500 text-white border-teal-300';
      case 'U-12':
        return 'bg-indigo-500 text-white border-indigo-300';
      default:
        return 'bg-amber-400 text-slate-950 border-amber-300';
    }
  };

  return (
    <div
      id="printable-id-card"
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950 text-white p-5 sm:p-6 shadow-2xl border-2 border-amber-400/80 transition-all ${className}`}
    >
      {/* Background Subtle Watermark Logo & Glow */}
      <div className="absolute -right-8 -top-8 w-44 h-44 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Watermark Crest/Logo in Center Background */}
      <div className="absolute right-4 bottom-8 opacity-10 pointer-events-none select-none flex items-center justify-center">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt=""
            className="w-40 h-40 object-contain filter grayscale"
          />
        ) : (
          <div className="w-40 h-40 rounded-full border-8 border-white flex items-center justify-center font-black text-6xl">
            {shortName}
          </div>
        )}
      </div>

      {/* Top Card Header: Club Logo, Name & Category */}
      <div className="relative z-10 flex items-center justify-between border-b border-emerald-600/50 pb-3 mb-3.5 gap-2">
        
        {/* Left: Organization Logo & Branding */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 p-0.5 shadow-md shrink-0 flex items-center justify-center overflow-hidden border border-amber-300">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={orgName}
                className="w-full h-full object-cover rounded-[10px]"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                  const fallback = (e.target as HTMLElement).nextElementSibling;
                  if (fallback) fallback.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-full h-full rounded-[10px] bg-slate-950 flex flex-col items-center justify-center font-black text-amber-400 ${logoUrl ? 'hidden' : ''}`}>
              <span className="text-[13px] leading-tight">{shortName}</span>
              <span className="text-[7px] text-emerald-300 font-normal">ACADEMY</span>
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] sm:text-xs font-black tracking-wider text-amber-300 uppercase truncate">
                {orgName}
              </span>
              <span className="text-[9px] font-mono px-1 py-0.2 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded shrink-0">
                EST. {established}
              </span>
            </div>
            <div className="text-[9px] sm:text-[10px] text-emerald-200 truncate font-medium">
              {orgNameTh}
            </div>
          </div>
        </div>

        {/* Right: Age Category Badge */}
        <div className="shrink-0 flex flex-col items-end">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-black shadow-md border ${getCategoryBadgeClass(student.category)}`}>
            {student.category}
          </span>
          <span className="text-[8px] text-amber-200/80 font-mono mt-0.5 tracking-tighter uppercase">
            MEMBER PASS
          </span>
        </div>

      </div>

      {/* Card Center: Student Photo & Essential Info */}
      <div className="relative z-10 flex gap-4 items-center">
        
        {/* Athlete Avatar with Gold Shield Frame */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl p-0.5 bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 shadow-lg overflow-hidden">
            <img
              src={student.avatarUrl}
              alt={student.fullName}
              className="w-full h-full rounded-[14px] object-cover bg-slate-800"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=200&auto=format&fit=crop&q=80';
              }}
            />
          </div>
          {student.preferredPosition && (
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-slate-950 text-amber-400 border border-amber-400/60 shadow">
              {student.preferredPosition.split(' ')[0]}
            </span>
          )}
        </div>

        {/* Athlete Attributes */}
        <div className="min-w-0 flex-1 space-y-1">
          <div>
            <h3 className="font-black text-base sm:text-lg text-white leading-tight truncate">
              {student.fullName}
            </h3>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mt-0.5">
              <span>ชื่อเล่น: "{student.nickname}"</span>
              {student.bloodType && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded">
                  Blood: {student.bloodType}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] sm:text-[11px] text-slate-200 pt-0.5">
            <div>
              <span className="text-emerald-300">รหัสสมาชิก: </span>
              <span className="font-mono font-bold text-white">{student.studentCode}</span>
            </div>
            <div>
              <span className="text-emerald-300">อายุ/รุ่น: </span>
              <span className="font-bold text-white">{student.age} ปี ({student.category})</span>
            </div>
            <div className="col-span-2 truncate">
              <span className="text-emerald-300">ตำแหน่ง: </span>
              <span className="font-medium text-white">{student.preferredPosition}</span>
            </div>
            {student.jerseyChestCm ? (
              <div className="col-span-2 text-[10px] text-amber-200/90 truncate">
                <span className="text-emerald-300">ชุดฝึกซ้อม: </span>
                <span>อก {student.jerseyChestCm} ซม. / ยาว {student.jerseyLengthCm || '-'} ซม.</span>
              </div>
            ) : null}
          </div>
        </div>

      </div>

      {/* Card Footer: Parent Info & QR Code / Barcode Scan */}
      <div className="relative z-10 mt-3.5 pt-3 border-t border-emerald-600/50 flex items-center justify-between gap-3 text-[10px] text-slate-300">
        
        {/* Parent & Emergency Contact */}
        <div className="min-w-0 space-y-0.5 flex-1">
          <div className="truncate">
            <span className="text-slate-400">ผู้ปกครอง: </span>
            <span className="font-semibold text-white">{student.parentName}</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-amber-300">
            <Phone className="w-3 h-3 text-amber-400 shrink-0" />
            <span>{formatPhone10(student.parentPhone)}</span>
          </div>
          <div className="text-[9px] text-emerald-300/80 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>ออกโดยคลีนิกฟุตบอลยะลา (Official Pass)</span>
          </div>
        </div>

        {/* QR Code / Digital Barcode Simulation */}
        <div className="shrink-0 flex flex-col items-center justify-center p-1.5 rounded-lg bg-white text-slate-950 shadow-md">
          <QrCode className="w-9 h-9 text-slate-950" />
          <span className="font-mono text-[8px] font-black tracking-tighter text-slate-900 mt-0.5">
            {student.studentCode}
          </span>
        </div>

      </div>

    </div>
  );
};
