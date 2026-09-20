/**
 * Ollama AI Integration Service
 * Connects directly to local Ollama (http://localhost:11434)
 * Powers:
 * 1. AI Mentor Chatbot (grounded on learner profile & struggle points)
 * 2. Adaptive Roadmap Generation (milestones derived from gap analysis)
 * 3. Weekly Schedule Rebalancing (7-day plan with pacing)
 * 4. AI Course Suggestions (custom gap-targeted learning modules)
 */

const getOllamaUrl = () => process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const getOllamaModel = () => process.env.OLLAMA_MODEL || 'phi4-mini:latest';

/**
 * Fetch with configurable timeout helper
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = 45000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

/**
 * Check Ollama connectivity and list available models
 */
export async function checkOllamaStatus() {
  const url = `${getOllamaUrl()}/api/tags`;
  try {
    const res = await fetchWithTimeout(url, {}, 5000);
    if (!res.ok) {
      return {
        connected: false,
        currentModel: getOllamaModel(),
        availableModels: [],
        error: `Ollama responded with status ${res.status}`
      };
    }
    const data = await res.json();
    const models = (data.models || []).map(m => m.name);
    const preferredModel = getOllamaModel();
    const activeModel = models.includes(preferredModel)
      ? preferredModel
      : (models[0] || preferredModel);

    return {
      connected: true,
      currentModel: activeModel,
      availableModels: models,
      baseUrl: getOllamaUrl()
    };
  } catch (err) {
    return {
      connected: false,
      currentModel: getOllamaModel(),
      availableModels: [],
      error: err.message
    };
  }
}

/**
 * Generate AI Mentor Chatbot reply with Ollama
 */
export async function generateOllamaChat({ message, history = [], context = {} }) {
  const status = await checkOllamaStatus();
  const targetRole = context.targetRole || 'Senior Full-Stack AI Engineer';
  const struggle = context.struggleTopic || 'Race Conditions & Concurrency';

  // Fallback response generator if Ollama is unreachable
  const getFallbackReply = () => {
    const lower = message.toLowerCase();
    if (lower.includes('race') || lower.includes('concurrency') || lower.includes('async')) {
      return {
        reply: `### Addressing Concurrency & State Inversion in React 19\n\nRace conditions occur when competing async requests resolve out of order, overwriting newer state with stale data.\n\n**Key Remediation Strategies:**\n1. **Use \`AbortController\`**: Cancel outdated fetch requests when component unmounts or query changes.\n2. **React 19 \`useActionState\`**: Automatically manages pending states, prevents duplicate submissions, and handles optimistic rollbacks.\n3. **Request IDs or Version Timestamps**: Discard any network response with an older timestamp than the active UI state.\n\n*Check the 'Needs Review' row above for 2 hands-on remediation sandboxes!*`,
        suggestions: [
          'Show me code for AbortController in useEffect',
          'Explain useActionState vs useTransition',
          'Mark Race Conditions as resolved'
        ],
        model: 'EduPath Fallback Mentor'
      };
    } else if (lower.includes('roadmap') || lower.includes('goal') || lower.includes('hours')) {
      return {
        reply: `### AI Schedule Pacing Guidance\n\nFor your goal of **${targetRole}**, maintaining a velocity of **5.5 to 6.5 hours/week** maximizes knowledge retention while preventing burnout.\n\nI recommend dedicating:\n- **60%** to hands-on architecture projects (such as real-time agents and optimistic CRDTs).\n- **25%** to targeted video and lab study.\n- **15%** to mock technical interview self-evaluation.`,
        suggestions: [
          'Generate customized 4-milestone roadmap',
          'Rebalance my weekly schedule to 5 hours',
          'Recommend top 3 courses for my role'
        ],
        model: 'EduPath Fallback Mentor'
      };
    } else {
      return {
        reply: `Hello! I am your **EduPath AI Mentor** grounded in your goal of becoming a **${targetRole}**.\n\nYou are currently making great progress across frontend architecture and async state patterns. What specific concept, code pattern, or project deliverable can I break down for you today?`,
        suggestions: [
          'Explain React 19 Server Actions',
          'Give me a mock interview question',
          'How do I build an autonomous AI agent?'
        ],
        model: 'EduPath Fallback Mentor'
      };
    }
  };

  if (!status.connected) {
    console.warn(`[Ollama Service] Ollama not reachable at ${getOllamaUrl()}. Using fallback.`);
    return getFallbackReply();
  }

  try {
    const systemPrompt = `You are EduPath AI, an elite technical mentor and continuous learning agent inspired by principal software architects.
The learner is preparing for the role: "${targetRole}".
Active skill competencies: ${JSON.stringify(context.skills || [])}.
Active friction / struggle point: "${struggle}".
Answer the learner's query clearly, professionally, and concisely in GitHub markdown format.
Include practical code snippets when asked. Always stay grounded in modern 2026 production software engineering practices.`;

    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-6).map(m => ({
        role: m.sender === 'agent' ? 'assistant' : 'user',
        content: m.text
      })),
      { role: 'user', content: message }
    ];

    const chatRes = await fetchWithTimeout(`${getOllamaUrl()}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: status.currentModel,
        messages: formattedMessages,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 500
        }
      })
    }, 25000);

    if (!chatRes.ok) {
      console.warn(`[Ollama Service] /api/chat responded with status ${chatRes.status}`);
      return getFallbackReply();
    }

    const chatData = await chatRes.json();
    const replyText = chatData.message?.content?.trim();

    if (!replyText) {
      return getFallbackReply();
    }

    // Generate 3 contextual follow-up suggestions
    const suggestions = [
      `How does this apply to ${targetRole}?`,
      'Show me a complete code implementation',
      'Recommend resources to practice this'
    ];

    return {
      reply: replyText,
      suggestions,
      model: status.currentModel
    };
  } catch (err) {
    console.error('[Ollama Service] Chat generation error:', err.message);
    return getFallbackReply();
  }
}

/**
 * Generate Structured Objectives Roadmap with Ollama
 */
export async function generateOllamaRoadmap({ targetRole, experienceLevel, currentSkills = [], goal }) {
  const status = await checkOllamaStatus();
  const role = targetRole || 'Senior Full-Stack AI Engineer';

  // High-fidelity fallback milestones
  const fallbackMilestones = [
    {
      id: `milestone-ollama-1`,
      milestoneNumber: 1,
      title: `Core Foundations & Modern React 19 Streams`,
      skillId: 'skill-react-arch',
      skillName: 'React 19 & Server Architecture',
      description: `Solidify server actions, partial prerendering, useActionState, and suspense streaming to eliminate client bundle bloat.`,
      durationHours: 14,
      prerequisites: ['JavaScript ESNext', 'Basic React Hooks'],
      status: 'completed',
      practicalOutcome: `Implement zero-bundle client boundary with optimistic action state and server transition streams.`,
      actionItems: [
        'Migrate legacy reducers to useActionState',
        'Configure partial prerendering in Next.js / Vite streaming',
        'Profile hydration time with Chrome DevTools Performance'
      ]
    },
    {
      id: `milestone-ollama-2`,
      milestoneNumber: 2,
      title: `Resilient Concurrency & Anti-Race-Condition Patterns`,
      skillId: 'skill-state-async',
      skillName: 'State & Async Concurrency',
      description: `Eradicate UI state inversions, race conditions, and memory leaks using AbortController and atomic transactions.`,
      durationHours: 18,
      prerequisites: ['React 19 Streams'],
      status: 'in_progress',
      practicalOutcome: `Build an auto-suggest search that discards stale network requests reliably.`,
      actionItems: [
        'Implement AbortController cleanup in useEffect',
        'Build optimistic UI rollback on network error',
        'Unit test race condition avoidance with Mock Service Worker'
      ]
    },
    {
      id: `milestone-ollama-3`,
      milestoneNumber: 3,
      title: `Distributed Systems & Asynchronous Event Architecture`,
      skillId: 'skill-system-design',
      skillName: 'Distributed Systems & Microservices',
      description: `Scale high-throughput real-time systems using WebSockets, Redis pub/sub, and event-driven microservices.`,
      durationHours: 24,
      prerequisites: ['Node.js Event Loop', 'SQL Basics'],
      status: 'not_started',
      practicalOutcome: `Deploy a distributed rate limiter and real-time collaboration gateway handling 10k req/sec.`,
      actionItems: [
        'Design Redis token bucket distributed rate limiter',
        'Implement WebSocket heartbeat & automatic reconnection',
        'Benchmark database connection pooling under load'
      ]
    },
    {
      id: `milestone-ollama-4`,
      milestoneNumber: 4,
      title: `Autonomous Agent Orchestration & Tool Routing`,
      skillId: 'skill-ai-agents',
      skillName: 'Agentic AI & LLM Systems',
      description: `Architect autonomous AI agents capable of recursive multi-step planning, tool schemas, and self-correcting validation loops.`,
      durationHours: 28,
      prerequisites: ['Python / TypeScript', 'Distributed Systems'],
      status: 'not_started',
      practicalOutcome: `Deploy an autonomous code-review agent that parses pull requests and suggests verified fixes.`,
      actionItems: [
        'Implement structured tool calling schemas with Pydantic / Zod',
        'Build recursive scratchpad planning and loop guards',
        'Evaluate hallucinations against golden test benchmarks'
      ]
    }
  ];

  if (!status.connected) {
    return {
      success: true,
      source: 'fallback',
      model: 'EduPath Adaptive Engine',
      milestones: fallbackMilestones
    };
  }

  try {
    const prompt = `You are an expert curriculum architect. Generate a JSON array of exactly 4 sequential learning milestones for a learner targeting the role "${role}".
Return ONLY a valid JSON array matching this schema:
[
  {
    "milestoneNumber": 1,
    "title": "Short title",
    "skillName": "Skill category",
    "description": "2 sentences explaining why this milestone is vital",
    "durationHours": 15,
    "prerequisites": ["Prereq 1"],
    "practicalOutcome": "Tangible real-world system or project built",
    "actionItems": ["Action 1", "Action 2", "Action 3"]
  }
]`;

    const res = await fetchWithTimeout(`${getOllamaUrl()}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: status.currentModel,
        prompt: prompt,
        format: 'json',
        stream: false,
        options: { temperature: 0.3 }
      })
    }, 25000);

    if (!res.ok) {
      return { success: true, source: 'fallback', milestones: fallbackMilestones };
    }

    const data = await res.json();
    let parsed = JSON.parse(data.response);
    if (!Array.isArray(parsed) && parsed.milestones) {
      parsed = parsed.milestones;
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return { success: true, source: 'fallback', milestones: fallbackMilestones };
    }

    const formatted = parsed.slice(0, 4).map((m, idx) => ({
      id: `milestone-ollama-${Date.now()}-${idx + 1}`,
      milestoneNumber: idx + 1,
      title: m.title || `Milestone ${idx + 1}`,
      skillId: `skill-ollama-${idx + 1}`,
      skillName: m.skillName || `Competency ${idx + 1}`,
      description: m.description || `Master foundational skills required for ${role}.`,
      durationHours: m.durationHours || 16,
      prerequisites: m.prerequisites || ['Foundational Programming'],
      status: idx === 0 ? 'completed' : idx === 1 ? 'in_progress' : 'not_started',
      practicalOutcome: m.practicalOutcome || 'Build production-ready deliverables',
      actionItems: m.actionItems || ['Review core concepts', 'Build practice project', 'Verify tests']
    }));

    return {
      success: true,
      source: 'ollama-live',
      model: status.currentModel,
      milestones: formatted
    };
  } catch (err) {
    console.warn('[Ollama Roadmap Error]:', err.message);
    return {
      success: true,
      source: 'fallback',
      milestones: fallbackMilestones
    };
  }
}

/**
 * Generate topic-aware fallback roadmap based on user's target goal
 */
export function getTopicAwareRoadmapFallback({
  targetGoal = 'Full Stack Web Development',
  currentLevel = 'Intermediate',
  timeCommitment = '10 hrs/week',
  learningStyle = 'Project-First'
}) {
  const goal = targetGoal || 'Full Stack Modern Web Architecture';
  const lowerGoal = goal.toLowerCase();

  if (lowerGoal.includes('c++') || lowerGoal.includes('c/') || lowerGoal.includes('embedded') || lowerGoal.includes('systems') || lowerGoal.includes('backend & systems')) {
    return {
      roadmapTitle: `${goal} (${currentLevel} Track)`,
      targetGoal: goal,
      currentLevel,
      timeCommitment,
      learningStyle,
      milestones: [
        {
          id: 1,
          milestoneTag: 'Memory & Pointers',
          estimatedHours: 12,
          title: `Modern C/C++ Primitives & Memory Management`,
          description: `Master stack vs heap dynamics, manual allocations, RAII, and smart pointers for memory-safe backend programming.`,
          deliverable: `Production-grade memory-safe custom allocator and circular buffer repository.`,
          microSteps: [
            `Master pointer arithmetic, memory layout, and stack vs heap allocation`,
            `Implement RAII, unique_ptr, and shared_ptr reference semantics`,
            `Conduct Valgrind and AddressSanitizer memory leak profiling`
          ],
          prerequisites: ['C Syntax Basics', 'Command Line & GCC/Clang'],
          recommendedCourses: [
            { title: 'Modern C++ Programming (C++20/23)', platform: 'YouTube', type: 'Free', url: 'https://www.youtube.com' },
            { title: 'C++ Systems & Memory Architecture', platform: 'Coursera', type: 'Free Audit', url: 'https://www.coursera.org' }
          ]
        },
        {
          id: 2,
          milestoneTag: 'Concurrency & Threads',
          estimatedHours: 16,
          title: `Multithreading, Synchronization & Lock-Free Atomics`,
          description: `Eliminate data races, deadlocks, and thread contention with POSIX threads, mutexes, and atomic memory orders.`,
          deliverable: `Thread-safe concurrent work-stealing thread pool with benchmarks.`,
          microSteps: [
            `Implement worker thread pools with std::thread and condition_variable`,
            `Build lock-free single-producer single-consumer queues with std::atomic`,
            `Debug race conditions using ThreadSanitizer (TSan)`
          ],
          prerequisites: ['Pointers & RAII', 'OS Thread Fundamentals'],
          recommendedCourses: [
            { title: 'C++ Concurrency in Action Deep Dive', platform: 'YouTube', type: 'Free', url: 'https://www.youtube.com' }
          ]
        },
        {
          id: 3,
          milestoneTag: 'Network Sockets & I/O',
          estimatedHours: 18,
          title: `High-Throughput Socket Programming & Event Loops`,
          description: `Build non-blocking TCP network servers using epoll / kqueue with custom binary protocol parsing.`,
          deliverable: `Non-blocking TCP echo and key-value server serving 10k concurrent connections.`,
          microSteps: [
            `Create non-blocking POSIX socket listeners with edge-triggered epoll`,
            `Implement structured binary protocol serialization and zero-copy buffers`,
            `Benchmark server throughput and tail latency under heavy load`
          ],
          prerequisites: ['TCP/IP Fundamentals', 'File Descriptors'],
          recommendedCourses: [
            { title: 'Linux System Programming & Network Sockets', platform: 'Coursera', type: 'Free Audit', url: 'https://www.coursera.org' }
          ]
        },
        {
          id: 4,
          milestoneTag: 'Systems Capstone',
          estimatedHours: 20,
          title: `Low-Latency Distributed Backend Service Capstone`,
          description: `Deploy a production-ready C++ microservice with memory-mapped storage, telemetry, and containerized CI/CD.`,
          deliverable: `Zero-copy distributed cache daemon with persistent WAL and automated test suite.`,
          microSteps: [
            `Implement write-ahead logging (WAL) with memory-mapped files (mmap)`,
            `Add high-resolution latency histograms and health monitoring metrics`,
            `Containerize service with multi-stage Docker build and CMake testing`
          ],
          prerequisites: ['Network Sockets', 'Concurrency'],
          recommendedCourses: [
            { title: 'Advanced Systems Design & Low-Latency Architecture', platform: 'YouTube', type: 'Free', url: 'https://www.youtube.com' }
          ]
        }
      ]
    };
  }

  if (lowerGoal.includes('docker') || lowerGoal.includes('kubernetes') || lowerGoal.includes('devops') || lowerGoal.includes('cloud')) {
    return {
      roadmapTitle: `${goal} (${currentLevel} Track)`,
      targetGoal: goal,
      currentLevel,
      timeCommitment,
      learningStyle,
      milestones: [
        {
          id: 1,
          milestoneTag: 'Docker Primitives',
          estimatedHours: 10,
          title: `Containerization Foundations & Docker Internals`,
          description: `Deep dive into Linux namespaces, cgroups, layered storage drivers, and multi-stage container optimization.`,
          deliverable: `Minimal, secure multi-stage containerized microservice repository.`,
          microSteps: [
            `Understand cgroups, namespaces, and union filesystems`,
            `Author minimal Alpine/distroless multi-stage Dockerfiles`,
            `Configure container networking, storage volumes, and non-root users`
          ],
          prerequisites: ['Linux Terminal', 'Git Basics'],
          recommendedCourses: [
            { title: 'Docker Mastery: From Beginner to Production', platform: 'YouTube', type: 'Free', url: 'https://www.youtube.com' }
          ]
        },
        {
          id: 2,
          milestoneTag: 'Compose & Networking',
          estimatedHours: 14,
          title: `Multi-Service Orchestration & Networking`,
          description: `Connect distributed web, database, and caching services with Docker Compose, health checks, and secrets.`,
          deliverable: `Full-stack multi-container application with automated health probes and volume backups.`,
          microSteps: [
            `Orchestrate web, PostgreSQL, and Redis containers in Docker Compose`,
            `Configure custom bridge networks, environment files, and secret mounts`,
            `Implement automated database health checks and restart policies`
          ],
          prerequisites: ['Docker Basics', 'Basic Database Knowledge'],
          recommendedCourses: [
            { title: 'Docker Compose Microservices Architecture', platform: 'Coursera', type: 'Free Audit', url: 'https://www.coursera.org' }
          ]
        },
        {
          id: 3,
          milestoneTag: 'Kubernetes Clusters',
          estimatedHours: 18,
          title: `Kubernetes Architecture & Workload Deployment`,
          description: `Master Pods, Deployments, Services, Ingress, and Persistent Volume Claims in local Minikube / K3s clusters.`,
          deliverable: `Zero-downtime rolling update deployment manifests on Kubernetes.`,
          microSteps: [
            `Deploy Pods, ReplicaSets, and Deployments with rolling update strategies`,
            `Configure ClusterIP, NodePort, and Ingress routing rules`,
            `Manage ConfigMaps, encrypted Secrets, and PersistentVolumeClaims (PVC)`
          ],
          prerequisites: ['Docker Containerization', 'YAML & Networking'],
          recommendedCourses: [
            { title: 'Kubernetes for Developers Deep Dive', platform: 'YouTube', type: 'Free', url: 'https://www.youtube.com' }
          ]
        },
        {
          id: 4,
          milestoneTag: 'GitOps & CI/CD',
          estimatedHours: 20,
          title: `Production DevOps: Helm, CI/CD & Cluster Observability`,
          description: `Automate deployments with GitHub Actions, Helm packaging, and real-time Prometheus/Grafana telemetry.`,
          deliverable: `End-to-end GitOps CI/CD pipeline deploying Helm charts with observability dashboards.`,
          microSteps: [
            `Package Kubernetes manifests into parameterized Helm charts`,
            `Build automated GitHub Actions pipeline with vulnerability scanning`,
            `Deploy Prometheus operator and Grafana dashboards for cluster monitoring`
          ],
          prerequisites: ['Kubernetes Manifests', 'CI/CD Pipelines'],
          recommendedCourses: [
            { title: 'GitOps & Kubernetes Production Engineering', platform: 'YouTube', type: 'Free', url: 'https://www.youtube.com' }
          ]
        }
      ]
    };
  }

  if (lowerGoal.includes('agent') || lowerGoal.includes('ai') || lowerGoal.includes('python') || lowerGoal.includes('llm')) {
    return {
      roadmapTitle: `${goal} (${currentLevel} Track)`,
      targetGoal: goal,
      currentLevel,
      timeCommitment,
      learningStyle,
      milestones: [
        {
          id: 1,
          milestoneTag: 'Agent Architecture',
          estimatedHours: 12,
          title: `Agentic Loops & Tool Schema Calling`,
          description: `Build ReAct reasoning loops, deterministic tool invocation, and JSON schema validation with local LLMs.`,
          deliverable: `Autonomous CLI assistant with verified tool execution sandbox.`,
          microSteps: [
            `Implement ReAct (Reasoning + Acting) decision cycle with prompt engineering`,
            `Define strict tool schemas with Pydantic / Zod and parse tool calls`,
            `Handle loop breaker limits and execution error recovery`
          ],
          prerequisites: ['Python / TypeScript Basics', 'API Fundamentals'],
          recommendedCourses: [
            { title: 'Building Autonomous AI Agents from Scratch', platform: 'YouTube', type: 'Free', url: 'https://www.youtube.com' }
          ]
        },
        {
          id: 2,
          milestoneTag: 'RAG & Vector Memory',
          estimatedHours: 16,
          title: `Vector Embeddings & Semantic Retrieval (RAG)`,
          description: `Index documentation, code repositories, and unstructured data into vector databases with hybrid search.`,
          deliverable: `Semantic knowledge assistant with citation tracking and hybrid reranking.`,
          microSteps: [
            `Chunk text and generate dense vector embeddings`,
            `Store and query embeddings in Chroma / pgvector with cosine similarity`,
            `Implement hybrid keyword + semantic search with reciprocal rank fusion`
          ],
          prerequisites: ['Tool Calling', 'Vector Math Basics'],
          recommendedCourses: [
            { title: 'Production RAG & Vector Systems Masterclass', platform: 'Coursera', type: 'Free Audit', url: 'https://www.coursera.org' }
          ]
        },
        {
          id: 3,
          milestoneTag: 'Multi-Agent Systems',
          estimatedHours: 18,
          title: `Hierarchical Multi-Agent Collaboration`,
          description: `Coordinate specialized planner, researcher, coder, and reviewer subagents with shared state buses.`,
          deliverable: `Multi-agent code generation squad with automated code review pass.`,
          microSteps: [
            `Design supervisor agent delegating tasks to domain-specialized workers`,
            `Build event-driven agent message bus with shared conversation state`,
            `Integrate human-in-the-loop approval gates for critical actions`
          ],
          prerequisites: ['Agent Loops', 'State Management'],
          recommendedCourses: [
            { title: 'Multi-Agent Systems & LangGraph Architecture', platform: 'YouTube', type: 'Free', url: 'https://www.youtube.com' }
          ]
        },
        {
          id: 4,
          milestoneTag: 'Production AI Capstone',
          estimatedHours: 20,
          title: `Autonomous Agent Service with Telemetry & Streaming`,
          description: `Deploy production-grade agent API with SSE streaming, cost telemetry, token rate limits, and safety guards.`,
          deliverable: `Full-stack autonomous AI platform with real-time UI execution visualization.`,
          microSteps: [
            `Implement server-sent events (SSE) streaming token output`,
            `Instrument OpenTelemetry spans for agent reasoning traces and latency`,
            `Add prompt injection guards and output verification benchmarks`
          ],
          prerequisites: ['Multi-Agent Architecture', 'WebSockets / Streaming'],
          recommendedCourses: [
            { title: 'Enterprise AI Agent Deployment & Observability', platform: 'YouTube', type: 'Free', url: 'https://www.youtube.com' }
          ]
        }
      ]
    };
  }

  // Default Full-Stack or Dynamic Goal Fallback
  return {
    roadmapTitle: `${goal} (${currentLevel} Track)`,
    targetGoal: goal,
    currentLevel,
    timeCommitment,
    learningStyle,
    milestones: [
      {
        id: 1,
        milestoneTag: 'Core Architecture',
        estimatedHours: 12,
        title: `Foundations & Architectural Primitives for ${goal}`,
        description: `Establish core primitives, mental models, and development setup aligned with ${learningStyle} methodology.`,
        deliverable: `Production-ready boilerplate repository with verified TypeScript strict configs and linting pipelines.`,
        microSteps: [
          `Set up modern build tooling, strict type safety, and runtime validation`,
          `Implement foundational state flows, modular components, and file structures`,
          `Write automated unit and integration tests to verify core contracts`
        ],
        prerequisites: ['Modern JavaScript', 'Git Fundamentals'],
        recommendedCourses: [
          { title: `${goal} Full Crash Course (2026)`, platform: 'YouTube', type: 'Free', url: 'https://www.youtube.com' },
          { title: `Enterprise Architecture Specialization`, platform: 'Coursera', type: 'Free Audit', url: 'https://www.coursera.org' }
        ]
      },
      {
        id: 2,
        milestoneTag: 'State & Concurrency',
        estimatedHours: 16,
        title: `Async Data Flow & Concurrency Resilience in ${goal}`,
        description: `Eliminate race conditions, unhandled rejections, and stale state mutations during high-frequency user actions.`,
        deliverable: `Real-time reactive dashboard with optimistic mutations and automatic rollback guards.`,
        microSteps: [
          `Integrate abortable fetch mechanisms and background cache reconciliation`,
          `Handle intermittent socket disconnections and conflict resolution`,
          `Benchmark UI responsiveness and rendering waterfalls under load`
        ],
        prerequisites: ['Promises & Async/Await', 'Reactive State Patterns'],
        recommendedCourses: [
          { title: `Advanced Concurrency & State Masterclass`, platform: 'YouTube', type: 'Free', url: 'https://www.youtube.com' }
        ]
      },
      {
        id: 3,
        milestoneTag: 'Distributed Systems',
        estimatedHours: 18,
        title: `Backend Pipelines & Data Persistence for ${goal}`,
        description: `Deploy resilient services, caching layers, and database transactions supporting low-latency reads and writes.`,
        deliverable: `Containerized distributed service with Redis caching, PostgreSQL persistence, and health monitors.`,
        microSteps: [
          `Design scalable relational schema with foreign key constraints`,
          `Configure distributed Redis caching with sliding-window rate limiting`,
          `Deploy multi-stage Docker containers with CI/CD validation`
        ],
        prerequisites: ['Containerization', 'REST & GraphQL APIs'],
        recommendedCourses: [
          { title: `Distributed Systems & Microservices Specialization`, platform: 'Coursera', type: 'Free Audit', url: 'https://www.coursera.org' }
        ]
      },
      {
        id: 4,
        milestoneTag: 'Production Capstone',
        estimatedHours: 20,
        title: `End-to-End Enterprise Capstone & Observability`,
        description: `Unify all competencies into an end-to-end production deployment with telemetry, rate limiting, and security hardening.`,
        deliverable: `Fully deployed, zero-vulnerability cloud application with telemetry and automated test suite.`,
        microSteps: [
          `Harden CORS, JWT session lifecycle, and CSP security headers`,
          `Set up real-time error tracking and telemetry dashboards`,
          `Conduct load testing up to 1,000 requests/sec with automated reporting`
        ],
        prerequisites: ['Cloud Infrastructure', 'Security Best Practices'],
        recommendedCourses: [
          { title: `Production Engineering & DevOps Masterclass`, platform: 'YouTube', type: 'Free', url: 'https://www.youtube.com' }
        ]
      }
    ]
  };
}

/**
 * Generate Dynamic Learning Roadmap with Ollama
 * Uses format: "json" and returns roadmapTitle, milestones with recommendedCourses, microSteps, deliverable
 */
export async function generateDynamicRoadmap({
  targetGoal = 'Full Stack React 19 & Next.js',
  currentLevel = 'Intermediate',
  timeCommitment = '10 hrs/week',
  learningStyle = 'Project-First'
}) {
  const goal = targetGoal || 'Full Stack Modern Web Architecture';
  const topicFallback = getTopicAwareRoadmapFallback({
    targetGoal: goal,
    currentLevel,
    timeCommitment,
    learningStyle
  });

  const status = await checkOllamaStatus();
  if (!status.connected) {
    return {
      success: true,
      source: 'fallback',
      model: 'EduPath Topic Engine',
      ...topicFallback
    };
  }

  try {
    const prompt = `You are an elite curriculum architect.
Create a structured 4-milestone roadmap for: "${goal}" (${currentLevel} level, ${timeCommitment}, ${learningStyle} format).
Output ONLY valid JSON matching this schema:
{
  "roadmapTitle": "${goal} Mastery Track",
  "milestones": [
    {
      "id": 1,
      "milestoneTag": "Short 2-3 word tag",
      "estimatedHours": 12,
      "title": "Clear milestone title for ${goal}",
      "description": "Short 1-2 sentence overview.",
      "deliverable": "Specific hands-on project or repository built.",
      "microSteps": [
        "Concrete actionable sub-task 1",
        "Concrete actionable sub-task 2",
        "Concrete actionable sub-task 3"
      ]
    }
  ]
}`;

    const res = await fetchWithTimeout(`${getOllamaUrl()}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: status.currentModel,
        prompt: prompt,
        format: 'json',
        stream: false,
        options: {
          temperature: 0.2,
          num_predict: 550
        }
      })
    }, 25000);

    if (!res.ok) {
      return { success: true, source: 'fallback', ...topicFallback };
    }

    const data = await res.json();
    let parsed = JSON.parse(data.response);
    if (!parsed || !parsed.milestones || !Array.isArray(parsed.milestones)) {
      if (Array.isArray(parsed)) {
        parsed = { roadmapTitle: `${goal} (${currentLevel} Roadmap)`, milestones: parsed };
      } else {
        return { success: true, source: 'fallback', ...topicFallback };
      }
    }

    const sanitizedMilestones = parsed.milestones.slice(0, 4).map((m, idx) => {
      const fallbackM = topicFallback.milestones[idx] || topicFallback.milestones[0];
      return {
        id: m.id || idx + 1,
        milestoneTag: m.milestoneTag || fallbackM.milestoneTag || `Milestone ${idx + 1}`,
        estimatedHours: Number(m.estimatedHours) || fallbackM.estimatedHours || 12,
        title: m.title || fallbackM.title || `Milestone ${idx + 1}: ${goal}`,
        description: m.description || fallbackM.description || `Master foundational competencies for ${goal}.`,
        deliverable: m.deliverable || fallbackM.deliverable || `Completed project deliverable for milestone ${idx + 1}.`,
        microSteps: Array.isArray(m.microSteps) && m.microSteps.length > 0
          ? m.microSteps.slice(0, 4)
          : fallbackM.microSteps,
        prerequisites: Array.isArray(m.prerequisites) && m.prerequisites.length > 0
          ? m.prerequisites.slice(0, 3)
          : fallbackM.prerequisites || ['Foundational Knowledge'],
        recommendedCourses: Array.isArray(m.recommendedCourses) && m.recommendedCourses.length > 0
          ? m.recommendedCourses.slice(0, 2)
          : fallbackM.recommendedCourses || [
              {
                title: `${goal} Essential Masterclass`,
                platform: 'YouTube',
                type: 'Free',
                url: 'https://www.youtube.com'
              }
            ]
      };
    });

    return {
      success: true,
      source: 'ollama-live',
      model: status.currentModel,
      roadmapTitle: parsed.roadmapTitle || `${goal} (${currentLevel} Roadmap)`,
      milestones: sanitizedMilestones.length === 4 ? sanitizedMilestones : topicFallback.milestones
    };
  } catch (err) {
    console.warn('[Ollama Dynamic Roadmap Notice]:', err.message);
    return {
      success: true,
      source: 'fallback',
      ...topicFallback
    };
  }
}

function getRealWeekDates() {
  const now = new Date();
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const day = d.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const isRestDay = d.getDay() === 0; // Sunday is rest day
    days.push({
      day,
      dateStr,
      isRestDay,
      isToday: i === 0,
      timestamp: d.getTime()
    });
  }
  return days;
}

/**
 * Generate Adaptive Weekly Schedule with Ollama
 * Dynamically distributes uncompleted roadmap tasks across real calendar days
 */
export async function generateOllamaSchedule({ 
  targetRole, 
  careerGoal = '', 
  weeklyHours = 10,
  completedTasks = [],
  remainingTasks = [],
  pace = 'on-track'
}) {
  const status = await checkOllamaStatus();
  const role = targetRole || 'Senior Full-Stack AI Engineer';
  const goal = careerGoal || role;
  const weekDays = getRealWeekDates();
  const targetDailyMinutes = Math.round((Number(weeklyHours || 10) * 60) / 6);

  // Fallback dynamic schedule without any hardcoded "Day 1" / "Day 2"
  const defaultFocusAreas = [
    'Architecture & Foundation Setup',
    'State Flow & Concurrency Resilience',
    'Hands-on Project Milestone Lab',
    'Distributed Services & API Design',
    'AI Multi-Agent & Tool Integration',
    'Portfolio Deployment & Code Review',
    'Rest & Cognitive Schema Recovery'
  ];

  const fallbackSchedule = weekDays.map((wd, idx) => {
    if (wd.isRestDay) {
      return {
        day: wd.day,
        dateStr: wd.dateStr,
        totalMinutes: 0,
        isRestDay: true,
        isToday: wd.isToday,
        focusArea: defaultFocusAreas[idx],
        tasks: []
      };
    }

    const taskTitle = (remainingTasks && remainingTasks[idx])
      ? (typeof remainingTasks[idx] === 'string' ? remainingTasks[idx] : remainingTasks[idx].title || remainingTasks[idx].name)
      : `${goal}: ${defaultFocusAreas[idx]}`;

    return {
      day: wd.day,
      dateStr: wd.dateStr,
      totalMinutes: targetDailyMinutes,
      isRestDay: false,
      isToday: wd.isToday,
      focusArea: defaultFocusAreas[idx],
      tasks: [
        {
          id: `task-${wd.day.toLowerCase()}-1`,
          title: taskTitle,
          duration: `${Math.round(targetDailyMinutes * 0.65)} mins`,
          completed: false
        },
        {
          id: `task-${wd.day.toLowerCase()}-2`,
          title: `Hands-on practice & verification tests for ${defaultFocusAreas[idx]}`,
          duration: `${Math.round(targetDailyMinutes * 0.35)} mins`,
          completed: false
        }
      ]
    };
  });

  if (!status.connected) {
    return {
      success: true,
      source: 'fallback',
      schedule: fallbackSchedule
    };
  }

  try {
    const datesContext = weekDays.map(w => `${w.day}: ${w.dateStr}`).join(', ');
    const prompt = `You are an adaptive engineering curriculum scheduler.
Rebalance a 7-day study timetable for a learner targeting "${goal}" (${role}).
Parameters:
- Target Weekly Commitment: ${weeklyHours} hours (~${targetDailyMinutes} mins/study day)
- Current Learner Pace: ${pace}
- Completed tasks: ${completedTasks.length > 0 ? JSON.stringify(completedTasks.slice(0, 6)) : 'Starting freshly'}
- Remaining uncompleted roadmap tasks to distribute: ${remainingTasks.length > 0 ? JSON.stringify(remainingTasks.slice(0, 8)) : 'Core architectural modules'}
- Real Calendar Days to use: ${datesContext}

CRITICAL RULES:
1. Sunday MUST be a rest day with totalMinutes: 0 and tasks: [].
2. NEVER use "Day 1", "Day 2", etc. You MUST use the exact real calendar dates provided (${datesContext}).
3. Distribute the remaining tasks across Monday to Saturday matching the daily target minutes (~${targetDailyMinutes} mins).

Output ONLY valid JSON matching this schema:
[
  {
    "day": "Monday",
    "dateStr": "${weekDays[0].dateStr}",
    "totalMinutes": ${targetDailyMinutes},
    "isRestDay": false,
    "focusArea": "Concise focus area",
    "tasks": [
      { "id": "task-mon-1", "title": "Clear actionable task", "duration": "45 mins", "completed": false }
    ]
  }
]`;

    const res = await fetchWithTimeout(`${getOllamaUrl()}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: status.currentModel,
        prompt: prompt,
        format: 'json',
        stream: false,
        options: { temperature: 0.25 }
      })
    }, 35000);

    if (!res.ok) {
      return { success: true, source: 'fallback', schedule: fallbackSchedule };
    }

    const data = await res.json();
    let parsed = JSON.parse(data.response);
    if (!Array.isArray(parsed) && parsed.schedule) {
      parsed = parsed.schedule;
    }

    if (!Array.isArray(parsed) || parsed.length !== 7) {
      return { success: true, source: 'fallback', schedule: fallbackSchedule };
    }

    // Ensure real dateStr are preserved
    const sanitized = parsed.map((dayPlan, idx) => ({
      ...dayPlan,
      day: weekDays[idx].day,
      dateStr: dayPlan.dateStr && !dayPlan.dateStr.toLowerCase().includes('day ') ? dayPlan.dateStr : weekDays[idx].dateStr,
      isRestDay: weekDays[idx].isRestDay || Boolean(dayPlan.isRestDay),
      isToday: weekDays[idx].isToday
    }));

    return {
      success: true,
      source: 'ollama-live',
      model: status.currentModel,
      schedule: sanitized
    };
  } catch (err) {
    console.warn('[Ollama Schedule Error]:', err.message);
    return {
      success: true,
      source: 'fallback',
      schedule: fallbackSchedule
    };
  }
}

/**
 * Generate gap-targeted Course Recommendations with Ollama
 */
export async function generateOllamaCourses({ targetRole, skill = 'React 19 & Agentic AI' }) {
  const status = await checkOllamaStatus();
  const role = targetRole || 'Senior Full-Stack AI Engineer';

  const fallbackCourses = [
    {
      id: 'ollama-c-1',
      title: 'Advanced React 19 Server Components & Concurrent Actions',
      description: 'Master practical Server Action pipelines, zero-bundle boundaries, and partial prerendering recommended by Ollama to eliminate frontend bottlenecks.',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
      type: 'course',
      provider: 'Ollama AI Synthesized Lab',
      providerType: 'internal',
      duration: '1h 30m',
      durationMinutes: 90,
      difficulty: 'Advanced',
      matchScore: 99,
      category: 'Ollama AI Recommendations',
      isLive: true,
      tags: [skill, 'React 19', 'Ollama AI'],
      keyTakeaways: [
        'useActionState vs custom reducer optimizations',
        'Eliminating waterfall request chains in server components',
        'Deterministic error boundary recovery'
      ]
    },
    {
      id: 'ollama-c-2',
      title: 'Distributed State Synchronization & Race Condition Proofing',
      description: 'Synthesized by Ollama specifically to address concurrency friction points. Learn atomic optimistic updates and vector clock conflict resolution.',
      thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
      type: 'lab',
      provider: 'Ollama Concurrency Suite',
      providerType: 'internal',
      duration: '45 mins',
      durationMinutes: 45,
      difficulty: 'Senior',
      matchScore: 97,
      category: 'Ollama AI Recommendations',
      isLive: true,
      tags: ['Concurrency', 'AbortController', 'Ollama AI'],
      keyTakeaways: [
        'AbortController request cancellation in asynchronous trees',
        'Optimistic state rollbacks on intermittent networks',
        'End-to-end integration test patterns with MSW'
      ]
    },
    {
      id: 'ollama-c-3',
      title: 'Autonomous Multi-Agent Architecture with Tool Calling',
      description: 'Build recursive AI reasoning loops, JSON schema validation, and sandboxed execution environments recommended by Ollama.',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      type: 'course',
      provider: 'Ollama Agentic Systems',
      providerType: 'internal',
      duration: '2h 15m',
      durationMinutes: 135,
      difficulty: 'Advanced',
      matchScore: 96,
      category: 'Ollama AI Recommendations',
      isLive: true,
      tags: ['Agentic AI', 'Tool Calling', 'Ollama AI'],
      keyTakeaways: [
        'Recursive planning loops and loop breaker guards',
        'Strict schema enforcement with Zod / Pydantic',
        'Stateful multi-agent communication buses'
      ]
    }
  ];

  if (!status.connected) {
    return {
      success: true,
      source: 'fallback',
      courses: fallbackCourses
    };
  }

  try {
    const prompt = `You are an AI education tutor. Suggest 3 specialized, highly practical courses/labs for a learner aiming to become "${role}" focusing on "${skill}".
Return ONLY a JSON array matching this format:
[
  {
    "title": "Course Title",
    "description": "2-sentence practical curriculum summary",
    "type": "course",
    "duration": "1h 30m",
    "durationMinutes": 90,
    "difficulty": "Advanced",
    "matchScore": 98,
    "tags": ["Tag1", "Tag2"],
    "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"]
  }
]`;

    const res = await fetchWithTimeout(`${getOllamaUrl()}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: status.currentModel,
        prompt: prompt,
        format: 'json',
        stream: false,
        options: { temperature: 0.4 }
      })
    }, 25000);

    if (!res.ok) {
      return { success: true, source: 'fallback', courses: fallbackCourses };
    }

    const data = await res.json();
    let parsed = JSON.parse(data.response);
    if (!Array.isArray(parsed) && parsed.courses) {
      parsed = parsed.courses;
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return { success: true, source: 'fallback', courses: fallbackCourses };
    }

    const thumbnails = [
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80'
    ];

    const mapped = parsed.slice(0, 4).map((c, idx) => ({
      id: `ollama-c-${Date.now()}-${idx}`,
      title: c.title || `Ollama Recommended Module ${idx + 1}`,
      description: c.description || `Specialized training curriculum synthesized by ${status.currentModel}.`,
      thumbnail: thumbnails[idx % thumbnails.length],
      type: c.type || 'course',
      provider: `Ollama AI (${status.currentModel})`,
      providerType: 'internal',
      duration: c.duration || '1h 20m',
      durationMinutes: c.durationMinutes || 80,
      difficulty: c.difficulty || 'Advanced',
      matchScore: c.matchScore || Math.min(99, 95 + idx),
      category: 'Ollama AI Recommendations',
      isLive: true,
      tags: [...(c.tags || [skill]), 'Ollama AI'],
      keyTakeaways: c.keyTakeaways || [
        'Production-tested architecture patterns',
        'Hands-on implementation checkpoints',
        'Direct alignment with industry benchmarks'
      ]
    }));

    return {
      success: true,
      source: 'ollama-live',
      model: status.currentModel,
      courses: mapped
    };
  } catch (err) {
    console.warn('[Ollama Course Error]:', err.message);
    return {
      success: true,
      source: 'fallback',
      courses: fallbackCourses
    };
  }
}

/**
 * AI Query Refinement
 * Transforms a skill gap into a precise 4-6 word search query
 * including user's difficulty level and current year.
 */
export async function refineCourseSearchQuery({ skill = 'React', role = 'Senior Full-Stack AI Engineer', difficulty = 'Advanced' }) {
  const currentYear = new Date().getFullYear();
  const validDifficulty = ['Beginner', 'Intermediate', 'Advanced'].includes(difficulty)
    ? difficulty
    : 'Advanced';

  // Deterministic 4-6 word fallback
  const createFallbackQuery = () => {
    const cleanTokens = skill
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 1 && !['and', 'the', 'for', 'with', '&'].includes(w.toLowerCase()));
    
    // Use 2-3 core words from skill
    const core = cleanTokens.slice(0, 2).join(' ') || skill.split(/\s+/).slice(0, 2).join(' ');
    // Format: "React 19 Advanced Tutorial 2026" (5 words)
    const query = `${core} ${validDifficulty} tutorial ${currentYear}`.trim();
    const words = query.split(/\s+/);
    if (words.length < 4) {
      return `${core} ${validDifficulty} full course ${currentYear}`;
    }
    if (words.length > 6) {
      return words.slice(0, 6).join(' ');
    }
    return query;
  };

  const status = await checkOllamaStatus();
  if (!status.connected) {
    const fallback = createFallbackQuery();
    return {
      refinedQuery: fallback,
      originalSkill: skill,
      difficulty: validDifficulty,
      currentYear,
      source: 'heuristic-refinement'
    };
  }

  try {
    const prompt = `You are a curriculum search optimizer. A learner targeting "${role}" has a skill gap in "${skill}". Their level is "${validDifficulty}".
Generate a precise 4 to 6 word search query for video and course APIs.
Requirements:
1. It MUST be between 4 and 6 words total.
2. It MUST explicitly contain "${validDifficulty}".
3. It MUST explicitly contain "${currentYear}".
4. It MUST directly focus on "${skill}".
Output ONLY the 4 to 6 words search query with no quotes, punctuation, or explanations.`;

    const res = await fetchWithTimeout(`${getOllamaUrl()}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: status.currentModel,
        prompt: prompt,
        stream: false,
        options: { temperature: 0.2, num_predict: 20 }
      })
    }, 20000);

    if (res.ok) {
      const data = await res.json();
      const rawText = (data.response || '').trim().replace(/["'’.]/g, '');
      const words = rawText.split(/\s+/).filter(Boolean);

      // Validate word count (4 to 6 words) and presence of difficulty & year
      if (words.length >= 4 && words.length <= 6 && rawText.includes(validDifficulty)) {
        const queryWithYear = rawText.includes(currentYear.toString()) ? rawText : `${words.slice(0, 5).join(' ')} ${currentYear}`;
        return {
          refinedQuery: queryWithYear,
          originalSkill: skill,
          difficulty: validDifficulty,
          currentYear,
          source: 'ollama-ai'
        };
      }
    }

    return {
      refinedQuery: createFallbackQuery(),
      originalSkill: skill,
      difficulty: validDifficulty,
      currentYear,
      source: 'heuristic-refinement'
    };
  } catch (err) {
    console.warn('[Query Refinement Error]:', err.message);
    return {
      refinedQuery: createFallbackQuery(),
      originalSkill: skill,
      difficulty: validDifficulty,
      currentYear,
      source: 'heuristic-refinement'
    };
  }
}

/**
 * AI Quality Reranking
 * Evaluates the top 5 candidates with Ollama and selects the top 2
 * that most directly eliminate the learner's skill gap.
 */
export async function rerankCoursesWithOllama({ skill = 'React', role = 'Senior Full-Stack AI Engineer', difficulty = 'Advanced', candidates = [] }) {
  const skillTerms = (skill || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !['and', 'for', 'the', 'with', 'course', 'tutorial', 'full', 'guide', '2024', '2025', '2026', 'mastery', 'crash'].includes(t));

  // Prune candidates that have zero relevance to the skill
  const relevantCandidates = candidates.filter(c => {
    if (skillTerms.length === 0) return true;
    const titleLower = (c.title || '').toLowerCase();
    const descLower = (c.description || '').toLowerCase();
    const tagsLower = Array.isArray(c.tags) ? c.tags.join(' ').toLowerCase() : '';
    return skillTerms.some(term => titleLower.includes(term) || descLower.includes(term) || tagsLower.includes(term));
  });

  const candidatePool = relevantCandidates.length >= 2 ? relevantCandidates : candidates;

  if (!candidatePool || candidatePool.length <= 2) {
    return (candidatePool || []).map((c, idx) => ({
      ...c,
      aiReranked: true,
      aiRank: idx + 1,
      aiRationale: `Directly targets key concepts in ${skill}.`
    }));
  }

  // Top 5 candidates for evaluation
  const topCandidates = candidatePool.slice(0, 5);

  // Heuristic reranking fallback
  const runHeuristicRerank = () => {
    const skillTerms = skill.toLowerCase().split(/\s+/);
    const scored = topCandidates.map(c => {
      const titleLower = (c.title || '').toLowerCase();
      const descLower = (c.description || '').toLowerCase();
      let score = (c.rating || 4.5) * 10;

      skillTerms.forEach(term => {
        if (titleLower.includes(term)) score += 15;
        if (descLower.includes(term)) score += 8;
      });

      if (c.badge === 'Free' || c.badge === 'Free Audit') score += 5;
      if (c.difficulty === difficulty) score += 5;

      return { ...c, _score: score };
    });

    scored.sort((a, b) => b._score - a._score);
    const selected = scored.slice(0, 2);

    return selected.map((item, idx) => ({
      ...item,
      aiReranked: true,
      aiRank: idx + 1,
      aiRationale: idx === 0
        ? `Top-rated deep dive selected for comprehensive practical coverage of ${skill}.`
        : `High-impact technical curriculum directly reinforcing production ${skill} patterns.`
    }));
  };

  const status = await checkOllamaStatus();
  if (!status.connected) {
    return runHeuristicRerank();
  }

  try {
    const candidateSummary = topCandidates.map((c, i) =>
      `${i + 1}. [ID: ${c.id}] "${c.title}" by ${c.instructor || c.provider} (${c.duration}, ${c.badge}) - ${c.description?.slice(0, 120)}`
    ).join('\n');

    const prompt = `You are a principal software engineering curriculum curator.
A learner targeting "${role}" has a skill gap in "${skill}" (${difficulty} level).
Here are 5 candidate courses:
${candidateSummary}

Pick the TOP 2 most relevant courses that directly and most effectively solve this specific skill gap.
Return ONLY valid JSON matching this schema:
[
  { "id": "candidate_id", "rank": 1, "aiRationale": "1 sentence why this best solves the gap" },
  { "id": "candidate_id", "rank": 2, "aiRationale": "1 sentence why this best solves the gap" }
]`;

    const res = await fetchWithTimeout(`${getOllamaUrl()}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: status.currentModel,
        prompt: prompt,
        format: 'json',
        stream: false,
        options: { temperature: 0.2 }
      })
    }, 25000);

    if (res.ok) {
      const data = await res.json();
      let parsed = JSON.parse(data.response);
      if (!Array.isArray(parsed) && parsed.courses) parsed = parsed.courses;
      if (!Array.isArray(parsed) && parsed.top) parsed = parsed.top;

      if (Array.isArray(parsed) && parsed.length >= 2) {
        const top2 = [];
        for (const item of parsed.slice(0, 2)) {
          const match = topCandidates.find(c => c.id === item.id);
          if (match) {
            top2.push({
              ...match,
              aiReranked: true,
              aiRank: top2.length + 1,
              aiRationale: item.aiRationale || `Selected by ${status.currentModel} to eradicate ${skill} friction.`
            });
          }
        }

        if (top2.length === 2) {
          return top2;
        }
      }
    }

    return runHeuristicRerank();
  } catch (err) {
    console.warn('[Rerank Error]:', err.message);
    return runHeuristicRerank();
  }
}

