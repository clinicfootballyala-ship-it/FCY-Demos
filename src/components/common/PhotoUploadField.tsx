import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, CheckCircle2, Link as LinkIcon } from 'lucide-react';

interface PhotoUploadFieldProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  helperText?: string;
  placeholder?: string;
  aspectRatio?: 'square' | 'wide';
  presetOptions?: { label: string; url: string }[];
}

export const PhotoUploadField: React.FC<PhotoUploadFieldProps> = ({
  label,
  value,
  onChange,
  helperText = 'รองรับไฟล์ JPG, PNG หรือกรอกลิงก์รูปภาพ',
  placeholder = 'https://...',
  aspectRatio = 'square',
  presetOptions
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) return;

      // Auto-compress image to max 600px width/height and 0.8 JPEG quality for optimal storage & performance
      const img = new Image();
      img.onload = () => {
        const maxDim = 600;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          onChange(compressedDataUrl);
        } else {
          onChange(rawDataUrl);
        }
      };
      img.onerror = () => {
        onChange(rawDataUrl);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleApplyUrl = () => {
    if (urlDraft.trim()) {
      onChange(urlDraft.trim());
      setUrlDraft('');
      setShowUrlInput(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">{label}</label>
        <div className="flex items-center gap-2">
          {!value && (
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-[11px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <LinkIcon className="w-3 h-3" />
              <span>{showUrlInput ? 'อัปโหลดไฟล์' : 'ระบุ URL'}</span>
            </button>
          )}
        </div>
      </div>

      {value ? (
        <div className="relative group p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
          <div className={`overflow-hidden rounded-md bg-slate-200 shrink-0 border border-slate-300 ${aspectRatio === 'square' ? 'w-14 h-14' : 'w-24 h-14'}`}>
            <img 
              src={value} 
              alt={label} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=150&auto=format&fit=crop&q=80';
              }}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 text-emerald-700 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>แนบรูปภาพแล้ว</span>
            </div>
            <p className="text-[11px] text-slate-500 truncate mt-0.5 max-w-[200px]">
              {value.startsWith('data:') ? 'ไฟล์รูปภาพจากเครื่อง (Base64)' : value}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-[11px] font-medium"
            >
              เปลี่ยนรูป
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
              title="ลบรูปภาพ"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : showUrlInput ? (
        <div className="flex items-center gap-1.5">
          <input
            type="url"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium"
          >
            ใช้รูปนี้
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all flex items-center justify-center gap-2 ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
          }`}
        >
          <Upload className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-medium text-slate-700">คลิกเลือกรูปภาพ หรือลากไฟล์มาวางที่นี่</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {presetOptions && presetOptions.length > 0 && !value && (
        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1">
          <span className="text-[10px] text-slate-400 shrink-0">เลือกตัวอย่าง:</span>
          {presetOptions.map((opt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(opt.url)}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 border border-slate-200 shrink-0 font-medium"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {helperText && !value && (
        <p className="text-[10px] text-slate-400">{helperText}</p>
      )}
    </div>
  );
};
