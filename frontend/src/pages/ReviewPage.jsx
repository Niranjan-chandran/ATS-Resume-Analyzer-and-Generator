import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useResume } from "../context/ResumeContext";
import ResumeEditor from "../components/ResumeEditor";
import { FileEdit, Eye, ArrowRight, LayoutDashboard, AlertCircle } from "lucide-react";

export default function ReviewPage() {
  const { editedResume, setEditedResume } = useResume();
  const navigate = useNavigate();
  const [showWarningModal, setShowWarningModal] = useState(false);

  if (!editedResume) return null;

  const handleSave = (updatedResume) => {
    setEditedResume(updatedResume);
  };

  const handleProceedClick = () => {
    const missingLinkedin = !editedResume.links?.linkedin;
    const missingGithub = !editedResume.links?.github;
    const missingLeetcode = !editedResume.links?.leetcode;
    const missingProjectLinks = editedResume.projects?.some(p => !p.link);

    if (missingLinkedin || missingGithub || missingLeetcode || missingProjectLinks) {
      setShowWarningModal(true);
    } else {
      navigate("/preview");
    }
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-extrabold uppercase tracking-wider">
            <FileEdit className="w-3.5 h-3.5" />
            <span>Interactive Editor</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Tweak Your Optimization</h2>
          <p className="text-xs text-slate-400">
            Edit summary, skills, work history, projects, and certifications directly. These updates will reflect on your preview and PDF.
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold uppercase tracking-wider hover:bg-slate-900/40 transition-all"
          >
            Dashboard
          </Link>
          <button
            onClick={handleProceedClick}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black uppercase tracking-wider hover:opacity-95 shadow-md shadow-blue-500/10 hover:-translate-y-0.5 transition-all"
          >
            <span>Preview Resume</span>
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor component container */}
      <div className="py-2">
        <ResumeEditor resumeData={editedResume} onSave={handleSave} />
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end pt-4 border-t border-slate-800">
        <button
          onClick={handleProceedClick}
          className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-extrabold text-sm hover:opacity-90 shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5 transition-all duration-300"
        >
          <span>Proceed to Preview & Download</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn animate-duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-6">
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex-shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white tracking-tight">Missing Recommended Links</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Some recommended links are missing. Recruiters often value professional profiles and project repositories.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/60 border border-slate-850 rounded-2xl text-[11px] text-slate-400 space-y-1.5 text-left font-mono">
              <span className="font-sans font-black uppercase text-slate-500 tracking-wider text-[9px] block mb-1">Missing Elements:</span>
              {!editedResume.links?.linkedin && <div>• LinkedIn Profile Link</div>}
              {!editedResume.links?.github && <div>• GitHub Profile Link</div>}
              {!editedResume.links?.leetcode && <div>• LeetCode Profile Link</div>}
              {editedResume.projects?.some(p => !p.link) && <div>• One or more Project Repositories</div>}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => navigate("/preview")}
                className="flex-1 py-3 rounded-xl bg-slate-955 hover:bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Continue Anyway
              </button>
              <button
                onClick={() => setShowWarningModal(false)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs uppercase tracking-wider hover:opacity-95 shadow-md shadow-blue-500/15 transition-all"
              >
                Go Back & Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

