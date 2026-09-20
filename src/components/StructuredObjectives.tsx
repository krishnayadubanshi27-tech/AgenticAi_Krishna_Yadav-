import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Layers, 
  Sparkles, 
  Award, 
  RefreshCw, 
  Bot, 
  ExternalLink, 
  Sliders, 
  Compass,
  RotateCcw,
  BookOpen,
  Edit3,
  Trash2,
  Plus,
  Save,
  X
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { RoadmapMilestone } from '../types/learning';

export const StructuredObjectives: React.FC = () => {
  const { 
    objectivesRoadmap,
    isGeneratingMasterPlan,
    generationStage,
    setIsRecalibrateModalOpen,
    updateMilestone,
    deleteMilestone,
    toggleMilestoneComplete,
    userPreferences,
    clearRoadmap
  } = useAppStore();

  // Milestone edit modal state
  const [editingMilestone, setEditingMilestone] = useState<RoadmapMilestone | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editHours, setEditHours] = useState(6);
  const [editDeliverable, setEditDeliverable] = useState('');
  const [editMicroSteps, setEditMicroSteps] = useState<string[]>([]);
  const [newStepText, setNewStepText] = useState('');

  const milestones = objectivesRoadmap?.milestones || [];
  const completedCount = milestones.filter(m => m.completed).length;
  const progressPercent = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  const handleOpenEdit = (m: RoadmapMilestone) => {
    setEditingMilestone(m);
    setEditTitle(m.title);
    setEditHours(m.estimatedHours || 6);
    setEditDeliverable(m.deliverable);
    setEditMicroSteps([...(m.microSteps || [])]);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMilestone) return;

    updateMilestone(editingMilestone.id, {
      title: editTitle.trim() || editingMilestone.title,
      estimatedHours: Number(editHours) || editingMilestone.estimatedHours,
      deliverable: editDeliverable.trim() || editingMilestone.deliverable,
      microSteps: editMicroSteps
    });

    setEditingMilestone(null);
  };

  const handleAddMicroStep = () => {
    if (!newStepText.trim()) return;
    setEditMicroSteps(prev => [...prev, newStepText.trim()]);
    setNewStepText('');
  };

  const handleRemoveMicroStep = (index: number) => {
    setEditMicroSteps(prev => prev.filter((_, idx) => idx !== index));
  };

  return (
    <div className="mb-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm transition-colors">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {objectivesRoadmap?.roadmapTitle || `${userPreferences.targetGoal} Objectives Roadmap`}
            </h2>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 flex items-center gap-1">
              <Bot className="w-3 h-3" />
              <span>Ollama {objectivesRoadmap?.model || 'phi4-mini:latest'}</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
            {objectivesRoadmap ? (
              <>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                  🎯 {objectivesRoadmap.targetGoal}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold">
                  ⚡ {objectivesRoadmap.currentLevel}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold">
                  ⏱️ {objectivesRoadmap.timeCommitment}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold">
                  💼 {objectivesRoadmap.learningStyle}
                </span>
              </>
            ) : (
              <span>Adaptive on-device milestone breakdown tailored strictly to your Recalibrate preferences.</span>
            )}
          </div>
        </div>

        {/* Action Controls & Progress */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsRecalibrateModalOpen(true)}
            disabled={isGeneratingMasterPlan}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-60 cursor-pointer"
            title="Configure and generate master plan with Ollama"
          >
            {isGeneratingMasterPlan ? (
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-200" />
            ) : (
              <Sliders className="w-4 h-4 text-indigo-200" />
            )}
            <span>
              {isGeneratingMasterPlan 
                ? 'Synthesizing Master Plan...' 
                : objectivesRoadmap ? 'Recalibrate Plan' : 'AI Generate Master Plan'}
            </span>
          </button>

          {objectivesRoadmap && (
            <button
              onClick={clearRoadmap}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Clear roadmap"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {objectivesRoadmap && milestones.length > 0 && (
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 px-4 py-2 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Milestone Velocity</span>
                  <span className="text-indigo-600 dark:text-indigo-400 ml-2">{completedCount}/{milestones.length} Done</span>
                </div>
                <div className="w-28 sm:w-36 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
              <div className="text-base font-black text-slate-900 dark:text-slate-100">
                {progressPercent}%
              </div>
            </div>
          )}
        </div>
      </div>

      {/* STREAMING LOADING SKELETON WITH PULSE ANIMATION */}
      {isGeneratingMasterPlan && (
        <div className="space-y-6 relative before:absolute before:top-6 before:bottom-6 before:left-5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 before:hidden sm:before:block mb-8">
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 flex items-center gap-3 text-xs text-indigo-700 dark:text-indigo-300 font-bold mb-6 animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
            <span>{generationStage || 'Ollama is synthesizing structured JSON milestones, deliverables, and course recommendations...'}</span>
          </div>

          {[1, 2, 3, 4].map(num => (
            <div key={num} className="relative sm:pl-12 animate-pulse">
              <div className="hidden sm:flex absolute left-2.5 -translate-x-1/2 top-5 w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 items-center justify-center text-xs font-bold text-slate-400">
                {num}
              </div>
              <div className="p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 space-y-4">
                <div className="h-5 w-1/3 bg-slate-300 dark:bg-slate-700 rounded-md" />
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-md" />
                <div className="h-12 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EMPTY STATE IF NO ROADMAP ACTIVE */}
      {!isGeneratingMasterPlan && (!objectivesRoadmap || milestones.length === 0) && (
        <div className="py-16 px-6 text-center rounded-3xl bg-slate-50/50 dark:bg-slate-800/30 border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-xl shadow-indigo-500/20 mb-4">
            <Compass className="w-8 h-8" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-2">
            No Active Learning Roadmap Found
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
            Configure your technical goal, current proficiency level, and study hours in the Master Recalibrate modal to generate your personalized roadmap.
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

      {/* ROADMAP TIMELINE NODES */}
      {!isGeneratingMasterPlan && objectivesRoadmap && milestones.length > 0 && (
        <div className="space-y-6 relative before:absolute before:top-6 before:bottom-6 before:left-5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 before:hidden sm:before:block">
          {milestones.map((m, idx) => {
            const isCompleted = Boolean(m.completed);

            return (
              <div key={m.id} className="relative sm:pl-12 group">
                {/* Node Milestone Circle */}
                <div 
                  onClick={() => toggleMilestoneComplete(m.id)}
                  className={`hidden sm:flex absolute left-2.5 -translate-x-1/2 top-5 w-7 h-7 rounded-full border-2 items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                    isCompleted
                      ? 'bg-emerald-500 border-emerald-400 text-white shadow-md shadow-emerald-500/30'
                      : 'bg-white dark:bg-slate-800 border-indigo-500 text-indigo-600 dark:text-indigo-400 hover:scale-110'
                  }`}
                  title={isCompleted ? 'Mark as active' : 'Mark milestone complete'}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>

                {/* Milestone Content Card */}
                <div className={`p-6 sm:p-7 rounded-3xl border transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40'
                    : 'bg-white dark:bg-slate-800/90 border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-500/50 shadow-sm'
                }`}>
                  {/* Card Top Meta */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        Milestone {idx + 1}
                      </span>
                      {m.milestoneTag && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {m.milestoneTag}
                        </span>
                      )}
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {m.estimatedHours} hrs
                      </span>
                    </div>

                    {/* Milestone Actions: Edit, Delete, Toggle Complete */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/70 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                        title="Edit milestone details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete milestone "${m.title}"? The weekly schedule will immediately recalculate.`)) {
                            deleteMilestone(m.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/70 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="Delete milestone"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => toggleMilestoneComplete(m.id)}
                        className={`text-xs font-bold px-3 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                          isCompleted
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-700/70 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isCompleted ? 'Completed' : 'Mark Done'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className={`text-base sm:text-lg font-bold mb-2 ${isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                    {m.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {m.description}
                  </p>

                  {/* Deliverable Box */}
                  <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 mb-4 flex items-start gap-2.5">
                    <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-800 dark:text-indigo-300 block mb-0.5">
                        Practical Deliverable
                      </span>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {m.deliverable}
                      </p>
                    </div>
                  </div>

                  {/* Micro-Steps Breakdown */}
                  {m.microSteps && m.microSteps.length > 0 && (
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                        Paced Micro-Steps (Synchronized with Weekly Schedule)
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {m.microSteps.map((step, sIdx) => (
                          <div 
                            key={sIdx}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/70 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2"
                          >
                            <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {sIdx + 1}
                            </span>
                            <span className="leading-snug">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EDIT MILESTONE MODAL */}
      {editingMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-400" />
                <span>Edit Milestone</span>
              </h3>
              <button
                onClick={() => setEditingMilestone(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Estimated Hours</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={editHours}
                  onChange={e => setEditHours(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Deliverable</label>
                <textarea
                  value={editDeliverable}
                  onChange={e => setEditDeliverable(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Micro-Steps</label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto mb-2">
                  {editMicroSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-800 text-xs">
                      <span className="truncate flex-1">{step}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMicroStep(idx)}
                        className="text-slate-500 hover:text-rose-400 ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newStepText}
                    onChange={e => setNewStepText(e.target.value)}
                    placeholder="Add a new step..."
                    className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddMicroStep}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingMilestone(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save & Recalculate</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
