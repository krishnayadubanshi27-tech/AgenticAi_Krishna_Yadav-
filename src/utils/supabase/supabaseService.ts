import { supabase } from './client';
import { DynamicRoadmap, ResourceItem, ProgressTracker } from '../../types/learning';
import { UserPreferences } from '../../store/useAppStore';

export interface RememberedUserProfile {
  id: string;
  email: string;
  name: string;
  targetRole: string;
  experienceLevel: string;
  avatar: string;
  lastLoginAt: number;
  isCurrent?: boolean;
}

export interface UserDataPayload {
  userId?: string;
  email: string;
  name: string;
  targetRole?: string;
  experienceLevel?: string;
  preferences?: UserPreferences;
  activeRoadmap?: DynamicRoadmap | null;
  savedCourses?: ResourceItem[];
  progressTracker?: ProgressTracker;
}

const REMEMBERED_USERS_KEY = 'edupath_remembered_users';
const CURRENT_USER_KEY = 'edupath_current_user';
const SUPABASE_OFFLINE_CACHE_KEY = 'edupath_supabase_offline_cache';

/**
 * Default initial demo user: Krishna Yadav
 */
export const DEFAULT_DEMO_USER: RememberedUserProfile = {
  id: 'user-demo-krishna',
  email: 'krishna.yadav@edupath.ai',
  name: 'Krishna Yadav',
  targetRole: 'Senior Full-Stack AI Engineer',
  experienceLevel: 'Senior (5+ yrs)',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  lastLoginAt: Date.now(),
  isCurrent: true
};

/**
 * Get all remembered users from localStorage (pre-seeded with demo profiles)
 */
export function getRememberedUsers(): RememberedUserProfile[] {
  try {
    const raw = localStorage.getItem(REMEMBERED_USERS_KEY);
    if (!raw) {
      const initial: RememberedUserProfile[] = [
        DEFAULT_DEMO_USER,
        {
          id: 'user-demo-alex',
          email: 'alex.chen@edupath.ai',
          name: 'Alex Chen',
          targetRole: 'Staff AI Engineer',
          experienceLevel: 'Mid-Level (3-5 yrs)',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          lastLoginAt: Date.now() - 86400000 * 2,
          isCurrent: false
        },
        {
          id: 'user-demo-sarah',
          email: 'sarah.kim@edupath.ai',
          name: 'Sarah Kim',
          targetRole: 'Frontend Architect',
          experienceLevel: 'Senior (5+ yrs)',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
          lastLoginAt: Date.now() - 86400000 * 5,
          isCurrent: false
        }
      ];
      localStorage.setItem(REMEMBERED_USERS_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [DEFAULT_DEMO_USER];
  }
}

/**
 * Save or update a remembered user profile
 */
export function saveRememberedUser(profile: Partial<RememberedUserProfile> & { email: string; name: string }): RememberedUserProfile[] {
  try {
    const currentList = getRememberedUsers();
    const normalizedEmail = profile.email.trim().toLowerCase();
    
    // Check if user already exists
    const existingIdx = currentList.findIndex(u => u.email.toLowerCase() === normalizedEmail);
    const updatedUser: RememberedUserProfile = {
      id: profile.id || (existingIdx >= 0 ? currentList[existingIdx].id : `user-${Date.now()}`),
      email: normalizedEmail,
      name: profile.name.trim() || 'Krishna Yadav',
      targetRole: profile.targetRole || 'Senior Full-Stack AI Engineer',
      experienceLevel: profile.experienceLevel || 'Senior (5+ yrs)',
      avatar: profile.avatar || (existingIdx >= 0 ? currentList[existingIdx].avatar : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'),
      lastLoginAt: Date.now(),
      isCurrent: true
    };

    // Mark others as not current
    const updatedList: RememberedUserProfile[] = currentList.map(u => ({ ...u, isCurrent: false }));

    if (existingIdx >= 0) {
      updatedList[existingIdx] = updatedUser;
    } else {
      updatedList.unshift(updatedUser);
    }

    localStorage.setItem(REMEMBERED_USERS_KEY, JSON.stringify(updatedList));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    return updatedList;
  } catch (e) {
    console.warn('[EduPath Supabase] Failed to persist remembered user:', e);
    return getRememberedUsers();
  }
}

/**
 * Get current active user
 */
export function getCurrentUser(): RememberedUserProfile | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) return JSON.parse(raw);
    const remembered = getRememberedUsers();
    return remembered.find(u => u.isCurrent) || remembered[0] || null;
  } catch {
    return null;
  }
}

/**
 * Set current active user
 */
export function setCurrentUser(user: RememberedUserProfile | null): void {
  try {
    if (!user) {
      localStorage.removeItem(CURRENT_USER_KEY);
      return;
    }
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ ...user, isCurrent: true, lastLoginAt: Date.now() }));
    // Update list
    const list = getRememberedUsers().map(u => ({
      ...u,
      isCurrent: u.email.toLowerCase() === user.email.toLowerCase(),
      lastLoginAt: u.email.toLowerCase() === user.email.toLowerCase() ? Date.now() : u.lastLoginAt
    }));
    localStorage.setItem(REMEMBERED_USERS_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('[EduPath Supabase] Failed to set current user:', e);
  }
}

/**
 * Remove a user from the remembered list
 */
export function removeRememberedUser(emailOrId: string): RememberedUserProfile[] {
  try {
    const currentList = getRememberedUsers();
    const filtered = currentList.filter(u => 
      u.email.toLowerCase() !== emailOrId.toLowerCase() && u.id !== emailOrId
    );
    localStorage.setItem(REMEMBERED_USERS_KEY, JSON.stringify(filtered));
    return filtered;
  } catch {
    return [];
  }
}

/**
 * Save & sync complete user state to Supabase table
 */
export async function syncUserDataToSupabase(payload: UserDataPayload): Promise<{ success: boolean; source: 'supabase-cloud' | 'local-cache'; error?: string }> {
  const normalizedEmail = payload.email.trim().toLowerCase();
  const recordId = payload.userId || `user-${normalizedEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;

  const dbRecord = {
    id: recordId,
    email: normalizedEmail,
    name: payload.name || 'Krishna Yadav',
    target_role: payload.targetRole || payload.preferences?.targetGoal || 'Senior Full-Stack AI Engineer',
    experience_level: payload.experienceLevel || payload.preferences?.skillLevel || 'Senior (5+ yrs)',
    preferences: payload.preferences || null,
    active_roadmap: payload.activeRoadmap || null,
    saved_courses: payload.savedCourses || [],
    progress_tracker: payload.progressTracker || null,
    updated_at: new Date().toISOString()
  };

  // 1. Always update local cache first for instant responsiveness
  try {
    const cacheRaw = localStorage.getItem(SUPABASE_OFFLINE_CACHE_KEY);
    const cache = cacheRaw ? JSON.parse(cacheRaw) : {};
    cache[normalizedEmail] = dbRecord;
    localStorage.setItem(SUPABASE_OFFLINE_CACHE_KEY, JSON.stringify(cache));
  } catch (err) {
    console.warn('[Supabase Cache] Local save failed:', err);
  }

  // 2. Attempt upsert into Supabase cloud table
  try {
    const { error } = await supabase
      .from('user_profiles')
      .upsert(dbRecord, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase Cloud] Upsert notice (using local-cache):', error.message);
      return { success: true, source: 'local-cache', error: error.message };
    }

    return { success: true, source: 'supabase-cloud' };
  } catch (err: any) {
    console.warn('[Supabase Cloud] Network exception (using local-cache):', err.message);
    return { success: true, source: 'local-cache', error: err.message };
  }
}

/**
 * Fetch user state from Supabase or local cache
 */
export async function fetchUserDataFromSupabase(emailOrId: string): Promise<{ data: any | null; source: 'supabase-cloud' | 'local-cache' }> {
  const normalized = emailOrId.trim().toLowerCase();

  // 1. Try Supabase cloud query
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .or(`email.eq.${normalized},id.eq.${normalized}`)
      .maybeSingle();

    if (!error && data) {
      return { data, source: 'supabase-cloud' };
    }
  } catch (e: any) {
    console.warn('[Supabase Cloud] Query error:', e.message);
  }

  // 2. Fallback to local cache
  try {
    const cacheRaw = localStorage.getItem(SUPABASE_OFFLINE_CACHE_KEY);
    if (cacheRaw) {
      const cache = JSON.parse(cacheRaw);
      if (cache[normalized]) {
        return { data: cache[normalized], source: 'local-cache' };
      }
    }
  } catch {}

  return { data: null, source: 'local-cache' };
}

/**
 * Test Supabase Cloud Connection & Auth Ping
 */
export async function testSupabaseConnection(): Promise<{ connected: boolean; url: string; latencyMs: number; error?: string }> {
  const start = performance.now();
  try {
    const { error } = await supabase.auth.getSession();
    const latencyMs = Math.round(performance.now() - start);
    if (error) {
      return { connected: false, url: 'https://ugnltqzfnsuqtomlpbvr.supabase.co', latencyMs, error: error.message };
    }
    return { connected: true, url: 'https://ugnltqzfnsuqtomlpbvr.supabase.co', latencyMs };
  } catch (err: any) {
    return { connected: false, url: 'https://ugnltqzfnsuqtomlpbvr.supabase.co', latencyMs: Math.round(performance.now() - start), error: err.message };
  }
}
