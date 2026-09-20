import React, { useState } from 'react';
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
  RefreshCw 
} from 'lucide-react';
import { useLearning } from '../context/LearningContext';
import { RoadmapQuestionnaireInputs } from '../types/learning';

export const RoadmapQuestionnaireModal: React.FC = () => {
  const { 
    isRoadmapModalOpen, 
    setIsRoadmapModalOpen, 
    generateCustomRoadmap, 
    isGeneratingDynamicRoadmap,
    ollamaStatus,
    dynamicRoadmap,
    userProfile
  } = useLearning();

  const [targetGoal, setTargetGoal] = useState(
    dynamicRoadmap?.targetGoal || userProfile.targetRole || 'Full Stack React 19 and Next.js'
  );
  const [currentLevel, setCurrentLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>(
    dynamicRoadmap?.currentLevel || 'Intermediate'
  );
  const [timeCommitment, setTimeCommitment] = useState(
    dynamicRoadmap?.timeCommitment || '10 hrs/week'
  );
  const [learningStyle, setLearningStyle] = useState(
    dynamicRoadmap?.learningStyle || 'Project-First'
  );

  if (!isRoadmapModalOpen) return null;

  const quickGoalPresets = [
    'Full Stack React 19 and Next.js',
    'Docker and Kubernetes DevOps',
    'Autonomous AI Agents and Python',
    'System Design and Distributed Systems',
    'FastAPI and Microservices Architecture'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetGoal.trim()) return;

    const inputs: RoadmapQuestionnaireInputs = {
      targetGoal: targetGoal.trim(),
      currentLevel,
      timeCommitment,
      learningStyle
    };

    await generateCustomRoadmap(inputs);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 text-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 sm:p-7 border-b border-slate-800/80 relative bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900">
          <button
            onClick={() => setIsRoadmapModalOpen(false)}
            disabled={isGeneratingDynamicRoadmap}
            className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Customize Your Learning Roadmap
              </h2>
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Ollama Engine: {ollamaStatus?.currentModel || 'phi4-mini:latest'}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Configure your technical goals below. Local Ollama will synthesize a personalized 4-milestone curriculum complete with tangible deliverables, micro-steps, and curated course links.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* 1. Target Goal / Skill Focus */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              1. Target Goal / Skill Focus
            </label>
            <div className="relative">
              <input
                type="text"
                value={targetGoal}
                onChange={e => setTargetGoal(e.target.value)}
                placeholder="e.g., Full Stack React 19 and Next.js, Docker and Kubernetes DevOps"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Quick preset chips */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] text-slate-400 font-semibold mr-1">Popular Goals:</span>
              {quickGoalPresets.map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTargetGoal(preset)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                    targetGoal === preset
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Current Level */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              2. Current Level
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(['Beginner', 'Intermediate', 'Advanced'] as const).map(lvl => {
                const isSelected = currentLevel === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setCurrentLevel(lvl)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500/50'
                        : 'bg-slate-800/50 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">{lvl}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      {lvl === 'Beginner' && 'Foundations and core syntax'}
                      {lvl === 'Intermediate' && 'Production patterns and APIs'}
                      {lvl === 'Advanced' && 'Architecture and scale'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Time Commitment */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              3. Weekly Time Commitment
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { hours: '5 hrs/week', tag: 'Casual Pace', desc: '~45 min/day' },
                { hours: '10 hrs/week', tag: 'Recommended', desc: '~1.5 hrs/day' },
                { hours: '20 hrs/week', tag: 'Intensive Track', desc: '~3 hrs/day' }
              ].map(opt => {
                const isSelected = timeCommitment === opt.hours;
                return (
                  <button
                    key={opt.hours}
                    type="button"
                    onClick={() => setTimeCommitment(opt.hours)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500/50'
                        : 'bg-slate-800/50 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">{opt.hours}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                    </div>
                    <span className="inline-block text-[10px] font-bold text-indigo-300 mb-0.5">
                      {opt.tag}
                    </span>
                    <p className="text-[11px] text-slate-400 leading-tight">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Learning Style */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              4. Preferred Learning Style
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { style: 'Project-First', icon: Briefcase, desc: 'Portfolio builds and sandboxes' },
                { style: 'Video Tutorials', icon: BookOpen, desc: 'Deep-dive lectures and demos' },
                { style: 'Fast-Track Certification', icon: Award, desc: 'Exam prep and key competencies' }
              ].map(opt => {
                const Icon = opt.icon;
                const isSelected = learningStyle === opt.style;
                return (
                  <button
                    key={opt.style}
                    type="button"
                    onClick={() => setLearningStyle(opt.style)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500/50'
                        : 'bg-slate-800/50 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Icon className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-xs font-bold leading-tight">{opt.style}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal Footer / Action Button */}
          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Synthesizes 4 custom milestones with deliverable checks</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsRoadmapModalOpen(false)}
                disabled={isGeneratingDynamicRoadmap}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isGeneratingDynamicRoadmap || !targetGoal.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isGeneratingDynamicRoadmap ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Ollama is Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4" />
                    <span>Generate Roadmap with Ollama</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
