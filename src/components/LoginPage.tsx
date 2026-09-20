import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Compass, 
  Sun, 
  Moon, 
  Flame, 
  ShieldCheck, 
  History, 
  Trash2, 
  Database, 
  Check 
} from 'lucide-react';
import { useLearning } from '../context/LearningContext';
import { useAppStore } from '../store/useAppStore';
import { ExperienceLevel } from '../types/learning';
import { 
  getRememberedUsers, 
  saveRememberedUser, 
  removeRememberedUser, 
  getCurrentUser, 
  setCurrentUser as setGlobalCurrentUser, 
  syncUserDataToSupabase, 
  testSupabaseConnection, 
  RememberedUserProfile 
} from '../utils/supabase/supabaseService';

const POPULAR_ROLES = [
  'Senior Full-Stack AI Engineer',
  'Staff Frontend Architect',
  'Distributed Systems Lead',
  'AI Solutions & Agentic Engineer'
];

export const LoginPage: React.FC = () => {
  const { login, register, isDarkMode, toggleDarkMode } = useLearning();
  const { setUserPreferences, userPreferences } = useAppStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Remembered Users & Supabase Telemetry
  const [rememberedUsers, setRememberedUsers] = useState<RememberedUserProfile[]>(() => getRememberedUsers());
  const [selectedUser, setSelectedUser] = useState<RememberedUserProfile | null>(() => getCurrentUser());
  const [rememberMe, setRememberMe] = useState(true);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean | null>(null);
  const [supabaseLatency, setSupabaseLatency] = useState<number>(0);

  // Form states - Krishna Yadav as default demo name
  const [name, setName] = useState('Krishna Yadav');
  const [email, setEmail] = useState(() => selectedUser?.email || 'krishna.yadav@edupath.ai');
  const [password, setPassword] = useState('password123');
  const [targetRole, setTargetRole] = useState(() => selectedUser?.targetRole || 'Senior Full-Stack AI Engineer');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(() => (selectedUser?.experienceLevel as any) || 'Senior (5+ yrs)');

  // Test Supabase connection on mount
  useEffect(() => {
    testSupabaseConnection().then(res => {
      setSupabaseConnected(res.connected);
      setSupabaseLatency(res.latencyMs || 0);
    });
  }, []);

  // Update form fields when user clicks a remembered profile
  const handleSelectRememberedUser = (u: RememberedUserProfile) => {
    setSelectedUser(u);
    setEmail(u.email);
    setName(u.name);
    if (u.targetRole) setTargetRole(u.targetRole);
    if (u.experienceLevel) setExperienceLevel(u.experienceLevel as ExperienceLevel);
    setPassword('password123');
    setGlobalCurrentUser(u);
  };

  const handleRemoveUser = (e: React.MouseEvent, emailToRemove: string) => {
    e.stopPropagation();
    const updated = removeRememberedUser(emailToRemove);
    setRememberedUsers(updated);
    if (selectedUser?.email.toLowerCase() === emailToRemove.toLowerCase()) {
      setSelectedUser(updated[0] || null);
      if (updated[0]) {
        setEmail(updated[0].email);
        setName(updated[0].name);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (!res.success) {
          setErrorMessage(res.error || 'Failed to sign in. Please verify your credentials.');
        } else {
          // If remember me is active, store in remembered users
          if (rememberMe) {
            const updated = saveRememberedUser({
              email,
              name: name || email.split('@')[0],
              targetRole,
              experienceLevel
            });
            setRememberedUsers(updated);
          }

          // Sync to Zustand store & Supabase Cloud
          setUserPreferences({
            name: name || userPreferences.name || 'Krishna Yadav',
            targetGoal: targetRole || userPreferences.targetGoal
          });

          syncUserDataToSupabase({
            email,
            name: name || 'Krishna Yadav',
            targetRole,
            experienceLevel,
            preferences: {
              name: name || 'Krishna Yadav',
              targetGoal: targetRole,
              skillLevel: 'Intermediate',
              hoursPerWeek: 10,
              preferredLearningFormat: 'Project-First'
            }
          }).catch(err => console.warn('[Supabase Sync Notice]:', err));
        }
      } else {
        const res = await register({
          email,
          password,
          name: name || 'Krishna Yadav',
          targetRole,
          experienceLevel
        });
        if (!res.success) {
          setErrorMessage(res.error || 'Failed to create account.');
        } else {
          if (rememberMe) {
            const updated = saveRememberedUser({
              email,
              name: name || 'Krishna Yadav',
              targetRole,
              experienceLevel
            });
            setRememberedUsers(updated);
          }

          setUserPreferences({
            name: name || 'Krishna Yadav',
            targetGoal: targetRole
          });

          syncUserDataToSupabase({
            email,
            name: name || 'Krishna Yadav',
            targetRole,
            experienceLevel,
            preferences: {
              name: name || 'Krishna Yadav',
              targetGoal: targetRole,
              skillLevel: 'Intermediate',
              hoursPerWeek: 10,
              preferredLearningFormat: 'Project-First'
            }
          }).catch(err => console.warn('[Supabase Sync Notice]:', err));
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoName: string, demoRole: string) => {
    setErrorMessage(null);
    setIsLoading(true);
    setEmail(demoEmail);
    setName(demoName);
    setTargetRole(demoRole);
    setPassword('password123');

    try {
      const res = await login(demoEmail, 'password123');
      if (!res.success) {
        setErrorMessage(res.error || 'Demo login failed');
      } else {
        const updated = saveRememberedUser({
          email: demoEmail,
          name: demoName,
          targetRole: demoRole,
          experienceLevel: 'Senior (5+ yrs)'
        });
        setRememberedUsers(updated);

        setUserPreferences({
          name: demoName,
          targetGoal: demoRole
        });

        syncUserDataToSupabase({
          email: demoEmail,
          name: demoName,
          targetRole: demoRole,
          preferences: {
            name: demoName,
            targetGoal: demoRole,
            skillLevel: 'Intermediate',
            hoursPerWeek: 10,
            preferredLearningFormat: 'Project-First'
          }
        }).catch(err => console.warn('[Supabase Sync Notice]:', err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-300 relative overflow-hidden">
      {/* Ambient Background Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 dark:bg-violet-600/15 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

      {/* Top Header */}
      <header className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 dark:from-indigo-400 dark:via-violet-400 dark:to-purple-300 bg-clip-text text-transparent">
                EduPath
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                Adaptive AI
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Streaming-Grade Continuous Learning Agent
            </p>
          </div>
        </div>

        {/* Right Header Status Badges & Dark Mode */}
        <div className="flex items-center gap-3">
          {/* Supabase Status Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Supabase Cloud Active</span>
            {supabaseLatency > 0 && (
              <span className="text-[10px] opacity-75">({supabaseLatency}ms)</span>
            )}
          </div>

          {/* Theme Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-400 transition-all cursor-pointer"
            title={isDarkMode ? 'Switch to Daylight Theme' : 'Switch to Cinema Dark Theme'}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="max-w-lg w-full mx-auto px-4 py-6 sm:py-8 z-10">
        <div className="bg-white dark:bg-slate-900/95 rounded-3xl shadow-xl shadow-slate-900/5 dark:shadow-black/40 border border-slate-200/90 dark:border-slate-800 overflow-hidden backdrop-blur-xl transition-all">
          
          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 p-1.5">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              Create New Account
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-7">
            <div className="mb-5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                {mode === 'login' ? 'Welcome Back to EduPath' : 'Start Your Adaptive Journey'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {mode === 'login'
                  ? 'Access your tailored dashboard, Ollama objectives roadmap, and Supabase synced ledger.'
                  : 'Create a free account to personalize your skill benchmarks and streaming feed.'}
              </p>
            </div>

            {/* SECTION: REMEMBERED DETAILS OF PREVIOUS USER & CURRENT USER */}
            <div className="mb-5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <History className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Remembered Accounts ({rememberedUsers.length})</span>
                </div>
                <span className="text-[10px] text-slate-400">1-click switch & auto-fill</span>
              </div>

              {/* Remembered User Cards */}
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {rememberedUsers.map(u => {
                  const isCurrent = u.isCurrent || (selectedUser?.email.toLowerCase() === u.email.toLowerCase());
                  const isKrishna = u.name.toLowerCase().includes('krishna');

                  return (
                    <div
                      key={u.id || u.email}
                      onClick={() => handleSelectRememberedUser(u)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 shadow-xs'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                          {isCurrent && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                              {u.name}
                            </p>
                            {isCurrent ? (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                                Current User
                              </span>
                            ) : isKrishna ? (
                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
                                Demo User
                              </span>
                            ) : (
                              <span className="text-[9px] text-slate-400">Previous</span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 truncate">
                            {u.email} • {u.targetRole}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isCurrent ? (
                          <span className="p-1 rounded-lg bg-indigo-600 text-white" title="Selected User">
                            <Check className="w-3 h-3" />
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => handleRemoveUser(e, u.email)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Forget user"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* If Register: Full Name with Krishna Yadav default */}
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider flex items-center justify-between">
                    <span>Full Name</span>
                    <span className="text-[10px] text-indigo-500 font-semibold normal-case">Demo: Krishna Yadav</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Krishna Yadav"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="krishna.yadav@edupath.ai"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  {mode === 'login' && (
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                      Demo password: <code className="font-mono font-bold">password123</code>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* If Register: Target Role */}
              {mode === 'register' && (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                      Target Role
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {POPULAR_ROLES.map(role => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setTargetRole(role)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                            targetRole === role
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={e => setTargetRole(e.target.value)}
                      placeholder="e.g. Senior Full-Stack AI Engineer"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                      Experience Level
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['Beginner', 'Junior (1-2 yrs)', 'Mid-Level (3-5 yrs)', 'Senior (5+ yrs)'] as ExperienceLevel[]).map(lvl => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setExperienceLevel(lvl)}
                          className={`p-2 rounded-xl border text-[11px] font-bold text-center transition-all ${
                            experienceLevel === lvl
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-500 ring-1 ring-indigo-500'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Remember user details & session on this device
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <span>Authenticating with Supabase & Server...</span>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In & Load Dashboard' : 'Create Account with Supabase & Launch'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick 1-Click Demo Evaluation Accounts featuring Krishna Yadav */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  1-Click Demo Evaluation Accounts
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Krishna Yadav (Primary) */}
                <button
                  type="button"
                  onClick={() => handleDemoLogin('krishna.yadav@edupath.ai', 'Krishna Yadav', 'Senior Full-Stack AI Engineer')}
                  className="p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                      alt="Krishna"
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-indigo-400"
                    />
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 leading-none truncate">
                        Krishna Yadav
                      </p>
                      <p className="text-[9px] text-slate-400 mt-0.5 truncate">AI Engineer (Demo)</p>
                    </div>
                  </div>
                </button>

                {/* Alex Chen */}
                <button
                  type="button"
                  onClick={() => handleDemoLogin('alex.chen@edupath.ai', 'Alex Chen', 'Staff AI Engineer')}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                      alt="Alex"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 leading-none truncate">
                        Alex Chen
                      </p>
                      <p className="text-[9px] text-slate-400 mt-0.5 truncate">Staff AI Engineer</p>
                    </div>
                  </div>
                </button>

                {/* Sarah Kim */}
                <button
                  type="button"
                  onClick={() => handleDemoLogin('sarah.kim@edupath.ai', 'Sarah Kim', 'Staff Frontend Architect')}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80"
                      alt="Sarah"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 leading-none truncate">
                        Sarah Kim
                      </p>
                      <p className="text-[9px] text-slate-400 mt-0.5 truncate">Frontend Architect</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Teasers */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
            <Compass className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mx-auto mb-1" />
            <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Radar Gaps</p>
            <p className="text-[10px] text-slate-400">Visual Diagnostics</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
            <Flame className="w-4 h-4 text-amber-500 mx-auto mb-1" />
            <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Streaming Rows</p>
            <p className="text-[10px] text-slate-400">Netflix-Style Feed</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
            <Database className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
            <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Supabase Cloud</p>
            <p className="text-[10px] text-slate-400">Persistent Storage</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
            <Sparkles className="w-4 h-4 text-purple-500 mx-auto mb-1" />
            <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Ollama AI</p>
            <p className="text-[10px] text-slate-400">Local LLM Tutor</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-400 dark:text-slate-600">
        EduPath Continuous Learning Agent • Supabase Cloud & Local Storage Synchronized
      </footer>
    </div>
  );
};
