import React, { useState } from 'react';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell
} from 'recharts';
import { 
  Target, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  Flame, 
  ArrowUpRight,
  HelpCircle
} from 'lucide-react';
import { useLearning } from '../context/LearningContext';

export const SkillGapDashboard: React.FC = () => {
  const { 
    skills, 
    userProfile, 
    sendChatMessage, 
    setIsOnboardingOpen,
    analytics 
  } = useLearning();

  const [chartView, setChartView] = useState<'radar' | 'bar'>('radar');

  // Format data for Recharts
  const radarData = skills.map(skill => ({
    subject: skill.name.length > 20 ? skill.name.slice(0, 18) + '...' : skill.name,
    fullName: skill.name,
    Current: skill.currentLevel,
    Target: skill.targetLevel,
    Gap: Math.max(0, skill.targetLevel - skill.currentLevel)
  }));

  const barData = skills.map(skill => ({
    name: skill.name.length > 15 ? skill.name.slice(0, 13) + '..' : skill.name,
    fullName: skill.name,
    current: skill.currentLevel,
    target: skill.targetLevel,
    gap: Math.max(0, skill.targetLevel - skill.currentLevel),
    status: skill.status
  }));

  const criticalGaps = skills.filter(s => s.status === 'critical_gap');
  const inProgressSkills = skills.filter(s => s.status === 'in_progress');
  const acquiredSkills = skills.filter(s => s.status === 'acquired');

  return (
    <div className="mb-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm transition-colors">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400">
              <Target className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Skill Gap Diagnostic Engine
            </h2>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
              Live AI Benchmarking
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Comparing your verified competencies against current industry hiring benchmarks for{' '}
            <span className="font-bold text-slate-800 dark:text-slate-200">{userProfile.targetRole}</span>.
          </p>
        </div>

        {/* Action & Toggle Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setChartView('radar')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                chartView === 'radar' 
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Radar Map
            </button>
            <button
              onClick={() => setChartView('bar')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                chartView === 'bar' 
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Bar Gaps
            </button>
          </div>

          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800/60 transition-colors"
          >
            <span>Edit Target Role</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Summary KPI Scorecards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Role Parity</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-950 dark:text-indigo-100">
            {analytics.overallReadiness}%
          </div>
          <p className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-1 font-medium">
            +14% gained this cycle
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Critical Gaps</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-950 dark:text-rose-100">
            {criticalGaps.length}
          </div>
          <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-1 font-medium">
            Prioritized in active stream
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">In Progress</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-950 dark:text-amber-100">
            {inProgressSkills.length}
          </div>
          <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-1 font-medium">
            Advancing steadily
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">At Parity</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-950 dark:text-emerald-100">
            {acquiredSkills.length}
          </div>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-1 font-medium">
            Exceeds benchmark
          </p>
        </div>
      </div>

      {/* Main Chart & Gap Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Visual Chart Left/Center (7 cols) */}
        <div className="lg:col-span-7 bg-slate-50/80 dark:bg-slate-950/60 rounded-2xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {chartView === 'radar' ? 'Competency Radar vs Role Standard' : 'Individual Skill Gap Deltas'}
            </h3>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block" />
                <span className="text-slate-700 dark:text-slate-300">Current Level</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-violet-300 dark:bg-violet-400 inline-block" />
                <span className="text-slate-500 dark:text-slate-400">Target Standard</span>
              </div>
            </div>
          </div>

          <div className="w-full h-72 sm:h-80">
            {chartView === 'radar' ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#cbd5e1" opacity={0.3} />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} 
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 100]} 
                    tick={{ fill: '#94a3b8', fontSize: 10 }} 
                  />
                  <Radar
                    name="Current"
                    dataKey="Current"
                    stroke="#4f46e5"
                    fill="#4f46e5"
                    fillOpacity={0.45}
                  />
                  <Radar
                    name="Target"
                    dataKey="Target"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.15}
                    strokeDasharray="4 4"
                  />
                  <RechartsTooltip 
                    content={({ payload }) => {
                      if (!payload || payload.length === 0) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white text-xs p-2.5 rounded-xl shadow-lg border border-slate-700">
                          <p className="font-bold mb-1">{data.fullName}</p>
                          <p className="text-indigo-300">Current: {data.Current}%</p>
                          <p className="text-violet-300">Target: {data.Target}%</p>
                          <p className="text-rose-300 font-semibold">Gap: -{data.Gap}%</p>
                        </div>
                      );
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <RechartsTooltip />
                  <Bar dataKey="current" name="Current Level" radius={[0, 4, 4, 0]}>
                    {barData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.status === 'acquired' ? '#10b981' : entry.status === 'critical_gap' ? '#f43f5e' : '#4f46e5'} 
                      />
                    ))}
                  </Bar>
                  <Bar dataKey="gap" name="Remaining Gap" fill="#475569" opacity={0.3} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Detailed Gap Cards Right (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Identified Competency Gaps
            </h3>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Ranked by Urgency</span>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {skills.map(skill => {
              const gap = skill.targetLevel - skill.currentLevel;
              const isStruggle = skill.struggleScore > 60;
              return (
                <div 
                  key={skill.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    skill.status === 'critical_gap'
                      ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                      : skill.status === 'in_progress'
                      ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                      : 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {skill.name}
                      </span>
                      {isStruggle && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-200 dark:bg-amber-900/70 text-amber-900 dark:text-amber-200 text-[10px] font-bold">
                          Struggling
                        </span>
                      )}
                    </div>
                    <span className={`text-xs font-extrabold ${
                      gap <= 0 ? 'text-emerald-700 dark:text-emerald-400' : gap > 30 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      {gap <= 0 ? 'Parity Met ✓' : `-${gap}% Gap`}
                    </span>
                  </div>

                  {/* Progress track */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden mb-1.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        gap <= 0 ? 'bg-emerald-500' : gap > 30 ? 'bg-rose-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${skill.currentLevel}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Level: {skill.currentLevel}/100</span>
                    <button
                      onClick={() => {
                        sendChatMessage(`How can I accelerate closing my gap in "${skill.name}"?`);
                      }}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold inline-flex items-center gap-0.5"
                    >
                      <span>Ask AI</span>
                      <HelpCircle className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
