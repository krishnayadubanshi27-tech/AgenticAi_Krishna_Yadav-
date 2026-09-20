import { ResourceItem } from '../types/learning';

export interface ConfiguredProviders {
  youtube: boolean;
  coursera: boolean;
  udemy: boolean;
}

export interface RecommendCoursesResponse {
  success: boolean;
  query: string;
  originalSkill?: string;
  refinedQuery?: string;
  difficulty?: string;
  currentYear?: number;
  role: string;
  source: 'live-third-party-api' | 'curated-fallback';
  message: string;
  pipeline?: {
    queryRefinement: {
      query: string;
      wordCount: number;
      source: string;
    };
    strictFiltersApplied: {
      youtube: string;
      courseApis: string;
    };
    aiReranking: {
      candidatesEvaluated: number;
      topPicked: number;
      model: string;
    };
  };
  configuredProviders: ConfiguredProviders;
  totalResults: number;
  courses: ResourceItem[];
}

export interface HealthCheckResponse {
  status: string;
  service: string;
  timestamp: string;
  configuredProviders: ConfiguredProviders;
}

/**
 * Calls the unified backend proxy endpoint /api/recommend-courses
 * Third-party keys (YouTube, Coursera, Udemy) stay securely on the server.
 */
export async function fetchRecommendedCourses(params: {
  skill?: string;
  role?: string;
  difficulty?: string;
  limit?: number;
}): Promise<RecommendCoursesResponse> {
  const queryParams = new URLSearchParams();
  if (params.skill) queryParams.set('skill', params.skill);
  if (params.role) queryParams.set('role', params.role);
  if (params.difficulty) queryParams.set('difficulty', params.difficulty);
  if (params.limit) queryParams.set('limit', params.limit.toString());

  const url = `/api/recommend-courses?${queryParams.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Proxy error (${response.status}): ${response.statusText}`);
    }
    const data: RecommendCoursesResponse = await response.json();
    return data;
  } catch (err: any) {
    console.error('Failed to fetch from course proxy:', err);
    throw err;
  }
}

/**
 * Checks proxy health and determines which third-party API credentials are configured.
 */
export async function fetchProxyHealth(): Promise<HealthCheckResponse | null> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
