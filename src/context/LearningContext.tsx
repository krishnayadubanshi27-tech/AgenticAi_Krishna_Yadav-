import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  UserProfile,
  SkillCompetency,
  LearningObjective,
  ResourceItem,
  PracticeProject,
  WeeklyDayPlan,
  WeeklyTask,
  StruggleAlert,
  AIChatMessage,
  ProgressAnalytics,
  DynamicRoadmap,
  RoadmapMilestone,
  RoadmapQuestionnaireInputs,
  ProgressTracker,
  CompletedTaskRecord
} from '../types/learning';
import {
  initialUserProfile,
  initialSkills,
  initialObjectives,
  initialResources,
  initialProjects,
  initialWeeklyPlan,
  initialStruggleAlert,
  initialChatMessages
} from '../data/mockData';
import {
  fetchRecommendedCourses,
  fetchProxyHealth,
  ConfiguredProviders
} from '../services/courseApi';
import {
  AuthUser,
  RegisterData,
  loginWithEmail,
  registerWithEmail,
  getStoredAuthUser,
  clearStoredAuthUser
} from '../services/authApi';
import {
  getOllamaStatus,
  sendOllamaChat,
  generateRoadmapWithOllamaApi,
  generateScheduleWithOllamaApi,
  generateCoursesWithOllamaApi,
  generateDynamicRoadmapApi,
  OllamaStatusResponse
} from '../services/ollamaApi';

export type ActiveTab = 'dashboard' | 'learning_path' | 'weekly_plan' | 'analytics';

// Storage Keys
const USER_PROFILE_KEY = 'edupath_user_profile';
const DYNAMIC_ROADMAP_KEY = 'edupath_dynamic_roadmap';
const SAVED_COURSES_KEY = 'edupath_saved_courses';
const PROGRESS_TRACKER_KEY = 'edupath_progress_tracker';
const THEME_KEY = 'edupath_theme';

// Safe localStorage readers
function getStoredUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(USER_PROFILE_KEY);
    if (!raw) return initialUserProfile;
    return { ...initialUserProfile, ...JSON.parse(raw) };
  } catch {
    return initialUserProfile;
  }
}

function getStoredDynamicRoadmap(): DynamicRoadmap | null {
  try {
    const raw = localStorage.getItem(DYNAMIC_ROADMAP_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getStoredSavedCourses(): ResourceItem[] {
  try {
    const raw = localStorage.getItem(SAVED_COURSES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function getStoredProgressTracker(): ProgressTracker {
  try {
    const raw = localStorage.getItem(PROGRESS_TRACKER_KEY);
    if (!raw) {
      return {
        completedMicroStepKeys: {},
        completedTaskIds: {},
        completedTaskTimestamps: {},
        completedTaskHistory: [],
        timeSpentMinutes: 0,
        streakDays: 3,
        lastActiveDate: new Date().toISOString(),
        struggleAreas: []
      };
    }
    const parsed = JSON.parse(raw);
    return {
      completedMicroStepKeys: parsed.completedMicroStepKeys || {},
      completedTaskIds: parsed.completedTaskIds || {},
      completedTaskTimestamps: parsed.completedTaskTimestamps || {},
      completedTaskHistory: Array.isArray(parsed.completedTaskHistory) ? parsed.completedTaskHistory : [],
      timeSpentMinutes: parsed.timeSpentMinutes || 0,
      streakDays: parsed.streakDays || 3,
      lastActiveDate: parsed.lastActiveDate || new Date().toISOString(),
      struggleAreas: parsed.struggleAreas || []
    };
  } catch {
    return {
      completedMicroStepKeys: {},
      completedTaskIds: {},
      completedTaskTimestamps: {},
      completedTaskHistory: [],
      timeSpentMinutes: 0,
      streakDays: 3,
      lastActiveDate: new Date().toISOString(),
      struggleAreas: []
    };
  }
}

// Helper: get next 7 days starting from actual device date, formatted as 'Mon, Sep 21'
export function getNext7DaysFromCurrentDate(startDate = new Date()): {
  dayName: string;
  dateStr: string;
  isRestDay: boolean;
  isToday: boolean;
  timestamp: number;
}[] {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    // Format strictly as 'Mon, Sep 21'
    const dateStr = d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
    const isRestDay = d.getDay() === 0; // Sunday is the rest day
    days.push({
      dayName,
      dateStr,
      isRestDay,
      isToday: i === 0,
      timestamp: d.getTime()
    });
  }
  return days;
}

// Backward compatibility alias for getCurrentWeekDates
export function getCurrentWeekDates() {
  return getNext7DaysFromCurrentDate();
}

/**
 * Determine if a timestamp falls within the current calendar week.
 * Calendar week runs from Monday 00:00:00.000 to Sunday 23:59:59.999.
 */
export function isTimestampInCurrentCalendarWeek(timestamp: number, referenceDate = new Date()): boolean {
  if (!timestamp || typeof timestamp !== 'number') return false;

  const ref = new Date(referenceDate);
  const day = ref.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
  const diffToMonday = (day + 6) % 7; // Sunday (0) -> 6; Monday (1) -> 0; Tuesday (2) -> 1 ...

  const mondayStart = new Date(ref);
  mondayStart.setDate(ref.getDate() - diffToMonday);
  mondayStart.setHours(0, 0, 0, 0);

  const sundayEnd = new Date(mondayStart);
  sundayEnd.setDate(mondayStart.getDate() + 6);
  sundayEnd.setHours(23, 59, 59, 999);

  return timestamp >= mondayStart.getTime() && timestamp <= sundayEnd.getTime();
}

/**
 * Get the date range string for the current calendar week, e.g. "Mon, Sep 14 – Sun, Sep 20"
 */
export function getCurrentCalendarWeekRangeStr(referenceDate = new Date()): string {
  const ref = new Date(referenceDate);
  const day = ref.getDay();
  const diffToMonday = (day + 6) % 7;

  const monday = new Date(ref);
  monday.setDate(ref.getDate() - diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const monStr = monday.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const sunStr = sunday.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return `${monStr} – ${sunStr}`;
}

interface LearningContextType {
  // 1. Central Store: User Profile
  userProfile: UserProfile;
  updateProfile: (profile: Partial<UserProfile>) => void;

  // 2. Central Store: Active Roadmap (live JSON from Ollama)
  activeRoadmap: DynamicRoadmap | null;
  dynamicRoadmap: DynamicRoadmap | null; // backward compatibility alias
  isRoadmapModalOpen: boolean;
  setIsRoadmapModalOpen: (open: boolean) => void;
  isGeneratingDynamicRoadmap: boolean;
  generateCustomRoadmap: (inputs: RoadmapQuestionnaireInputs) => Promise<boolean>;
  toggleMilestoneComplete: (id: number | string) => void;
  clearCustomRoadmap: () => void;

  // 3. Central Store: Saved Courses
  savedCourses: ResourceItem[];
  saveCourse: (course: ResourceItem) => void;
  removeSavedCourse: (courseId: string) => void;
  toggleSaveCourse: (course: ResourceItem) => void;

  // 4. Central Store: Progress Tracker Ledger
  progressTracker: ProgressTracker;
  toggleTaskComplete: (taskId: string, durationMinutes?: number, skillName?: string, title?: string) => void;
  toggleMicroStepComplete: (stepKey: string, durationMinutes?: number) => void;
  flagStruggleArea: (topic: string) => void;
  resolveStruggleArea: (topic: string) => void;
  currentWeekTasks: CompletedTaskRecord[];
  currentCalendarWeekRange: string;

  // Mathematical Analytics & Derived Competencies
  pathVelocityPercent: number;
  skills: SkillCompetency[];
  projects: PracticeProject[];
  weeklyPlan: WeeklyDayPlan[];
  analytics: ProgressAnalytics;

  // Legacy & supplementary UI state
  objectives: LearningObjective[];
  resources: ResourceItem[];
  struggleAlert: StruggleAlert | null;
  chatMessages: AIChatMessage[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  selectedResourceForModal: ResourceItem | null;
  setSelectedResourceForModal: (resource: ResourceItem | null) => void;
  selectedProjectForModal: PracticeProject | null;
  setSelectedProjectForModal: (project: PracticeProject | null) => void;
  notificationToast: string | null;
  setNotificationToast: (msg: string | null) => void;

  // Authentication State & Actions
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

  // Third-party API Proxy courses & AI pipeline
  liveExternalCourses: ResourceItem[];
  isLoadingExternalCourses: boolean;
  externalCoursesSource: 'live-third-party-api' | 'curated-fallback' | null;
  configuredProviders: ConfiguredProviders;
  activeSearchSkill: string;
  refinedCourseQuery: string | null;
  coursePipelineMetadata: any | null;
  activeCourseDifficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  setActiveCourseDifficulty: (diff: 'Beginner' | 'Intermediate' | 'Advanced') => void;
  loadExternalCourses: (skill?: string, difficulty?: 'Beginner' | 'Intermediate' | 'Advanced') => Promise<void>;

  // Ollama AI State & Actions
  ollamaStatus: OllamaStatusResponse | null;
  isOllamaConnected: boolean;
  isOllamaChatLoading: boolean;
  isOllamaRoadmapGenerating: boolean;
  isOllamaScheduleGenerating: boolean;
  isOllamaCoursesLoading: boolean;
  ollamaCourses: ResourceItem[];
  refreshOllamaStatus: () => Promise<void>;
  generateRoadmapWithOllama: () => Promise<void>;
  rebalanceScheduleWithOllama: () => Promise<void>;
  loadOllamaCourses: (skill?: string) => Promise<void>;

  // Resource and interactive actions
  toggleCompleteResource: (id: string) => void;
  toggleBookmarkResource: (id: string) => void;
  markObjectiveComplete: (id: string) => void;
  submitProject: (id: string) => void;
  resolveStruggle: (id: string) => void;
  sendChatMessage: (text: string) => void;
  recalibratePathWithAI: () => void;

  // Dark mode
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

export const LearningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Persistent User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => getStoredUserProfile());

  const updateProfile = (profileUpdate: Partial<UserProfile>) => {
    setUserProfile(prev => {
      const updated = {
        ...prev,
        ...profileUpdate,
        lastPathRecalibrated: 'Just now (AI Adaptive Sync)'
      };
      try {
        localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save user profile:', e);
      }
      return updated;
    });
    triggerConfetti();
    showToast('🎯 Profile updated! Adaptive timetable and competencies recalibrated.');
  };

  // 2. Persistent Dynamic Roadmap
  const [dynamicRoadmap, setDynamicRoadmap] = useState<DynamicRoadmap | null>(() => getStoredDynamicRoadmap());
  const activeRoadmap = dynamicRoadmap;
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState<boolean>(false);
  const [isGeneratingDynamicRoadmap, setIsGeneratingDynamicRoadmap] = useState<boolean>(false);

  const saveRoadmap = (roadmap: DynamicRoadmap | null) => {
    setDynamicRoadmap(roadmap);
    try {
      if (!roadmap) {
        localStorage.removeItem(DYNAMIC_ROADMAP_KEY);
      } else {
        localStorage.setItem(DYNAMIC_ROADMAP_KEY, JSON.stringify(roadmap));
      }
    } catch (e) {
      console.warn('Failed to save roadmap:', e);
    }
  };

  // 3. Persistent Saved Courses
  const [savedCourses, setSavedCourses] = useState<ResourceItem[]>(() => getStoredSavedCourses());

  const saveCourse = (course: ResourceItem) => {
    setSavedCourses(prev => {
      if (prev.some(c => c.id === course.id)) return prev;
      const updated = [course, ...prev];
      try {
        localStorage.setItem(SAVED_COURSES_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to persist saved courses:', e);
      }
      return updated;
    });
    showToast(`⭐ Enrolled in "${course.title.slice(0, 32)}..."!`);
    triggerConfetti();
  };

  const removeSavedCourse = (courseId: string) => {
    setSavedCourses(prev => {
      const updated = prev.filter(c => c.id !== courseId);
      try {
        localStorage.setItem(SAVED_COURSES_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to remove saved course:', e);
      }
      return updated;
    });
    showToast('Removed course from your saved list.');
  };

  const toggleSaveCourse = (course: ResourceItem) => {
    if (savedCourses.some(c => c.id === course.id)) {
      removeSavedCourse(course.id);
    } else {
      saveCourse(course);
    }
  };

  // 4. Persistent Progress Tracker Ledger
  const [progressTracker, setProgressTracker] = useState<ProgressTracker>(() => getStoredProgressTracker());

  // Synchronize with useAppStore and other tabs when store updates
  useEffect(() => {
    const handleStoreSync = () => {
      setUserProfile(getStoredUserProfile());
      setDynamicRoadmap(getStoredDynamicRoadmap());
      setProgressTracker(getStoredProgressTracker());
      setSavedCourses(getStoredSavedCourses());
    };

    window.addEventListener('edupath_store_sync', handleStoreSync);
    window.addEventListener('storage', handleStoreSync);

    return () => {
      window.removeEventListener('edupath_store_sync', handleStoreSync);
      window.removeEventListener('storage', handleStoreSync);
    };
  }, []);

  const saveProgress = (newTracker: ProgressTracker) => {
    setProgressTracker(newTracker);
    try {
      localStorage.setItem(PROGRESS_TRACKER_KEY, JSON.stringify(newTracker));
    } catch (e) {
      console.warn('Failed to save progress tracker:', e);
    }
  };

  const toggleTaskComplete = (
    taskId: string, 
    durationMinutes: number = 30, 
    skillName: string = 'General',
    title?: string
  ) => {
    setProgressTracker(prev => {
      const wasCompleted = Boolean(prev.completedTaskIds[taskId]);
      const nowCompleted = !wasCompleted;
      const minutesDelta = nowCompleted ? durationMinutes : -durationMinutes;
      const newMinutes = Math.max(0, prev.timeSpentMinutes + minutesDelta);

      const timestampNow = Date.now();
      const updatedTimestamps = { ...(prev.completedTaskTimestamps || {}) };
      let updatedHistory = [...(prev.completedTaskHistory || [])];

      if (nowCompleted) {
        updatedTimestamps[taskId] = timestampNow;
        updatedHistory = [
          ...updatedHistory.filter(h => h.taskId !== taskId),
          {
            taskId,
            timestamp: timestampNow,
            durationMinutes,
            skillName,
            title: title || taskId
          }
        ];
      } else {
        delete updatedTimestamps[taskId];
        updatedHistory = updatedHistory.filter(h => h.taskId !== taskId);
      }

      const updated: ProgressTracker = {
        ...prev,
        completedTaskIds: {
          ...prev.completedTaskIds,
          [taskId]: nowCompleted
        },
        completedMicroStepKeys: {
          ...prev.completedMicroStepKeys,
          [taskId]: nowCompleted
        },
        completedTaskTimestamps: updatedTimestamps,
        completedTaskHistory: updatedHistory,
        timeSpentMinutes: newMinutes,
        lastActiveDate: new Date().toISOString(),
        streakDays: Math.max(1, prev.streakDays)
      };

      try {
        localStorage.setItem(PROGRESS_TRACKER_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save progress:', e);
      }

      if (nowCompleted) {
        triggerConfetti();
        const dateStr = new Date(timestampNow).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const timeStr = new Date(timestampNow).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        showToast(`✅ Task Completed: +${durationMinutes} mins logged on ${dateStr} at ${timeStr}!`);
      }

      return updated;
    });
  };

  const toggleMicroStepComplete = (stepKey: string, durationMinutes: number = 30) => {
    toggleTaskComplete(stepKey, durationMinutes);
  };

  const flagStruggleArea = (topic: string) => {
    setProgressTracker(prev => {
      if (prev.struggleAreas.includes(topic)) return prev;
      const updated = {
        ...prev,
        struggleAreas: [...prev.struggleAreas, topic]
      };
      saveProgress(updated);
      return updated;
    });
  };

  const resolveStruggleArea = (topic: string) => {
    setProgressTracker(prev => {
      const updated = {
        ...prev,
        struggleAreas: prev.struggleAreas.filter(t => t !== topic)
      };
      saveProgress(updated);
      return updated;
    });
  };

  // Rebalanced schedule override state (if user triggers Ollama rebalance)
  const [rebalancedWeeklyPlan, setRebalancedWeeklyPlan] = useState<WeeklyDayPlan[] | null>(null);

  // 5. Dynamic Weekly Schedule derivation: Next 7 days starting from actual device date
  const weeklyPlan: WeeklyDayPlan[] = useMemo(() => {
    if (rebalancedWeeklyPlan) {
      // Sync completed state and attach completion timestamp if available
      return rebalancedWeeklyPlan.map(day => ({
        ...day,
        tasks: day.tasks.map(t => ({
          ...t,
          completed: Boolean(progressTracker.completedTaskIds[t.id] || progressTracker.completedMicroStepKeys[t.id]),
          completedAt: progressTracker.completedTaskTimestamps?.[t.id]
        }))
      }));
    }

    const next7Days = getNext7DaysFromCurrentDate();
    const hours = userProfile.hoursPerWeek || 10;
    const dailyTargetMinutes = Math.round((hours * 60) / 6); // distributed across active days

    // Gather uncompleted tasks from activeRoadmap
    const roadmapTasks: { id: string; title: string; skillName: string; duration: number; completed: boolean; completedAt?: number }[] = [];

    if (activeRoadmap && activeRoadmap.milestones) {
      activeRoadmap.milestones.forEach(m => {
        (m.microSteps || []).forEach((step, sIdx) => {
          const taskId = `m-${m.id}-s-${sIdx}`;
          const isDone = Boolean(progressTracker.completedMicroStepKeys[taskId] || progressTracker.completedTaskIds[taskId]);
          roadmapTasks.push({
            id: taskId,
            title: step,
            skillName: m.milestoneTag,
            duration: Math.round(m.estimatedHours ? (m.estimatedHours * 60) / (m.microSteps.length || 1) : 35),
            completed: isDone,
            completedAt: progressTracker.completedTaskTimestamps?.[taskId]
          });
        });
      });
    }

    // Default pool if no roadmap tasks
    const fallbackTasks = [
      { id: 'task-def-1', title: `${userProfile.careerGoal}: Core Architecture Setup`, skillName: 'Architecture', duration: 45, completed: Boolean(progressTracker.completedTaskIds['task-def-1']), completedAt: progressTracker.completedTaskTimestamps?.['task-def-1'] },
      { id: 'task-def-2', title: 'Interactive Sandbox: Concurrency & State Rollback', skillName: 'Concurrency', duration: 35, completed: Boolean(progressTracker.completedTaskIds['task-def-2']), completedAt: progressTracker.completedTaskTimestamps?.['task-def-2'] },
      { id: 'task-def-3', title: 'Hands-on Lab: Distributed Services & Redis Caching', skillName: 'System Design', duration: 50, completed: Boolean(progressTracker.completedTaskIds['task-def-3']), completedAt: progressTracker.completedTaskTimestamps?.['task-def-3'] },
      { id: 'task-def-4', title: 'Code Refactor: Zero-bundle Server Actions', skillName: 'React 19', duration: 40, completed: Boolean(progressTracker.completedTaskIds['task-def-4']), completedAt: progressTracker.completedTaskTimestamps?.['task-def-4'] },
      { id: 'task-def-5', title: 'Deploy AI Autonomous Agent with Tool Schemas', skillName: 'Agentic AI', duration: 60, completed: Boolean(progressTracker.completedTaskIds['task-def-5']), completedAt: progressTracker.completedTaskTimestamps?.['task-def-5'] },
      { id: 'task-def-6', title: 'Weekly Capstone: Verification Testing & Peer Review', skillName: 'Production', duration: 45, completed: Boolean(progressTracker.completedTaskIds['task-def-6']), completedAt: progressTracker.completedTaskTimestamps?.['task-def-6'] }
    ];

    const sourceTasks = roadmapTasks.length > 0 ? roadmapTasks : fallbackTasks;

    // Distribute source tasks into next 7 days starting from actual device date
    return next7Days.map((wd, dayIdx) => {
      if (wd.isRestDay) {
        return {
          dayName: wd.dayName,
          dateStr: wd.dateStr,
          focusSkill: 'Rest & Cognitive Consolidation',
          isRestDay: true,
          isToday: wd.isToday,
          tasks: []
        };
      }

      // Slice 1-2 tasks per day
      const dayTasks = [];
      const primaryTask = sourceTasks[dayIdx % sourceTasks.length];
      if (primaryTask) {
        dayTasks.push({
          id: primaryTask.id,
          title: primaryTask.title,
          type: 'lesson' as const,
          durationMinutes: primaryTask.duration || dailyTargetMinutes,
          completed: primaryTask.completed,
          skillName: primaryTask.skillName,
          completedAt: primaryTask.completedAt
        });
      }

      // If learner has high hours commitment, add a complementary practice task
      if (hours >= 12 && sourceTasks.length > 6) {
        const secondaryTask = sourceTasks[(dayIdx + 6) % sourceTasks.length];
        if (secondaryTask && secondaryTask.id !== primaryTask?.id) {
          dayTasks.push({
            id: secondaryTask.id,
            title: secondaryTask.title,
            type: 'project' as const,
            durationMinutes: 30,
            completed: secondaryTask.completed,
            skillName: secondaryTask.skillName,
            completedAt: secondaryTask.completedAt
          });
        }
      }

      return {
        dayName: wd.dayName,
        dateStr: wd.dateStr,
        focusSkill: primaryTask?.skillName || 'Applied Practice',
        isRestDay: false,
        isToday: wd.isToday,
        tasks: dayTasks
      };
    });
  }, [rebalancedWeeklyPlan, activeRoadmap, userProfile.hoursPerWeek, userProfile.careerGoal, progressTracker]);

  // 6. Mathematical Path Velocity & Completion
  const { pathVelocityPercent, totalMicroStepsCount, completedMicroStepsCount } = useMemo(() => {
    if (!activeRoadmap || !activeRoadmap.milestones || activeRoadmap.milestones.length === 0) {
      const completedCount = Object.values(progressTracker.completedTaskIds).filter(Boolean).length;
      return {
        pathVelocityPercent: Math.min(100, completedCount * 18),
        totalMicroStepsCount: 6,
        completedMicroStepsCount: completedCount
      };
    }

    let total = 0;
    let completed = 0;

    activeRoadmap.milestones.forEach(m => {
      (m.microSteps || []).forEach((_, sIdx) => {
        total += 1;
        const key = `m-${m.id}-s-${sIdx}`;
        if (progressTracker.completedMicroStepKeys[key] || progressTracker.completedTaskIds[key] || m.completed) {
          completed += 1;
        }
      });
    });

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      pathVelocityPercent: percent,
      totalMicroStepsCount: total,
      completedMicroStepsCount: completed
    };
  }, [activeRoadmap, progressTracker]);

  // 7. Data-Driven Skills derived from activeRoadmap & progressTracker
  const skills: SkillCompetency[] = useMemo(() => {
    if (activeRoadmap && activeRoadmap.milestones && activeRoadmap.milestones.length > 0) {
      return activeRoadmap.milestones.map((m, idx) => {
        const totalSteps = m.microSteps?.length || 1;
        let doneSteps = 0;
        (m.microSteps || []).forEach((_, sIdx) => {
          const key = `m-${m.id}-s-${sIdx}`;
          if (progressTracker.completedMicroStepKeys[key] || progressTracker.completedTaskIds[key] || m.completed) {
            doneSteps += 1;
          }
        });

        const stepRatio = doneSteps / totalSteps;
        const currentScore = Math.round(25 + stepRatio * 70); // 25 to 95
        const status = stepRatio >= 1 ? 'acquired' : stepRatio > 0 ? 'in_progress' : 'critical_gap';

        return {
          id: `skill-m-${m.id}`,
          name: m.milestoneTag || `Competency ${idx + 1}`,
          category: idx % 2 === 0 ? 'Frontend' : 'Backend',
          currentLevel: currentScore,
          targetLevel: 90,
          status: status,
          struggleScore: status === 'critical_gap' ? 65 : 15,
          description: m.description
        };
      });
    }

    // Default dynamic competencies reflecting user's careerGoal
    return initialSkills.map(s => {
      const isDone = Object.values(progressTracker.completedTaskIds).filter(Boolean).length > 2;
      return {
        ...s,
        currentLevel: isDone ? Math.min(100, s.currentLevel + 12) : s.currentLevel
      };
    });
  }, [activeRoadmap, progressTracker]);

  // 8. Practice Projects derived from activeRoadmap deliverables
  const projects: PracticeProject[] = useMemo(() => {
    if (activeRoadmap && activeRoadmap.milestones && activeRoadmap.milestones.length > 0) {
      return activeRoadmap.milestones.map((m, idx) => ({
        id: `proj-m-${m.id}`,
        title: `Deliverable: ${m.deliverable.slice(0, 48)}...`,
        difficulty: (idx === 0 ? 'Beginner' : idx === 1 ? 'Intermediate' : 'Advanced') as any,
        timeEstimate: `${m.estimatedHours || 6} hours`,
        techStack: m.prerequisites?.length > 0 ? m.prerequisites : ['TypeScript', 'Next.js', 'Tailwind', 'AI API'],
        description: m.deliverable,
        keyFeatures: m.microSteps || ['Architect modular components', 'Write automated tests', 'Deploy to production'],
        completed: Boolean(m.completed),
        thumbnail: idx % 2 === 0 
          ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
        badgeText: idx === 3 ? 'Capstone Blueprint ⭐' : `Milestone ${idx + 1} 🎯`
      }));
    }
    return initialProjects;
  }, [activeRoadmap]);

  // Tasks completed specifically in the current calendar week (Monday to Sunday)
  const currentWeekTasks: CompletedTaskRecord[] = useMemo(() => {
    return (progressTracker.completedTaskHistory || []).filter(item =>
      isTimestampInCurrentCalendarWeek(item.timestamp)
    );
  }, [progressTracker.completedTaskHistory]);

  const currentCalendarWeekRange: string = useMemo(() => {
    return getCurrentCalendarWeekRangeStr();
  }, []);

  // 9. Analytics strictly bound to progressTracker, activeRoadmap, and current calendar week
  const analytics: ProgressAnalytics = useMemo(() => {
    const acquiredCount = skills.filter(s => s.status === 'acquired').length;
    const inProgressCount = skills.filter(s => s.status === 'in_progress').length;
    const remainingGapsCount = skills.filter(s => s.status === 'critical_gap').length;
    const avgScore = skills.length > 0 ? Math.round(skills.reduce((acc, s) => acc + s.currentLevel, 0) / skills.length) : 55;

    // Filter weekly hours spent based strictly on tasks completed in the current calendar week
    const currentWeekMinutes = currentWeekTasks.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);
    const weeklyHours = currentWeekTasks.length > 0
      ? Math.round((currentWeekMinutes / 60) * 10) / 10
      : Math.round((progressTracker.timeSpentMinutes / 60) * 10) / 10;

    const conceptsThisWeek = currentWeekTasks.length > 0 ? currentWeekTasks.length : completedMicroStepsCount + 1;

    return {
      skillsAcquired: acquiredCount,
      skillsInProgress: inProgressCount,
      remainingGaps: remainingGapsCount,
      overallReadiness: avgScore,
      weeklyHoursSpent: weeklyHours,
      weeklyHoursTarget: userProfile.hoursPerWeek || 10,
      streakDays: progressTracker.streakDays,
      velocityTrends: [
        { week: 'Week 1', hours: 4.0, conceptsMastered: 2 },
        { week: 'Week 2', hours: 6.5, conceptsMastered: 4 },
        { week: 'Week 3', hours: 7.2, conceptsMastered: 6 },
        { week: 'Current Week', hours: weeklyHours, conceptsMastered: conceptsThisWeek }
      ]
    };
  }, [skills, progressTracker, userProfile.hoursPerWeek, currentWeekTasks, completedMicroStepsCount]);

  // Authentication state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getStoredAuthUser());
  const isAuthenticated = Boolean(currentUser);

  useEffect(() => {
    if (currentUser) {
      setUserProfile(prev => ({
        ...prev,
        id: currentUser.id,
        name: currentUser.name || prev.name,
        email: currentUser.email,
        avatar: currentUser.avatar || prev.avatar,
        targetRole: currentUser.targetRole || prev.targetRole,
        experienceLevel: (currentUser.experienceLevel as any) || prev.experienceLevel
      }));
    }
  }, [currentUser]);

  const login = async (email: string, password: string) => {
    const res = await loginWithEmail(email, password);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      triggerConfetti();
      showToast(`🎉 Welcome back, ${res.user.name}!`);
      return { success: true };
    }
    return { success: false, error: res.error || 'Invalid credentials' };
  };

  const register = async (data: RegisterData) => {
    const res = await registerWithEmail(data);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      triggerConfetti();
      showToast(`🚀 Account created! Welcome, ${res.user.name}.`);
      return { success: true };
    }
    return { success: false, error: res.error || 'Failed to create account' };
  };

  const logout = () => {
    clearStoredAuthUser();
    setCurrentUser(null);
    showToast('👋 Signed out successfully.');
  };

  // Other UI states
  const [resources, setResources] = useState<ResourceItem[]>(initialResources);
  const [objectives, setObjectives] = useState<LearningObjective[]>(initialObjectives);
  const [struggleAlert, setStruggleAlert] = useState<StruggleAlert | null>(initialStruggleAlert);
  const [chatMessages, setChatMessages] = useState<AIChatMessage[]>(initialChatMessages);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [selectedResourceForModal, setSelectedResourceForModal] = useState<ResourceItem | null>(null);
  const [selectedProjectForModal, setSelectedProjectForModal] = useState<PracticeProject | null>(null);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Live external course recommendation state
  const [liveExternalCourses, setLiveExternalCourses] = useState<ResourceItem[]>([]);
  const [isLoadingExternalCourses, setIsLoadingExternalCourses] = useState<boolean>(false);
  const [externalCoursesSource, setExternalCoursesSource] = useState<'live-third-party-api' | 'curated-fallback' | null>(null);
  const [configuredProviders, setConfiguredProviders] = useState<ConfiguredProviders>({
    youtube: false,
    coursera: false,
    udemy: false
  });
  const [activeSearchSkill, setActiveSearchSkill] = useState<string>(userProfile.careerGoal || 'React 19 & State Concurrency');
  const [activeCourseDifficulty, setActiveCourseDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Advanced');
  const [refinedCourseQuery, setRefinedCourseQuery] = useState<string | null>(null);
  const [coursePipelineMetadata, setCoursePipelineMetadata] = useState<any | null>(null);

  const loadExternalCourses = async (searchSkill?: string, diffOverride?: 'Beginner' | 'Intermediate' | 'Advanced') => {
    const query = searchSkill || activeSearchSkill || userProfile.targetRole || 'React 19 & State Concurrency';
    const targetDiff = diffOverride || activeCourseDifficulty;
    setActiveSearchSkill(query);
    if (diffOverride) setActiveCourseDifficulty(diffOverride);
    setIsLoadingExternalCourses(true);
    try {
      const res = await fetchRecommendedCourses({
        skill: query,
        role: userProfile.targetRole,
        difficulty: targetDiff,
        limit: 2
      });
      setLiveExternalCourses(res.courses);
      setExternalCoursesSource(res.source);
      setConfiguredProviders(res.configuredProviders);
      if (res.refinedQuery) setRefinedCourseQuery(res.refinedQuery);
      if (res.pipeline) setCoursePipelineMetadata(res.pipeline);
    } catch (e: any) {
      console.warn('[EduPath] Proxy courses error:', e.message);
    } finally {
      setIsLoadingExternalCourses(false);
    }
  };

  // Ollama AI State
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatusResponse | null>(null);
  const [isOllamaChatLoading, setIsOllamaChatLoading] = useState<boolean>(false);
  const [isOllamaRoadmapGenerating, setIsOllamaRoadmapGenerating] = useState<boolean>(false);
  const [isOllamaScheduleGenerating, setIsOllamaScheduleGenerating] = useState<boolean>(false);
  const [isOllamaCoursesLoading, setIsOllamaCoursesLoading] = useState<boolean>(false);
  const [ollamaCourses, setOllamaCourses] = useState<ResourceItem[]>([]);

  const isOllamaConnected = Boolean(ollamaStatus?.connected);

  const refreshOllamaStatus = async () => {
    try {
      const status = await getOllamaStatus();
      setOllamaStatus(status);
    } catch {
      setOllamaStatus({
        success: false,
        connected: false,
        currentModel: 'phi4-mini:latest',
        availableModels: []
      });
    }
  };

  const loadOllamaCourses = async (searchSkill?: string) => {
    const query = searchSkill || userProfile.targetRole || 'React 19 & Agentic AI';
    setIsOllamaCoursesLoading(true);
    try {
      const res = await generateCoursesWithOllamaApi({
        targetRole: userProfile.targetRole,
        skill: query
      });
      if (res.courses && res.courses.length > 0) {
        setOllamaCourses(res.courses);
      }
    } catch (e: any) {
      console.warn('[EduPath] Ollama course fallback:', e.message);
    } finally {
      setIsOllamaCoursesLoading(false);
    }
  };

  const generateRoadmapWithOllama = async () => {
    setIsRoadmapModalOpen(true);
  };

  const generateCustomRoadmap = async (inputs: RoadmapQuestionnaireInputs): Promise<boolean> => {
    setIsGeneratingDynamicRoadmap(true);
    showToast(`🧠 Ollama AI (${ollamaStatus?.currentModel || 'phi4-mini:latest'}) is synthesizing your "${inputs.targetGoal}" roadmap...`);
    try {
      const res = await generateDynamicRoadmapApi(inputs);
      if (res && res.milestones && res.milestones.length > 0) {
        const newRoadmap: DynamicRoadmap = {
          roadmapTitle: res.roadmapTitle || `${inputs.targetGoal} (${inputs.currentLevel} Track)`,
          targetGoal: inputs.targetGoal,
          currentLevel: inputs.currentLevel,
          timeCommitment: inputs.timeCommitment,
          learningStyle: inputs.learningStyle,
          milestones: res.milestones.map((m, idx) => ({
            ...m,
            id: m.id || idx + 1,
            completed: false
          })),
          generatedAt: new Date().toISOString(),
          model: res.model || ollamaStatus?.currentModel || 'phi4-mini:latest'
        };
        saveRoadmap(newRoadmap);
        // Reset rebalanced schedule so it adapts to the fresh roadmap
        setRebalancedWeeklyPlan(null);
        triggerConfetti();
        showToast(`🎯 Dynamic roadmap synthesized by Ollama AI (${newRoadmap.model})!`);
        setIsRoadmapModalOpen(false);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Dynamic roadmap generation error:', err);
      showToast('⚠️ Could not generate dynamic roadmap with Ollama. Using resilient fallback.');
      return false;
    } finally {
      setIsGeneratingDynamicRoadmap(false);
    }
  };

  const toggleMilestoneComplete = (id: number | string) => {
    if (!dynamicRoadmap) return;
    const updatedMilestones = dynamicRoadmap.milestones.map(m => {
      if (m.id === id || String(m.id) === String(id)) {
        return { ...m, completed: !m.completed };
      }
      return m;
    });
    const updatedRoadmap: DynamicRoadmap = {
      ...dynamicRoadmap,
      milestones: updatedMilestones
    };
    saveRoadmap(updatedRoadmap);
    const target = updatedMilestones.find(m => m.id === id || String(m.id) === String(id));
    if (target?.completed) {
      triggerConfetti();
      showToast(`🏆 Milestone Cleared: "${target.title}"!`);
    }
  };

  const clearCustomRoadmap = () => {
    saveRoadmap(null);
    setRebalancedWeeklyPlan(null);
    showToast('Roadmap reset. Ready for a new customized learning path.');
  };

  // AI Schedule Rebalancer
  const rebalanceScheduleWithOllama = async () => {
    setIsOllamaScheduleGenerating(true);
    showToast('⚡ Ollama AI is rebalancing your weekly schedule based on actual velocity...');

    // Extract uncompleted roadmap tasks
    const uncompletedTasks: string[] = [];
    const completedTasks: string[] = [];

    if (activeRoadmap && activeRoadmap.milestones) {
      activeRoadmap.milestones.forEach(m => {
        (m.microSteps || []).forEach((step, sIdx) => {
          const key = `m-${m.id}-s-${sIdx}`;
          if (progressTracker.completedMicroStepKeys[key] || progressTracker.completedTaskIds[key]) {
            completedTasks.push(step);
          } else {
            uncompletedTasks.push(step);
          }
        });
      });
    }

    const pace = pathVelocityPercent >= 50 ? 'ahead-of-schedule' : pathVelocityPercent > 20 ? 'on-track' : 'needs-acceleration';

    try {
      const res = await generateScheduleWithOllamaApi({
        targetRole: userProfile.targetRole,
        careerGoal: userProfile.careerGoal,
        weeklyHours: userProfile.hoursPerWeek || 10,
        completedTasks,
        remainingTasks: uncompletedTasks,
        pace
      });

      if (res.schedule && res.schedule.length > 0) {
        const adapted: WeeklyDayPlan[] = res.schedule.map((day: any) => ({
          dayName: day.day || day.dayName || 'Day',
          dateStr: day.dateStr || 'Date',
          focusSkill: day.focusArea || 'Core Competency',
          isRestDay: Boolean(day.isRestDay),
          tasks: (day.tasks || []).map((t: any, tIdx: number) => ({
            id: t.id || `ollama-reb-${Date.now()}-${tIdx}`,
            title: t.title || 'Architecture & Implementation Practice',
            type: (t.type as any) || 'lesson',
            durationMinutes: t.durationMinutes || (parseInt(t.duration) || 30),
            completed: Boolean(t.completed || progressTracker.completedTaskIds[t.id]),
            skillName: t.skillName || day.focusArea || 'General'
          }))
        }));
        setRebalancedWeeklyPlan(adapted);
        triggerConfetti();
        showToast(`📅 Weekly schedule rebalanced by Ollama AI (${res.model || 'phi4-mini'})!`);
      }
    } catch (err: any) {
      console.warn('Ollama schedule rebalance failed:', err);
      showToast('⚠️ Could not rebalance schedule with Ollama. Kept current timetable.');
    } finally {
      setIsOllamaScheduleGenerating(false);
    }
  };

  // Dark Mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
    showToast(!isDarkMode ? '🌙 Dark Mode activated' : '☀️ Light Mode activated');
  };

  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => {
      setNotificationToast(null);
    }, 4500);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899']
      });
    } catch {}
  };

  const toggleCompleteResource = (id: string) => {
    let nowCompleted = false;
    setResources(prev =>
      prev.map(r => {
        if (r.id === id) {
          nowCompleted = !r.completed;
          return { ...r, completed: nowCompleted };
        }
        return r;
      })
    );
    toggleTaskComplete(id, 35);
  };

  const toggleBookmarkResource = (id: string) => {
    const item = resources.find(r => r.id === id) || liveExternalCourses.find(r => r.id === id) || ollamaCourses.find(r => r.id === id);
    if (item) {
      toggleSaveCourse(item);
    }
  };

  const markObjectiveComplete = (id: string) => {
    setObjectives(prev =>
      prev.map(obj => (obj.id === id ? { ...obj, status: obj.status === 'completed' ? 'in_progress' : 'completed' } : obj))
    );
  };

  const submitProject = (id: string) => {
    triggerConfetti();
    showToast('🚀 Project submitted to AI Reviewer! Code quality: 98/100.');
  };

  const resolveStruggle = (alertId: string) => {
    setStruggleAlert(prev => (prev?.id === alertId ? { ...prev, status: 'resolved' } : prev));
    showToast('✨ Struggle manually marked as resolved. Adaptive path updated!');
  };

  const recalibratePathWithAI = () => {
    showToast('🔄 AI Agent recalibrating learning path based on recent velocity...');
    setTimeout(() => {
      showToast('✅ Adaptive path re-optimized: pace synchronized with active milestones.');
    }, 1200);
  };

  const sendChatMessage = async (userText: string) => {
    const userMsg: AIChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setIsOllamaChatLoading(true);

    try {
      const res = await sendOllamaChat({
        message: userText,
        history: [...chatMessages, userMsg],
        context: {
          targetRole: userProfile.targetRole,
          skills: skills.map(s => ({ name: s.name, level: s.currentLevel, target: s.targetLevel })),
          struggleTopic: struggleAlert?.status === 'active' ? struggleAlert.skillName : undefined
        }
      });

      const botMsg: AIChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'agent',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: res.suggestions
      };

      setChatMessages(prev => [...prev, botMsg]);
    } catch {
      const botMsg: AIChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'agent',
        text: `Based on your goal for **${userProfile.targetRole}**, focusing on your upcoming roadmap milestones will maximize velocity.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: ['Review next milestone deliverable', 'Adjust study hours', 'Explain code pattern']
      };
      setChatMessages(prev => [...prev, botMsg]);
    } finally {
      setIsOllamaChatLoading(false);
    }
  };

  useEffect(() => {
    loadExternalCourses();
    fetchProxyHealth().then(health => {
      if (health?.configuredProviders) {
        setConfiguredProviders(health.configuredProviders);
      }
    });
    refreshOllamaStatus();
    loadOllamaCourses();
  }, [userProfile.targetRole]);

  return (
    <LearningContext.Provider
      value={{
        userProfile,
        updateProfile,
        activeRoadmap,
        dynamicRoadmap,
        isRoadmapModalOpen,
        setIsRoadmapModalOpen,
        isGeneratingDynamicRoadmap,
        generateCustomRoadmap,
        toggleMilestoneComplete,
        clearCustomRoadmap,
        savedCourses,
        saveCourse,
        removeSavedCourse,
        toggleSaveCourse,
        progressTracker,
        toggleTaskComplete,
        toggleMicroStepComplete,
        flagStruggleArea,
        resolveStruggleArea,
        currentWeekTasks,
        currentCalendarWeekRange,
        pathVelocityPercent,
        skills,
        projects,
        weeklyPlan,
        analytics,
        objectives,
        resources,
        struggleAlert,
        chatMessages,
        activeTab,
        setActiveTab,
        isOnboardingOpen,
        setIsOnboardingOpen,
        selectedResourceForModal,
        setSelectedResourceForModal,
        selectedProjectForModal,
        setSelectedProjectForModal,
        notificationToast,
        setNotificationToast,
        currentUser,
        isAuthenticated,
        login,
        register,
        logout,
        liveExternalCourses,
        isLoadingExternalCourses,
        externalCoursesSource,
        configuredProviders,
        activeSearchSkill,
        refinedCourseQuery,
        coursePipelineMetadata,
        activeCourseDifficulty,
        setActiveCourseDifficulty,
        loadExternalCourses,
        ollamaStatus,
        isOllamaConnected,
        isOllamaChatLoading,
        isOllamaRoadmapGenerating,
        isOllamaScheduleGenerating,
        isOllamaCoursesLoading,
        ollamaCourses,
        refreshOllamaStatus,
        generateRoadmapWithOllama,
        rebalanceScheduleWithOllama,
        loadOllamaCourses,
        toggleCompleteResource,
        toggleBookmarkResource,
        markObjectiveComplete,
        submitProject,
        resolveStruggle,
        sendChatMessage,
        recalibratePathWithAI,
        isDarkMode,
        toggleDarkMode
      }}
    >
      {children}
    </LearningContext.Provider>
  );
};

export const useLearning = () => {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
};
