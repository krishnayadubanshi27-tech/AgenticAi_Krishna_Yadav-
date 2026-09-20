import React, { useState } from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  Sparkles, 
  Award, 
  ArrowRight, 
  Download, 
  Zap,
  Calendar,
  Flame,
  Target,
  BookOpen
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { useLearning } from '../context/LearningContext';

export const ProgressReportsModal: React.FC = () => {
  const { 
    skills, 
    analytics, 
    userProfile, 
    sendChatMessage, 
    setActiveTab, 
    pathVelocityPercent,
    progressTracker,
    activeRoadmap,
    setIsRoadmapModalOpen,
    currentWeekTasks,
    currentCalendarWeekRange
  } = useLearning();

  const [activeReportTab, setActiveReportTab] = useState<'acquired' | 'in_progress' | 'gaps' | 'next_steps'>('acquired');

  const acquired = skills.filter(s => s.status === 'acquired');
  const inProgress = skills.filter(s => s.status === 'in_progress');
  const criticalGaps = skills.filter(s => s.status === 'critical_gap');

  // Format data for Skills Acquired Radar Chart
  const radarData = skills.map(skill => ({
    subject: skill.name.length > 18 ? skill.name.slice(0, 16) + '..' : skill.name,
    fullName: skill.name,
    Current: skill.currentLevel,
    Target: skill.targetLevel,
    fullMark: 100
  }));

  // Remaining upcoming milestones from activeRoadmap
  const upcomingRoadmapMilestones = (activeRoadmap?.milestones || []).filter(m => !m.completed);

  return (
    <div className="mb-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm transition-colors">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Periodic Progress & Velocity Reports
            </h2>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
              Week: {currentCalendarWeekRange}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Audit of <span className="font-bold text-slate-800 dark:text-slate-200">{userProfile.name}'s</span> progress toward{' '}
            <span className="font-bold text-slate-800 dark:text-slate-200">{userProfile.targetRole}</span> • Filtered for current calendar week ({currentCalendarWeekRange}).
          </p>
        </div>

        {/* Export & Action Buttons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => alert(`Progress report for ${userProfile.name} exported as PDF summary!`)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
          <button 
            onClick={() => {
              sendChatMessage(`Can you evaluate my current velocity of ${pathVelocityPercent}% and suggest adjustments for ${userProfile.targetRole}?`);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AI Evaluation</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* 1. Path Velocity mathematically calculated */}
        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase mb-1">
            <span>Path Velocity</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-indigo-950 dark:text-indigo-100">{pathVelocityPercent}%</p>
          <div className="w-full bg-indigo-200 dark:bg-indigo-900/60 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${pathVelocityPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-indigo-700 dark:text-indigo-300 font-semibold mt-1">
            (Completed steps / Total roadmap steps)
          </p>
        </div>

        {/* 2. Skills Acquired */}
        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase mb-1">
            <span>Skills Acquired</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-3xl font-black text-emerald-950 dark:text-emerald-100">{acquired.length}</p>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold mt-1">
            {skills.length - acquired.length} competencies remaining
          </p>
        </div>

        {/* 3. Weekly Study Hours (Current Calendar Week) */}
        <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 text-xs font-bold uppercase mb-1">
            <span>Weekly Study Hours</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-3xl font-black text-amber-950 dark:text-amber-100">
            {analytics.weeklyHoursSpent} <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">/ {userProfile.hoursPerWeek || 10} hrs</span>
          </p>
          <div className="flex items-center justify-between mt-1 text-[11px] font-semibold">
            <span className="text-amber-700 dark:text-amber-300">
              {Math.round(((analytics.weeklyHoursSpent / (userProfile.hoursPerWeek || 10)) * 100))}% of weekly target
            </span>
            <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 font-normal">
              {currentWeekTasks.length} tasks this week
            </span>
          </div>
        </div>

        {/* 4. Current Streak */}
        <div className="p-4 rounded-2xl bg-violet-50/50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/50">
          <div className="flex items-center justify-between text-violet-600 dark:text-violet-400 text-xs font-bold uppercase mb-1">
            <span>Current Streak</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-3xl font-black text-violet-950 dark:text-violet-100">{progressTracker.streakDays} Days</p>
          <p className="text-[11px] text-violet-700 dark:text-violet-300 font-semibold mt-1">
            Active ledger tracking
          </p>
        </div>
      </div>

      {/* DUAL CHARTS GRID: AreaChart + RadarChart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left 7 cols: Learning Velocity Trend Chart */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Study Velocity & Concept Growth
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Weekly hours logged from ledger</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
                Hours Logged
              </span>
            </div>
          </div>

          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.velocityTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#64748b" opacity={0.2} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  content={({ payload, label }) => {
                    if (!payload || payload.length === 0) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white text-xs p-2.5 rounded-xl shadow-lg border border-slate-700">
                        <p className="font-bold mb-1">{label}</p>
                        <p className="text-indigo-300">Hours Logged: {d.hours} hrs</p>
                        <p className="text-emerald-300 font-semibold">Concepts Mastered: {d.conceptsMastered}</p>
                      </div>
                    );
                  }}
                />
                <Area type="monotone" dataKey="hours" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 5 cols: Skills Acquired Radar Chart */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Skills Acquired Radar Map
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Current verified mastery vs target benchmark</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              Live State
            </span>
          </div>

          <div className="w-full h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="#64748b" opacity={0.25} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748b" opacity={0.4} />
                <Radar name="Current" dataKey="Current" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.45} />
                <Radar name="Target" dataKey="Target" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeDasharray="3 3" />
                <Tooltip 
                  content={({ payload }) => {
                    if (!payload || payload.length === 0) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white text-xs p-2.5 rounded-xl border border-slate-700 shadow-xl">
                        <p className="font-bold text-indigo-300">{d.fullName}</p>
                        <p className="text-slate-300">Current Level: <span className="font-bold text-white">{d.Current}%</span></p>
                        <p className="text-emerald-400">Target Benchmark: {d.Target}%</p>
                      </div>
                    );
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4 Report Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 overflow-x-auto no-scrollbar gap-2 sm:gap-4">
        {[
          { id: 'acquired', label: `Acquired (${acquired.length}) & Week Log (${currentWeekTasks.length})`, icon: CheckCircle2 },
          { id: 'in_progress', label: `In Progress (${inProgress.length})`, icon: TrendingUp },
          { id: 'gaps', label: `Remaining Gaps (${criticalGaps.length})`, icon: AlertCircle },
          { id: 'next_steps', label: 'Upcoming Roadmap Milestones', icon: Sparkles }
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeReportTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveReportTab(t.id as any)}
              className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: CURRENT WEEK TASKS LOG & MASTERED COMPETENCIES */}
      {activeReportTab === 'acquired' && (
        <div className="space-y-6">
          {/* Current Calendar Week Ledger Filter */}
          <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-indigo-100 dark:border-indigo-900/50">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-indigo-600 text-white">
                  <Calendar className="w-3.5 h-3.5" />
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Tasks Completed in Current Calendar Week
                </h3>
              </div>
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800">
                {currentCalendarWeekRange} • {currentWeekTasks.length} done ({analytics.weeklyHoursSpent} hrs)
              </span>
            </div>

            {currentWeekTasks.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-500 dark:text-slate-400">
                <p>No tasks completed in the current calendar week yet.</p>
                <p className="mt-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                  Go to the Weekly Schedule and check off today's tasks to log real-time study hours.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {currentWeekTasks.map((t, idx) => (
                  <div
                    key={`${t.taskId}-${t.timestamp || idx}`}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          {t.title || t.taskId}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                            {t.skillName || 'General'}
                          </span>
                          <span>•</span>
                          <span>{t.durationMinutes} mins logged</span>
                          <span>•</span>
                          <span className="text-slate-400 dark:text-slate-500">
                            {new Date(t.timestamp).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="shrink-0 self-start sm:self-auto px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] border border-emerald-200 dark:border-emerald-800">
                      Logged to Week ✓
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mastered Competencies Section */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Mastered Competencies ({acquired.length})
            </h3>
            {acquired.length === 0 ? (
              <div className="py-6 text-center text-slate-500 dark:text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <p>No competencies fully mastered yet. Complete micro-steps in your weekly schedule to level up!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {acquired.map(skill => (
                  <div 
                    key={skill.id}
                    className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shrink-0 mt-0.5">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{skill.name}</h4>
                          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200">
                            Mastered
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{skill.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      <span>Score: {skill.currentLevel}/100</span>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200">
                        Parity Achieved ✓
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SKILLS IN PROGRESS */}
      {activeReportTab === 'in_progress' && (
        <div className="space-y-4">
          {inProgress.map(skill => {
            const gap = skill.targetLevel - skill.currentLevel;
            return (
              <div 
                key={skill.id}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{skill.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{skill.category} • Current Level: {skill.currentLevel}%</p>
                  </div>
                  <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800/60">
                    {gap}% to Target
                  </span>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${skill.currentLevel}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Target Benchmark: {skill.targetLevel}%</span>
                  <button
                    onClick={() => setActiveTab('weekly_plan')}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                  >
                    View in Weekly Schedule →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: REMAINING GAPS */}
      {activeReportTab === 'gaps' && (
        <div className="space-y-3">
          {criticalGaps.map(skill => {
            const gap = skill.targetLevel - skill.currentLevel;
            return (
              <div 
                key={skill.id}
                className="p-5 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{skill.name}</h4>
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200">
                      Gap: -{gap}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{skill.description}</p>
                </div>

                <div className="shrink-0 self-start sm:self-auto flex items-center gap-2">
                  <button
                    onClick={() => {
                      sendChatMessage(`What is the fastest way for me to eliminate the -${gap}% gap in ${skill.name} for my goal ${userProfile.targetRole}?`);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Ask AI Remediation
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 4: UPCOMING ROADMAP MILESTONES */}
      {activeReportTab === 'next_steps' && (
        <div className="space-y-4">
          {upcomingRoadmapMilestones.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-center">
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">No active roadmap loaded yet.</p>
              <button
                onClick={() => setIsRoadmapModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
              >
                Generate Roadmap with Ollama
              </button>
            </div>
          ) : (
            upcomingRoadmapMilestones.map((milestone, idx) => (
              <div 
                key={milestone.id || idx}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300">
                      Milestone {idx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{milestone.title}</h4>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    ~{milestone.estimatedHours} hrs
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300">{milestone.description}</p>

                <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-xs">
                  <p className="font-bold text-amber-900 dark:text-amber-200 mb-0.5">🎯 Target Deliverable:</p>
                  <p className="text-amber-800 dark:text-amber-300">{milestone.deliverable}</p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{milestone.microSteps?.length || 0} micro-steps</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('learning_path')}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Open in Roadmap Tab →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
