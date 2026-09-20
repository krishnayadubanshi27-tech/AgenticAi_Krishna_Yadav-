import {
  UserProfile,
  SkillCompetency,
  LearningObjective,
  ResourceItem,
  PracticeProject,
  WeeklyDayPlan,
  StruggleAlert,
  AIChatMessage
} from '../types/learning';

export const initialUserProfile: UserProfile = {
  name: 'Krishna Yadav',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  targetRole: 'Full Stack Web Development',
  careerGoal: 'Full Stack Web Development',
  experienceLevel: 'Mid-Level (3-5 yrs)',
  hoursPerWeek: 10,
  currentSkillLevel: 'Intermediate',
  targetDateMonths: 6,
  uploadedFileName: 'Krishna_Resume_2026.pdf',
  analyzedKeywords: ['React 19', 'TypeScript', 'Next.js', 'Node.js', 'PostgreSQL', 'Tailwind', 'REST APIs', 'Docker Basics'],
  lastPathRecalibrated: 'Just now (AI Adaptive Sync active)'
};

export const initialSkills: SkillCompetency[] = [
  {
    id: 'skill-react-arch',
    name: 'React 19 & Client Architecture',
    category: 'Frontend',
    currentLevel: 68,
    targetLevel: 92,
    status: 'in_progress',
    struggleScore: 25,
    description: 'Server Components, streaming SSR, Suspense boundaries, and compile-time optimizations.'
  },
  {
    id: 'skill-state-async',
    name: 'Concurrency, State & Race Conditions',
    category: 'State & Concurrency',
    currentLevel: 42,
    targetLevel: 88,
    status: 'critical_gap',
    struggleScore: 82, // Active struggle trigger!
    description: 'Handling race conditions, optimistic UI updates, abort controllers, and TanStack query sync.'
  },
  {
    id: 'skill-system-design',
    name: 'Distributed Systems & API Design',
    category: 'System Architecture',
    currentLevel: 50,
    targetLevel: 85,
    status: 'critical_gap',
    struggleScore: 35,
    description: 'Event-driven architectures, rate limiting, WebSockets, Kafka pipelines, and horizontal scaling.'
  },
  {
    id: 'skill-ai-agents',
    name: 'AI & Multi-Agent Orchestration',
    category: 'AI & LLM Integration',
    currentLevel: 35,
    targetLevel: 90,
    status: 'critical_gap',
    struggleScore: 20,
    description: 'Tool calling, structured JSON outputs, vector search/RAG, agent loops, and evaluation.'
  },
  {
    id: 'skill-backend-services',
    name: 'FastAPI & Microservices Architecture',
    category: 'Backend',
    currentLevel: 72,
    targetLevel: 85,
    status: 'in_progress',
    struggleScore: 15,
    description: 'Asynchronous Python/Node services, connection pooling, Redis caching, and contract testing.'
  },
  {
    id: 'skill-devops-ci',
    name: 'Cloud Infrastructure & CI/CD',
    category: 'DevOps & CI/CD',
    currentLevel: 80,
    targetLevel: 82,
    status: 'acquired',
    struggleScore: 10,
    description: 'Docker multi-stage builds, GitHub Actions pipelines, Kubernetes ingress, and monitoring.'
  }
];

export const initialObjectives: LearningObjective[] = [
  {
    id: 'obj-1',
    milestoneNumber: 1,
    title: 'Eliminate Async Race Conditions & Cleanups in React',
    skillId: 'skill-state-async',
    skillName: 'Concurrency, State & Race Conditions',
    description: 'Master AbortController, cleanup lifecycles, and useTransition to prevent desynchronized UI updates.',
    durationHours: 3.5,
    prerequisites: ['Basic React Hooks', 'JavaScript Promises'],
    status: 'in_progress',
    practicalOutcome: 'Build an auto-suggest search that discards stale network requests reliably.',
    actionItems: [
      'Complete remediation lab on AbortSignal in useEffect',
      'Refactor custom useFetch hook with cancellation tokens',
      'Pass the Concurrency Debugging Challenge (Quiz #4)'
    ]
  },
  {
    id: 'obj-2',
    milestoneNumber: 2,
    title: 'Architect Full-Stack Next.js 15 Server Actions & Streaming',
    skillId: 'skill-react-arch',
    skillName: 'React 19 & Client Architecture',
    description: 'Deploy partial prerendering and streaming responses with optimistic updates.',
    durationHours: 5.0,
    prerequisites: ['Obj 1: Concurrency', 'TypeScript Generics'],
    status: 'not_started',
    practicalOutcome: 'Build a zero-bundle-size server dashboard with streaming chunks.',
    actionItems: [
      'Implement React 19 useActionState and useOptimistic',
      'Stream AI token responses into a markdown renderer',
      'Benchmark client bundle reduction using React Compiler'
    ]
  },
  {
    id: 'obj-3',
    milestoneNumber: 3,
    title: 'Deploy Multi-Agent Reasoning Loops with Tool Calling',
    skillId: 'skill-ai-agents',
    skillName: 'AI & Multi-Agent Orchestration',
    description: 'Wire autonomous agents with deterministic schemas, state graphs, and memory persistence.',
    durationHours: 6.5,
    prerequisites: ['REST APIs', 'Pydantic/Zod Schemas'],
    status: 'not_started',
    practicalOutcome: 'Create a research agent that executes search tools and outputs citations.',
    actionItems: [
      'Define strict schema validators for function calling',
      'Implement human-in-the-loop interruption state machines',
      'Test agent fallback handlers for tool invocation failures'
    ]
  },
  {
    id: 'obj-4',
    milestoneNumber: 4,
    title: 'Implement Resilient Distributed Rate Limiting & Token Buckets',
    skillId: 'skill-system-design',
    skillName: 'Distributed Systems & API Design',
    description: 'Safeguard microservices against traffic spikes and LLM API cost blowouts using Redis.',
    durationHours: 4.0,
    prerequisites: ['Redis Basics', 'HTTP Protocol Headers'],
    status: 'not_started',
    practicalOutcome: 'Prevent cascading failures across upstream LLM providers.',
    actionItems: [
      'Code a sliding window rate limiter in Redis Lua',
      'Add exponential backoff with jitter on 429 status codes',
      'Simulate 10,000 concurrent requests with Locust'
    ]
  }
];

export const initialResources: ResourceItem[] = [
  // High Priority / Critical Gaps
  {
    id: 'res-react-19',
    title: 'React 19 Deep Dive: Server Components & Actions',
    category: 'Top Recommendations',
    type: 'video',
    duration: '42 min',
    durationMinutes: 42,
    rating: 4.9,
    matchScore: 98,
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=80',
    tags: ['React 19', 'RSC', 'Server Actions'],
    completed: false,
    bookmarked: true,
    difficulty: 'Advanced',
    provider: 'EduPath Core Academy',
    description: 'Learn how React 19 eliminates waterfalls with native server actions and unified streaming SSR.',
    associatedSkillId: 'skill-react-arch',
    keyTakeaways: ['Zero client bundle server components', 'Server mutations with useActionState', 'Form status hooks']
  },
  {
    id: 'res-async-race',
    title: 'Taming React Concurrency & Network Race Conditions',
    category: 'Needs Review',
    type: 'interactive',
    duration: '28 min',
    durationMinutes: 28,
    rating: 4.8,
    matchScore: 99,
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    tags: ['AbortController', 'Race Conditions', 'Remediation'],
    completed: false,
    bookmarked: false,
    isStruggleRemedy: true, // Marked for struggle row!
    difficulty: 'Intermediate',
    provider: 'Adaptive AI Remediation Lab',
    description: 'Interactive sandbox: simulate out-of-order API responses and implement reliable AbortSignal patterns.',
    associatedSkillId: 'skill-state-async',
    keyTakeaways: ['Preventing stale state overwrites', 'Cleaning up asynchronous effects cleanly', 'Testing network delays']
  },
  {
    id: 'res-ai-agents',
    title: 'Building Autonomous Multi-Agent Workflows with Tool Use',
    category: 'Top Recommendations',
    type: 'interactive',
    duration: '55 min',
    durationMinutes: 55,
    rating: 4.95,
    matchScore: 96,
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    tags: ['LLM Agents', 'Tool Calling', 'LangGraph'],
    completed: false,
    bookmarked: true,
    difficulty: 'Advanced',
    provider: 'AI Engineering Guild',
    description: 'Step-by-step interactive builder for chaining agents, persistent memory, and validation guards.',
    associatedSkillId: 'skill-ai-agents',
    keyTakeaways: ['Function calling schemas', 'Cyclic graphs with feedback loops', 'Token usage budgeting']
  },
  {
    id: 'res-sys-design',
    title: 'Distributed System Design: High-Throughput WebSockets',
    category: 'System Architecture',
    type: 'video',
    duration: '38 min',
    durationMinutes: 38,
    rating: 4.85,
    matchScore: 94,
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
    tags: ['WebSockets', 'Redis Pub/Sub', 'Scalability'],
    completed: false,
    bookmarked: false,
    difficulty: 'Intermediate',
    provider: 'System Architect Academy',
    description: 'Scale bidirectional streaming across multiple backend servers using Redis Pub/Sub adapters.',
    associatedSkillId: 'skill-system-design',
    keyTakeaways: ['Horizontal socket clustering', 'Heartbeats & reconnection backoffs', 'Message delivery guarantees']
  },
  {
    id: 'res-optimistic-ui',
    title: 'Mastering Optimistic UI Mutations & Cache Invalidation',
    category: 'Needs Review',
    type: 'interactive',
    duration: '32 min',
    durationMinutes: 32,
    rating: 4.9,
    matchScore: 97,
    thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80',
    tags: ['TanStack Query', 'Optimistic UI', 'Remediation'],
    completed: false,
    bookmarked: false,
    isStruggleRemedy: true,
    difficulty: 'Intermediate',
    provider: 'Adaptive AI Remediation Lab',
    description: 'Practice rolling back failed optimistic state without causing annoying screen flickers.',
    associatedSkillId: 'skill-state-async',
    keyTakeaways: ['Snapshotting previous cache state', 'Instant UI feedback without lag', 'Graceful mutation retry logic']
  },
  {
    id: 'res-quick-zod',
    title: 'Runtime Schema Validation with Zod in 15 Minutes',
    category: 'Quick Wins',
    type: 'article',
    duration: '15 min',
    durationMinutes: 15,
    rating: 4.75,
    matchScore: 91,
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    tags: ['TypeScript', 'Zod', 'Safety'],
    completed: true,
    bookmarked: false,
    difficulty: 'Beginner',
    provider: 'Modern TypeScript Weekly',
    description: 'Fast hands-on cheat sheet for parsing external API payloads and typing AI structured outputs.',
    associatedSkillId: 'skill-ai-agents',
    keyTakeaways: ['Safe type inference', 'Transformations and custom refinements', 'Zero overhead bundling']
  },
  {
    id: 'res-quick-compiler',
    title: 'React Compiler: Automatic Memoization Explained',
    category: 'Quick Wins',
    type: 'article',
    duration: '18 min',
    durationMinutes: 18,
    rating: 4.88,
    matchScore: 93,
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
    tags: ['React Compiler', 'Performance', 'Memoization'],
    completed: false,
    bookmarked: false,
    difficulty: 'Intermediate',
    provider: 'Frontend Engineering Lab',
    description: 'Say goodbye to manual useMemo and useCallback. Understand the compiler IR under the hood.',
    associatedSkillId: 'skill-react-arch',
    keyTakeaways: ['How compiler detects immutable dependencies', 'Rules of React compliance', 'Benchmarking re-renders']
  },
  {
    id: 'res-fastapi-perf',
    title: 'Production FastAPI: Concurrency, Workers & Async I/O',
    category: 'Backend Mastery',
    type: 'video',
    duration: '45 min',
    durationMinutes: 45,
    rating: 4.8,
    matchScore: 89,
    thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&auto=format&fit=crop&q=80',
    tags: ['Python', 'FastAPI', 'AsyncIO'],
    completed: false,
    bookmarked: false,
    difficulty: 'Advanced',
    provider: 'Cloud Native University',
    description: 'Tune Uvicorn worker threads, non-blocking DB engines, and background tasks for max throughput.',
    associatedSkillId: 'skill-backend-services',
    keyTakeaways: ['Uvicorn multi-process configurations', 'Async SQLAlchemy session pooling', 'Handling CPU bound bottlenecks']
  },
  {
    id: 'res-docker-multi',
    title: 'Zero-CVE Multi-Stage Docker Builds for Node & React',
    category: 'Backend Mastery',
    type: 'video',
    duration: '30 min',
    durationMinutes: 30,
    rating: 4.7,
    matchScore: 88,
    thumbnail: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=600&auto=format&fit=crop&q=80',
    tags: ['Docker', 'DevOps', 'Security'],
    completed: true,
    bookmarked: false,
    difficulty: 'Intermediate',
    provider: 'DevOps Masterclass',
    description: 'Shrink production container footprints from 1.2GB down to 65MB with alpine and distroless images.',
    associatedSkillId: 'skill-devops-ci',
    keyTakeaways: ['Multi-stage build separation', 'Non-root user permissions', 'Vulnerability scanning with Grype']
  }
];

export const initialProjects: PracticeProject[] = [
  {
    id: 'proj-1',
    title: 'AI Multi-Agent Live Research Copilot',
    difficulty: 'Advanced',
    timeEstimate: '6 - 8 hours',
    techStack: ['React 19', 'FastAPI', 'LangGraph', 'Tailwind', 'WebSockets'],
    description: 'Create an autonomous multi-agent pipeline where agents search the web, evaluate source credibility, and stream live citations into an interactive canvas.',
    keyFeatures: [
      'Multi-agent state graph with reasoning traces',
      'Streaming markdown response with token counter',
      'Interactive citation inspection popover'
    ],
    completed: false,
    thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=80',
    badgeText: 'Portfolio Grade ⭐'
  },
  {
    id: 'proj-2',
    title: 'Real-time Collaborative Kanban with Optimistic Rollback',
    difficulty: 'Intermediate',
    timeEstimate: '4 - 5 hours',
    techStack: ['React', 'TanStack Query', 'Tailwind', 'WebSockets'],
    description: 'Build a zero-latency drag-and-drop task board with conflict resolution and graceful network error rollback handling.',
    keyFeatures: [
      'Immediate optimistic UI card repositioning',
      'Simulated 10% packet drop test suite',
      'Sync status indicator with retry queue'
    ],
    completed: false,
    thumbnail: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&auto=format&fit=crop&q=80',
    badgeText: 'Struggle Fixer 🎯'
  },
  {
    id: 'proj-3',
    title: 'Distributed Token Bucket Rate Limiter Gateway',
    difficulty: 'Advanced',
    timeEstimate: '5 - 6 hours',
    techStack: ['Node.js', 'Redis', 'Docker', 'TypeScript'],
    description: 'Engineered API gateway middleware protecting upstream AI models with tenant-tiered quotas and sliding window throttling.',
    keyFeatures: [
      'Atomic Redis Lua script token replenishment',
      'X-RateLimit HTTP standard response headers',
      'Prometheus latency metrics export'
    ],
    completed: false,
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
    badgeText: 'System Design 🛠️'
  }
];

export const initialWeeklyPlan: WeeklyDayPlan[] = [
  {
    dayName: 'Monday',
    dateStr: 'Sep 21',
    focusSkill: 'State & Concurrency (Remediation)',
    isRestDay: false,
    tasks: [
      {
        id: 'task-mon-1',
        title: 'Complete Interactive Sandbox: Taming React Concurrency',
        type: 'lesson',
        durationMinutes: 28,
        completed: false,
        resourceId: 'res-async-race',
        skillName: 'Concurrency, State & Race Conditions'
      },
      {
        id: 'task-mon-2',
        title: 'Code Refactor: Add AbortController to search input',
        type: 'project',
        durationMinutes: 30,
        completed: false,
        skillName: 'Concurrency, State & Race Conditions'
      }
    ]
  },
  {
    dayName: 'Tuesday',
    dateStr: 'Sep 22',
    focusSkill: 'React 19 Server Components',
    isRestDay: false,
    tasks: [
      {
        id: 'task-tue-1',
        title: 'Watch & Code-along: React 19 Deep Dive',
        type: 'lesson',
        durationMinutes: 42,
        completed: false,
        resourceId: 'res-react-19',
        skillName: 'React 19 & Client Architecture'
      },
      {
        id: 'task-tue-2',
        title: 'Mini-Quiz: Server vs Client Component Boundaries',
        type: 'quiz',
        durationMinutes: 15,
        completed: false,
        skillName: 'React 19 & Client Architecture'
      }
    ]
  },
  {
    dayName: 'Wednesday',
    dateStr: 'Sep 23',
    focusSkill: 'Struggle Review & Optimistic Cache',
    isRestDay: false,
    tasks: [
      {
        id: 'task-wed-1',
        title: 'Lab: Optimistic UI Mutations & Cache Invalidation',
        type: 'lesson',
        durationMinutes: 32,
        completed: false,
        resourceId: 'res-optimistic-ui',
        skillName: 'Concurrency, State & Race Conditions'
      }
    ]
  },
  {
    dayName: 'Thursday',
    dateStr: 'Sep 24',
    focusSkill: 'AI Agent Architecture',
    isRestDay: false,
    tasks: [
      {
        id: 'task-thu-1',
        title: 'Deep Dive: Multi-Agent Workflows & Tool Calling',
        type: 'lesson',
        durationMinutes: 55,
        completed: false,
        resourceId: 'res-ai-agents',
        skillName: 'AI & Multi-Agent Orchestration'
      }
    ]
  },
  {
    dayName: 'Friday',
    dateStr: 'Sep 25',
    focusSkill: 'Hands-on Project Day',
    isRestDay: false,
    tasks: [
      {
        id: 'task-fri-1',
        title: 'Kick off: AI Multi-Agent Live Research Copilot (Milestone 1)',
        type: 'project',
        durationMinutes: 90,
        completed: false,
        skillName: 'AI & Multi-Agent Orchestration'
      }
    ]
  },
  {
    dayName: 'Saturday',
    dateStr: 'Sep 26',
    focusSkill: 'Project Sprint & AI Code Review',
    isRestDay: false,
    tasks: [
      {
        id: 'task-sat-1',
        title: 'Build Streaming Markdown Renderer with citations',
        type: 'project',
        durationMinutes: 75,
        completed: false,
        skillName: 'React 19 & Client Architecture'
      }
    ]
  },
  {
    dayName: 'Sunday',
    dateStr: 'Sep 27',
    focusSkill: 'Reflection & Rest',
    isRestDay: true,
    tasks: []
  }
];

export const initialStruggleAlert: StruggleAlert = {
  id: 'str-async-race',
  skillId: 'skill-state-async',
  skillName: 'Concurrency, State & Race Conditions',
  issueSummary: 'High friction detected: Stale State Overwrite & Missing AbortControllers',
  frictionReason: 'Learner spent 3.4 hrs on Concurrency Module with 54% average accuracy on asynchronous state quiz questions.',
  timeSpentMinutes: 204,
  quizScore: 54,
  status: 'active',
  recommendedAction: 'We paused advancing to Distributed Architecture until you complete two targeted 25-minute interactive sandboxes.',
  remedyResourceIds: ['res-async-race', 'res-optimistic-ui']
};

export const initialChatMessages: AIChatMessage[] = [
  {
    id: 'msg-welcome',
    sender: 'agent',
    text: "Hello Alex! 👋 I'm your EduPath AI Learning Agent. I noticed you're currently experiencing some friction with **Asynchronous Concurrency & Race Conditions** (quiz score 54%). I've adapted your path by prioritizing two targeted remediation labs and deferring advanced microservices until we cement this foundation. What would you like to explore today?",
    timestamp: '10:00 AM',
    suggestions: [
      'Why is React Concurrency holding me back?',
      'Walk me through AbortController simply',
      'Adjust my weekly goal to 5 hrs/week',
      'Simulate an interview question on Race Conditions'
    ]
  }
];
