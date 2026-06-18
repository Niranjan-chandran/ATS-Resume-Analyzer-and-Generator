import React from "react";
import { Code, Briefcase, FileCode, CheckSquare } from "lucide-react";

export default function ATSBreakdown({ scoring }) {
  if (!scoring) return null;

  const items = [
    {
      title: "Skills Match",
      data: scoring.skills_match,
      icon: Code,
      gradient: "from-blue-500/10 to-indigo-500/10",
      border: "border-blue-500/20",
      colorClass: "text-blue-400",
    },
    {
      title: "Projects Match",
      data: scoring.projects_match,
      icon: FileCode,
      gradient: "from-purple-500/10 to-pink-500/10",
      border: "border-purple-500/20",
      colorClass: "text-purple-400",
    },
    {
      title: "Experience Match",
      data: scoring.experience_match,
      icon: Briefcase,
      gradient: "from-indigo-500/10 to-violet-500/10",
      border: "border-indigo-500/20",
      colorClass: "text-indigo-400",
    },
    {
      title: "Keyword Coverage",
      data: scoring.keyword_coverage,
      icon: CheckSquare,
      gradient: "from-teal-500/10 to-emerald-500/10",
      border: "border-teal-500/20",
      colorClass: "text-teal-400",
    },
  ];

  const getScoreBg = (score) => {
    if (score >= 80) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    if (score >= 60) return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    return "bg-red-500/20 text-red-400 border-red-500/30";
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
        <span>ATS Breakdown</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item, idx) => {
          const Icon = item.icon;
          const score = item.data?.score ?? 0;
          const reason = item.data?.reason ?? "";

          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl border ${item.border} bg-gradient-to-br ${item.gradient} backdrop-blur-sm hover:translate-y-[-2px] transition-transform duration-300 flex flex-col justify-between`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl bg-slate-950 border border-slate-800 ${item.colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-slate-200 text-sm">{item.title}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 border rounded-full ${getScoreBg(score)}`}>
                    {score}%
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {reason}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
