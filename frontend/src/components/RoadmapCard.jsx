import React, { useState } from "react";
import { Compass, BookOpen, GitFork, ExternalLink, Calendar, CheckSquare, Layers } from "lucide-react";

export default function RoadmapCard({ recommendations }) {
  const [subTab, setSubTab] = useState("timeline");

  if (!recommendations) return null;

  const { roadmap = [], courses = [], projects = [] } = recommendations;

  const subTabs = [
    { id: "timeline", label: "Learning Path", icon: Calendar, count: roadmap.length },
    { id: "courses", label: "Recommended Courses", icon: BookOpen, count: courses.length },
    { id: "projects", label: "Recommended Projects", icon: GitFork, count: projects.length },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
        <span>AI Upskilling Roadmap</span>
      </h3>

      <div className="glass-card p-6 flex flex-col">
        {/* Navigation tabs */}
        <div className="flex border-b border-slate-800 mb-5 pb-1">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id)}
                className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 text-xs font-bold border-b-2 transition-all ${
                  isSelected
                    ? "border-purple-500 text-purple-400"
                    : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className="ml-1 bg-slate-850 px-1.5 py-0.5 rounded text-[10px] text-slate-400 font-semibold border border-slate-850">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Timeline View */}
        {subTab === "timeline" && (
          <div className="space-y-6 relative border-l border-slate-800 ml-3.5 pl-6 py-2">
            {roadmap.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No learning timeline generated.
              </p>
            ) : (
              roadmap.map((week, idx) => (
                <div key={idx} className="relative group">
                  {/* Timeline point */}
                  <div className="absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full border border-purple-500 bg-slate-950 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-xs font-black tracking-wider uppercase text-purple-400">
                        {week.week}
                      </span>
                      <h4 className="text-sm font-bold text-white leading-tight">
                        {week.topic}
                      </h4>
                    </div>

                    <ul className="space-y-1.5 bg-slate-950/60 border border-slate-900 rounded-xl p-3.5">
                      {week.tasks && week.tasks.map((task, tIdx) => (
                        <li key={tIdx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                          <CheckSquare className="w-4 h-4 text-purple-500/80 flex-shrink-0 mt-0.5" />
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Courses View */}
        {subTab === "courses" && (
          <div className="grid grid-cols-1 gap-4">
            {courses.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No course recommendations generated.
              </p>
            ) : (
              courses.map((course, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200"
                >
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded">
                        {course.provider}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-850">
                        Cert: {course.certification || "No"}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white leading-snug">{course.name}</h4>
                  </div>

                  {course.link && (
                    <a
                      href={course.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white text-xs font-bold transition-all flex-shrink-0"
                    >
                      <span>Go to Course</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Projects View */}
        {subTab === "projects" && (
          <div className="space-y-4">
            {projects.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No project suggestions generated.
              </p>
            ) : (
              projects.map((proj, idx) => (
                <div key={idx} className="p-5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Suggested Build {idx + 1}</span>
                    <h4 className="text-sm font-extrabold text-white leading-tight">{proj.name}</h4>
                  </div>
                  
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {proj.description}
                  </p>

                  {/* Tech stack */}
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {proj.technologies.map((tech, tIdx) => (
                        <span key={tIdx} className="text-[10px] font-semibold bg-slate-900 border border-slate-850 text-slate-300 px-2.5 py-0.5 rounded-full">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Steps */}
                  {proj.steps && proj.steps.length > 0 && (
                    <div className="pt-2 border-t border-slate-900">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Build Plan</span>
                      <ol className="space-y-2">
                        {proj.steps.map((step, sIdx) => (
                          <li key={sIdx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                            <span className="w-5 h-5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                              {sIdx + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
