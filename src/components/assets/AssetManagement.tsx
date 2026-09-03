import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ClinicAsset } from '../../types';
import { 
  Package, 
  Search, 
  Plus, 
  Filter, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  MapPin, 
  X,
  Boxes,
  Activity,
  Save,
  Check,
  AlertCircle
} from 'lucide-react';

const CATEGORY_NAMES: Record<string, string> = {
  balls: 'ลูกฟุตบอลฝึกซ้อม',
  training_gear: 'อุปกรณ์ฝึกซ้อม & กรวย/มาร์กเกอร์',
  medical_firstaid: 'กล่องยา & ปฐมพยาบาล',
  first_aid: 'กล่องยา & ปฐมพยาบาล',
  apparel: 'ชุดเอี๊ยม & เสื้อฝึกซ้อม',
  facility: 'สิ่งอำนวยความสะดวก & ประตูโกล์',
  goalkeeping: 'อุปกรณ์ผู้รักษาประตู'
};

export const AssetManagement: React.FC = () => {
  const { assets, addAsset, updateAsset, deleteAsset, currentRole } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<ClinicAsset | null>(null);

  // New Asset Form State
  const [newAsset, setNewAsset] = useState({
    name: '',
    category: 'balls' as ClinicAsset['category'],
    totalQuantity: 20,
    availableQuantity: 20,
    damagedQuantity: 0,
    unit: 'ลูก',
    location: 'ตู้เก็บอุปกรณ์ A - สนามยะลา สเตเดียม',
    condition: 'good' as ClinicAsset['condition'],
    lastCheckedDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const filteredAssets = assets.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.assetCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name) {
      alert('กรุณากรอกชื่ออุปกรณ์');
      return;
    }

    addAsset(newAsset);
    setShowAddModal(false);
    setNewAsset({
      name: '',
      category: 'balls',
      totalQuantity: 10,
      availableQuantity: 10,
      damagedQuantity: 0,
      unit: 'ชิ้น',
      location: 'ห้องเก็บอุปกรณ์คลีนิกยะลา',
      condition: 'good',
      lastCheckedDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const handleSaveEditAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset) return;
    if (!editingAsset.name.trim()) {
      alert('กรุณากรอกชื่ออุปกรณ์');
      return;
    }

    updateAsset(editingAsset.id, {
      name: editingAsset.name,
      category: editingAsset.category,
      totalQuantity: Number(editingAsset.totalQuantity),
      availableQuantity: Number(editingAsset.availableQuantity),
      damagedQuantity: Number(editingAsset.damagedQuantity),
      unit: editingAsset.unit,
      location: editingAsset.location,
      condition: editingAsset.condition,
      lastCheckedDate: editingAsset.lastCheckedDate,
      notes: editingAsset.notes
    });

    setEditingAsset(null);
  };

  const totalItemsCount = assets.reduce((s, a) => s + (a.totalQuantity || 0), 0);
  const totalAvailable = assets.reduce((s, a) => s + (a.availableQuantity || 0), 0);
  const totalDamaged = assets.reduce((s, a) => s + (a.damagedQuantity || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">ระบบจัดการอุปกรณ์ & ครุภัณฑ์</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ตรวจนับสต็อก รายการชำรุด และสถานที่จัดเก็บ
          </p>
        </div>

        {(currentRole === 'admin_staff' || currentRole === 'coach') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 font-medium text-xs text-white shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มรายการอุปกรณ์ใหม่</span>
          </button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">อุปกรณ์ทั้งหมดในระบบ</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{totalItemsCount} ชิ้น</div>
            <span className="text-[11px] text-slate-400">จาก {assets.length} หมวดรายการ</span>
          </div>
          <Boxes className="w-8 h-8 text-blue-600/30" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">สภาพสมบูรณ์ พร้อมใช้งาน</span>
            <div className="text-2xl font-bold text-emerald-600 mt-1">{totalAvailable} ชิ้น</div>
            <span className="text-[11px] text-emerald-700 font-medium">
              {totalItemsCount > 0 ? Math.round((totalAvailable / totalItemsCount) * 100) : 0}% อัตราความพร้อม
            </span>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-600/30" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">ชำรุด / ต้องซ่อมบำรุง</span>
            <div className="text-2xl font-bold text-amber-600 mt-1">{totalDamaged} ชิ้น</div>
            <span className="text-[11px] text-amber-700 font-medium">เตรียมจัดซื้อหรือซ่อมแซม</span>
          </div>
          <AlertTriangle className="w-8 h-8 text-amber-600/30" />
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่ออุปกรณ์, รหัส AST, สถานที่เก็บ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-500 shrink-0">หมวดหมู่:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="all">ทุกหมวดหมู่อุปกรณ์ ({assets.length})</option>
            {Object.entries(CATEGORY_NAMES).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 1. Mobile Asset Card List View (md:hidden) */}
      <div className="md:hidden space-y-3">
        {filteredAssets.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400">
            <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-xs">ไม่พบรายการอุปกรณ์ที่ค้นหา</p>
          </div>
        ) : (
          filteredAssets.map(item => (
            <div 
              key={item.id} 
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3"
            >
              {/* Card Header: Asset Code, Category & Condition Badge */}
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-mono text-blue-600 font-bold bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                    {item.assetCode}
                  </span>
                  <span className="text-[10px] text-slate-600 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                    {CATEGORY_NAMES[item.category] || item.category}
                  </span>
                </div>

                {item.condition === 'new' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                    ใหม่เอี่ยม (New)
                  </span>
                )}
                {(item.condition === 'good' || item.condition === 'ready') && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 shrink-0">
                    สภาพดี (Good)
                  </span>
                )}
                {(item.condition === 'fair' || item.condition === 'needs_repair') && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">
                    พอใช้/ต้องตรวจ (Fair)
                  </span>
                )}
                {item.condition === 'damaged' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 shrink-0">
                    ชำรุด (Damaged)
                  </span>
                )}
              </div>

              {/* Title & Notes */}
              <div>
                <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                {item.notes && (
                  <div className="text-xs text-slate-500 line-clamp-2 mt-0.5">{item.notes}</div>
                )}
              </div>

              {/* 2-Column Info Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">คงเหลือ / ทั้งหมด</span>
                  <div className="font-black text-slate-900 text-sm mt-0.5">
                    <span className="text-emerald-700">{item.availableQuantity}</span> / {item.totalQuantity} {item.unit}
                  </div>
                  {item.damagedQuantity > 0 && (
                    <div className="text-[10px] text-rose-600 font-bold mt-0.5">
                      ชำรุด {item.damagedQuantity} {item.unit}
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">สถานที่จัดเก็บ</span>
                  <div className="flex items-center gap-1 text-slate-700 font-medium text-xs mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="truncate" title={item.location}>{item.location}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    ตรวจนับ: <span className="text-slate-600 font-medium">{item.lastCheckedDate}</span>
                  </span>
                </div>
              </div>

              {/* Actions for mobile card */}
              {(currentRole === 'admin_staff' || currentRole === 'coach') && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingAsset({ ...item })}
                    className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-blue-100"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>แก้ไข</span>
                  </button>

                  {currentRole === 'admin_staff' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`คุณต้องการลบอุปกรณ์ "${item.name}" หรือไม่?`)) {
                          deleteAsset(item.id);
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ลบ</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 2. Tablet / Desktop Asset Table View (hidden md:block) */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">รหัส / ชื่ออุปกรณ์</th>
                <th className="py-3 px-4">หมวดหมู่</th>
                <th className="py-3 px-4 text-center">คงเหลือ / ทั้งหมด</th>
                <th className="py-3 px-4">สถานที่จัดเก็บ</th>
                <th className="py-3 px-4">สภาพอุปกรณ์</th>
                <th className="py-3 px-4">ตรวจนับล่าสุด</th>
                {(currentRole === 'admin_staff' || currentRole === 'coach') && <th className="py-3 px-4 text-right">จัดการ</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    ไม่พบรายการอุปกรณ์ที่ค้นหา
                  </td>
                </tr>
              ) : (
                filteredAssets.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{item.assetCode}</div>
                      {item.notes && (
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{item.notes}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                        {CATEGORY_NAMES[item.category] || item.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="font-black text-slate-900 text-sm">
                        <span className="text-emerald-700">{item.availableQuantity}</span> / {item.totalQuantity} {item.unit}
                      </div>
                      {item.damagedQuantity > 0 && (
                        <div className="text-[10px] text-rose-600 font-bold">ชำรุด {item.damagedQuantity} {item.unit}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-slate-700 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{item.location}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {item.condition === 'new' && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          ใหม่เอี่ยม (New)
                        </span>
                      )}
                      {(item.condition === 'good' || item.condition === 'ready') && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800">
                          สภาพดี (Good)
                        </span>
                      )}
                      {(item.condition === 'fair' || item.condition === 'needs_repair') && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                          พอใช้/ต้องตรวจ (Fair)
                        </span>
                      )}
                      {item.condition === 'damaged' && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                          ชำรุด (Damaged)
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">{item.lastCheckedDate}</td>

                    {(currentRole === 'admin_staff' || currentRole === 'coach') && (
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingAsset({ ...item })}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="แก้ไขข้อมูลอุปกรณ์"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {currentRole === 'admin_staff' && (
                            <button
                              onClick={() => {
                                if (confirm(`คุณต้องการลบอุปกรณ์ "${item.name}" หรือไม่?`)) {
                                  deleteAsset(item.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="ลบ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT ASSET MODAL */}
      {editingAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8 border border-slate-200">
            <div className="flex justify-between items-center pb-2 border-b">
              <div className="flex items-center gap-2">
                <Edit className="w-4.5 h-4.5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">แก้ไขข้อมูลอุปกรณ์: {editingAsset.assetCode}</h3>
              </div>
              <button 
                onClick={() => setEditingAsset(null)} 
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditAsset} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ชื่ออุปกรณ์ / รุ่น <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingAsset.name}
                  onChange={(e) => setEditingAsset({ ...editingAsset, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">หมวดหมู่</label>
                  <select
                    value={editingAsset.category}
                    onChange={(e) => setEditingAsset({ ...editingAsset, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold bg-white"
                  >
                    {Object.entries(CATEGORY_NAMES).map(([k, n]) => (
                      <option key={k} value={k}>{n}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">หน่วยนับ</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ลูก, ชิ้น, ชุด, คู่"
                    value={editingAsset.unit}
                    onChange={(e) => setEditingAsset({ ...editingAsset, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">จำนวนทั้งหมด</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingAsset.totalQuantity}
                    onChange={(e) => {
                      const total = Number(e.target.value);
                      const damaged = editingAsset.damagedQuantity || 0;
                      setEditingAsset({ 
                        ...editingAsset, 
                        totalQuantity: total,
                        availableQuantity: Math.max(0, total - damaged)
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">พร้อมใช้งาน</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingAsset.availableQuantity}
                    onChange={(e) => setEditingAsset({ ...editingAsset, availableQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-emerald-700 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ชำรุด</label>
                  <input
                    type="number"
                    min="0"
                    value={editingAsset.damagedQuantity}
                    onChange={(e) => {
                      const damaged = Number(e.target.value);
                      const total = editingAsset.totalQuantity || 0;
                      setEditingAsset({ 
                        ...editingAsset, 
                        damagedQuantity: damaged,
                        availableQuantity: Math.max(0, total - damaged)
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-rose-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">สถานที่จัดเก็บ</label>
                <input
                  type="text"
                  placeholder="เช่น ตู้เก็บอุปกรณ์ A - สนามยะลา สเตเดียม"
                  value={editingAsset.location}
                  onChange={(e) => setEditingAsset({ ...editingAsset, location: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">สภาพอุปกรณ์</label>
                  <select
                    value={editingAsset.condition}
                    onChange={(e) => setEditingAsset({ ...editingAsset, condition: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="new">ใหม่เอี่ยม (New)</option>
                    <option value="good">สภาพดี (Good)</option>
                    <option value="fair">พอใช้ (Fair)</option>
                    <option value="damaged">ชำรุด (Damaged)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">วันที่ตรวจนับล่าสุด</label>
                  <input
                    type="date"
                    value={editingAsset.lastCheckedDate}
                    onChange={(e) => setEditingAsset({ ...editingAsset, lastCheckedDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">หมายเหตุเพิ่มเติม</label>
                <textarea
                  rows={2}
                  placeholder="บันทึกสภาพ, เบอร์ผู้รับผิดชอบ, ข้อมูลเพิ่มเติม..."
                  value={editingAsset.notes || ''}
                  onChange={(e) => setEditingAsset({ ...editingAsset, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingAsset(null)}
                  className="px-4 py-2 border rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>บันทึกการแก้ไข</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD ASSET MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-bold text-sm text-slate-900">เพิ่มอุปกรณ์ / ครุภัณฑ์คลีนิกใหม่</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ชื่ออุปกรณ์ / รุ่น <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ลูกฟุตบอล Molten F5A3400 (เบอร์ 4)"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">หมวดหมู่</label>
                  <select
                    value={newAsset.category}
                    onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg font-semibold"
                  >
                    {Object.entries(CATEGORY_NAMES).map(([k, n]) => (
                      <option key={k} value={k}>{n}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">หน่วยนับ</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ลูก, ชิ้น, ชุด, คู่"
                    value={newAsset.unit}
                    onChange={(e) => setNewAsset({ ...newAsset, unit: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">จำนวนทั้งหมด</label>
                  <input
                    type="number"
                    required
                    value={newAsset.totalQuantity}
                    onChange={(e) => setNewAsset({ 
                      ...newAsset, 
                      totalQuantity: Number(e.target.value),
                      availableQuantity: Number(e.target.value) - newAsset.damagedQuantity
                    })}
                    className="w-full px-3 py-2 border rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">พร้อมใช้งาน</label>
                  <input
                    type="number"
                    required
                    value={newAsset.availableQuantity}
                    onChange={(e) => setNewAsset({ ...newAsset, availableQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ชำรุด</label>
                  <input
                    type="number"
                    value={newAsset.damagedQuantity}
                    onChange={(e) => setNewAsset({ ...newAsset, damagedQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg font-bold text-rose-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">สถานที่จัดเก็บ</label>
                <input
                  type="text"
                  placeholder="เช่น ตู้เก็บอุปกรณ์ A - สนามยะลา สเตเดียม"
                  value={newAsset.location}
                  onChange={(e) => setNewAsset({ ...newAsset, location: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">สภาพอุปกรณ์</label>
                  <select
                    value={newAsset.condition}
                    onChange={(e) => setNewAsset({ ...newAsset, condition: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="new">ใหม่เอี่ยม (New)</option>
                    <option value="good">สภาพดี (Good)</option>
                    <option value="fair">พอใช้ (Fair)</option>
                    <option value="damaged">ชำรุด (Damaged)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">วันที่ตรวจนับ</label>
                  <input
                    type="date"
                    value={newAsset.lastCheckedDate}
                    onChange={(e) => setNewAsset({ ...newAsset, lastCheckedDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-xl cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow cursor-pointer"
                >
                  บันทึกอุปกรณ์
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
