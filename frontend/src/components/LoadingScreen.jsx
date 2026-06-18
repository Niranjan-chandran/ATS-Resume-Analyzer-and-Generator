import React, { useState, useEffect } from "react";
import { Loader2, CheckCircle2, Circle } from "lucide-react";

const STEPS = [
  "Uploading PDF resume...",
  "Extracting and parsing resume structure...",
  "Detecting resume technical domain...",
  "Scoring ATS readiness and keyword coverage...",
  "Optimizing content and alignment...",
  "Generating personalized interview prep questions...",
  "Creating professional learning roadmap...",
  "Generating ATS-friendly LaTeX and PDF resumes..."
];

const TIPS = [
  "Did you know? Customizing your resume for each job description can increase interview rates by up to 40%.",
  "ATS systems parse text headers: Keep sections standard (e.g., 'Work Experience', 'Skills', 'Education').",
  "A good ATS score is generally above 75. We'll identify exactly what's missing to get you there.",
  "Tailored project suggestions are designed specifically to fill your detected skill gaps.",
  "LaTeX templates ensure recruiters and ATS parsers see identical formatting.",
  "Our LangGraph agents are analyzing your resume across 4 dimensions: Skills, Projects, Experience, and Keywords."
];

export default function LoadingScreen() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Advance steps slowly
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 4500);

    return () => clearInterval(stepInterval);
  }, []);

  // Cycle tips
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 6000);

    return () => clearInterval(tipInterval);
  }, []);

  // Update progress percentage smoothly
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        // Target progress based on step index
        const target = Math.min(((currentStepIndex + 1) / STEPS.length) * 100, 99);
        if (prev < target) {
          return prev + 1;
        }
        return prev;
      });
    }, 200);

    return () => clearInterval(progressInterval);
  }, [currentStepIndex]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-xl p-8 rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl relative overflow-hidden shadow-2xl shadow-indigo-500/5">
        
        {/* Glow decoration */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

        {/* Circular Progress & Spinner */}
        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="relative flex items-center justify-center">
            <Loader2 className="w-20 h-20 text-blue-500 animate-spin absolute" />
            <div className="w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center border border-slate-800">
              <span className="text-lg font-bold text-slate-200">{progress}%</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold mt-6 text-center text-white tracking-tight">
            Analyzing Your Resume
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Running Agentic Workflow Optimization
          </p>
        </div>

        {/* Workflow Steps */}
        <div className="space-y-3 relative z-10 mb-8 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isActive = idx === currentStepIndex;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? "bg-indigo-500/10 border border-indigo-500/20 text-white font-medium" 
                    : isCompleted 
                      ? "text-slate-400" 
                      : "text-slate-600 opacity-60"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                ) : isActive ? (
                  <Loader2 className="w-5 h-5 text-indigo-400 animate-spin flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 flex-shrink-0" />
                )}
                <span className="text-sm tracking-wide">{step}</span>
              </div>
            );
          })}
        </div>

        {/* Educational Tip Box */}
        <div className="border border-slate-800 bg-slate-950/80 p-4 rounded-2xl relative z-10">
          <div className="text-xs uppercase tracking-wider text-indigo-400 font-extrabold mb-1">
            Resume Tip
          </div>
          <p className="text-xs text-slate-300 transition-all duration-500 leading-relaxed min-h-[36px]">
            {TIPS[tipIndex]}
          </p>
        </div>

      </div>
    </div>
  );
}
