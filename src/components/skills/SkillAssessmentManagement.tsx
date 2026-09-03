import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SkillEvaluation, SkillPillars } from '../../types';
import { 
  Trophy, 
  Plus, 
  Search, 
  Printer, 
  Sparkles, 
  X, 
  Flame,
  Zap,
  Brain,
  Heart,
  Activity,
  Users,
  ShieldCheck,
  Filter
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  Radar
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

export const SkillAssessmentManagement: React.FC<{ initialStudentId?: string }> = ({ initialStudentId }) => {
  const { students, coaches, skillEvaluations, addSkillEvaluation, currentRole, selectedCoachIdForCoach, organizationConfig } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStudentForNewEval, setSelectedStudentForNewEval] = useState<string>(initialStudentId || students[0]?.id || '');
  const [showNewEvalModal, setShowNewEvalModal] = useState(false);
  const [selectedEvalForReportCard, setSelectedEvalForReportCard] = useState<SkillEvaluation | null>(null);

  // New Evaluation Form State (5 Skill Pillars)
  const [evalForm, setEvalForm] = useState<{
    termPeriod: string;
    coachId: string;
    technical: { ballControl: number; passing: number; dribbling: number; shooting: number; headingOrGoalkeeping: number };
    tactical: { gameVision: number; positioning: number; decisionMaking: number; transitionSpeed: number };
    physical: { speed: number; agility: number; stamina: number; strength: number };
    psychological: { focus: number; confidence: number; determination: number; emotionalControl: number };
    social: { discipline: number; teamwork: number; communication: number; respectAndSportsmanship: number };
    strengths: string;
    areasForImprovement: string;
    coachFeedback: string;
    nextGoals: string;
  }>({
    termPeriod: 'ไตรมาส 3/2569 (สิงหาคม)',
    coachId: currentRole === 'coach' ? selectedCoachIdForCoach : coaches[0]?.id || '',
    technical: { ballControl: 8.5, passing: 8, dribbling: 8, shooting: 7.5, headingOrGoalkeeping: 7 },
    tactical: { gameVision: 8, positioning: 7.5, decisionMaking: 8, transitionSpeed: 7.5 },
    physical: { speed: 8, agility: 8.5, stamina: 8, strength: 7.5 },
    psychological: { focus: 8.5, confidence: 8.5, determination: 9, emotionalControl: 8 },
    social: { discipline: 9, teamwork: 8.5, communication: 8, respectAndSportsmanship: 9.5 },
    strengths: 'มีความคล่องตัวสูง จ่ายบอลแม่นยำ สมาธิตั้งใจฝึกซ้อม และมีวินัยดีเยี่ยม',
    areasForImprovement: 'การยิงประตูด้วยเท้าข้างที่ไม่ถนัด และการสื่อสารส่งเสียงกระตุ้นเพื่อนในสนาม',
    coachFeedback: 'นักเตะมีพัฒนาการเด่นชัด มีความเป็นผู้นำและความมุ่งมั่น ขอให้ฝึกฝนต่อเนื่องตามแผนพัฒนา',
    nextGoals: 'เพิ่มความแม่นยำในการจบสกอร์ และฝึกการเล่นบอลภายใต้ความกดดันสูง'
  });

  // Calculate live averages across 5 pillars
  const calcAvg = (arr: number[]) => Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10;

  const technicalAvg = calcAvg(Object.values(evalForm.technical));
  const tacticalAvg = calcAvg(Object.values(evalForm.tactical));
  const physicalAvg = calcAvg(Object.values(evalForm.physical));
  const psychologicalAvg = calcAvg(Object.values(evalForm.psychological));
  const socialAvg = calcAvg(Object.values(evalForm.social));

  const totalOverallScore = Math.round(((technicalAvg + tacticalAvg + physicalAvg + psychologicalAvg + socialAvg) / 5) * 10);
  
  let grade: SkillEvaluation['overallGrade'] = 'B';
  if (totalOverallScore >= 90) grade = 'A+';
  else if (totalOverallScore >= 80) grade = 'A';
  else if (totalOverallScore >= 75) grade = 'B+';
  else if (totalOverallScore >= 70) grade = 'B';
  else if (totalOverallScore >= 65) grade = 'C+';
  else grade = 'C';

  // Live Radar Chart Data (5 Pillars)
  const liveRadarData = [
    { subject: '1. เทคนิค (Tech)', score: technicalAvg, fullMark: 10 },
    { subject: '2. แท็กติก (Tact)', score: tacticalAvg, fullMark: 10 },
    { subject: '3. กายภาพ (Phys)', score: physicalAvg, fullMark: 10 },
    { subject: '4. จิตวิทยา (Psych)', score: psychologicalAvg, fullMark: 10 },
    { subject: '5. สังคม & วินัย (Soc)', score: socialAvg, fullMark: 10 }
  ];

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForNewEval) {
      alert('กรุณาเลือกนักเรียน');
      return;
    }

    const skills: SkillPillars = {
      technical: { ...evalForm.technical, average: technicalAvg },
      tactical: { ...evalForm.tactical, average: tacticalAvg },
      physical: { ...evalForm.physical, average: physicalAvg },
      psychological: { ...evalForm.psychological, average: psychologicalAvg },
      social: { ...evalForm.social, average: socialAvg },
      // Backward compatibility
      mentalSocial: {
        discipline: evalForm.social.discipline,
        focus: evalForm.psychological.focus,
        teamwork: evalForm.social.teamwork,
        respectAndSportsmanship: evalForm.social.respectAndSportsmanship,
        average: Math.round(((psychologicalAvg + socialAvg) / 2) * 10) / 10
      }
    };

    const newEval = addSkillEvaluation({
      studentId: selectedStudentForNewEval,
      coachId: evalForm.coachId,
      termPeriod: evalForm.termPeriod,
      skills,
      overallScore: totalOverallScore,
      overallGrade: grade,
      strengths: evalForm.strengths,
      areasForImprovement: evalForm.areasForImprovement,
      coachFeedback: evalForm.coachFeedback,
      nextGoals: evalForm.nextGoals
    });

    setShowNewEvalModal(false);
    setSelectedEvalForReportCard(newEval);
  };

  const filteredEvaluations = skillEvaluations.filter(ev => {
    const student = students.find(s => s.id === ev.studentId);
    if (!student) return false;
    const matchesSearch = 
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.termPeriod.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || student.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Trophy className="w-4.5 h-4.5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">ประเมินทักษะ 5 ด้านหลัก</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ตามมาตรฐานสากล FA/AFC
          </p>
        </div>

        {(currentRole === 'admin_staff' || currentRole === 'coach') && (
          <button
            onClick={() => setShowNewEvalModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>ประเมินทักษะนักเรียนใหม่</span>
          </button>
        )}
      </div>

      {/* 5 Pillars Legend / Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {[
          { num: '1', title: 'เทคนิค (Technical)', desc: 'การจับ เลี้ยง ส่ง ยิง โหม่ง', color: 'text-amber-700 bg-amber-50 border-amber-200', icon: Zap },
          { num: '2', title: 'แท็กติก (Tactical)', desc: 'วิสัยทัศน์ ตำแหน่ง การตัดสินใจ', color: 'text-blue-700 bg-blue-50 border-blue-200', icon: Brain },
          { num: '3', title: 'กายภาพ (Physical)', desc: 'สปีด คล่องตัว ความอึด แข็งแกร่ง', color: 'text-rose-700 bg-rose-50 border-rose-200', icon: Flame },
          { num: '4', title: 'จิตวิทยา (Psychological)', desc: 'สมาธิ มั่นใจ มุ่งมั่น คุมอารมณ์', color: 'text-purple-700 bg-purple-50 border-purple-200', icon: Sparkles },
          { num: '5', title: 'สังคม & วินัย (Social)', desc: 'วินัย ทีมเวิร์ก สื่อสาร น้ำใจกีฬา', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: Users }
        ].map((p) => {
          const Icon = p.icon;
          return (
            <div key={p.num} className={`p-3 rounded-xl border text-xs ${p.color} flex flex-col justify-between`}>
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{p.title}</span>
              </div>
              <div className="text-[11px] opacity-80 line-clamp-1">{p.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Search Bar & Category Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อนักเรียน หรือรหัส"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-slate-500 shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> รุ่นอายุ:
          </span>
          {['all', 'U-6', 'U-8'].map(cat => {
            const isSelected = selectedCategory === cat;
            const isU6 = cat === 'U-6';
            const isU8 = cat === 'U-8';

            let activeClass = 'bg-slate-900 text-white shadow-xs';
            let inactiveClass = 'bg-slate-100 text-slate-600 hover:bg-slate-200';

            if (isU6) {
              activeClass = 'bg-blue-600 text-white shadow-xs';
              inactiveClass = 'bg-blue-50/80 text-blue-700 border border-blue-200/80 hover:bg-blue-100';
            } else if (isU8) {
              activeClass = 'bg-emerald-600 text-white shadow-xs';
              inactiveClass = 'bg-emerald-50/80 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100';
            }

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isSelected ? activeClass : inactiveClass
                }`}
              >
                {isU6 && (
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />
                )}
                {isU8 && (
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
                )}
                <span>{cat === 'all' ? 'ทุกรุ่นอายุ' : cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Evaluation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvaluations.map(ev => {
          const student = students.find(s => s.id === ev.studentId);
          const coach = coaches.find(c => c.id === ev.coachId);
          if (!student) return null;

          const psychAvg = ev.skills.psychological?.average ?? ev.skills.mentalSocial?.average ?? 8.5;
          const socAvg = ev.skills.social?.average ?? ev.skills.mentalSocial?.average ?? 8.5;

          const radarData = [
            { subject: '1. เทคนิค', score: ev.skills.technical.average, fullMark: 10 },
            { subject: '2. แท็กติก', score: ev.skills.tactical.average, fullMark: 10 },
            { subject: '3. กายภาพ', score: ev.skills.physical.average, fullMark: 10 },
            { subject: '4. จิตวิทยา', score: psychAvg, fullMark: 10 },
            { subject: '5. สังคม/วินัย', score: socAvg, fullMark: 10 }
          ];

          const isU6 = student.category === 'U-6';

          return (
            <div 
              key={ev.id} 
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all p-5 flex flex-col justify-between"
            >
              <div>
                
                {/* Student header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <img 
                      src={student.avatarUrl} 
                      alt={student.fullName} 
                      className={`w-12 h-12 rounded-xl object-cover border-2 ${isU6 ? 'border-blue-500' : 'border-emerald-500'}`} 
                    />
                    <div>
                      <div className="font-extrabold text-sm text-slate-900">{student.fullName}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs font-bold text-slate-700">"{student.nickname}"</span>
                        <span 
                          className="px-2 py-0.5 rounded text-[10.5px] font-bold text-white shadow-xs"
                          style={{ backgroundColor: AGE_COLORS[student.category] || (isU6 ? '#3b82f6' : '#10b981') }}
                        >
                          {student.category}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{student.studentCode}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md inline-block">เกรด {ev.overallGrade}</div>
                    <div className="text-lg font-black text-slate-900 mt-0.5">{ev.overallScore}%</div>
                  </div>
                </div>

                {/* 5-Axis Radar Chart */}
                <div className="h-48 w-full my-2 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius={55} data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#475569', fontWeight: 600 }} />
                      <Radar name="คะแนนทักษะ 5 ด้าน" dataKey="score" stroke="#059669" fill="#10b981" fillOpacity={0.45} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Quick Score Bars */}
                <div className="grid grid-cols-5 gap-1 text-[10px] text-center mb-3">
                  <div className="p-1 rounded bg-amber-50 border border-amber-100">
                    <span className="block font-bold text-amber-900">เทคนิค</span>
                    <span className="font-extrabold text-amber-700">{ev.skills.technical.average}</span>
                  </div>
                  <div className="p-1 rounded bg-blue-50 border border-blue-100">
                    <span className="block font-bold text-blue-900">แท็กติก</span>
                    <span className="font-extrabold text-blue-700">{ev.skills.tactical.average}</span>
                  </div>
                  <div className="p-1 rounded bg-rose-50 border border-rose-100">
                    <span className="block font-bold text-rose-900">กายภาพ</span>
                    <span className="font-extrabold text-rose-700">{ev.skills.physical.average}</span>
                  </div>
                  <div className="p-1 rounded bg-purple-50 border border-purple-100">
                    <span className="block font-bold text-purple-900">จิตวิทยา</span>
                    <span className="font-extrabold text-purple-700">{psychAvg}</span>
                  </div>
                  <div className="p-1 rounded bg-emerald-50 border border-emerald-100">
                    <span className="block font-bold text-emerald-900">สังคม</span>
                    <span className="font-extrabold text-emerald-700">{socAvg}</span>
                  </div>
                </div>

                {/* Coach Feedback snippet */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div className="text-slate-600 font-medium line-clamp-2">
                    <span className="font-bold text-slate-800">จุดเด่น: </span>
                    {ev.strengths}
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                    <span>ประเมินโดย: {coach?.fullName || 'โค้ชคลีนิก'}</span>
                    <span>{ev.evaluationDate}</span>
                  </div>
                </div>

              </div>

              {/* Action Footer */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">{ev.termPeriod}</span>
                <button
                  onClick={() => setSelectedEvalForReportCard(ev)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>สมุดรายงาน</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* NEW EVALUATION MODAL (5 SKILL PILLARS) */}
      {showNewEvalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-7 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto border border-slate-200">
            
            <div className="flex justify-between items-center pb-3 border-b">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">แบบฟอร์มประเมินทักษะ 5 ด้านหลัก</h3>
                  <p className="text-xs text-slate-500">{organizationConfig.nameTh} • มาตรฐานสากล FA Grassroots Development</p>
                </div>
              </div>
              <button onClick={() => setShowNewEvalModal(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvaluation} className="space-y-5 text-xs">
              
              {/* Select Student & Period */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เลือกนักเรียน</label>
                  <select
                    value={selectedStudentForNewEval}
                    onChange={(e) => setSelectedStudentForNewEval(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl font-bold bg-white"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.nickname}) - {s.category} ({s.studentCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">รอบการประเมิน</label>
                  <input
                    type="text"
                    value={evalForm.termPeriod}
                    onChange={(e) => setEvalForm({ ...evalForm, termPeriod: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-semibold bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">โค้ชผู้ประเมิน</label>
                  <select
                    value={evalForm.coachId}
                    onChange={(e) => setEvalForm({ ...evalForm, coachId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-semibold bg-white"
                  >
                    {coaches.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} ({c.nickname}) - {c.license}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Real-time Radar & Grade Bar (5 Pillars) */}
              <div className="bg-emerald-50/80 p-4.5 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="h-44 w-56 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius={50} data={liveRadarData}>
                      <PolarGrid stroke="#cbd5e1" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#1e293b', fontWeight: 600 }} />
                      <Radar dataKey="score" stroke="#059669" fill="#10b981" fillOpacity={0.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex-1 space-y-2 text-xs text-emerald-950 w-full">
                  <div className="flex items-center justify-between border-b border-emerald-200/60 pb-1.5">
                    <span className="font-bold">คะแนนเฉลี่ยรวม 5 ด้าน:</span>
                    <span className="text-2xl font-black text-emerald-900">{totalOverallScore} / 100</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-emerald-200/60 pb-1.5">
                    <span className="font-bold">เกรดประเมินพัฒนาการ:</span>
                    <span className="px-3.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-slate-950 shadow-xs">
                      เกรด {grade}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 pt-1 text-center text-[10px]">
                    <div className="bg-white/80 p-1.5 rounded-lg border border-emerald-200">
                      <span className="block text-slate-500">เทคนิค</span>
                      <span className="font-bold text-amber-700">{technicalAvg}</span>
                    </div>
                    <div className="bg-white/80 p-1.5 rounded-lg border border-emerald-200">
                      <span className="block text-slate-500">แท็กติก</span>
                      <span className="font-bold text-blue-700">{tacticalAvg}</span>
                    </div>
                    <div className="bg-white/80 p-1.5 rounded-lg border border-emerald-200">
                      <span className="block text-slate-500">กายภาพ</span>
                      <span className="font-bold text-rose-700">{physicalAvg}</span>
                    </div>
                    <div className="bg-white/80 p-1.5 rounded-lg border border-emerald-200">
                      <span className="block text-slate-500">จิตวิทยา</span>
                      <span className="font-bold text-purple-700">{psychologicalAvg}</span>
                    </div>
                    <div className="bg-white/80 p-1.5 rounded-lg border border-emerald-200">
                      <span className="block text-slate-500">สังคม</span>
                      <span className="font-bold text-emerald-700">{socialAvg}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5 Pillars Sliders */}
              <div className="space-y-4">
                
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5 border-b pb-2">
                  <span>เกณฑ์ให้คะแนน 5 ด้านหลัก (ระดับ 1 - 10)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* 1. Technical */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                    <div className="font-bold text-slate-900 flex items-center justify-between pb-1 border-b border-slate-200">
                      <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-500" /> 1. ด้านเทคนิค (Technical)</span>
                      <span className="text-amber-800 font-extrabold bg-amber-100 px-2 py-0.5 rounded-md text-[11px]">{technicalAvg}/10</span>
                    </div>
                    {[
                      { key: 'ballControl', label: 'การจับและควบคุมบอลแรก (First Touch & Control)' },
                      { key: 'passing', label: 'การจ่ายบอลสั้น-ยาว (Passing Accuracy)' },
                      { key: 'dribbling', label: 'การเลี้ยงบอลหลบคู่แข่ง (Dribbling & 1v1)' },
                      { key: 'shooting', label: 'การยิงประตูและการจบสกอร์ (Shooting & Finishing)' },
                      { key: 'headingOrGoalkeeping', label: 'การเล่นลูกกลางอากาศ / การป้องกันประตู (Heading/GK)' }
                    ].map(f => (
                      <div key={f.key}>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                          <span>{f.label}</span>
                          <span className="font-bold text-slate-800">{(evalForm.technical as any)[f.key]}</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          step="0.5"
                          value={(evalForm.technical as any)[f.key]}
                          onChange={(e) => setEvalForm({
                            ...evalForm,
                            technical: { ...evalForm.technical, [f.key]: Number(e.target.value) }
                          })}
                          className="w-full accent-amber-600"
                        />
                      </div>
                    ))}
                  </div>

                  {/* 2. Tactical */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                    <div className="font-bold text-slate-900 flex items-center justify-between pb-1 border-b border-slate-200">
                      <span className="flex items-center gap-1.5"><Brain className="w-4 h-4 text-blue-500" /> 2. ด้านแท็กติก (Tactical)</span>
                      <span className="text-blue-800 font-extrabold bg-blue-100 px-2 py-0.5 rounded-md text-[11px]">{tacticalAvg}/10</span>
                    </div>
                    {[
                      { key: 'gameVision', label: 'วิสัยทัศน์และการมองพื้นที่ (Game Vision & Awareness)' },
                      { key: 'positioning', label: 'การยืนตำแหน่งและการเคลื่อนที่หาพื้นที่ (Positioning)' },
                      { key: 'decisionMaking', label: 'การตัดสินใจในสถานการณ์จริง (Decision Making)' },
                      { key: 'transitionSpeed', label: 'ความเร็วการเปลี่ยนรุก-รับ (Transition Play)' }
                    ].map(f => (
                      <div key={f.key}>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                          <span>{f.label}</span>
                          <span className="font-bold text-slate-800">{(evalForm.tactical as any)[f.key]}</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          step="0.5"
                          value={(evalForm.tactical as any)[f.key]}
                          onChange={(e) => setEvalForm({
                            ...evalForm,
                            tactical: { ...evalForm.tactical, [f.key]: Number(e.target.value) }
                          })}
                          className="w-full accent-blue-600"
                        />
                      </div>
                    ))}
                  </div>

                  {/* 3. Physical */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                    <div className="font-bold text-slate-900 flex items-center justify-between pb-1 border-b border-slate-200">
                      <span className="flex items-center gap-1.5"><Flame className="w-4 h-4 text-rose-500" /> 3. ด้านกายภาพ (Physical)</span>
                      <span className="text-rose-800 font-extrabold bg-rose-100 px-2 py-0.5 rounded-md text-[11px]">{physicalAvg}/10</span>
                    </div>
                    {[
                      { key: 'speed', label: 'ความเร็วสปีดต้น-ปลาย (Sprint Speed)' },
                      { key: 'agility', label: 'ความคล่องแคล่วว่องไว (Agility & Coordination)' },
                      { key: 'stamina', label: 'ความทนทานและความอึด (Stamina & Aerobic Capacity)' },
                      { key: 'strength', label: 'ความแข็งแกร่งและการเบียดปะทะ (Strength & Balance)' }
                    ].map(f => (
                      <div key={f.key}>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                          <span>{f.label}</span>
                          <span className="font-bold text-slate-800">{(evalForm.physical as any)[f.key]}</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          step="0.5"
                          value={(evalForm.physical as any)[f.key]}
                          onChange={(e) => setEvalForm({
                            ...evalForm,
                            physical: { ...evalForm.physical, [f.key]: Number(e.target.value) }
                          })}
                          className="w-full accent-rose-600"
                        />
                      </div>
                    ))}
                  </div>

                  {/* 4. Psychological */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                    <div className="font-bold text-slate-900 flex items-center justify-between pb-1 border-b border-slate-200">
                      <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-purple-500" /> 4. ด้านจิตวิทยา (Psychological)</span>
                      <span className="text-purple-800 font-extrabold bg-purple-100 px-2 py-0.5 rounded-md text-[11px]">{psychologicalAvg}/10</span>
                    </div>
                    {[
                      { key: 'focus', label: 'สมาธิและความตั้งใจมั่น (Focus & Concentration)' },
                      { key: 'confidence', label: 'ความมั่นใจในตนเองและความกล้าเล่น (Confidence)' },
                      { key: 'determination', label: 'ความมุ่งมั่นไม่ยอมแพ้ (Determination & Grit)' },
                      { key: 'emotionalControl', label: 'การควบคุมอารมณ์และทัศนคติ (Emotional Control)' }
                    ].map(f => (
                      <div key={f.key}>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                          <span>{f.label}</span>
                          <span className="font-bold text-slate-800">{(evalForm.psychological as any)[f.key]}</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          step="0.5"
                          value={(evalForm.psychological as any)[f.key]}
                          onChange={(e) => setEvalForm({
                            ...evalForm,
                            psychological: { ...evalForm.psychological, [f.key]: Number(e.target.value) }
                          })}
                          className="w-full accent-purple-600"
                        />
                      </div>
                    ))}
                  </div>

                </div>

                {/* 5. Social / Teamwork (Full Width) */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center justify-between pb-1 border-b border-slate-200">
                    <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-emerald-600" /> 5. ด้านสังคมและวินัยการทำงานเป็นทีม (Social & Teamwork)</span>
                    <span className="text-emerald-800 font-extrabold bg-emerald-100 px-2 py-0.5 rounded-md text-[11px]">{socialAvg}/10</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                    {[
                      { key: 'discipline', label: 'วินัยและการตรงต่อเวลา (Discipline & Punctuality)' },
                      { key: 'teamwork', label: 'การทำงานร่วมกันและการสนับสนุนเพื่อน (Teamwork)' },
                      { key: 'communication', label: 'การสื่อสารส่งเสียงในสนาม (Communication)' },
                      { key: 'respectAndSportsmanship', label: 'น้ำใจนักกีฬาและการเคารพกติกา (Sportsmanship & Respect)' }
                    ].map(f => (
                      <div key={f.key}>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                          <span>{f.label}</span>
                          <span className="font-bold text-slate-800">{(evalForm.social as any)[f.key]}</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          step="0.5"
                          value={(evalForm.social as any)[f.key]}
                          onChange={(e) => setEvalForm({
                            ...evalForm,
                            social: { ...evalForm.social, [f.key]: Number(e.target.value) }
                          })}
                          className="w-full accent-emerald-600"
                        />
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Coach Comments */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">จุดเด่นที่ทำได้ดีมาก</label>
                  <input
                    type="text"
                    value={evalForm.strengths}
                    onChange={(e) => setEvalForm({ ...evalForm, strengths: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">จุดที่ต้องพัฒนาเพิ่มเติม</label>
                  <input
                    type="text"
                    value={evalForm.areasForImprovement}
                    onChange={(e) => setEvalForm({ ...evalForm, areasForImprovement: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">คำแนะนำจากโค้ช</label>
                  <textarea
                    rows={2}
                    value={evalForm.coachFeedback}
                    onChange={(e) => setEvalForm({ ...evalForm, coachFeedback: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowNewEvalModal(false)}
                  className="px-4 py-2 border rounded-xl cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md cursor-pointer transition-colors"
                >
                  บันทึกการประเมิน
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* OFFICIAL PLAYER DEVELOPMENT REPORT CARD MODAL (5 PILLARS) */}
      {selectedEvalForReportCard && (() => {
        const st = students.find(s => s.id === selectedEvalForReportCard.studentId);
        const coach = coaches.find(c => c.id === selectedEvalForReportCard.coachId);
        if (!st) return null;

        const psychScore = selectedEvalForReportCard.skills.psychological?.average 
          ?? selectedEvalForReportCard.skills.mentalSocial?.average 
          ?? 8.5;
        const socScore = selectedEvalForReportCard.skills.social?.average 
          ?? selectedEvalForReportCard.skills.mentalSocial?.average 
          ?? 8.5;

        const radarData = [
          { subject: '1. เทคนิค', score: selectedEvalForReportCard.skills.technical.average },
          { subject: '2. แท็กติก', score: selectedEvalForReportCard.skills.tactical.average },
          { subject: '3. กายภาพ', score: selectedEvalForReportCard.skills.physical.average },
          { subject: '4. จิตวิทยา', score: psychScore },
          { subject: '5. สังคม & วินัย', score: socScore }
        ];

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 space-y-6 my-8">
              
              <div className="flex items-center justify-between border-b pb-3">
                <span className="font-bold text-slate-800 text-sm">สมุดรายงานผลการประเมินทักษะ 5 ด้านหลัก</span>
                <button onClick={() => setSelectedEvalForReportCard(null)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Printable Document Paper */}
              <div id="printable-report-card" className="border-2 border-emerald-800 rounded-2xl p-6 bg-slate-50/50 space-y-4 text-xs text-slate-800">
                
                {/* Header */}
                <div className="flex justify-between items-center border-b-2 border-emerald-800 pb-4">
                  <div className="flex items-center gap-3">
                    {organizationConfig.logoUrl ? (
                      <img 
                        src={organizationConfig.logoUrl} 
                        alt="Logo" 
                        className="w-14 h-14 rounded-2xl object-cover border border-emerald-700 bg-white p-1 shadow-sm" 
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-emerald-800 text-amber-300 font-black flex items-center justify-center text-lg shadow">
                        YFC
                      </div>
                    )}
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900">{organizationConfig.nameTh}</h2>
                      <div className="text-xs font-bold text-emerald-800">สมุดประเมินพัฒนาการนักฟุตบอล (Player Progress Report)</div>
                      <div className="text-[10px] text-slate-500 font-mono">รอบประเมิน: {selectedEvalForReportCard.termPeriod}</div>
                    </div>
                  </div>

                  <div className="text-center bg-amber-100 border border-amber-300 px-4 py-2 rounded-xl">
                    <div className="text-[10px] font-bold text-amber-900">เกรดเฉลี่ย</div>
                    <div className="text-2xl font-black text-amber-800">{selectedEvalForReportCard.overallGrade}</div>
                    <div className="text-[10px] font-bold text-slate-600">{selectedEvalForReportCard.overallScore}/100</div>
                  </div>
                </div>

                {/* Student Info Bar */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={st.avatarUrl} 
                      alt={st.fullName} 
                      className={`w-12 h-12 rounded-xl object-cover border-2 ${st.category === 'U-6' ? 'border-blue-500' : 'border-emerald-500'}`} 
                    />
                    <div>
                      <div className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                        <span>{st.fullName} ("{st.nickname}")</span>
                        <span 
                          className="px-2 py-0.5 rounded text-[10.5px] font-bold text-white shadow-xs"
                          style={{ backgroundColor: AGE_COLORS[st.category] || (st.category === 'U-6' ? '#3b82f6' : '#10b981') }}
                        >
                          {st.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        รหัส: <span className="font-mono font-bold text-slate-700">{st.studentCode}</span> | ตำแหน่ง: <span className="font-semibold text-slate-700">{st.preferredPosition}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-slate-600">
                    <div>โรงเรียน: <span className="font-medium text-slate-800">{st.schoolName}</span></div>
                    <div>ผู้ปกครอง: <span className="font-medium text-slate-800">{st.parentName}</span></div>
                  </div>
                </div>

                {/* 5-Axis Radar Chart & 5 Pillar Scores */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-white p-4 rounded-xl border border-slate-200">
                  <div className="h-48 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius={55} data={radarData}>
                        <PolarGrid stroke="#cbd5e1" />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#334155', fontWeight: 600 }} />
                        <Radar dataKey="score" stroke="#059669" fill="#10b981" fillOpacity={0.5} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b">
                      <span className="font-semibold text-amber-900">1. ทักษะเทคนิค:</span>
                      <span className="font-black text-amber-800">{selectedEvalForReportCard.skills.technical.average}/10</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="font-semibold text-blue-900">2. ความเข้าใจแท็กติก:</span>
                      <span className="font-black text-blue-800">{selectedEvalForReportCard.skills.tactical.average}/10</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="font-semibold text-rose-900">3. สมรรถภาพกายภาพ:</span>
                      <span className="font-black text-rose-800">{selectedEvalForReportCard.skills.physical.average}/10</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="font-semibold text-purple-900">4. สภาพจิตวิทยา:</span>
                      <span className="font-black text-purple-800">{psychScore}/10</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="font-semibold text-emerald-900">5. สังคม & วินัยทีม:</span>
                      <span className="font-black text-emerald-800">{socScore}/10</span>
                    </div>
                  </div>
                </div>

                {/* Qualitative Feedback */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-emerald-900">จุดเด่นที่น่าประทับใจ: </span>
                    <span className="text-slate-700">{selectedEvalForReportCard.strengths}</span>
                  </div>
                  <div>
                    <span className="font-bold text-amber-900">จุดที่ต้องฝึกซ้อมเพิ่มเติม: </span>
                    <span className="text-slate-700">{selectedEvalForReportCard.areasForImprovement}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">ความเห็นจากโค้ช: </span>
                    <span className="text-slate-700">{selectedEvalForReportCard.coachFeedback}</span>
                  </div>
                </div>

                {/* Signatures */}
                <div className="pt-4 flex justify-between items-end text-[10px] text-slate-500">
                  <div>
                    <div>วันที่ประเมิน: {selectedEvalForReportCard.evaluationDate}</div>
                    <div>{organizationConfig.nameTh} ({organizationConfig.nameEn})</div>
                  </div>
                  <div className="text-center">
                    <div className="w-36 border-b border-slate-400 pb-1 font-bold text-slate-800">
                      {coach?.fullName || 'โค้ชผู้ฝึกสอน'}
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5">โค้ชผู้ประเมิน ({coach?.license})</div>
                  </div>
                </div>

              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>พิมพ์สมุดรายงานผลการเรียน</span>
                </button>
                <button
                  onClick={() => setSelectedEvalForReportCard(null)}
                  className="py-2.5 px-4 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  ปิด
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
};
