import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import confetti from 'canvas-confetti';
import {
  DynamicRoadmap,
  RoadmapMilestone,
  ResourceItem,
  WeeklyDayPlan,
  WeeklyTask,
  ProgressTracker,
  CompletedTaskRecord
} from '../types/learning';
import { generateDynamicRoadmapApi } from '../services/ollamaApi';
import { fetchRecommendedCourses } from '../services/courseApi';
import { getNext7DaysFromCurrentDate } from '../utils/dateUtils';
import { syncUserDataToSupabase } from '../utils/supabase/supabaseService';

export interface UserPreferences {
  name: string;
  targetGoal: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  hoursPerWeek: number;
  preferredLearningFormat: 'Project-First' | 'Video Tutorials' | 'Fast-Track Certification';
}

export interface AppState {
  // 1. Single Source of Truth: User Preferences
  userPreferences: UserPreferences;

  // 2. Modals and AI Generation State
  isRecalibrateModalOpen: boolean;
  isGeneratingMasterPlan: boolean;
  generationStage: string;
  notificationToast: string | null;

  // 3. Objectives Roadmap (Structured Dynamic Roadmap)
  objectivesRoadmap: DynamicRoadmap | null;

  // 4. Live & Curated Course Streams
  recommendedCourses: ResourceItem[];
  savedCourses: ResourceItem[];

  // 5. Weekly Schedule Timeline (7 Days from Current Date)
  weeklySchedule: WeeklyDayPlan[];
  selectedDayIdx: number;

  // 6. Progress Tracker Ledger
  progressTracker: ProgressTracker;

  // Actions
  setUserPreferences: (prefs: Partial<UserPreferences>) => void;
  setIsRecalibrateModalOpen: (open: boolean) => void;
  setSelectedDayIdx: (idx: number) => void;
  setNotificationToast: (msg: string | null) => void;

  // The Master Orchestrator Chain Reaction
  generateMasterPlan: (preferences: UserPreferences) => Promise<boolean>;

  // Milestone Mutations (with instant schedule recalculation)
  updateMilestone: (id: number | string, patch: Partial<RoadmapMilestone>) => void;
  deleteMilestone: (id: number | string) => void;
  toggleMilestoneComplete: (id: number | string) => void;

  // Task Mutations (with instant streak & date recalculation)
  toggleTaskComplete: (
    taskId: string,
    durationMinutes?: number,
    skillName?: string,
    title?: string
  ) => void;

  // Course Actions
  toggleSaveCourse: (course: ResourceItem) => void;

  // Schedule Utilities
  recalculateWeeklySchedule: () => void;
  clearRoadmap: () => void;
}

// Initial Clean State
const defaultPreferences: UserPreferences = {
  name: 'Krishna Yadav',
  targetGoal: 'Full Stack Web Development',
  skillLevel: 'Intermediate',
  hoursPerWeek: 10,
  preferredLearningFormat: 'Project-First'
};

const defaultProgressTracker: ProgressTracker = {
  completedMicroStepKeys: {},
  completedTaskIds: {},
  completedTaskTimestamps: {},
  completedTaskHistory: [],
  timeSpentMinutes: 0,
  streakDays: 3,
  lastActiveDate: new Date().toISOString(),
  struggleAreas: []
};

/**
 * Helper to keep local storage keys in sync across stores
 */
function syncToSharedStorage(
  preferences: UserPreferences,
  roadmap: DynamicRoadmap | null,
  progressTracker: ProgressTracker
) {
  try {
    localStorage.setItem(
      'edupath_user_profile',
      JSON.stringify({
        name: preferences.name,
        targetRole: preferences.targetGoal,
        careerGoal: preferences.targetGoal,
        skillLevel: preferences.skillLevel,
        hoursPerWeek: preferences.hoursPerWeek,
        lastPathRecalibrated: 'Just now (AI Adaptive Recalibration)'
      })
    );
    if (roadmap) {
      localStorage.setItem('edupath_dynamic_roadmap', JSON.stringify(roadmap));
    }
    localStorage.setItem('edupath_progress_tracker', JSON.stringify(progressTracker));
    window.dispatchEvent(new Event('edupath_store_sync'));
  } catch (e) {
    console.warn('[Store Sync Notice]:', e);
  }
}

/**
 * Client-Side Instant Topic-Aware Roadmap Synthesizer
 * Generates structured, high-fidelity milestones matching the learner's chosen track
 */
function createCourses(title: string, platform = 'YouTube', url = 'https://www.youtube.com') {
  return [
    { title, platform, type: 'Free', url },
    { title: `${title} - Architecture Lab`, platform: 'Coursera', type: 'Free Audit', url: 'https://www.coursera.org' }
  ];
}

export function synthesizeDynamicRoadmap(preferences: UserPreferences): DynamicRoadmap {
  const goal = preferences.targetGoal || 'Full Stack Web Development';
  const level = preferences.skillLevel || 'Intermediate';
  const hours = preferences.hoursPerWeek || 10;
  const format = preferences.preferredLearningFormat || 'Project-First';
  const lower = goal.toLowerCase();

  let milestones: RoadmapMilestone[] = [];

  if (lower.includes('c++') || lower.includes('c/') || lower.includes('embedded') || lower.includes('systems') || lower.includes('backend & systems')) {
    milestones = [
      {
        id: 1,
        milestoneTag: 'Memory & Pointers',
        estimatedHours: Math.round(hours * 1.2),
        title: `Modern C/C++ Primitives & Memory Management`,
        description: `Master stack vs heap dynamics, manual allocations, RAII, and smart pointers for memory-safe backend programming.`,
        deliverable: `Production-grade memory-safe custom allocator and circular buffer repository.`,
        microSteps: [
          `Master pointer arithmetic, memory layout, and stack vs heap allocation`,
          `Implement RAII, unique_ptr, and shared_ptr reference semantics`,
          `Conduct Valgrind and AddressSanitizer memory leak profiling`
        ],
        prerequisites: ['C Syntax Basics', 'Command Line & GCC/Clang'],
        recommendedCourses: createCourses('Modern C++ Programming (C++20/23)'),
        completed: false
      },
      {
        id: 2,
        milestoneTag: 'Concurrency & Threads',
        estimatedHours: Math.round(hours * 1.5),
        title: `Multithreading, Synchronization & Lock-Free Atomics`,
        description: `Eliminate data races, deadlocks, and thread contention with POSIX threads, mutexes, and atomic memory orders.`,
        deliverable: `Thread-safe concurrent work-stealing thread pool with benchmarks.`,
        microSteps: [
          `Implement worker thread pools with std::thread and condition_variable`,
          `Build lock-free single-producer single-consumer queues with std::atomic`,
          `Debug race conditions using ThreadSanitizer (TSan)`
        ],
        prerequisites: ['Pointers & RAII', 'OS Thread Fundamentals'],
        recommendedCourses: createCourses('C++ Concurrency in Action Deep Dive'),
        completed: false
      },
      {
        id: 3,
        milestoneTag: 'Network Sockets & I/O',
        estimatedHours: Math.round(hours * 1.6),
        title: `High-Throughput Socket Programming & Event Loops`,
        description: `Build non-blocking TCP network servers using epoll / kqueue with custom binary protocol parsing.`,
        deliverable: `Non-blocking TCP echo and key-value server serving 10k concurrent connections.`,
        microSteps: [
          `Create non-blocking POSIX socket listeners with edge-triggered epoll`,
          `Implement structured binary protocol serialization and zero-copy buffers`,
          `Benchmark server throughput and tail latency under heavy load`
        ],
        prerequisites: ['TCP/IP Fundamentals', 'File Descriptors'],
        recommendedCourses: createCourses('Linux System Programming & Network Sockets'),
        completed: false
      },
      {
        id: 4,
        milestoneTag: 'Systems Capstone',
        estimatedHours: Math.round(hours * 1.8),
        title: `Low-Latency Distributed Backend Service Capstone`,
        description: `Deploy a production-ready C++ microservice with memory-mapped storage, telemetry, and containerized CI/CD.`,
        deliverable: `Zero-copy distributed cache daemon with persistent WAL and automated test suite.`,
        microSteps: [
          `Implement write-ahead logging (WAL) with memory-mapped files (mmap)`,
          `Add high-resolution latency histograms and health monitoring metrics`,
          `Containerize service with multi-stage Docker build and CMake testing`
        ],
        prerequisites: ['Network Sockets', 'Concurrency'],
        recommendedCourses: createCourses('Advanced Systems Design & Low-Latency Architecture'),
        completed: false
      }
    ];
  } else if (lower.includes('docker') || lower.includes('kubernetes') || lower.includes('devops') || lower.includes('cloud')) {
    milestones = [
      {
        id: 1,
        milestoneTag: 'Docker Primitives',
        estimatedHours: Math.round(hours * 1.0),
        title: `Containerization Foundations & Docker Internals`,
        description: `Deep dive into Linux namespaces, cgroups, layered storage drivers, and multi-stage container optimization.`,
        deliverable: `Minimal, secure multi-stage containerized microservice repository.`,
        microSteps: [
          `Understand cgroups, namespaces, and union filesystems`,
          `Author minimal Alpine/distroless multi-stage Dockerfiles`,
          `Configure container networking, storage volumes, and non-root users`
        ],
        prerequisites: ['Linux Terminal', 'Git Basics'],
        recommendedCourses: createCourses('Docker Mastery: From Beginner to Production'),
        completed: false
      },
      {
        id: 2,
        milestoneTag: 'Compose & Networking',
        estimatedHours: Math.round(hours * 1.3),
        title: `Multi-Service Orchestration & Networking`,
        description: `Connect distributed web, database, and caching services with Docker Compose, health checks, and secrets.`,
        deliverable: `Full-stack multi-container application with automated health probes and volume backups.`,
        microSteps: [
          `Orchestrate web, PostgreSQL, and Redis containers in Docker Compose`,
          `Configure custom bridge networks, environment files, and secret mounts`,
          `Implement automated database health checks and restart policies`
        ],
        prerequisites: ['Docker Basics', 'Basic Database Knowledge'],
        recommendedCourses: createCourses('Docker Compose Microservices Architecture'),
        completed: false
      },
      {
        id: 3,
        milestoneTag: 'Kubernetes Clusters',
        estimatedHours: Math.round(hours * 1.6),
        title: `Kubernetes Architecture & Workload Deployment`,
        description: `Master Pods, Deployments, Services, Ingress, and Persistent Volume Claims in local Minikube / K3s clusters.`,
        deliverable: `Zero-downtime rolling update deployment manifests on Kubernetes.`,
        microSteps: [
          `Deploy Pods, ReplicaSets, and Deployments with rolling update strategies`,
          `Configure ClusterIP, NodePort, and Ingress routing rules`,
          `Manage ConfigMaps, encrypted Secrets, and PersistentVolumeClaims (PVC)`
        ],
        prerequisites: ['Docker Containerization', 'YAML & Networking'],
        recommendedCourses: createCourses('Kubernetes for Developers Deep Dive'),
        completed: false
      },
      {
        id: 4,
        milestoneTag: 'GitOps & CI/CD',
        estimatedHours: Math.round(hours * 1.8),
        title: `Production DevOps: Helm, CI/CD & Cluster Observability`,
        description: `Automate deployments with GitHub Actions, Helm packaging, and real-time Prometheus/Grafana telemetry.`,
        deliverable: `End-to-end GitOps CI/CD pipeline deploying Helm charts with observability dashboards.`,
        microSteps: [
          `Package Kubernetes manifests into parameterized Helm charts`,
          `Build automated GitHub Actions pipeline with vulnerability scanning`,
          `Deploy Prometheus operator and Grafana dashboards for cluster monitoring`
        ],
        prerequisites: ['Kubernetes Manifests', 'CI/CD Pipelines'],
        recommendedCourses: createCourses('GitOps & Kubernetes Production Engineering'),
        completed: false
      }
    ];
  } else if (lower.includes('agent') || lower.includes('ai') || lower.includes('python') || lower.includes('llm')) {
    milestones = [
      {
        id: 1,
        milestoneTag: 'Agent Architecture',
        estimatedHours: Math.round(hours * 1.2),
        title: `Agentic Loops & Tool Schema Calling`,
        description: `Build ReAct reasoning loops, deterministic tool invocation, and JSON schema validation with local LLMs.`,
        deliverable: `Autonomous CLI assistant with verified tool execution sandbox.`,
        microSteps: [
          `Implement ReAct (Reasoning + Acting) decision cycle with prompt engineering`,
          `Define strict tool schemas with Pydantic / Zod and parse tool calls`,
          `Handle loop breaker limits and execution error recovery`
        ],
        prerequisites: ['Python / TypeScript Basics', 'API Fundamentals'],
        recommendedCourses: createCourses('Building Autonomous AI Agents from Scratch'),
        completed: false
      },
      {
        id: 2,
        milestoneTag: 'RAG & Vector Memory',
        estimatedHours: Math.round(hours * 1.5),
        title: `Vector Embeddings & Semantic Retrieval (RAG)`,
        description: `Index documentation, code repositories, and unstructured data into vector databases with hybrid search.`,
        deliverable: `Semantic knowledge assistant with citation tracking and hybrid reranking.`,
        microSteps: [
          `Chunk text and generate dense vector embeddings`,
          `Store and query embeddings in Chroma / pgvector with cosine similarity`,
          `Implement hybrid keyword + semantic search with reciprocal rank fusion`
        ],
        prerequisites: ['Tool Calling', 'Vector Math Basics'],
        recommendedCourses: createCourses('Production RAG & Vector Systems Masterclass'),
        completed: false
      },
      {
        id: 3,
        milestoneTag: 'Multi-Agent Systems',
        estimatedHours: Math.round(hours * 1.7),
        title: `Hierarchical Multi-Agent Collaboration`,
        description: `Coordinate specialized planner, researcher, coder, and reviewer subagents with shared state buses.`,
        deliverable: `Multi-agent code generation squad with automated code review pass.`,
        microSteps: [
          `Design supervisor agent delegating tasks to domain-specialized workers`,
          `Build event-driven agent message bus with shared conversation state`,
          `Integrate human-in-the-loop approval gates for critical actions`
        ],
        prerequisites: ['Agent Loops', 'State Management'],
        recommendedCourses: createCourses('Multi-Agent Systems & LangGraph Architecture'),
        completed: false
      },
      {
        id: 4,
        milestoneTag: 'Production AI Capstone',
        estimatedHours: Math.round(hours * 2.0),
        title: `Autonomous Agent Service with Telemetry & Streaming`,
        description: `Deploy production-grade agent API with SSE streaming, cost telemetry, token rate limits, and safety guards.`,
        deliverable: `Full-stack autonomous AI platform with real-time UI execution visualization.`,
        microSteps: [
          `Implement server-sent events (SSE) streaming token output`,
          `Instrument OpenTelemetry spans for agent reasoning traces and latency`,
          `Add prompt injection guards and output verification benchmarks`
        ],
        prerequisites: ['Multi-Agent Architecture', 'WebSockets / Streaming'],
        recommendedCourses: createCourses('Enterprise AI Agent Deployment & Observability'),
        completed: false
      }
    ];
  } else {
    // Default Full-Stack or Dynamic Goal
    milestones = [
      {
        id: 1,
        milestoneTag: 'Core Architecture',
        estimatedHours: Math.round(hours * 1.2),
        title: `Foundations & Architectural Primitives for ${goal}`,
        description: `Establish core primitives, mental models, and development setup aligned with ${format} methodology.`,
        deliverable: `Production-ready boilerplate repository with verified TypeScript strict configs and linting pipelines.`,
        microSteps: [
          `Set up modern build tooling, strict type safety, and runtime validation`,
          `Implement foundational state flows, modular components, and file structures`,
          `Write automated unit and integration tests to verify core contracts`
        ],
        prerequisites: ['Modern JavaScript', 'Git Fundamentals'],
        recommendedCourses: createCourses(`${goal} Full Crash Course (2026)`),
        completed: false
      },
      {
        id: 2,
        milestoneTag: 'State & Concurrency',
        estimatedHours: Math.round(hours * 1.5),
        title: `Async Data Flow & Concurrency Resilience in ${goal}`,
        description: `Eliminate race conditions, unhandled rejections, and stale state mutations during high-frequency user actions.`,
        deliverable: `Real-time reactive dashboard with optimistic mutations and automatic rollback guards.`,
        microSteps: [
          `Integrate abortable fetch mechanisms and background cache reconciliation`,
          `Handle intermittent socket disconnections and conflict resolution`,
          `Benchmark UI responsiveness and rendering waterfalls under load`
        ],
        prerequisites: ['Promises & Async/Await', 'Reactive State Patterns'],
        recommendedCourses: createCourses(`Advanced Concurrency & State Masterclass`),
        completed: false
      },
      {
        id: 3,
        milestoneTag: 'Distributed Systems',
        estimatedHours: Math.round(hours * 1.7),
        title: `Backend Pipelines & Data Persistence for ${goal}`,
        description: `Deploy resilient services, caching layers, and database transactions supporting low-latency reads and writes.`,
        deliverable: `Containerized distributed service with Redis caching, PostgreSQL persistence, and health monitors.`,
        microSteps: [
          `Design scalable relational schema with foreign key constraints`,
          `Configure distributed Redis caching with sliding-window rate limiting`,
          `Deploy multi-stage Docker containers with CI/CD validation`
        ],
        prerequisites: ['Containerization', 'REST & GraphQL APIs'],
        recommendedCourses: createCourses(`Distributed Systems & Microservices Specialization`),
        completed: false
      },
      {
        id: 4,
        milestoneTag: 'Production Capstone',
        estimatedHours: Math.round(hours * 2.0),
        title: `End-to-End Enterprise Capstone & Observability`,
        description: `Unify all competencies into an end-to-end production deployment with telemetry, rate limiting, and security hardening.`,
        deliverable: `Fully deployed, zero-vulnerability cloud application with telemetry and automated test suite.`,
        microSteps: [
          `Harden CORS, JWT session lifecycle, and CSP security headers`,
          `Set up real-time error tracking and telemetry dashboards`,
          `Conduct load testing up to 1,000 requests/sec with automated reporting`
        ],
        prerequisites: ['Cloud Infrastructure', 'Security Best Practices'],
        recommendedCourses: createCourses(`Production Engineering & DevOps Masterclass`),
        completed: false
      }
    ];
  }

  return {
    roadmapTitle: `${goal} (${level} Track)`,
    targetGoal: goal,
    currentLevel: level,
    timeCommitment: `${hours} hrs/week`,
    learningStyle: format,
    milestones,
    generatedAt: new Date().toISOString(),
    model: 'phi4-mini:latest'
  };
}

/**
 * Pure Deterministic Schedule Generator
 * Maps uncompleted roadmap milestones into the next 7 consecutive calendar days.
 * Strictly paces daily duration according to hoursPerWeek and ensures UNIQUE task IDs.
 */
export function buildWeeklyScheduleFromRoadmap(
  roadmap: DynamicRoadmap | null,
  hoursPerWeek: number,
  progressTracker: ProgressTracker,
  fallbackGoal = 'Full Stack Web Development'
): WeeklyDayPlan[] {
  const activeRoadmap = (roadmap && roadmap.milestones && roadmap.milestones.length > 0)
    ? roadmap
    : synthesizeDynamicRoadmap({
        name: 'Krishna Yadav',
        targetGoal: fallbackGoal,
        skillLevel: 'Intermediate',
        hoursPerWeek: hoursPerWeek || 10,
        preferredLearningFormat: 'Project-First'
      });

  const next7Days = getNext7DaysFromCurrentDate();
  const availableWeekdays = next7Days.filter(d => !d.isRestDay);
  const activeWeekdayCount = Math.max(1, availableWeekdays.length); // 6 days

  const targetHours = Math.max(3, Math.min(40, Number(hoursPerWeek) || 10));
  const dailyPacedMinutes = Math.round((targetHours * 60) / activeWeekdayCount);
  const tasksPerDay = Math.max(1, Math.min(4, Math.round(dailyPacedMinutes / 45)));

  return next7Days.map((day) => {
    if (day.isRestDay) {
      return {
        dayName: day.dayName,
        dateStr: day.dateStr,
        focusSkill: 'Rest & Cognitive Consolidation',
        isRestDay: true,
        isToday: day.isToday,
        tasks: []
      };
    }

    const weekdayIdx = availableWeekdays.findIndex(wd => wd.dateStr === day.dateStr);
    const mIdx = Math.min(
      activeRoadmap.milestones.length - 1,
      Math.floor((weekdayIdx / activeWeekdayCount) * activeRoadmap.milestones.length)
    );
    const activeMilestone = activeRoadmap.milestones[mIdx] || activeRoadmap.milestones[0];
    const microSteps = activeMilestone.microSteps || [];

    const dayTasks: WeeklyTask[] = [];
    const minutesPerTask = Math.round(dailyPacedMinutes / tasksPerDay);

    for (let tIdx = 0; tIdx < tasksPerDay; tIdx++) {
      // Deterministic, completely UNIQUE taskId for each day and sub-task
      const taskId = `task-m${activeMilestone.id}-w${weekdayIdx}-t${tIdx}`;
      const isCompleted = Boolean(
        progressTracker.completedTaskIds[taskId] ||
        (tIdx === 0 && activeMilestone.completed)
      );
      const completedAt = progressTracker.completedTaskTimestamps?.[taskId];

      let taskTitle: string;
      let taskType: 'lesson' | 'project' | 'quiz' | 'review' = 'lesson';

      if (tIdx === 0) {
        taskTitle = microSteps[0] || `Master foundational concepts for ${activeMilestone.title}`;
        taskType = 'lesson';
      } else if (tIdx === 1) {
        taskTitle = microSteps[1] || `Hands-on implementation: ${activeMilestone.deliverable.slice(0, 48)}...`;
        taskType = 'project';
      } else if (tIdx === 2) {
        taskTitle = microSteps[2] || `Verification testing and edge-case diagnostics for ${activeMilestone.milestoneTag}`;
        taskType = 'quiz';
      } else {
        taskTitle = `Benchmark and code review sprint for ${activeMilestone.milestoneTag}`;
        taskType = 'review';
      }

      dayTasks.push({
        id: taskId,
        title: taskTitle,
        type: taskType,
        durationMinutes: minutesPerTask,
        completed: isCompleted,
        skillName: activeMilestone.milestoneTag || activeMilestone.title,
        completedAt
      });
    }

    // If day is today and has previously completed tasks, keep them visible at the top
    if (day.isToday && progressTracker.completedTaskHistory?.length > 0) {
      const todayHistory = progressTracker.completedTaskHistory.slice(0, 2);
      todayHistory.forEach(h => {
        if (!dayTasks.some(dt => dt.id === h.taskId)) {
          dayTasks.unshift({
            id: h.taskId,
            title: h.title || 'Completed Task',
            type: 'lesson',
            durationMinutes: h.durationMinutes,
            completed: true,
            skillName: h.skillName || 'Practice',
            completedAt: h.timestamp
          });
        }
      });
    }

    return {
      dayName: day.dayName,
      dateStr: day.dateStr,
      focusSkill: activeMilestone.milestoneTag || `${activeRoadmap.targetGoal} Practice`,
      isRestDay: false,
      isToday: day.isToday,
      tasks: dayTasks
    };
  });
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // State
      userPreferences: defaultPreferences,
      isRecalibrateModalOpen: false,
      isGeneratingMasterPlan: false,
      generationStage: '',
      notificationToast: null,
      objectivesRoadmap: null,
      recommendedCourses: [],
      savedCourses: [],
      weeklySchedule: [],
      selectedDayIdx: 0,
      progressTracker: defaultProgressTracker,

      // Synchronous setters with automatic schedule recalculation
      setIsRecalibrateModalOpen: (open: boolean) => set({ isRecalibrateModalOpen: open }),
      setNotificationToast: (toast: string | null) => set({ notificationToast: toast }),
      setSelectedDayIdx: (idx: number) => set({ selectedDayIdx: idx }),

      setUserPreferences: (prefs: Partial<UserPreferences>) => {
        const current = get().userPreferences;
        const updated: UserPreferences = {
          ...current,
          ...prefs,
          hoursPerWeek: Number(prefs.hoursPerWeek !== undefined ? prefs.hoursPerWeek : current.hoursPerWeek) || 10
        };

        const { objectivesRoadmap, progressTracker } = get();

        // If targetGoal changed, synthesize corresponding roadmap
        let roadmapToUse = objectivesRoadmap;
        if (prefs.targetGoal && prefs.targetGoal !== current.targetGoal) {
          roadmapToUse = synthesizeDynamicRoadmap(updated);
        }

        const freshSchedule = buildWeeklyScheduleFromRoadmap(
          roadmapToUse,
          updated.hoursPerWeek,
          progressTracker,
          updated.targetGoal
        );

        set({
          userPreferences: updated,
          objectivesRoadmap: roadmapToUse,
          weeklySchedule: freshSchedule
        });

        syncToSharedStorage(updated, roadmapToUse, progressTracker);
      },

      setPreferences: (prefs: Partial<UserPreferences>) => {
        get().setUserPreferences(prefs);
      },

      /**
       * Unified AI Orchestration (The Chain Reaction)
       * Step 1 (Immediate / Optimistic): Update preferences, synthesize domain roadmap,
       * recalculate 7-day schedule with true pacing, and close modal immediately.
       * Step 2 (Background AI Refinement): Query Ollama and external course APIs in background.
       */
      generateMasterPlan: async (preferences: UserPreferences): Promise<boolean> => {
        const cleanProgressTracker: ProgressTracker = {
          completedMicroStepKeys: {},
          completedTaskIds: {},
          completedTaskTimestamps: {},
          completedTaskHistory: [],
          timeSpentMinutes: 0,
          streakDays: 1,
          lastActiveDate: new Date().toISOString(),
          struggleAreas: []
        };

        // 1. Instant Optimistic Generation
        const instantRoadmap = synthesizeDynamicRoadmap(preferences);
        const instantSchedule = buildWeeklyScheduleFromRoadmap(
          instantRoadmap,
          preferences.hoursPerWeek,
          cleanProgressTracker,
          preferences.targetGoal
        );

        // Update state IMMEDIATELY so Weekly Schedule updates without delay
        set({
          userPreferences: preferences,
          objectivesRoadmap: instantRoadmap,
          weeklySchedule: instantSchedule,
          progressTracker: cleanProgressTracker,
          selectedDayIdx: 0,
          isGeneratingMasterPlan: true,
          isRecalibrateModalOpen: false, // Close modal right away!
          generationStage: `⚡ Applied pacing for ${preferences.hoursPerWeek}h/week. Querying Ollama AI...`,
          notificationToast: `🎯 Master Plan active for "${preferences.targetGoal}" (${preferences.hoursPerWeek} hrs/week)!`
        });

        // Trigger confetti celebration
        try {
          confetti({
            particleCount: 75,
            spread: 65,
            origin: { y: 0.75 },
            colors: ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899']
          });
        } catch {}

        // Sync shared storage immediately
        syncToSharedStorage(preferences, instantRoadmap, cleanProgressTracker);

        // 2. Background Asynchronous AI Refinement
        try {
          set({
            generationStage: `B. Synthesizing ${preferences.targetGoal} nuances with Ollama AI (phi4-mini)...`
          });

          const roadmapResponse = await generateDynamicRoadmapApi({
            targetGoal: preferences.targetGoal,
            currentLevel: preferences.skillLevel,
            timeCommitment: `${preferences.hoursPerWeek} hrs/week`,
            learningStyle: preferences.preferredLearningFormat
          });

          if (roadmapResponse && roadmapResponse.milestones && roadmapResponse.milestones.length > 0) {
            const refinedRoadmap: DynamicRoadmap = {
              roadmapTitle: roadmapResponse.roadmapTitle || `${preferences.targetGoal} (${preferences.skillLevel} Track)`,
              targetGoal: preferences.targetGoal,
              currentLevel: preferences.skillLevel,
              timeCommitment: `${preferences.hoursPerWeek} hrs/week`,
              learningStyle: preferences.preferredLearningFormat,
              milestones: roadmapResponse.milestones.map((m: any, idx: number) => ({
                ...m,
                id: m.id || idx + 1,
                completed: false
              })),
              generatedAt: new Date().toISOString(),
              model: roadmapResponse.model || 'phi4-mini:latest'
            };

            const refinedSchedule = buildWeeklyScheduleFromRoadmap(
              refinedRoadmap,
              preferences.hoursPerWeek,
              get().progressTracker,
              preferences.targetGoal
            );

            set({
              objectivesRoadmap: refinedRoadmap,
              weeklySchedule: refinedSchedule
            });

            syncToSharedStorage(preferences, refinedRoadmap, get().progressTracker);
          }
        } catch (ollamaErr: any) {
          console.warn('[Zustand Store] Ollama refinement notice (using dynamic roadmap):', ollamaErr.message);
        }

        // 3. Background Course Catalog Fetch
        try {
          set({
            generationStage: 'C. Querying verified video streams and course catalog...'
          });

          const courseRes = await fetchRecommendedCourses({
            skill: preferences.targetGoal,
            role: preferences.targetGoal,
            difficulty: preferences.skillLevel,
            limit: 4
          });

          if (courseRes && Array.isArray(courseRes.courses) && courseRes.courses.length > 0) {
            set({ recommendedCourses: courseRes.courses });
          }
        } catch (courseErr) {
          console.warn('[Zustand Store] Course proxy fetch notice:', courseErr);
        }

        // 4. Background Supabase Sync
        syncUserDataToSupabase({
          email: `${preferences.name.toLowerCase().replace(/\s+/g, '.')}@edupath.ai`,
          name: preferences.name,
          targetRole: preferences.targetGoal,
          experienceLevel: preferences.skillLevel,
          preferences,
          activeRoadmap: get().objectivesRoadmap,
          savedCourses: get().savedCourses,
          progressTracker: get().progressTracker
        }).catch(err => console.warn('[Supabase Sync Notice]:', err.message));

        set({
          isGeneratingMasterPlan: false,
          generationStage: ''
        });

        return true;
      },

      /**
       * Update Milestone and immediately recalculate dependent Weekly Schedule
       */
      updateMilestone: (id: number | string, patch: Partial<RoadmapMilestone>) => {
        const { objectivesRoadmap, userPreferences, progressTracker } = get();
        if (!objectivesRoadmap) return;

        const updatedMilestones = objectivesRoadmap.milestones.map(m => {
          if (m.id === id || String(m.id) === String(id)) {
            return { ...m, ...patch };
          }
          return m;
        });

        const updatedRoadmap: DynamicRoadmap = {
          ...objectivesRoadmap,
          milestones: updatedMilestones
        };

        const updatedSchedule = buildWeeklyScheduleFromRoadmap(
          updatedRoadmap,
          userPreferences.hoursPerWeek,
          progressTracker
        );

        set({
          objectivesRoadmap: updatedRoadmap,
          weeklySchedule: updatedSchedule,
          notificationToast: `✏️ Milestone "${patch.title || id}" updated & schedule recalculated!`
        });
      },

      /**
       * Delete Milestone and immediately recalculate dependent Weekly Schedule
       */
      deleteMilestone: (id: number | string) => {
        const { objectivesRoadmap, userPreferences, progressTracker } = get();
        if (!objectivesRoadmap) return;

        const updatedMilestones = objectivesRoadmap.milestones.filter(
          m => m.id !== id && String(m.id) !== String(id)
        );

        const updatedRoadmap: DynamicRoadmap = {
          ...objectivesRoadmap,
          milestones: updatedMilestones
        };

        const updatedSchedule = buildWeeklyScheduleFromRoadmap(
          updatedRoadmap,
          userPreferences.hoursPerWeek,
          progressTracker
        );

        set({
          objectivesRoadmap: updatedRoadmap,
          weeklySchedule: updatedSchedule,
          notificationToast: `🗑️ Milestone removed & schedule recalculated!`
        });
      },

      /**
       * Toggle Milestone Complete
       */
      toggleMilestoneComplete: (id: number | string) => {
        const { objectivesRoadmap, userPreferences, progressTracker } = get();
        if (!objectivesRoadmap) return;

        const targetMilestone = objectivesRoadmap.milestones.find(
          m => m.id === id || String(m.id) === String(id)
        );
        const newCompleted = !targetMilestone?.completed;

        const updatedMilestones = objectivesRoadmap.milestones.map(m => {
          if (m.id === id || String(m.id) === String(id)) {
            return { ...m, completed: newCompleted };
          }
          return m;
        });

        const updatedRoadmap: DynamicRoadmap = {
          ...objectivesRoadmap,
          milestones: updatedMilestones
        };

        const updatedSchedule = buildWeeklyScheduleFromRoadmap(
          updatedRoadmap,
          userPreferences.hoursPerWeek,
          progressTracker
        );

        set({
          objectivesRoadmap: updatedRoadmap,
          weeklySchedule: updatedSchedule,
          notificationToast: newCompleted ? `🎉 Milestone completed!` : `Milestone marked active`
        });
      },

      /**
       * Toggle Task Complete (with real-time timestamp ledger)
       */
      toggleTaskComplete: (taskId: string, durationMinutes = 30, skillName = 'Practice', title = 'Task') => {
        const { progressTracker, objectivesRoadmap, userPreferences } = get();
        const currentlyDone = Boolean(progressTracker.completedTaskIds[taskId]);
        const now = Date.now();

        const updatedTaskIds = {
          ...progressTracker.completedTaskIds,
          [taskId]: !currentlyDone
        };

        const updatedTimestamps = {
          ...progressTracker.completedTaskTimestamps,
          [taskId]: !currentlyDone ? now : 0
        };

        let updatedHistory = [...(progressTracker.completedTaskHistory || [])];
        if (!currentlyDone) {
          updatedHistory.unshift({
            taskId,
            timestamp: now,
            durationMinutes,
            skillName,
            title
          });
        } else {
          updatedHistory = updatedHistory.filter(h => h.taskId !== taskId);
        }

        const updatedTracker: ProgressTracker = {
          ...progressTracker,
          completedTaskIds: updatedTaskIds,
          completedTaskTimestamps: updatedTimestamps,
          completedTaskHistory: updatedHistory,
          timeSpentMinutes: Math.max(
            0,
            progressTracker.timeSpentMinutes + (!currentlyDone ? durationMinutes : -durationMinutes)
          )
        };

        const updatedSchedule = buildWeeklyScheduleFromRoadmap(
          objectivesRoadmap,
          userPreferences.hoursPerWeek,
          updatedTracker
        );

        set({
          progressTracker: updatedTracker,
          weeklySchedule: updatedSchedule
        });
      },

      /**
       * Toggle Save/Bookmark Course
       */
      toggleSaveCourse: (course: ResourceItem) => {
        const { savedCourses } = get();
        const exists = savedCourses.some(c => c.id === course.id);
        const updated = exists
          ? savedCourses.filter(c => c.id !== course.id)
          : [...savedCourses, { ...course, bookmarked: true }];

        set({
          savedCourses: updated,
          notificationToast: exists ? `Removed "${course.title.slice(0, 30)}..." from saved` : `⭐ Saved "${course.title.slice(0, 30)}..."`
        });
      },

      /**
       * Synchronously recalculate weekly schedule
       */
      recalculateWeeklySchedule: () => {
        const { objectivesRoadmap, userPreferences, progressTracker } = get();
        const freshSchedule = buildWeeklyScheduleFromRoadmap(
          objectivesRoadmap,
          userPreferences.hoursPerWeek,
          progressTracker
        );
        set({ weeklySchedule: freshSchedule });
      },

      /**
       * Clear Roadmap to empty state
       */
      clearRoadmap: () => {
        set({
          objectivesRoadmap: null,
          weeklySchedule: [],
          recommendedCourses: [],
          notificationToast: 'Roadmap cleared. Click Recalibrate to generate a new master plan.'
        });
      }
    }),
    {
      name: 'edupath_zustand_master_store',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        userPreferences: state.userPreferences,
        objectivesRoadmap: state.objectivesRoadmap,
        recommendedCourses: state.recommendedCourses,
        savedCourses: state.savedCourses,
        weeklySchedule: state.weeklySchedule,
        progressTracker: state.progressTracker
      })
    }
  )
);
