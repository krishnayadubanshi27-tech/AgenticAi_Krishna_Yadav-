import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileCheck, 
  Sparkles, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Briefcase, 
  GraduationCap, 
  Sliders,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useLearning } from '../context/LearningContext';
import { ExperienceLevel } from '../types/learning';

const POPULAR_ROLES = [
  'Senior Full-Stack AI Engineer',
  'Staff Frontend Architect',
  'Distributed Systems Lead',
  'AI Solutions & Agentic Engineer',
  'Cloud Native DevOps Specialist'
];

const SKILL_OPTIONS = [
  'React 18 / 19',
  'TypeScript',
  'Next.js 15',
  'Node.js',
  'Python & FastAPI',
  'PostgreSQL',
  'Redis',
  'Docker & K8s',
  'LangChain / LangGraph',
  'System Design',
  'GraphQL',
  'CI/CD GitHub Actions'
];

export const OnboardingModal: React.FC = () => {
  const { 
    userProfile, 
    updateProfile, 
    isOnboardingOpen, 
    setIsOnboardingOpen 
  } = useLearning();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form local state
  const [name, setName] = useState(userProfile.name || 'Krishna Yadav');
  const [targetRole, setTargetRole] = useState(userProfile.targetRole);
  const [careerGoal, setCareerGoal] = useState(userProfile.careerGoal);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(userProfile.experienceLevel);
  const [targetDateMonths, setTargetDateMonths] = useState(userProfile.targetDateMonths);
  const [hoursPerWeek, setHoursPerWeek] = useState(userProfile.hoursPerWeek || 10);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(userProfile.analyzedKeywords || ['React 19', 'TypeScript', 'Node.js']);

  // File drag & drop & AI scan state
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatusMessage, setScanStatusMessage] = useState('');

  if (!isOnboardingOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      startFileScan(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      startFileScan(e.target.files[0]);
    }
  };

  const startFileScan = (file: File) => {
    setUploadedFile(file);
    setIsScanning(true);
    setScanProgress(10);
    setScanStatusMessage('Parsing PDF structural hierarchy...');

    setTimeout(() => {
      setScanProgress(45);
      setScanStatusMessage('Extracting technology stack & verified project metrics...');
    }, 600);

    setTimeout(() => {
      setScanProgress(80);
      setScanStatusMessage('Running benchmark comparisons against hiring requirements...');
    }, 1200);

    setTimeout(() => {
      setScanProgress(100);
      setIsScanning(false);
      setScanStatusMessage('Analysis complete! 12 core competencies extracted.');
    }, 1800);
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleComplete = () => {
    updateProfile({
      name,
      targetRole,
      careerGoal,
      experienceLevel,
      targetDateMonths,
      hoursPerWeek,
      uploadedFileName: uploadedFile ? uploadedFile.name : userProfile.uploadedFileName,
      analyzedKeywords: selectedSkills
    });
    setIsOnboardingOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                AI Path Calibration & Onboarding
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Step {step} of 4: {
                  step === 1 ? 'Target Role & Goal' :
                  step === 2 ? 'Experience & Competencies' :
                  step === 3 ? 'Resume & Portfolio AI Scan' : 'Synthesis & Path Generation'
                }
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOnboardingOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicator Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1">
          <div 
            className="bg-indigo-600 h-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          {/* STEP 1: Profile, Target Role & Career Goal */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Your Full Name:
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Krishna Yadav"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Target Role You Aim to Transition Into:
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {POPULAR_ROLES.map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setTargetRole(role)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        targetRole === role
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Your Primary Career Goal:
                </label>
                <textarea
                  value={careerGoal}
                  onChange={e => setCareerGoal(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                  placeholder="e.g. Full-Stack Web Development & Next.js or C/C++ backend"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Available Hours / Week:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 15, 20].map(h => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setHoursPerWeek(h)}
                        className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                          hoursPerWeek === h
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-500 ring-1 ring-indigo-500 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-500'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700'
                        }`}
                      >
                        {h}h
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Timeline Horizon:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[3, 6, 12].map(months => (
                      <button
                        key={months}
                        type="button"
                        onClick={() => setTargetDateMonths(months)}
                        className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                          targetDateMonths === months
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-500 ring-1 ring-indigo-500 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-500'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700'
                        }`}
                      >
                        {months}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Current Skills & Experience */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Your Current Experience Level:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Beginner', 'Junior (1-2 yrs)', 'Mid-Level (3-5 yrs)', 'Senior (5+ yrs)'] as ExperienceLevel[]).map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setExperienceLevel(lvl)}
                      className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                        experienceLevel === lvl
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Select Skills You Already Have Practical Experience With:
                </label>
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map(sk => {
                    const isSelected = selectedSkills.includes(sk);
                    return (
                      <button
                        key={sk}
                        type="button"
                        onClick={() => toggleSkill(sk)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-300" />}
                        <span>{sk}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Resume / Certificate Drag-and-Drop AI Upload */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">
                  AI Capability Analyzer
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Upload your resume, GitHub portfolio export, or LinkedIn PDF. Our AI agent parses past pull requests, tech stacks, and domain depth to calibrate your baseline.
                </p>
              </div>

              {/* Drag and drop zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
                  dragActive 
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 scale-[1.01]' 
                    : uploadedFile 
                    ? 'border-emerald-400 dark:border-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/20' 
                    : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-800/40'
                }`}
              >
                <input
                  type="file"
                  id="resume-upload"
                  accept=".pdf,.doc,.docx,.json"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <label htmlFor="resume-upload" className="cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
                    {uploadedFile ? <FileCheck className="w-7 h-7 text-emerald-600 dark:text-emerald-400" /> : <UploadCloud className="w-7 h-7" />}
                  </div>

                  {uploadedFile ? (
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{uploadedFile.name}</p>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                        File uploaded & ready for AI diagnostic
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">
                        Drag and drop your Resume / Portfolio file here
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Supports PDF, DOCX, or JSON (max 15MB) • Or click to browse
                      </p>
                    </div>
                  )}
                </label>
              </div>

              {/* Simulated Scanning Progress */}
              {isScanning && (
                <div className="p-4 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-900 dark:text-indigo-200 mb-1.5">
                    <span>{scanStatusMessage}</span>
                    <span>{scanProgress}%</span>
                  </div>
                  <div className="w-full bg-indigo-200 dark:bg-indigo-900 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {uploadedFile && !isScanning && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-emerald-950 dark:text-emerald-200">AI Extraction Verified</p>
                    <p className="text-emerald-800 dark:text-emerald-300 mt-0.5">
                      Identified 7 verified competencies (React 18, TypeScript, REST APIs, Docker, Git). 
                      Mapped against <span className="font-semibold">{targetRole}</span> benchmarks.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: AI Synthesis Summary */}
          {step === 4 && (
            <div className="space-y-6 text-center py-2">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/25">
                <Sparkles className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">
                  Tailored Learning Agent Configured!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                  EduPath has tailored a personalized curriculum specifically designed to bridge the gap between your current background and <span className="font-bold text-slate-800 dark:text-white">{targetRole}</span>.
                </p>
              </div>

              {/* Blueprint Summary Card */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                    Target Role
                  </span>
                  <span className="font-extrabold text-slate-800 dark:text-white text-sm">{targetRole}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                    Timeline Horizon
                  </span>
                  <span className="font-extrabold text-slate-800 dark:text-white text-sm">{targetDateMonths} Months</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                    Current Role Parity
                  </span>
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">58% Baseline</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                    Critical Gap Focus
                  </span>
                  <span className="font-extrabold text-rose-600 dark:text-rose-400 text-sm">Concurrency & Concurrency State</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Navigation */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/80">
          {step > 1 ? (
            <button
              onClick={() => setStep(prev => (prev - 1) as any)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep(prev => (prev + 1) as any)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Adaptive EduPath</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
