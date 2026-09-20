import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bot, 
  Sparkles, 
  Clock, 
  Layers, 
  CheckCircle2, 
  BookOpen, 
  Briefcase, 
  Award, 
  RefreshCw,
  Sliders,
  User,
  Target,
  Zap
} from 'lucide-react';
import { useAppStore, UserPreferences } from '../store/useAppStore';

export const RecalibrateModal: React.FC = () => {
  const {
    isRecalibrateModalOpen,
    setIsRecalibrateModalOpen,
    userPreferences,
    generateMasterPlan,
    isGeneratingMasterPlan,
    generationStage
  } = useAppStore();

  // Local form state pre-filled from Zustand Single Source of Truth
  const [name, setName] = useState(userPreferences.name || 'Krishna Yadav');
  const [targetGoal, setTargetGoal] = useState(userPreferences.targetGoal || 'Full Stack Web Development');
  const [skillLevel, setSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>(
    userPreferences.skillLevel || 'Intermediate'
  );
  const [hoursPerWeek, setHoursPerWeek] = useState(userPreferences.hoursPerWeek || 10);
  const [preferredLearningFormat, setPreferredLearningFormat] = useState<
    'Project-First' | 'Video Tutorials' | 'Fast-Track Certification'
  >(userPreferences.preferredLearningFormat || 'Project-First');

  // Keep local state synced when modal opens
  useEffect(() => {
    if (isRecalibrateModalOpen) {
      setName(userPreferences.name || 'Krishna Yadav');
      setTargetGoal(userPreferences.targetGoal || 'Full Stack Web Development');
      setSkillLevel(userPreferences.skillLevel || 'Intermediate');
      setHoursPerWeek(userPreferences.hoursPerWeek || 10);
      setPreferredLearningFormat(userPreferences.preferredLearningFormat || 'Project-First');
    }
  }, [isRecalibrateModalOpen, userPreferences]);

  if (!isRecalibrateModalOpen) return null;

  const quickGoalPresets = [
    'Full Stack Web Development',
    'C/C++ Backend & Systems',
    'Docker & Kubernetes DevOps',
    'Autonomous AI Agents & Python',
    'System Design & Distributed Services'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetGoal.trim()) return;

    const prefs: UserPreferences = {
      name: name.trim() || 'Krishna Yadav',
      targetGoal: targetGoal.trim(),
      skillLevel,
      hoursPerWeek: Number(hoursPerWeek) || 10,
      preferredLearningFormat
    };

    await generateMasterPlan(prefs);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 text-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 sm:p-7 border-b border-slate-800/80 relative bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900">
          <button
            onClick={() => setIsRecalibrateModalOpen(false)}
            disabled={isGeneratingMasterPlan}
            className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-rose-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Sliders className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Master Recalibrate
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Bot className="w-3 h-3 text-indigo-400" />
                  Single Source of Truth
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure your career goal and schedule. Generates your structured roadmap, timetable, and courses via Ollama AI.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 overflow-y-auto space-y-6">
          {/* Section 1: User Profile & Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>Learner Profile Name</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Krishna Yadav"
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-800/90 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <p className="text-[11px] text-slate-500 mt-1">Pre-filled default for your personalized learning plan.</p>
          </div>

          {/* Section 2: Target Goal */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                <span>Target Goal / Primary Skill Focus</span>
              </span>
              <span className="text-[10px] text-slate-500 font-normal">Freeform or preset</span>
            </label>
            <input
              type="text"
              value={targetGoal}
              onChange={e => setTargetGoal(e.target.value)}
              placeholder="e.g. Full Stack Web Development, C/C++ Backend, Docker DevOps"
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-800/90 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              required
            />

            {/* Quick Presets */}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {quickGoalPresets.map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTargetGoal(preset)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer border ${
                    targetGoal.toLowerCase() === preset.toLowerCase()
                      ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500 font-bold'
                      : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-700/60'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Skill Level */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Current Skill Level</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Beginner', 'Intermediate', 'Advanced'] as const).map(lvl => {
                const isSelected = skillLevel === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSkillLevel(lvl)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border flex flex-col items-center gap-0.5 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                        : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    <span>{lvl}</span>
                    <span className={`text-[10px] font-normal ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
                      {lvl === 'Beginner' ? 'Foundations & Basics' : lvl === 'Intermediate' ? 'Practical Architecture' : 'Mastery & Scale'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Time Commitment */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Weekly Time Commitment</span>
              </label>
              <span className="text-xs font-black text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-2.5 py-0.5 rounded-full">
                {hoursPerWeek} hrs / week
              </span>
            </div>

            <div className="flex items-center gap-2">
              {[5, 10, 15, 20, 30].map(h => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHoursPerWeek(h)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    hoursPerWeek === h
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                      : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-700'
                  }`}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>

          {/* Section 5: Preferred Learning Format */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Preferred Learning Format</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  id: 'Project-First',
                  title: 'Project-First',
                  desc: 'Build real applications, sandboxes & repos',
                  icon: Briefcase
                },
                {
                  id: 'Video Tutorials',
                  title: 'Video Tutorials',
                  desc: 'Curated deep dives (>20 mins) & masterclasses',
                  icon: BookOpen
                },
                {
                  id: 'Fast-Track Certification',
                  title: 'Fast-Track',
                  desc: 'Rapid milestones & system deliverables',
                  icon: Award
                }
              ].map(opt => {
                const isSelected = preferredLearningFormat === opt.id;
                const Icon = opt.icon;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setPreferredLearningFormat(opt.id as any)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/40'
                        : 'bg-slate-800/50 hover:bg-slate-800/80 border-slate-700/80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <p className="text-xs font-bold text-white">{opt.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{opt.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Multi-stage Progress Status Banner */}
          {isGeneratingMasterPlan && (
            <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-800/80 text-xs text-indigo-200 animate-pulse">
              <div className="flex items-center gap-2 mb-1.5 font-bold">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                <span>Unified AI Orchestration Chain Reaction Active</span>
              </div>
              <p className="text-[11px] text-indigo-300 font-mono">
                {generationStage || 'Synthesizing roadmap with Ollama...'}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsRecalibrateModalOpen(false)}
              disabled={isGeneratingMasterPlan}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isGeneratingMasterPlan || !targetGoal.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-rose-500 hover:from-indigo-500 hover:to-rose-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isGeneratingMasterPlan ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating Master Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>Save & Generate Master Plan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
