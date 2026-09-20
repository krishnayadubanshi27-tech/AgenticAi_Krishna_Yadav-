import React from 'react';
import { 
  X, 
  Play, 
  CheckCircle2, 
  Bookmark, 
  Clock, 
  Sparkles, 
  AlertTriangle, 
  Code, 
  BookOpen, 
  ExternalLink,
  Target,
  FileCheck
} from 'lucide-react';
import { useLearning } from '../context/LearningContext';

export const ResourceDetailModal: React.FC = () => {
  const { 
    selectedResourceForModal, 
    setSelectedResourceForModal, 
    selectedProjectForModal,
    setSelectedProjectForModal,
    toggleCompleteResource, 
    toggleBookmarkResource,
    submitProject,
    sendChatMessage,
    userProfile 
  } = useLearning();

  if (!selectedResourceForModal && !selectedProjectForModal) return null;

  // Render Project Modal
  if (selectedProjectForModal) {
    const proj = selectedProjectForModal;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
          {/* Banner */}
          <div className="relative h-48 sm:h-56 bg-slate-900">
            <img
              src={proj.thumbnail}
              alt={proj.title}
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
            
            <button
              onClick={() => setSelectedProjectForModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="absolute bottom-4 left-6 right-6 text-white">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-xs font-bold">
                  {proj.badgeText}
                </span>
                <span className="px-2 py-0.5 rounded bg-white/20 text-slate-200 text-xs font-semibold">
                  {proj.difficulty}
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {proj.timeEstimate}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {proj.title}
              </h2>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            <div>
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Project Architecture Overview
              </h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {proj.description}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Tech Stack Specifications
              </h4>
              <div className="flex flex-wrap gap-2">
                {proj.techStack.map(tech => (
                  <span key={tech} className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Key Architectural Deliverables
              </h4>
              <div className="space-y-2">
                {proj.keyFeatures.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200">
                    <FileCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/70">
            <button
              onClick={() => {
                setSelectedProjectForModal(null);
                sendChatMessage(`Can you give me an implementation starter template for "${proj.title}"?`);
              }}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask AI Code Starter</span>
            </button>

            <button
              onClick={() => submitProject(proj.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                proj.completed 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{proj.completed ? 'Re-Submit to AI Code Reviewer' : 'Submit Project Code'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Resource Modal
  const res = selectedResourceForModal!;
  const isDone = res.completed;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Banner */}
        <div className="relative h-48 sm:h-60 bg-slate-900">
          <img
            src={res.thumbnail}
            alt={res.title}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
          
          <button
            onClick={() => setSelectedResourceForModal(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-bold">
                {res.matchScore}% Match
              </span>
              <span className="px-2 py-0.5 rounded bg-white/20 text-slate-200 text-xs font-semibold capitalize">
                {res.type}
              </span>
              <span className="text-xs text-slate-300 flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5" />
                {res.duration}
              </span>
              {res.isStruggleRemedy && (
                <span className="px-2 py-0.5 rounded bg-amber-500 text-amber-950 text-xs font-extrabold uppercase">
                  Remediation Lab
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {res.title}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          <div>
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Curriculum Overview
            </h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {res.description}
            </p>
          </div>

          {/* AI Diagnostic Context */}
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-950 dark:text-indigo-200">
              <p className="font-bold mb-0.5">Adaptive Learning Agent Diagnostic</p>
              <p className="leading-relaxed">
                This resource was placed in your path to accelerate your goal of becoming a <strong>{userProfile.targetRole}</strong>. 
                Completing this module will immediately adjust your competency scores and unlock the next milestone.
              </p>
            </div>
          </div>

          {/* Key Takeaways */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Key Skills & Takeaways
            </h4>
            <div className="space-y-2">
              {res.keyTakeaways.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {res.tags.map(tag => (
              <span key={tag} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/70">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleBookmarkResource(res.id)}
              className={`p-2.5 rounded-xl border text-xs font-semibold transition-colors ${
                res.bookmarked 
                  ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700' 
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${res.bookmarked ? 'fill-amber-600 text-amber-600' : ''}`} />
            </button>

            <button
              onClick={() => {
                setSelectedResourceForModal(null);
                sendChatMessage(`Can you give me a summary of "${res.title}" and explain why it's crucial for my role?`);
              }}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask AI Tutor</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                toggleCompleteResource(res.id);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isDone
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isDone ? 'Completed ✓ (Click to Undo)' : 'Mark as Completed'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
