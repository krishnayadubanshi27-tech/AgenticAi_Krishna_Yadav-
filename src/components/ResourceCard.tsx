import React from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  CheckCircle2, 
  Bookmark, 
  Clock, 
  Sparkles, 
  AlertTriangle,
  FileText,
  Code,
  Video,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { ResourceItem, ResourceType } from '../types/learning';
import { useLearning } from '../context/LearningContext';

interface ResourceCardProps {
  resource: ResourceItem;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  const { 
    toggleCompleteResource, 
    toggleBookmarkResource, 
    toggleSaveCourse,
    savedCourses,
    setSelectedResourceForModal 
  } = useLearning();

  const isSaved = resource.bookmarked || savedCourses.some(c => c.id === resource.id);

  const getTypeIcon = (type: ResourceType) => {
    switch (type) {
      case 'video': return Video;
      case 'interactive': return Code;
      case 'article': return FileText;
      case 'quiz': return HelpCircle;
      default: return Code;
    }
  };

  const TypeIcon = getTypeIcon(resource.type);

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`group relative flex-none w-72 sm:w-80 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border transition-all duration-300 shadow-sm hover:shadow-xl ${
        resource.completed 
          ? 'border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-emerald-500/5' 
          : resource.isStruggleRemedy
          ? 'border-amber-200 dark:border-amber-800/80 shadow-amber-500/10'
          : 'border-slate-200/90 dark:border-slate-800 shadow-slate-200/50 dark:shadow-none hover:border-indigo-300 dark:hover:border-indigo-500/50'
      }`}
    >
      {/* Thumbnail Container */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-900 cursor-pointer" onClick={() => setSelectedResourceForModal(resource)}>
        <img
          src={resource.thumbnail}
          alt={resource.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {/* Match Score or AI Pick */}
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-emerald-400 text-[11px] font-bold border border-white/10">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>{resource.aiRank ? `AI Pick #${resource.aiRank}` : `${resource.matchScore}% Match`}</span>
          </div>

          <div className="flex items-center gap-1 pointer-events-auto">
            {/* Free vs Paid Badge */}
            {resource.badge && (
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase shadow-sm ${
                resource.badge === 'Free'
                  ? 'bg-emerald-600 text-white'
                  : resource.badge === 'Free Audit'
                  ? 'bg-sky-600 text-white'
                  : 'bg-indigo-600 text-white'
              }`}>
                {resource.badge}
              </span>
            )}

            {/* Live API Indicator */}
            {resource.isLive && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-red-600 to-rose-600 text-white text-[10px] font-bold shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Live
              </span>
            )}

            {/* Struggle Alert indicator */}
            {resource.isStruggleRemedy && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500 text-amber-950 text-[10px] font-extrabold uppercase shadow-sm">
                <AlertTriangle className="w-3 h-3" />
                Needs Review
              </span>
            )}

            {/* Completed Badge */}
            {resource.completed && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-bold shadow-sm">
                <CheckCircle2 className="w-3 h-3" />
                Done
              </span>
            )}
          </div>
        </div>

        {/* Center Hover Play Button (Streaming Style) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 backdrop-blur-sm transform scale-75 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-white translate-x-0.5" />
          </div>
        </div>

        {/* Bottom Thumbnail Bar */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs text-white/90 font-medium pointer-events-none">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[11px]">
            <TypeIcon className="w-3.5 h-3.5 text-indigo-300" />
            <span className="capitalize">{resource.type}</span>
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[11px]">
            <Clock className="w-3 h-3 text-slate-300" />
            <span>{resource.duration}</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col justify-between h-[175px]">
        <div>
          {/* Instructor & Provider Row */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
              {resource.instructor ? `By ${resource.instructor}` : resource.provider}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                {resource.difficulty}
              </span>
              {resource.rating && (
                <span className="text-[10px] px-1 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold border border-amber-200/60 dark:border-amber-800/60">
                  ★ {resource.rating}
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <h3 
            onClick={() => setSelectedResourceForModal(resource)}
            className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors leading-snug"
            title={resource.title}
          >
            {resource.title}
          </h3>

          {/* AI Rationale Snippet */}
          {resource.aiRationale && (
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium italic line-clamp-1 mt-1">
              💡 {resource.aiRationale}
            </p>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {/* Quick Complete Button */}
            <button
              onClick={() => toggleCompleteResource(resource.id)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                resource.completed
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
              title={resource.completed ? 'Mark incomplete' : 'Mark as complete to update skills'}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${resource.completed ? 'text-emerald-600 dark:text-emerald-400 fill-emerald-600 dark:fill-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
              <span>{resource.completed ? 'Done' : 'Complete'}</span>
            </button>

            {/* Bookmark / Save Course */}
            <button
              onClick={() => toggleSaveCourse(resource)}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                isSaved 
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title={isSaved ? 'Enrolled & Saved (Click to remove)' : 'Save & Enroll in Course'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-600 dark:fill-amber-400 text-amber-600 dark:text-amber-400' : ''}`} />
            </button>
          </div>

          {/* More details link or direct external link */}
          {resource.externalUrl ? (
            <a
              href={resource.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
            >
              <span>Launch</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <button
              onClick={() => setSelectedResourceForModal(resource)}
              className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
            >
              <span>Preview</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
