export type ExperienceLevel = 'Beginner' | 'Junior (1-2 yrs)' | 'Mid-Level (3-5 yrs)' | 'Senior (5+ yrs)';

export interface UserProfile {
  id?: string;
  email?: string;
  name: string;
  avatar: string;
  targetRole: string;
  careerGoal: string;
  experienceLevel: ExperienceLevel;
  hoursPerWeek: number;
  currentSkillLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  targetDateMonths: number;
  uploadedFileName?: string;
  analyzedKeywords?: string[];
  lastPathRecalibrated?: string;
}

export interface SkillCompetency {
  id: string;
  name: string;
  category: 'Frontend' | 'Backend' | 'System Architecture' | 'State & Concurrency' | 'DevOps & CI/CD' | 'AI & LLM Integration';
  currentLevel: number; // 0 - 100
  targetLevel: number;  // 0 - 100
  status: 'acquired' | 'in_progress' | 'critical_gap';
  struggleScore: number; // 0 (no struggle) to 100 (high friction)
  description: string;
}

export interface LearningObjective {
  id: string;
  milestoneNumber: number;
  title: string;
  skillId: string;
  skillName: string;
  description: string;
  durationHours: number;
  prerequisites: string[];
  status: 'not_started' | 'in_progress' | 'completed';
  practicalOutcome: string;
  actionItems: string[];
}

export type ResourceType = 'video' | 'interactive' | 'article' | 'quiz' | 'lab' | 'course';

export interface ResourceItem {
  id: string;
  title: string;
  category: string;
  type: ResourceType;
  duration: string;
  durationMinutes: number;
  rating: number;
  matchScore: number; // e.g. 98%
  thumbnail: string;
  tags: string[];
  completed: boolean;
  bookmarked: boolean;
  isStruggleRemedy?: boolean;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels' | 'Senior';
  provider: string;
  providerType?: 'youtube' | 'coursera' | 'udemy' | 'internal';
  externalUrl?: string;
  isLive?: boolean;
  source?: 'live-third-party-api' | 'curated-fallback';
  description: string;
  associatedSkillId: string;
  keyTakeaways: string[];
  instructor?: string;
  badge?: 'Free' | 'Free Audit' | 'Paid' | string;
  directLink?: string;
  aiRationale?: string;
  aiRank?: number;
  aiReranked?: boolean;
}

export interface PracticeProject {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  timeEstimate: string;
  techStack: string[];
  description: string;
  keyFeatures: string[];
  completed: boolean;
  thumbnail: string;
  badgeText: string;
}

export interface WeeklyTask {
  id: string;
  title: string;
  type: 'lesson' | 'project' | 'quiz' | 'review';
  durationMinutes: number;
  completed: boolean;
  resourceId?: string;
  skillName: string;
  completedAt?: number;
}

export interface WeeklyDayPlan {
  dayName: string;
  dateStr: string;
  focusSkill: string;
  tasks: WeeklyTask[];
  isRestDay: boolean;
  isToday?: boolean;
}

export interface StruggleAlert {
  id: string;
  skillId: string;
  skillName: string;
  issueSummary: string;
  frictionReason: string;
  timeSpentMinutes: number;
  quizScore: number;
  status: 'active' | 'resolved';
  recommendedAction: string;
  remedyResourceIds: string[];
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  suggestions?: string[];
  highlightAction?: string;
}

export interface ProgressAnalytics {
  skillsAcquired: number;
  skillsInProgress: number;
  remainingGaps: number;
  overallReadiness: number;
  weeklyHoursSpent: number;
  weeklyHoursTarget: number;
  streakDays: number;
  velocityTrends: { week: string; hours: number; conceptsMastered: number }[];
}

export interface RoadmapRecommendedCourse {
  title: string;
  platform: string;
  type: 'Free' | 'Paid' | 'Free Audit' | string;
  url: string;
}

export interface RoadmapMilestone {
  id: number | string;
  milestoneTag: string;
  estimatedHours: number;
  title: string;
  description: string;
  deliverable: string;
  microSteps: string[];
  prerequisites: string[];
  recommendedCourses: RoadmapRecommendedCourse[];
  completed?: boolean;
}

export interface DynamicRoadmap {
  roadmapTitle: string;
  targetGoal: string;
  currentLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  timeCommitment: string;
  learningStyle: string;
  milestones: RoadmapMilestone[];
  generatedAt?: string;
  model?: string;
}

export interface RoadmapQuestionnaireInputs {
  targetGoal: string;
  currentLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  timeCommitment: string;
  learningStyle: string;
}

export interface CompletedTaskRecord {
  taskId: string;
  timestamp: number; // Date.now()
  durationMinutes: number;
  skillName?: string;
  title?: string;
}

export interface ProgressTracker {
  completedMicroStepKeys: Record<string, boolean>; // e.g. "m-1-s-0": true
  completedTaskIds: Record<string, boolean>; // e.g. "task-id": true
  completedTaskTimestamps: Record<string, number>; // taskId -> Date.now()
  completedTaskHistory: CompletedTaskRecord[];
  timeSpentMinutes: number;
  streakDays: number;
  lastActiveDate: string;
  struggleAreas: string[];
}

export interface ScheduleRebalancePayload {
  targetRole: string;
  careerGoal?: string;
  weeklyHours: number;
  completedTasks?: string[];
  remainingTasks?: string[];
  pace?: string;
}

