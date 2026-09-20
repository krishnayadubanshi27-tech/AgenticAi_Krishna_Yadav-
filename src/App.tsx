import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  RefreshCw, 
  Bot 
} from 'lucide-react';
import { useLearning } from './context/LearningContext';
import { useAppStore } from './store/useAppStore';
import { Navbar } from './components/Navbar';
import { HeroBillboard } from './components/HeroBillboard';
import { StruggleAlertBanner } from './components/StruggleAlertBanner';
import { SkillGapDashboard } from './components/SkillGapDashboard';
import { StructuredObjectives } from './components/StructuredObjectives';
import { ResourceCarousel } from './components/ResourceCarousel';
import { PracticeProjectsCarousel } from './components/PracticeProjectsCarousel';
import { WeeklyPlanTimeline } from './components/WeeklyPlanTimeline';
import { ProgressReportsModal } from './components/ProgressReportsModal';
import { RecalibrateModal } from './components/RecalibrateModal';
import { ResourceDetailModal } from './components/ResourceDetailModal';
import { AIChatDrawer } from './components/AIChatDrawer';
import { LoginPage } from './components/LoginPage';

export const App: React.FC = () => {
  const { 
    isAuthenticated,
    activeTab, 
    userProfile, 
    notificationToast, 
    setNotificationToast,
    liveExternalCourses,
    isLoadingExternalCourses,
    configuredProviders,
    activeSearchSkill,
    loadExternalCourses,
    externalCoursesSource,
    refinedCourseQuery,
    coursePipelineMetadata,
    activeCourseDifficulty,
    setActiveCourseDifficulty,
    ollamaCourses,
    isOllamaCoursesLoading,
    loadOllamaCourses,
    ollamaStatus,
    isOllamaConnected,
    savedCourses
  } = useLearning();

  const {
    objectivesRoadmap,
    userPreferences,
    recommendedCourses,
    setIsRecalibrateModalOpen,
    notificationToast: storeToast,
    setNotificationToast: setStoreToast
  } = useAppStore();

  const activeGoal = userPreferences.targetGoal || userProfile.careerGoal || userProfile.targetRole || 'Full-Stack Development';
  const [searchQuery, setSearchQuery] = useState(activeSearchSkill || activeGoal);
  const [courseFilterTab, setCourseFilterTab] = useState<'all' | 'ollama' | 'live'>('all');

  const isCoursesLoading = isLoadingExternalCourses || isOllamaCoursesLoading;

  const handleSynthesizeAndFetch = (skillToFetch?: string, diffToFetch?: 'Beginner' | 'Intermediate' | 'Advanced') => {
    const q = (skillToFetch !== undefined ? skillToFetch : searchQuery).trim() || activeSearchSkill || activeGoal;
    const diff = diffToFetch || activeCourseDifficulty;
    loadExternalCourses(q, diff);
    loadOllamaCourses(q);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSynthesizeAndFetch();
  };

  const combinedCurriculumCourses = React.useMemo(() => {
    const storeCourses = recommendedCourses || [];
    if (courseFilterTab === 'ollama') return ollamaCourses;
    if (courseFilterTab === 'live') return [...storeCourses, ...liveExternalCourses];
    return [...storeCourses, ...ollamaCourses, ...liveExternalCourses];
  }, [courseFilterTab, recommendedCourses, ollamaCourses, liveExternalCourses]);

  // Authentication Gate: Require Login / Account Creation
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const activeToast = notificationToast || storeToast;
  const dismissToast = () => {
    if (notificationToast) setNotificationToast(null);
    if (storeToast) setStoreToast(null);
  };

  const isRoadmapEmpty = !objectivesRoadmap || objectivesRoadmap.milestones.length === 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-24 transition-colors duration-300">
      {/* Top Navbar */}
      <Navbar />

      {/* Floating Global Adaptive Toast */}
      {activeToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900 text-white shadow-xl text-xs font-semibold border border-slate-700 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{activeToast}</span>
            <button
              onClick={dismissToast}
              className="ml-2 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* VIEW 1: DASHBOARD & STREAMING ROWS */}
        {activeTab === 'dashboard' && (
          <div>
            {isRoadmapEmpty ? (
              <div className="py-14 px-6 text-center rounded-3xl bg-white dark:bg-slate-900/60 border border-dashed border-indigo-200 dark:border-indigo-900/60 shadow-sm flex flex-col items-center justify-center my-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-3">
                  <Bot className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1.5">
                  Welcome, {userPreferences.name || 'Krishna Yadav'}!
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mb-5 leading-relaxed">
                  No active learning plan found for <span className="font-bold text-slate-800 dark:text-slate-200">"{userPreferences.targetGoal}"</span>. Open the Master Recalibrate modal to synthesize your roadmap, course stream, and weekly schedule with Ollama AI.
                </p>
                <button
                  onClick={() => setIsRecalibrateModalOpen(true)}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>Recalibrate & Generate Master Plan</span>
                </button>
              </div>
            ) : (
              <>
                {/* Struggle Alert Banner (Dynamic friction detection) */}
                <StruggleAlertBanner />

                {/* Netflix/Hotstar Style Hero Billboard */}
                <HeroBillboard />

                {/* Visual Skill Gap Dashboard (Recharts Radar & Bar) */}
                <SkillGapDashboard />
              </>
            )}

            {/* Streaming Carousels Section */}
            <div className="space-y-4">
              {/* UNIFIED: Ollama AI Synthesized Curriculum & Courses (Integrated with Live Third-Party Proxy) */}
              <div className="pt-4 pb-2">
                <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-indigo-900/10 via-purple-900/10 to-slate-900/10 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-slate-900/40 border border-indigo-200/80 dark:border-indigo-800/60 shadow-sm mb-4">
                  {/* Master Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-rose-500 flex items-center justify-center text-white shadow-xs">
                          <Bot className="w-4 h-4" />
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                          Ollama AI Synthesized Curriculum & Courses
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 text-[10px] font-extrabold uppercase border border-indigo-200 dark:border-indigo-800">
                          Ollama AI + Live Proxy
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Adaptive on-device curriculum synthesis (<code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px]">{ollamaStatus?.currentModel || 'phi4-mini:latest'}</code>) integrated with live verified video and course streams (YouTube Data API v3, Coursera, Udemy) with strict quality filtering and gap-targeted reranking.
                      </p>
                    </div>

                    {/* Telemetry & Provider Status Pills */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                        <span className={`w-2 h-2 rounded-full ${isOllamaConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                        <span className="text-slate-700 dark:text-slate-300">Ollama: {ollamaStatus?.currentModel || 'phi4-mini'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                        <span className={`w-2 h-2 rounded-full ${configuredProviders.youtube ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                        <span className="text-slate-700 dark:text-slate-300">YouTube {configuredProviders.youtube ? 'Live API' : 'Fallback'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                        <span className={`w-2 h-2 rounded-full ${configuredProviders.coursera ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                        <span className="text-slate-700 dark:text-slate-300">Coursera {configuredProviders.coursera ? 'Active' : 'Catalog'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                        <span className={`w-2 h-2 rounded-full ${configuredProviders.udemy ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                        <span className="text-slate-700 dark:text-slate-300">Udemy {configuredProviders.udemy ? 'Active' : 'Fallback'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Query Bar & Difficulty Pills */}
                  <form onSubmit={handleSearchSubmit} className="mt-4 flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search any skill or concept (e.g. React 19, LangChain, Docker, System Design)..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Difficulty Level Selector */}
                    <div className="flex items-center gap-1 bg-white/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                      {(['Beginner', 'Intermediate', 'Advanced'] as const).map(level => {
                        const isSelected = activeCourseDifficulty === level;
                        return (
                          <button
                            key={level}
                            type="button"
                            onClick={() => {
                              setActiveCourseDifficulty(level);
                              handleSynthesizeAndFetch(searchQuery.trim() || activeSearchSkill, level);
                            }}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            {level}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="submit"
                      disabled={isCoursesLoading}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isCoursesLoading ? 'animate-spin' : ''}`} />
                      <span>{isCoursesLoading ? 'Synthesizing & Fetching...' : 'Synthesize & Fetch Courses'}</span>
                    </button>
                  </form>

                  {/* Quick Preset Tags */}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mr-1">
                      Quick queries:
                    </span>
                    {['React 19 & State', 'Autonomous AI Agents', 'System Design & Redis', 'FastAPI & Python', 'Docker & Kubernetes'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setSearchQuery(tag);
                          handleSynthesizeAndFetch(tag, activeCourseDifficulty);
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/60 dark:border-slate-700 transition-colors cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  {/* AI Refinement & Strict Filters Banner */}
                  <div className="mt-3.5 p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-indigo-100 dark:border-indigo-900/60 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-indigo-950 dark:text-indigo-200">
                            AI Refined Query:
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] font-bold border border-indigo-200/80 dark:border-indigo-800 shadow-xs">
                            {refinedCourseQuery || `"${searchQuery || activeSearchSkill} ${activeCourseDifficulty} 2026"`}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Strict filters: &gt;20m (no shorts) • &lt;3 yrs recent • ★ ≥ 4.3 • Free/audit prioritized
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        AI Quality Reranked: Top 2 Selected
                      </span>
                    </div>
                  </div>

                  {/* Segmented View Tabs */}
                  <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-1 bg-white/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => setCourseFilterTab('all')}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          courseFilterTab === 'all'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                        }`}
                      >
                        All Integrated Courses ({ollamaCourses.length + liveExternalCourses.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setCourseFilterTab('ollama')}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          courseFilterTab === 'ollama'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                        }`}
                      >
                        Ollama AI Modules ({ollamaCourses.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setCourseFilterTab('live')}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          courseFilterTab === 'live'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                        }`}
                      >
                        Live Video Streams ({liveExternalCourses.length})
                      </button>
                    </div>

                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Showing {combinedCurriculumCourses.length} personalized courses
                    </span>
                  </div>
                </div>

                {/* Render Unified Courses Carousel */}
                {isCoursesLoading ? (
                  <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-3 text-xs text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
                    <span>Ollama ({ollamaStatus?.currentModel || 'phi4-mini'}) and backend proxy are synthesizing modules and querying YouTube Data API v3...</span>
                  </div>
                ) : (
                  <ResourceCarousel
                    title={`Ollama AI Synthesized Curriculum & Courses: "${activeSearchSkill}"`}
                    subtitle={
                      courseFilterTab === 'ollama'
                        ? `On-device AI curriculum modules tuned to eliminate skill gaps for ${userProfile.targetRole}`
                        : courseFilterTab === 'live'
                        ? refinedCourseQuery
                          ? `Live verified streams • Refined: "${refinedCourseQuery}" • Reranked for ${activeCourseDifficulty} level`
                          : `Live verified streams from YouTube Data API v3 & partner catalogs`
                        : `Unified stream: ${ollamaCourses.length} Ollama synthesized modules + ${liveExternalCourses.length} verified live video courses`
                    }
                    badge="Ollama AI + Live Proxy"
                    icon={Bot}
                    resources={combinedCurriculumCourses}
                  />
                )}
              </div>

              {/* Row 1.5: Enrolled & Saved Courses */}
              {savedCourses.length > 0 && (
                <ResourceCarousel
                  title="⭐ Your Enrolled & Saved Courses"
                  subtitle="Courses and video masterclasses you have saved and enrolled in"
                  badge={`${savedCourses.length} Enrolled`}
                  icon={Sparkles}
                  resources={savedCourses}
                />
              )}

              {/* Practice Tasks & Project Ideas Carousel */}
              <PracticeProjectsCarousel />
            </div>

            {/* Embedded Weekly Plan */}
            <WeeklyPlanTimeline />
          </div>
        )}

        {/* VIEW 2: OBJECTIVES ROADMAP */}
        {activeTab === 'learning_path' && (
          <div>
            <StructuredObjectives />
            <SkillGapDashboard />
            <PracticeProjectsCarousel />
          </div>
        )}

        {/* VIEW 3: WEEKLY PLAN TIMELINE */}
        {activeTab === 'weekly_plan' && (
          <div>
            <WeeklyPlanTimeline />
          </div>
        )}

        {/* VIEW 4: PROGRESS REPORTS & ANALYTICS */}
        {activeTab === 'analytics' && (
          <div>
            <ProgressReportsModal />
            <SkillGapDashboard />
          </div>
        )}
      </main>

      {/* Global Modals & Drawers */}
      <RecalibrateModal />
      <ResourceDetailModal />
      <AIChatDrawer />
    </div>
  );
};

export default App;
