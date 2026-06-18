import React from "react";
import { Award, ArrowUpRight, CheckCircle2 } from "lucide-react";

export default function ScoreCard({ scoring, scoreReeval }) {
  const score = scoreReeval ? scoreReeval.new_score : (scoring?.score || 0);
  const oldScore = scoreReeval?.old_score || scoring?.score || 0;
  const showImprovement = scoreReeval && scoreReeval.improvement_percent > 0;

  // Circular progress math
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const oldStrokeDashoffset = circumference - (oldScore / 100) * circumference;

  // Determine color theme based on score value
  const getScoreColor = (val) => {
    if (val >= 80) return "text-emerald-400 stroke-emerald-400";
    if (val >= 60) return "text-amber-400 stroke-amber-400";
    return "text-red-400 stroke-red-400";
  };

  return (
    <div className="glass-card p-6 relative overflow-hidden flex flex-col items-center justify-center">
      {/* Visual background glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
      
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-bold text-slate-200">Overall ATS Score</h3>
      </div>

      <div className="relative flex items-center justify-center">
        {/* SVG Circular Progress Bar */}
        <svg className="w-36 h-36 transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            className="stroke-slate-800"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            className={`transition-all duration-1000 ease-out ${getScoreColor(score)}`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Score Text */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-white tracking-tight">{score}</span>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">/ 100</span>
        </div>
      </div>

      {showImprovement && (
        <div className="mt-5 w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex flex-col items-center">
          <div className="flex items-center gap-1 text-emerald-400 text-sm font-bold">
            <ArrowUpRight className="w-4 h-4" />
            <span>+{scoreReeval.improvement_percent}% Increase</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 text-center">
            Optimized from an initial score of <span className="font-semibold text-slate-300">{oldScore}</span>
          </p>
        </div>
      )}

      {!showImprovement && (
        <div className="mt-4 text-xs text-slate-400 text-center flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Status: {scoring?.score_type || "Analyzed"}</span>
        </div>
      )}
    </div>
  );
}
