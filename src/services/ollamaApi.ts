import { LearningObjective, ResourceItem, AIChatMessage, DynamicRoadmap, RoadmapQuestionnaireInputs } from '../types/learning';

export interface OllamaStatusResponse {
  success: boolean;
  connected: boolean;
  currentModel: string;
  availableModels: string[];
  baseUrl?: string;
  error?: string;
}

export interface OllamaChatResponse {
  success: boolean;
  reply: string;
  suggestions: string[];
  model: string;
  error?: string;
}

export interface OllamaRoadmapResponse {
  success: boolean;
  source: string;
  model?: string;
  milestones: LearningObjective[];
  error?: string;
}

export interface OllamaScheduleResponse {
  success: boolean;
  source: string;
  model?: string;
  schedule: Array<{
    day: string;
    dateStr: string;
    totalMinutes?: number;
    isRestDay: boolean;
    focusArea: string;
    tasks: Array<{
      id: string;
      title: string;
      duration?: string;
      durationMinutes?: number;
      completed: boolean;
      type?: string;
      skillName?: string;
    }>;
  }>;
  error?: string;
}

export interface OllamaCoursesResponse {
  success: boolean;
  source: string;
  model?: string;
  courses: ResourceItem[];
  error?: string;
}

/**
 * Check Ollama AI backend connection and list of active models
 */
export async function getOllamaStatus(): Promise<OllamaStatusResponse> {
  try {
    const res = await fetch('/api/ai/status');
    if (!res.ok) {
      return {
        success: false,
        connected: false,
        currentModel: 'phi4-mini:latest',
        availableModels: [],
        error: `Server responded with status ${res.status}`
      };
    }
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      connected: false,
      currentModel: 'phi4-mini:latest',
      availableModels: [],
      error: err.message
    };
  }
}

/**
 * Send chat message to local Ollama AI mentor
 */
export async function sendOllamaChat(params: {
  message: string;
  history?: AIChatMessage[];
  context?: {
    targetRole?: string;
    skills?: any[];
    struggleTopic?: string;
  };
}): Promise<OllamaChatResponse> {
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!res.ok) {
      throw new Error(`Chat API error (${res.status})`);
    }

    return await res.json();
  } catch (err: any) {
    console.error('Ollama chat failed:', err);
    return {
      success: false,
      reply: "I am having trouble reaching Ollama right now. Please verify `ollama serve` is running.",
      suggestions: ['Check Ollama status', 'Try again in a moment'],
      model: 'Fallback'
    };
  }
}

/**
 * Request Ollama to generate an adaptive structured roadmap
 */
export async function generateRoadmapWithOllamaApi(params: {
  targetRole: string;
  experienceLevel?: string;
  currentSkills?: string[];
  goal?: string;
}): Promise<OllamaRoadmapResponse> {
  try {
    const res = await fetch('/api/ai/roadmap-suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!res.ok) {
      throw new Error(`Roadmap API error (${res.status})`);
    }

    return await res.json();
  } catch (err: any) {
    console.error('Ollama roadmap generation failed:', err);
    throw err;
  }
}

/**
 * Request Ollama to generate / rebalance a weekly schedule
 */
export async function generateScheduleWithOllamaApi(params: {
  targetRole: string;
  careerGoal?: string;
  weeklyHours?: number;
  completedTasks?: string[];
  remainingTasks?: string[];
  pace?: string;
}): Promise<OllamaScheduleResponse> {
  try {
    const res = await fetch('/api/ai/schedule-suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!res.ok) {
      throw new Error(`Schedule API error (${res.status})`);
    }

    return await res.json();
  } catch (err: any) {
    console.error('Ollama schedule generation failed:', err);
    throw err;
  }
}

/**
 * Request Ollama to recommend tailored courses for a specific skill / role
 */
export async function generateCoursesWithOllamaApi(params: {
  targetRole: string;
  skill: string;
}): Promise<OllamaCoursesResponse> {
  try {
    const res = await fetch('/api/ai/recommend-courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!res.ok) {
      throw new Error(`Courses API error (${res.status})`);
    }

    return await res.json();
  } catch (err: any) {
    console.error('Ollama courses generation failed:', err);
    throw err;
  }
}

/**
 * Generate a dynamic structured roadmap matching the user's questionnaire inputs
 * Calls POST /api/generate-roadmap
 */
export async function generateDynamicRoadmapApi(inputs: RoadmapQuestionnaireInputs): Promise<DynamicRoadmap & { success: boolean; source?: string }> {
  try {
    const res = await fetch('/api/generate-roadmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputs)
    });

    if (!res.ok) {
      throw new Error(`Dynamic roadmap API error (${res.status})`);
    }

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error('Dynamic roadmap generation failed:', err);
    throw err;
  }
}

