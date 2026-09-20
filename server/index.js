import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  fetchYouTubeCourses,
  fetchCourseraCourses,
  fetchUdemyCourses,
  getCuratedFallbackCourses
} from './services/courseProviders.js';
import {
  registerUser,
  authenticateUser,
  getUserByEmail,
  getDemoAccounts
} from './services/authService.js';
import {
  checkOllamaStatus,
  generateOllamaChat,
  generateOllamaRoadmap,
  generateOllamaSchedule,
  generateOllamaCourses,
  generateDynamicRoadmap,
  refineCourseSearchQuery,
  rerankCoursesWithOllama
} from './services/ollamaService.js';

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

/**
 * Health Check & Provider Status
 * Informs the frontend which third-party APIs have active credentials configured.
 */
app.get('/api/health', (req, res) => {
  const ytKey = process.env.YOUTUBE_API_KEY;
  const courseraKey = process.env.COURSERA_API_KEY;
  const udemyId = process.env.UDEMY_CLIENT_ID;
  const udemySecret = process.env.UDEMY_CLIENT_SECRET;

  res.json({
    status: 'online',
    service: 'EduPath Course Proxy Engine',
    timestamp: new Date().toISOString(),
    configuredProviders: {
      youtube: Boolean(ytKey && ytKey !== 'your_youtube_api_key_here'),
      coursera: Boolean(courseraKey && courseraKey !== 'your_coursera_api_key_here'),
      udemy: Boolean(udemyId && udemySecret && udemyId !== 'your_udemy_client_id_here')
    }
  });
});

/**
/**
 * Unified Course Recommendation Endpoint with AI-Curated Filtering & Reranking
 * GET /api/recommend-courses?skill=react&role=Frontend%20Architect&difficulty=Advanced
 *
 * 1. AI Query Refinement: Generates precise 4-6 word query including difficulty & current year.
 * 2. Strict API Filters:
 *    - YouTube: videoDuration=long (>20m, no shorts), published within last 3 years, Free badge.
 *    - Course APIs: ratings >= 4.3 stars, free/audit prioritized.
 * 3. AI Quality Reranking: Evaluates top 5 candidates with Ollama to pick top 2 most relevant courses.
 * 4. Clean formatting: Title, instructor, duration, badge (Free vs Paid), direct link, AI rationale.
 */
app.get('/api/recommend-courses', async (req, res) => {
  try {
    const skill = (req.query.skill || req.query.q || 'React 19 & State Concurrency').toString().trim();
    const role = (req.query.role || 'Senior Full-Stack AI Engineer').toString().trim();
    const difficulty = (req.query.difficulty || 'Advanced').toString().trim();

    console.log(`[AI Pipeline] Processing recommendation for skill: "${skill}", role: "${role}", difficulty: "${difficulty}"`);

    // Step 1: AI Query Refinement (4-6 words with difficulty & year)
    const refinement = await refineCourseSearchQuery({ skill, role, difficulty });
    const refinedQuery = refinement.refinedQuery;
    console.log(`[AI Pipeline] Refined Search Query (${refinement.source}): "${refinedQuery}"`);

    // Step 2: Strict Multi-Provider Search with API Filters
    const [youtubeResults, courseraResults, udemyResults] = await Promise.allSettled([
      fetchYouTubeCourses(refinedQuery, 5),
      fetchCourseraCourses(refinedQuery, 5),
      fetchUdemyCourses(refinedQuery, 5)
    ]);

    const candidatePool = [];

    if (youtubeResults.status === 'fulfilled' && Array.isArray(youtubeResults.value)) {
      candidatePool.push(...youtubeResults.value);
    }
    if (courseraResults.status === 'fulfilled' && Array.isArray(courseraResults.value)) {
      candidatePool.push(...courseraResults.value);
    }
    if (udemyResults.status === 'fulfilled' && Array.isArray(udemyResults.value)) {
      candidatePool.push(...udemyResults.value);
    }

    // Filter candidate pool to guarantee strict topic relevance to `skill`
    const skillTerms = (skill || '')
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2 && !['and', 'for', 'the', 'with', 'course', 'tutorial', 'full', 'guide', '2024', '2025', '2026', 'mastery', 'crash'].includes(t));

    const topicRelevantCandidates = candidatePool.filter(c => {
      if (skillTerms.length === 0) return true;
      const titleLower = (c.title || '').toLowerCase();
      const descLower = (c.description || '').toLowerCase();
      const tagsLower = Array.isArray(c.tags) ? c.tags.join(' ').toLowerCase() : '';
      return skillTerms.some(term => titleLower.includes(term) || descLower.includes(term) || tagsLower.includes(term));
    });

    const hasLiveCourses = topicRelevantCandidates.length > 0;
    const rawCandidates = hasLiveCourses
      ? topicRelevantCandidates
      : getCuratedFallbackCourses(skill, role);

    // Limit to top 5 candidates for AI evaluation
    const top5Candidates = rawCandidates.slice(0, 5);

    // Step 3: AI Quality Reranking (Ollama picks top 2 solving the gap)
    console.log(`[AI Pipeline] Passing ${top5Candidates.length} candidate courses through AI Quality Reranking...`);
    const top2Courses = await rerankCoursesWithOllama({
      skill,
      role,
      difficulty,
      candidates: top5Candidates
    });

    const ytKey = process.env.YOUTUBE_API_KEY;
    const courseraKey = process.env.COURSERA_API_KEY;
    const udemyId = process.env.UDEMY_CLIENT_ID;

    return res.json({
      success: true,
      originalSkill: skill,
      refinedQuery: refinedQuery,
      difficulty: refinement.difficulty,
      currentYear: refinement.currentYear,
      role: role,
      source: hasLiveCourses ? 'live-third-party-api' : 'curated-fallback',
      pipeline: {
        queryRefinement: {
          query: refinedQuery,
          wordCount: refinedQuery.split(/\s+/).length,
          source: refinement.source
        },
        strictFiltersApplied: {
          youtube: 'videoDuration=long (>20m), no-shorts, publishedAfter 3yr, Free badge',
          courseApis: 'ratings >= 4.3 stars, free/audit option prioritized'
        },
        aiReranking: {
          candidatesEvaluated: top5Candidates.length,
          topPicked: top2Courses.length,
          model: 'phi4-mini:latest'
        }
      },
      message: `AI refined query "${refinedQuery}", applied strict filters (>20m, <3yr, >=4.3★), and reranked top 2 courses for ${skill}.`,
      configuredProviders: {
        youtube: Boolean(ytKey && ytKey !== 'your_youtube_api_key_here'),
        coursera: Boolean(courseraKey && courseraKey !== 'your_coursera_api_key_here'),
        udemy: Boolean(udemyId && udemyId !== 'your_udemy_client_id_here')
      },
      totalResults: top2Courses.length,
      courses: top2Courses
    });
  } catch (err) {
    console.error('[AI Pipeline Error] Failed processing /api/recommend-courses:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to process AI-curated course recommendations',
      details: err.message
    });
  }
});

// ==========================================
// Authentication Endpoints
// ==========================================

/**
 * Sign In with Email & Password
 * POST /api/auth/login
 */
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const result = authenticateUser({ email, password });
    console.log(`[Auth] User signed in: ${result.user.email} (${result.user.name})`);
    return res.json({
      success: true,
      message: `Welcome back, ${result.user.name}!`,
      user: result.user,
      token: result.token
    });
  } catch (err) {
    console.warn(`[Auth Warning] Sign in failed:`, err.message);
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * Create New Account with Email
 * POST /api/auth/register
 */
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, name, targetRole, experienceLevel } = req.body;
    const result = registerUser({ email, password, name, targetRole, experienceLevel });
    console.log(`[Auth] New account created: ${result.user.email} (${result.user.name})`);
    return res.status(201).json({
      success: true,
      message: `Account created successfully! Welcome to EduPath, ${result.user.name}.`,
      user: result.user,
      token: result.token
    });
  } catch (err) {
    console.warn(`[Auth Warning] Registration failed:`, err.message);
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * Get Pre-configured Demo Accounts
 * GET /api/auth/demo-users
 */
app.get('/api/auth/demo-users', (req, res) => {
  return res.json({
    success: true,
    users: getDemoAccounts()
  });
});

// ==========================================
// Ollama AI Endpoints
// ==========================================

/**
 * Check Ollama AI Status & Model Availability
 * GET /api/ai/status
 */
app.get('/api/ai/status', async (req, res) => {
  try {
    const status = await checkOllamaStatus();
    return res.json({
      success: true,
      ...status
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      connected: false,
      error: err.message
    });
  }
});

/**
 * AI Mentor Chat powered by Ollama
 * POST /api/ai/chat
 * Body: { message, history, context }
 */
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history, context } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }
    const result = await generateOllamaChat({ message, history, context });
    return res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error('[AI Chat Route Error]:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate AI chat response',
      details: err.message
    });
  }
});

/**
 * AI Roadmap Milestones Suggestion powered by Ollama
 * POST /api/ai/roadmap-suggest
 * Body: { targetRole, experienceLevel, currentSkills, goal }
 */
app.post('/api/ai/roadmap-suggest', async (req, res) => {
  try {
    const { targetRole, experienceLevel, currentSkills, goal } = req.body;
    const result = await generateOllamaRoadmap({ targetRole, experienceLevel, currentSkills, goal });
    return res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error('[AI Roadmap Route Error]:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate AI roadmap suggestions',
      details: err.message
    });
  }
});

/**
 * Dynamic Custom Learning Roadmap powered by Ollama (phi4-mini:latest)
 * POST /api/generate-roadmap
 * Body: { targetGoal, currentLevel, timeCommitment, learningStyle }
 * Returns structured JSON: { roadmapTitle, milestones: [...] }
 */
app.post('/api/generate-roadmap', async (req, res) => {
  try {
    const { targetGoal, currentLevel, timeCommitment, learningStyle } = req.body || {};
    console.log(`[Ollama Roadmap] Generating dynamic roadmap for "${targetGoal}" (${currentLevel}, ${timeCommitment}, ${learningStyle})`);
    const result = await generateDynamicRoadmap({
      targetGoal,
      currentLevel,
      timeCommitment,
      learningStyle
    });
    return res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error('[Generate Dynamic Roadmap Error]:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate dynamic roadmap',
      details: err.message
    });
  }
});

/**
 * AI Adaptive Weekly Schedule powered by Ollama
 * POST /api/ai/schedule-suggest
 * Body: { targetRole, weeklyHours }
 */
app.post('/api/ai/schedule-suggest', async (req, res) => {
  try {
    const { targetRole, careerGoal, weeklyHours, completedTasks, remainingTasks, pace } = req.body;
    const result = await generateOllamaSchedule({ targetRole, careerGoal, weeklyHours, completedTasks, remainingTasks, pace });
    return res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error('[AI Schedule Route Error]:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate AI schedule suggestions',
      details: err.message
    });
  }
});

/**
 * AI Course Recommendations powered by Ollama
 * POST /api/ai/recommend-courses
 * Body: { targetRole, skill }
 */
app.post('/api/ai/recommend-courses', async (req, res) => {
  try {
    const { targetRole, skill } = req.body;
    const result = await generateOllamaCourses({ targetRole, skill });
    return res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error('[AI Courses Route Error]:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate AI course recommendations',
      details: err.message
    });
  }
});

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found on EduPath backend proxy' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 EduPath Backend Proxy is listening on port ${PORT}`);
  console.log(`📡 Unified Endpoint: http://localhost:${PORT}/api/recommend-courses`);
  console.log(`🩺 Health Check:      http://localhost:${PORT}/api/health`);
  console.log(`=================================================`);
});
