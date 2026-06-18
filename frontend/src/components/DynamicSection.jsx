import React, { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

export default function DynamicSection({ extraSections = {}, onChange }) {
  const [expandedSection, setExpandedSection] = useState(null);

  const sections = [
    { key: "awards", label: "Awards & Honors" },
    { key: "publications", label: "Publications" },
    { key: "languages", label: "Languages" },
    { key: "volunteer_work", label: "Volunteer Work" },
    { key: "research_papers", label: "Research Papers & Projects" },
    { key: "patents", label: "Patents" },
    { key: "hackathons", label: "Hackathons & Competitions" }
  ];

  const handleAddItem = (secKey) => {
    const list = [...(extraSections[secKey] || [])];
    list.push("");
    onChange({
      ...extraSections,
      [secKey]: list
    });
  };

  const handleUpdateItem = (secKey, index, val) => {
    const list = [...(extraSections[secKey] || [])];
    list[index] = val;
    onChange({
      ...extraSections,
      [secKey]: list
    });
  };

  const handleDeleteItem = (secKey, index) => {
    const list = (extraSections[secKey] || []).filter((_, idx) => idx !== index);
    onChange({
      ...extraSections,
      [secKey]: list
    });
  };

  const toggleSection = (key) => {
    setExpandedSection(expandedSection === key ? null : key);
  };

  return (
    <div className="space-y-3">
      {sections.map((sec) => {
        const isExpanded = expandedSection === sec.key;
        const items = extraSections[sec.key] || [];

        return (
          <div
            key={sec.key}
            className={`border rounded-2xl transition-all duration-200 ${
              isExpanded 
                ? "bg-slate-900/30 border-slate-700" 
                : "bg-slate-950/20 border-slate-850 hover:border-slate-800"
            }`}
          >
            {/* Accordion header */}
            <button
              type="button"
              onClick={() => toggleSection(sec.key)}
              className="w-full px-5 py-3.5 flex items-center justify-between gap-3 text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-200">{sec.label}</span>
                {items.length > 0 && (
                  <span className="text-[10px] font-bold bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 px-2 py-0.5 rounded-full">
                    {items.length}
                  </span>
                )}
              </div>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Accordion body */}
            {isExpanded && (
              <div className="px-5 pb-5 pt-1 border-t border-slate-900/60 space-y-4">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleAddItem(sec.key)}
                    className="flex items-center gap-1 text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-wider"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Item
                  </button>
                </div>

                {items.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic text-center py-2">
                    No items added in this section.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <span className="text-xs text-slate-500 font-bold">{idx + 1}.</span>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleUpdateItem(sec.key, idx, e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                          placeholder="Section detail..."
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(sec.key, idx)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-900 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
