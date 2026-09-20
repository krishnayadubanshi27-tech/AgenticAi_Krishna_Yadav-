import React from 'react';
import { 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  HelpCircle,
  Clock,
  RotateCcw
} from 'lucide-react';
import { useLearning } from '../context/LearningContext';

export const StruggleAlertBanner: React.FC = () => {
  const { 
    struggleAlert, 
    resources, 
    setSelectedResourceForModal, 
    sendChatMessage, 
    resolveStruggle 
  } = useLearning();

  if (!struggleAlert || struggleAlert.status === 'resolved') {
    return null;
  }

  const remedyResource = resources.find(r => r.id === struggleAlert.remedyResourceIds[0]);

  return (
    <div className="mb-8 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-amber-950/20 border-2 border-amber-300/80 dark:border-amber-700/60 p-5 sm:p-6 shadow-md shadow-amber-500/5 transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left Side Info */}
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-amber-500 text-amber-950 shadow-md shadow-amber-500/30 shrink-0 animate-pulse">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                AI Struggle Detected • Needs Review
              </span>
              <span className="text-xs text-amber-900 dark:text-amber-300 font-bold">
                {struggleAlert.skillName}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 mb-1">
              {struggleAlert.issueSummary}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed mb-3">
              {struggleAlert.frictionReason}
            </p>

            {/* Diagnostic stats chips */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/80">
                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Time Spent: <strong>{Math.round(struggleAlert.timeSpentMinutes / 60 * 10) / 10} hrs</strong></span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/80">
                <RotateCcw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Quiz Accuracy: <strong className="text-amber-700 dark:text-amber-400">{struggleAlert.quizScore}%</strong> (Passing: 80%)</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800/80 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span>2 Targeted Micro-Labs Prioritized</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side CTA Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-amber-200 dark:border-amber-800/80">
          {remedyResource && (
            <button
              onClick={() => setSelectedResourceForModal(remedyResource)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Launch Remediation Lab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => {
              sendChatMessage("Can you explain why race conditions are happening in my React async effects and how AbortController solves it?");
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Ask AI Tutor</span>
          </button>

          <button
            onClick={() => resolveStruggle(struggleAlert.id)}
            className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-transparent hover:border-emerald-200 text-xs font-semibold transition-colors cursor-pointer"
            title="Mark as resolved manually"
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
