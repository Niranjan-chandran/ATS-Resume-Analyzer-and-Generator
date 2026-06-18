import React from "react";
import { Link } from "react-router-dom";
import { useResume } from "../context/ResumeContext";
import ScoreCard from "../components/ScoreCard";
import ATSBreakdown from "../components/ATSBreakdown";
import SkillGapCard from "../components/SkillGapCard";
import InterviewCard from "../components/InterviewCard";
import RoadmapCard from "../components/RoadmapCard";
import { ShieldAlert, CheckCircle, ChevronRight, Sparkles, AlertCircle, FileText, CheckCircle2 } from "lucide-react";

export default function DashboardPage() {
  const { analysisResult, scoreReeval } = useResume();

  if (!analysisResult) return null;

  const {
    detected_domain = "General",
    scoring,
    analysis = {},
    interview_questions,
    recommendations,
    completeness = {}
  } = analysisResult;

  const { strengths = [], weaknesses = [], missing_keywords = [] } = analysis;

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Domain Info */}
      <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -z-10" />

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Analysis Complete</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Resume Domain: <span className="text-indigo-400">{detected_domain}</span>
          </h2>
          <p className="text-xs text-slate-400">
            Based on structural keywords, syntax, and experience mapping.
          </p>
        </div>

        {/* Navigation Action */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/review"
            className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-xs font-black uppercase tracking-wider hover:opacity-90 shadow-md shadow-indigo-500/10 hover:-translate-y-0.5 transition-all"
          >
            <span>Review & Edit Resume</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            to="/preview"
            className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider hover:bg-slate-850 transition-all"
          >
            <span>Preview & Download</span>
          </Link>
        </div>
      </div>

      {/* Overview Completeness Report */}
      {completeness && (
        <div className="p-6 rounded-3xl border border-slate-800 bg-slate-950/40 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-slate-200">Resume Completeness</h3>
              <p className="text-xs text-slate-500">How ready is your resume structure for ATS parsers and recruiters?</p>
            </div>
            <span className="text-lg font-black text-indigo-400">
              {completeness.completeness_score || 0}% Complete
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-850">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full transition-all duration-1000"
              style={{ width: `${completeness.completeness_score || 0}%` }}
            />
          </div>

          {/* Missing fields */}
          {completeness.missing_fields && completeness.missing_fields.length > 0 && (
            <div className="pt-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Missing Content Elements:</span>
              <div className="flex flex-wrap gap-2">
                {completeness.missing_fields.map((field, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold"
                  >
                    <AlertCircle className="w-3 h-3" />
                    <span>{field}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grid Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Score & Core Analysis (7 Columns on large screens) */}
        <div className="lg:col-span-7 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            <div className="md:col-span-1">
              <ScoreCard scoring={scoring} scoreReeval={scoreReeval} />
            </div>
            <div className="md:col-span-2">
              <ATSBreakdown scoring={scoring} />
            </div>
          </div>

          {/* Strengths Accordion Card */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-100 border-b border-slate-800 pb-2">
              AI-Detected Strengths
            </h3>
            {strengths.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No key strengths extracted from resume.</p>
            ) : (
              <div className="space-y-4">
                {strengths.map((str, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4.5 h-4.5" />
                      {str.title}
                    </h4>
                    <ul className="space-y-1 pl-6">
                      {str.points && str.points.map((p, pIdx) => (
                        <li key={pIdx} className="text-xs text-slate-300 list-disc list-outside leading-relaxed">
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weaknesses List Card */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-100 border-b border-slate-800 pb-2">
              ATS Performance Weaknesses
            </h3>
            {weaknesses.length === 0 ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center gap-2.5 text-xs">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>No weaknesses detected! Great job.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {weaknesses.map((weak, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex gap-3 items-start"
                  >
                    <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">{weak.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{weak.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Missing Keywords Box */}
          {missing_keywords && missing_keywords.length > 0 && (
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-base font-extrabold text-slate-100 border-b border-slate-800 pb-2">
                Missing Keywords (Target Job Description)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Add these keywords to your resume summary, project descriptions, or experience bullets to improve your ATS search ranking.
              </p>
              <div className="flex flex-wrap gap-2">
                {missing_keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-semibold bg-slate-900 border border-slate-850 text-indigo-300 px-3 py-1 rounded-full"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Timeline and Prepare Cards (5 Columns on large screens) */}
        <div className="lg:col-span-5 space-y-8">
          <RoadmapCard recommendations={recommendations} />
          
          <SkillGapCard skillGaps={analysis.skill_gaps} />
          
          <InterviewCard interviewQuestions={interview_questions} />
        </div>
      </div>
    </div>
  );
}
