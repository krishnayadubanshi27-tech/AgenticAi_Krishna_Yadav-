import React from 'react';
import { Play, CheckCircle2, Sparkles, Clock, Target, Info, Flame } from 'lucide-react';
import { useLearning } from '../context/LearningContext';
import { useAppStore } from '../store/useAppStore';

export const HeroBillboard: React.FC = () => {
  const { 
    userProfile, 
    resources, 
    toggleCompleteResource, 
    setSelectedResourceForModal,
    setActiveTab,
    sendChatMessage,
    pathVelocityPercent
  } = useLearning();

  const { objectivesRoadmap, userPreferences, savedCourses } = useAppStore();

  // Find the dynamically featured item:
  // Priority: 1. Top saved course, 2. First uncompleted roadmap milestone course/item, 3. Top uncompleted resource
  const firstUncompletedMilestone = objectivesRoadmap?.milestones?.find(m => !m.completed);

  const featuredResource = React.useMemo(() => {
    if (savedCourses.length > 0 && !savedCourses[0].completed) {
      return savedCourses[0];
    }
    if (firstUncompletedMilestone) {
      const topCourse = firstUncompletedMilestone.recommendedCourses?.[0];
      return {
        id: `milestone-hero-${firstUncompletedMilestone.id}`,
        title: firstUncompletedMilestone.title,
        category: firstUncompletedMilestone.milestoneTag,
        type: 'course' as const,
        duration: `${firstUncompletedMilestone.estimatedHours} hrs`,
        durationMinutes: firstUncompletedMilestone.estimatedHours * 60,
        rating: 4.95,
        matchScore: 99,
        thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
        tags: firstUncompletedMilestone.prerequisites || ['Modern Architecture', 'Production Ready'],
        completed: false,
        bookmarked: true,
        difficulty: userProfile.currentSkillLevel || 'Intermediate',
        provider: topCourse?.platform || 'Ollama AI Synthesized',
        description: `${firstUncompletedMilestone.description} Deliverable: ${firstUncompletedMilestone.deliverable}`,
        associatedSkillId: `skill-${firstUncompletedMilestone.id}`,
        keyTakeaways: firstUncompletedMilestone.microSteps || ['Core mental model', 'Hands-on practice', 'Production verification'],
        externalUrl: topCourse?.url
      };
    }

    const targetTrack = userPreferences.targetGoal || userProfile.careerGoal || userProfile.targetRole || 'Full-Stack Software Engineering';
    return {
      id: 'dynamic-career-hero',
      title: `${targetTrack} Masterclass & Core Architecture`,
      category: 'Primary Career Track',
      type: 'course' as const,
      duration: `${userPreferences.hoursPerWeek || 10} hrs/wk`,
      durationMinutes: (userPreferences.hoursPerWeek || 10) * 60,
      rating: 4.95,
      matchScore: 99,
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&auto=format&fit=crop&q=80',
      tags: [targetTrack, userPreferences.skillLevel || userProfile.currentSkillLevel || 'Intermediate', 'Production Ready'],
      completed: false,
      bookmarked: true,
      difficulty: userPreferences.skillLevel || userProfile.currentSkillLevel || 'Intermediate',
      provider: 'Ollama AI Synthesized',
      description: `Targeted curriculum tailored specifically to accelerate your career as a ${targetTrack}.`,
      associatedSkillId: 'skill-primary-career-track',
      keyTakeaways: [
        `Core architectural patterns for ${targetTrack}`,
        'Hands-on deliverables solving real-world skill gaps',
        'Direct alignment with hiring expectations'
      ]
    };
  }, [savedCourses, firstUncompletedMilestone, userPreferences, userProfile]);

  const isCompleted = featuredResource.completed;

  return (
    <div className="relative rounded-3xl overflow-hidden border border-indigo-100/80 dark:border-slate-800 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-xl shadow-indigo-950/10 mb-8">
      {/* Background Graphic Ambient Glow & Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent z-10" />
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105 transition-transform duration-1000"
        style={{ backgroundImage: `url(${featuredResource.thumbnail})` }}
      />
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-20 p-6 sm:p-8 lg:p-12 max-w-4xl">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2.5 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold tracking-wide backdrop-blur-md">
            <Flame className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
            <span>{featuredResource.matchScore}% Target Match</span>
          </div>

          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/25 text-indigo-200 border border-indigo-400/30 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Active Learning Priority</span>
          </div>

          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-medium backdrop-blur-md">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{featuredResource.duration}</span>
          </div>

          <span className="text-xs px-2.5 py-1 rounded-md bg-white/15 text-slate-200 font-semibold uppercase tracking-wider">
            {featuredResource.difficulty}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-3 leading-tight">
          {featuredResource.title}
        </h1>

        {/* Description */}
        <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed mb-5">
          {featuredResource.description}
        </p>

        {/* AI Agent Real-Time Rationale Box */}
        <div className="mb-6 p-3.5 sm:p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md max-w-2xl">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/30 text-indigo-300 shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wider mb-0.5">
                AI Diagnostic Pacing Rationale
              </p>
              <p className="text-xs sm:text-sm text-slate-200 leading-snug">
                Paced for <span className="text-white font-semibold">{userProfile.name}</span>'s goal of{' '}
                <span className="text-emerald-400 font-bold">{userProfile.careerGoal || userProfile.targetRole}</span>. 
                Current path velocity is <span className="text-indigo-300 font-semibold">{pathVelocityPercent}%</span> at{' '}
                <span className="text-white font-semibold">{userProfile.hoursPerWeek || 10} hrs/week</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setSelectedResourceForModal(featuredResource)}
            className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-white text-slate-900 font-bold text-sm shadow-lg shadow-white/10 hover:bg-indigo-50 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <Play className="w-4 h-4 fill-slate-900 text-slate-900" />
            <span>{isCompleted ? 'Review Lesson' : 'Start Mission'}</span>
          </button>

          <button
            onClick={() => toggleCompleteResource(featuredResource.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm border backdrop-blur-md transition-all duration-200 ${
              isCompleted
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 hover:bg-emerald-500/30'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'text-emerald-400 fill-emerald-400' : 'text-slate-300'}`} />
            <span>{isCompleted ? 'Completed ✓' : 'Mark as Done'}</span>
          </button>

          <button
            onClick={() => setSelectedResourceForModal(featuredResource)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-transparent hover:bg-white/10 text-slate-300 hover:text-white text-sm font-semibold transition-colors"
          >
            <Info className="w-4 h-4" />
            <span>Details & Key Notes</span>
          </button>

          <button
            onClick={() => {
              sendChatMessage('Why is React 19 recommended as my top priority right now?');
            }}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-3 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-400/20 text-xs font-semibold transition-all"
          >
            <Target className="w-3.5 h-3.5" />
            <span>Ask AI Tutor</span>
          </button>
        </div>
      </div>
    </div>
  );
};
