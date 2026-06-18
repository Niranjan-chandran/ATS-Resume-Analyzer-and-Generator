import React, { useState } from "react";
import { AlertCircle, HelpCircle, ArrowRightCircle, ChevronDown, ChevronUp } from "lucide-react";

export default function SkillGapCard({ skillGaps = [] }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (!skillGaps || skillGaps.length === 0) {
    return (
      <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-slate-200">No Skill Gaps Detected</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Congratulations! Your skills align perfectly with the target job description.
        </p>
      </div>
    );
  }

  const toggleExpand = (idx) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
        <span>Skill Gaps ({skillGaps.length})</span>
      </h3>
      <div className="space-y-3">
        {skillGaps.map((gap, idx) => {
          const isExpanded = expandedIndex === idx;

          return (
            <div
              key={idx}
              className={`border rounded-2xl transition-all duration-300 ${
                isExpanded 
                  ? "bg-slate-900 border-indigo-500/30" 
                  : "bg-slate-950/40 border-slate-800 hover:border-slate-700"
              }`}
            >
              {/* Header Toggle */}
              <button
                onClick={() => toggleExpand(idx)}
                className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="font-bold text-slate-200 text-sm tracking-wide">
                    {gap.skill}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {/* Collapsible details */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-1 space-y-3 border-t border-slate-900 animate-fadeIn text-xs">
                  {/* Why it Matters */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-start gap-2.5">
                    <HelpCircle className="w-4.5 h-4.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-300 block mb-0.5">Why it matters:</span>
                      <p className="text-slate-400 leading-relaxed">{gap.why_it_matters}</p>
                    </div>
                  </div>
                  {/* Suggested Action */}
                  <div className="bg-indigo-950/20 p-3 rounded-xl border border-indigo-950/40 flex items-start gap-2.5">
                    <ArrowRightCircle className="w-4.5 h-4.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-indigo-300 block mb-0.5">Suggested Action:</span>
                      <p className="text-slate-300 leading-relaxed">{gap.suggested_action}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
