import React, { useState } from "react";
import { HelpCircle, ChevronRight, BookOpen, Layers, User } from "lucide-react";

export default function InterviewCard({ interviewQuestions }) {
  const [activeTab, setActiveTab] = useState("technical");

  if (!interviewQuestions) return null;

  const tabs = [
    {
      id: "technical",
      label: "Technical",
      icon: BookOpen,
      questions: interviewQuestions.technical_questions || [],
      color: "border-blue-500 text-blue-400",
    },
    {
      id: "projects",
      label: "Project-Specific",
      icon: Layers,
      questions: interviewQuestions.project_questions || [],
      color: "border-purple-500 text-purple-400",
    },
    {
      id: "hr",
      label: "HR & Behavioral",
      icon: User,
      questions: interviewQuestions.hr_questions || [],
      color: "border-indigo-500 text-indigo-400",
    },
  ];

  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
        <span>Tailored Interview Practice</span>
      </h3>
      
      <div className="glass-card p-6 flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-slate-800 mb-5 pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold border-b-2 transition-all ${
                  isSelected
                    ? `${tab.color} border-current`
                    : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className="ml-1 bg-slate-850 px-1.5 py-0.5 rounded text-[10px] text-slate-400 font-semibold border border-slate-850">
                  {tab.questions.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Questions list */}
        {currentTab.questions.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            No questions generated for this category.
          </p>
        ) : (
          <div className="space-y-3">
            {currentTab.questions.map((q, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-xl hover:bg-slate-900/60 transition-all duration-200"
              >
                <div className="mt-0.5 bg-slate-900 p-1.5 rounded-lg border border-slate-800 text-indigo-400 flex-shrink-0">
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 text-[10px] font-bold tracking-wider uppercase">Question {idx + 1}</span>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {q}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
