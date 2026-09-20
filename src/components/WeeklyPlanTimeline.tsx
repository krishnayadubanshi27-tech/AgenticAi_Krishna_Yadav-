import React from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  Coffee, 
  RotateCcw, 
  ChevronRight,
  Sliders,
  RefreshCw,
  Bot
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const WeeklyPlanTimeline: React.FC = () => {
  const { 
    weeklySchedule, 
    selectedDayIdx, 
    setSelectedDayIdx, 
    toggleTaskComplete, 
    objectivesRoadmap, 
    userPreferences, 
    setIsRecalibrateModalOpen,
    recalculateWeeklySchedule,
    isGeneratingMasterPlan
  } = useAppStore();

  const totalTasks = weeklySchedule.reduce((sum, d) => sum + d.tasks.length, 0);
  const completedTasks = weeklySchedule.reduce(
    (sum, d) => sum + d.tasks.filter(t => t.completed).length,
    0
  );
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="mb-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm transition-colors">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Personalized Adaptive Weekly Plan
            </h2>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1">
              <Bot className="w-3 h-3" />
              <span>Ollama Adaptive Calendar</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Paced for <span className="font-bold text-slate-800 dark:text-slate-200">{userPreferences.hoursPerWeek} hrs/week</span> ({userPreferences.targetGoal} Track).
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
              ⚡ ~{Math.round((userPreferences.hoursPerWeek * 60) / 6)} mins/day (6 active days)
            </span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Tasks synchronize dynamically with your active roadmap milestones and calendar dates.
          </p>
        </div>

        {/* Weekly Stats & AI Recalibrate */}
        <div className="flex flex-wrap items-center gap-3">
          {weeklySchedule.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2 rounded-2xl border border-slate-200/80 dark:border-slate-700 flex items-center gap-3 text-xs">
              <div className="text-right">
                <p className="font-bold text-slate-800 dark:text-slate-200">{completedTasks}/{totalTasks} Tasks Done</p>
                <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">{completionRate}% Completed</p>
              </div>
              <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          )}

          <button
            onClick={() => setIsRecalibrateModalOpen(true)}
            disabled={isGeneratingMasterPlan}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-60 cursor-pointer"
            title="Recalculate 7-day adaptive schedule via Master Recalibrate"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-200" />
            <span>Recalibrate Schedule</span>
          </button>
        </div>
      </div>

      {/* EMPTY STATE IF NO SCHEDULE ACTIVE */}
      {(!objectivesRoadmap || weeklySchedule.length === 0) && (
        <div className="py-16 px-6 text-center rounded-3xl bg-slate-50/50 dark:bg-slate-800/30 border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-xl shadow-indigo-500/20 mb-4">
            <CalendarIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-2">
            No Active Weekly Schedule
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
            Your 7-day schedule is derived directly from your roadmap milestones and weekly hours. Click Recalibrate to generate your master plan.
          </p>
          <button
            onClick={() => setIsRecalibrateModalOpen(true)}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
            <span>Open Recalibrate Modal</span>
          </button>
        </div>
      )}

      {/* ACTIVE SCHEDULE VIEW */}
      {weeklySchedule.length > 0 && (
        <>
          {/* Day Selector Chips (Mobile + Desktop Horizontal Bar) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3 mb-8">
            {weeklySchedule.map((day, idx) => {
              const isSelected = selectedDayIdx === idx;
              const dayDone = day.tasks.length > 0 && day.tasks.every(t => t.completed);

              return (
                <button
                  key={day.dateStr}
                  onClick={() => setSelectedDayIdx(idx)}
                  className={`p-3 rounded-2xl text-left border transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 ring-2 ring-indigo-500/50'
                      : dayDone
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-slate-700 dark:text-slate-300'
                      : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className={`text-[11px] font-bold ${isSelected ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'}`}>
                      {day.dayName.slice(0, 3)}
                    </span>
                    {day.isToday && (
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-white text-indigo-700' : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'}`}>
                        Today
                      </span>
                    )}
                    {dayDone && !day.isRestDay && (
                      <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-emerald-500'}`} />
                    )}
                  </div>

                  <div className="my-0.5">
                    <p className={`text-xs sm:text-sm font-black ${isSelected ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                      {day.dateStr}
                    </p>
                  </div>

                  <div className="mt-1 pt-1 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[10px]">
                    {day.isRestDay ? (
                      <span className={`${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>Rest</span>
                    ) : (
                      <span className={`font-semibold ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
                        {day.tasks.length} {day.tasks.length === 1 ? 'task' : 'tasks'}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Day Expanded Detail */}
          {(() => {
            const activeDay = weeklySchedule[selectedDayIdx] || weeklySchedule[0];
            if (!activeDay) return null;

            return (
              <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200/60 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                        {activeDay.dayName}, {activeDay.dateStr}
                      </h3>
                      {activeDay.isToday && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          Current Day
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Focus Domain: <span className="font-semibold text-slate-800 dark:text-slate-200">{activeDay.focusSkill}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span>
                      {activeDay.tasks.reduce((sum, t) => sum + t.durationMinutes, 0)} mins planned
                    </span>
                  </div>
                </div>

                {/* Day Tasks List */}
                {activeDay.isRestDay ? (
                  <div className="py-10 text-center flex flex-col items-center justify-center text-slate-400">
                    <Coffee className="w-10 h-10 text-amber-500 mb-2" />
                    <p className="font-bold text-sm text-slate-700 dark:text-slate-300">Scheduled Recovery & Consolidation Day</p>
                    <p className="text-xs text-slate-400 mt-1">Review notes or recharge your focus for high-velocity deliverables tomorrow.</p>
                  </div>
                ) : activeDay.tasks.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 text-xs">
                    No remaining tasks for this day. All scheduled items cleared!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeDay.tasks.map(task => {
                      return (
                        <div
                          key={task.id}
                          className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                            task.completed
                              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40'
                              : 'bg-white dark:bg-slate-800/90 border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-500/50 shadow-xs'
                          }`}
                        >
                          <div className="flex items-start gap-3.5">
                            <button
                              onClick={() => toggleTaskComplete(task.id, task.durationMinutes, task.skillName, task.title)}
                              className={`mt-0.5 p-1 rounded-lg transition-colors cursor-pointer ${
                                task.completed
                                  ? 'text-emerald-500 hover:text-emerald-600'
                                  : 'text-slate-300 dark:text-slate-600 hover:text-indigo-500'
                              }`}
                            >
                              {task.completed ? (
                                <CheckCircle2 className="w-5 h-5 fill-emerald-100 dark:fill-emerald-950/50" />
                              ) : (
                                <Circle className="w-5 h-5" />
                              )}
                            </button>

                            <div>
                              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700/70 text-slate-700 dark:text-slate-300">
                                  {task.type}
                                </span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                  {task.skillName}
                                </span>
                              </div>
                              <p className={`text-sm font-bold ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                                {task.title}
                              </p>
                              {task.completed && task.completedAt && (
                                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 inline shrink-0" />
                                  Completed on {new Date(task.completedAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                              <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                              {task.durationMinutes} min
                            </span>

                            <button
                              onClick={() => toggleTaskComplete(task.id, task.durationMinutes, task.skillName, task.title)}
                              className={`text-xs font-bold px-3 py-1 rounded-lg transition-all cursor-pointer ${
                                task.completed
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                  : 'bg-slate-100 dark:bg-slate-700/70 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-400'
                              }`}
                            >
                              {task.completed ? 'Completed ✓' : 'Mark Done'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
};
