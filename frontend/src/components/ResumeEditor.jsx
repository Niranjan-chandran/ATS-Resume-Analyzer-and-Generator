import React, { useState } from "react";
import { User, FileText, Briefcase, FileCode, Award, Plus, Trash2, Link as LinkIcon, MoveUp, MoveDown, Info } from "lucide-react";
import DynamicSection from "./DynamicSection";
import { normalizeUrl, isGenericGitHubUrl } from "../context/ResumeContext";

export default function ResumeEditor({ resumeData, onSave }) {
  const [activeTab, setActiveTab] = useState("contact");
  const [formData, setFormData] = useState({ ...resumeData });
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSkillInputs, setNewSkillInputs] = useState({});

  // Help state propagation
  const updateField = (section, field, value) => {
    const updated = {
      ...formData,
      [section]: {
        ...formData[section],
        [field]: value,
      },
    };
    setFormData(updated);
    onSave(updated);
  };

  const updateRootField = (field, value) => {
    const updated = {
      ...formData,
      [field]: value,
    };
    setFormData(updated);
    onSave(updated);
  };

  // Helper to add list item
  const addListItem = (section, defaultObj) => {
    const updatedList = [...(formData[section] || []), defaultObj];
    const updated = { ...formData, [section]: updatedList };
    setFormData(updated);
    onSave(updated);
  };

  // Helper to delete list item
  const deleteListItem = (section, idx) => {
    const updatedList = (formData[section] || []).filter((_, i) => i !== idx);
    const updated = { ...formData, [section]: updatedList };
    setFormData(updated);
    onSave(updated);
  };

  // Helper to update field in specific item of a list
  const updateListItemField = (section, idx, field, value) => {
    const updatedList = (formData[section] || []).map((item, i) => {
      if (i === idx) {
        return { ...item, [field]: value };
      }
      return item;
    });
    const updated = { ...formData, [section]: updatedList };
    setFormData(updated);
    onSave(updated);
  };

  // Helper for bullet list editing (description arrays in Projects/Experience)
  const addBullet = (section, itemIdx) => {
    const list = [...(formData[section] || [])];
    list[itemIdx] = {
      ...list[itemIdx],
      description: [...(list[itemIdx].description || []), ""],
    };
    const updated = { ...formData, [section]: list };
    setFormData(updated);
    onSave(updated);
  };

  const deleteBullet = (section, itemIdx, bulletIdx) => {
    const list = [...(formData[section] || [])];
    list[itemIdx] = {
      ...list[itemIdx],
      description: (list[itemIdx].description || []).filter((_, i) => i !== bulletIdx),
    };
    const updated = { ...formData, [section]: list };
    setFormData(updated);
    onSave(updated);
  };

  const updateBulletText = (section, itemIdx, bulletIdx, val) => {
    const list = [...(formData[section] || [])];
    const desc = [...(list[itemIdx].description || [])];
    desc[bulletIdx] = val;
    list[itemIdx] = { ...list[itemIdx], description: desc };
    const updated = { ...formData, [section]: list };
    setFormData(updated);
    onSave(updated);
  };

  // Helpers for categorized skills
  const addSkillCategory = (catName) => {
    if (catName && (!formData.skills || !formData.skills[catName])) {
      const updated = {
        ...formData,
        skills: {
          ...(formData.skills || {}),
          [catName]: []
        }
      };
      setFormData(updated);
      onSave(updated);
    }
  };

  const removeSkillCategory = (catName) => {
    if (formData.skills && formData.skills[catName]) {
      const updatedSkills = { ...formData.skills };
      delete updatedSkills[catName];
      const updated = { ...formData, skills: updatedSkills };
      setFormData(updated);
      onSave(updated);
    }
  };

  const addSkillToCategory = (category, skill) => {
    if (skill && category && formData.skills && formData.skills[category]) {
      if (!formData.skills[category].includes(skill)) {
        const updatedCategorySkills = [...formData.skills[category], skill];
        const updated = {
          ...formData,
          skills: {
            ...formData.skills,
            [category]: updatedCategorySkills
          }
        };
        setFormData(updated);
        onSave(updated);
      }
    }
  };

  const removeSkillFromCategory = (category, skillToRemove) => {
    if (category && formData.skills && formData.skills[category]) {
      const updatedCategorySkills = formData.skills[category].filter(s => s !== skillToRemove);
      const updated = {
        ...formData,
        skills: {
          ...formData.skills,
          [category]: updatedCategorySkills
        }
      };
      setFormData(updated);
      onSave(updated);
    }
  };

  const tabs = [
    { id: "contact", label: "Contact & Links", icon: User },
    { id: "summary", label: "Summary & Skills", icon: FileText },
    { id: "experience", label: "Work Experience", icon: Briefcase },
    { id: "projects", label: "Projects", icon: FileCode },
    { id: "certifications", label: "Certifications & Extras", icon: Award },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch">
      {/* Sidebar Tabs */}
      <div className="w-full lg:w-64 flex-shrink-0 flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 border-b lg:border-b-0 lg:border-r border-slate-800 pr-0 lg:pr-4 scrollbar-thin">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left flex-shrink-0 lg:w-full border ${
                isSelected
                  ? "bg-indigo-500/10 border-indigo-500/30 text-white font-semibold shadow-lg shadow-indigo-500/5"
                  : "bg-slate-950/20 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 lg:p-8 backdrop-blur-sm">
        {/* Contact Information Tab */}
        {activeTab === "contact" && (
          <div className="space-y-6">
            <h3 className="text-base font-extrabold text-slate-100 border-b border-slate-800 pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={formData.personal_info?.name || ""}
                  onChange={(e) => updateField("personal_info", "name", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={formData.personal_info?.email || ""}
                  onChange={(e) => updateField("personal_info", "email", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="john.doe@example.com"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Phone Number</label>
                <input
                  type="text"
                  value={formData.personal_info?.phone || ""}
                  onChange={(e) => updateField("personal_info", "phone", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Location</label>
                <input
                  type="text"
                  value={formData.personal_info?.location || ""}
                  onChange={(e) => updateField("personal_info", "location", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="San Francisco, CA"
                />
              </div>
            </div>

            <h3 className="text-base font-extrabold text-slate-100 border-b border-slate-800 pb-2 pt-4">Professional Links</h3>
            
            <div className="mt-4 mb-6 p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 text-blue-300 text-xs flex gap-3 items-start leading-relaxed">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                Profile URLs are optional and are not automatically imported from the uploaded resume.
                Add your LinkedIn, GitHub, LeetCode, or Portfolio URLs manually if you want clickable hyperlinks in the generated resume.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">LinkedIn Profile</label>
                <input
                  type="url"
                  value={formData.links?.linkedin || ""}
                  onChange={(e) => updateField("links", "linkedin", e.target.value)}
                  onBlur={(e) => updateField("links", "linkedin", normalizeUrl(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="LinkedIn URL not found. Add your profile URL"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">GitHub Profile</label>
                <input
                  type="url"
                  value={formData.links?.github || ""}
                  onChange={(e) => updateField("links", "github", e.target.value)}
                  onBlur={(e) => updateField("links", "github", normalizeUrl(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="GitHub URL not found. Add your profile URL"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Portfolio Website</label>
                <input
                  type="url"
                  value={formData.links?.portfolio || ""}
                  onChange={(e) => updateField("links", "portfolio", e.target.value)}
                  onBlur={(e) => updateField("links", "portfolio", normalizeUrl(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="Portfolio URL not found (optional)"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">LeetCode URL</label>
                <input
                  type="url"
                  value={formData.links?.leetcode || ""}
                  onChange={(e) => updateField("links", "leetcode", e.target.value)}
                  onBlur={(e) => updateField("links", "leetcode", normalizeUrl(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="LeetCode URL not found. Add your profile URL"
                />
              </div>
            </div>
            <p className="text-xs text-indigo-400 font-medium mt-3">
              Links added here will appear as clickable hyperlinks in the generated PDF resume.
            </p>
          </div>
        )}

        {/* Summary & Skills Tab */}
        {activeTab === "summary" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-100 border-b border-slate-800 pb-2 mb-4">Professional Summary</h3>
              <textarea
                value={formData.summary || ""}
                onChange={(e) => updateRootField("summary", e.target.value)}
                rows={5}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors resize-y leading-relaxed"
                placeholder="Brief professional bio summary..."
              />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-100 border-b border-slate-800 pb-2 mb-4">Technical & Core Skills</h3>
              
              {/* Add New Category Control */}
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="New Category Name (e.g. Languages, Cloud)..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const catName = newCategoryName.trim();
                      if (catName) {
                        addSkillCategory(catName);
                        setNewCategoryName("");
                      }
                    }
                  }}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => {
                    const catName = newCategoryName.trim();
                    if (catName) {
                      addSkillCategory(catName);
                      setNewCategoryName("");
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Category
                </button>
              </div>

              {/* Render Categories */}
              <div className="space-y-6">
                {formData.skills && typeof formData.skills === "object" && !Array.isArray(formData.skills) && Object.keys(formData.skills).length > 0 ? (
                  Object.entries(formData.skills).map(([category, categorySkills]) => (
                    <div key={category} className="p-5 bg-slate-950/50 border border-slate-850 rounded-2xl space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <span className="text-xs font-black text-indigo-400 uppercase tracking-wider">{category}</span>
                        <button
                          type="button"
                          onClick={() => removeSkillCategory(category)}
                          className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Tag list */}
                      <div className="flex flex-wrap gap-2 min-h-[40px] items-center">
                        {Array.isArray(categorySkills) && categorySkills.length > 0 ? (
                          categorySkills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 text-slate-200 rounded-full text-xs font-semibold"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => removeSkillFromCategory(category, skill)}
                                className="text-slate-500 hover:text-red-400 font-bold ml-0.5 text-sm"
                              >
                                &times;
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-550 italic">No skills in this category yet.</span>
                        )}
                      </div>

                      {/* Add Skill to Category */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder={`Add skill to ${category}...`}
                          value={newSkillInputs[category] || ""}
                          onChange={(e) => setNewSkillInputs({
                            ...newSkillInputs,
                            [category]: e.target.value
                          })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const newSkillVal = (newSkillInputs[category] || "").trim();
                              if (newSkillVal) {
                                addSkillToCategory(category, newSkillVal);
                                setNewSkillInputs({
                                  ...newSkillInputs,
                                  [category]: ""
                                });
                              }
                            }
                          }}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newSkillVal = (newSkillInputs[category] || "").trim();
                            if (newSkillVal) {
                              addSkillToCategory(category, newSkillVal);
                              setNewSkillInputs({
                                ...newSkillInputs,
                                [category]: ""
                              });
                            }
                          }}
                          className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400 hover:bg-indigo-600 hover:text-white text-xs font-bold transition-all"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-slate-950/60 border border-slate-850 rounded-2xl text-xs text-slate-500">
                    No skill categories created yet. Create a category above to get started.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Work Experience Tab */}
        {activeTab === "experience" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-4">
              <h3 className="text-base font-extrabold text-slate-100">Work Experience</h3>
              <button
                onClick={() => addListItem("experience", { company: "", role: "", location: "", start_date: "", end_date: "", description: [] })}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white text-xs font-bold transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Experience
              </button>
            </div>

            {(!formData.experience || formData.experience.length === 0) ? (
              <p className="text-xs text-slate-500 text-center py-8">No experience items added. Click the button above to add one.</p>
            ) : (
              <div className="space-y-6">
                {formData.experience.map((exp, idx) => (
                  <div key={idx} className="p-5 bg-slate-950/50 border border-slate-850 rounded-2xl relative space-y-4">
                    <button
                      onClick={() => deleteListItem("experience", idx)}
                      className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => updateListItemField("experience", idx, "company", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Role / Job Title</label>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => updateListItemField("experience", idx, "role", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Location</label>
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) => updateListItemField("experience", idx, "location", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Start Date</label>
                          <input
                            type="text"
                            value={exp.start_date}
                            onChange={(e) => updateListItemField("experience", idx, "start_date", e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                            placeholder="MM/YYYY or Year"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">End Date</label>
                          <input
                            type="text"
                            value={exp.end_date}
                            onChange={(e) => updateListItemField("experience", idx, "end_date", e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                            placeholder="MM/YYYY or Present"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bullet Points */}
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Description Bullets</label>
                        <button
                          onClick={() => addBullet("experience", idx)}
                          className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300"
                        >
                          <Plus className="w-3 h-3" /> Add Bullet
                        </button>
                      </div>

                      {(!exp.description || exp.description.length === 0) ? (
                        <p className="text-[10px] text-slate-500 italic">No bullets added yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {exp.description.map((bullet, bulletIdx) => (
                            <div key={bulletIdx} className="flex gap-2 items-center">
                              <span className="w-4 text-xs font-bold text-indigo-500">{bulletIdx + 1}.</span>
                              <input
                                type="text"
                                value={bullet}
                                onChange={(e) => updateBulletText("experience", idx, bulletIdx, e.target.value)}
                                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                                placeholder="Achievement bullet..."
                              />
                              <button
                                onClick={() => deleteBullet("experience", idx, bulletIdx)}
                                className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === "projects" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-4">
              <h3 className="text-base font-extrabold text-slate-100">Projects</h3>
              <button
                onClick={() => addListItem("projects", { title: "", technologies: [], description: [], link: "" })}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white text-xs font-bold transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Project
              </button>
            </div>

            {(!formData.projects || formData.projects.length === 0) ? (
              <p className="text-xs text-slate-500 text-center py-8">No project items added. Click the button above to add one.</p>
            ) : (
              <div className="space-y-6">
                {formData.projects.map((proj, idx) => (
                  <div key={idx} className="p-5 bg-slate-950/50 border border-slate-850 rounded-2xl relative space-y-4">
                    <button
                      onClick={() => deleteListItem("projects", idx)}
                      className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Project Title</label>
                        <input
                          type="text"
                          value={proj.title}
                          onChange={(e) => updateListItemField("projects", idx, "title", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Optional Project / GitHub Link</label>
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                          <input
                            type="url"
                            value={proj.link || ""}
                            onChange={(e) => updateListItemField("projects", idx, "link", e.target.value)}
                            onBlur={(e) => {
                              const inputVal = e.target.value;
                              const isGeneric = isGenericGitHubUrl(inputVal);
                              const normalized = isGeneric ? "" : normalizeUrl(inputVal);
                              
                              const updatedProjects = formData.projects.map((item, i) => {
                                if (i === idx) {
                                  return {
                                    ...item,
                                    link: normalized,
                                    hadGenericLink: isGeneric
                                  };
                                }
                                return item;
                              });
                              
                              const updated = { ...formData, projects: updatedProjects };
                              setFormData(updated);
                              onSave(updated);
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                            placeholder={proj.hadGenericLink ? "Repository URL not detected. Add project GitHub URL (optional)" : "Add project GitHub URL (optional)"}
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                          Optional. Add your project repository URL manually. If provided, it will appear as a clickable hyperlink in the generated PDF resume.
                        </p>
                      </div>
                    </div>

                    {/* Technologies Input */}
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Technologies Used (Comma-separated)</label>
                      <input
                        type="text"
                        value={proj.technologies ? proj.technologies.join(", ") : ""}
                        onChange={(e) => {
                          const techArr = e.target.value.split(",").map(t => t.trim()).filter(Boolean);
                          updateListItemField("projects", idx, "technologies", techArr);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                        placeholder="React, Tailwind, Node.js"
                      />
                    </div>

                    {/* Bullet Points */}
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Project Bullets</label>
                        <button
                          onClick={() => addBullet("projects", idx)}
                          className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300"
                        >
                          <Plus className="w-3 h-3" /> Add Bullet
                        </button>
                      </div>

                      {(!proj.description || proj.description.length === 0) ? (
                        <p className="text-[10px] text-slate-500 italic">No bullets added yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {proj.description.map((bullet, bulletIdx) => (
                            <div key={bulletIdx} className="flex gap-2 items-center">
                              <span className="w-4 text-xs font-bold text-indigo-500">{bulletIdx + 1}.</span>
                              <input
                                type="text"
                                value={bullet}
                                onChange={(e) => updateBulletText("projects", idx, bulletIdx, e.target.value)}
                                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                                placeholder="Bullet description..."
                              />
                              <button
                                onClick={() => deleteBullet("projects", idx, bulletIdx)}
                                className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Certifications and Extras Tab */}
        {activeTab === "certifications" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Certifications Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h3 className="text-base font-extrabold text-slate-100">Certifications</h3>
                <button
                  onClick={() => addListItem("certifications", { name: "", date: "" })}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white text-xs font-bold transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Certification
                </button>
              </div>

              {(!formData.certifications || formData.certifications.length === 0) ? (
                <p className="text-xs text-slate-500 text-center py-4">No certifications added.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.certifications.map((cert, idx) => (
                    <div key={idx} className="p-4 bg-slate-950/50 border border-slate-850 rounded-2xl relative flex gap-3 items-end pr-10">
                      <div className="flex-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Certification Name</label>
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) => updateListItemField("certifications", idx, "name", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                        />
                      </div>
                      <div className="w-32">
                        <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Date</label>
                        <input
                          type="text"
                          value={cert.date || ""}
                          onChange={(e) => updateListItemField("certifications", idx, "date", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                          placeholder="MM/YYYY or Year"
                        />
                      </div>
                      <button
                        onClick={() => deleteListItem("certifications", idx)}
                        className="absolute top-4 right-3 p-1 rounded hover:text-red-400 text-slate-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Extra Sections Wrapper */}
            <div className="pt-4">
              <h3 className="text-base font-extrabold text-slate-100 border-b border-slate-800 pb-2 mb-4">Extra Sections</h3>
              <DynamicSection
                extraSections={formData.extra_sections || {}}
                onChange={(updatedExtras) => {
                  const updated = {
                    ...formData,
                    extra_sections: updatedExtras
                  };
                  setFormData(updated);
                  onSave(updated);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
