import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useResume } from "../context/ResumeContext";
import { Upload, FileText, Briefcase, AlertTriangle, ArrowRight, X } from "lucide-react";

export default function UploadPage() {
  const { resumeFile, setResumeFile, jobDescription, setJobDescription } = useResume();
  const [dragActive, setDragActive] = useState(false);
  const [localError, setLocalError] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      setLocalError("Please upload a PDF file only.");
      return;
    }
    setLocalError("");
    setResumeFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setResumeFile(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!resumeFile) {
      setLocalError("A resume PDF file is required.");
      return;
    }
    navigate("/processing");
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 relative">
      {/* Visual background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-2xl bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl relative z-10 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Upload Your Materials</h2>
          <p className="text-sm text-slate-400 mt-2">Upload your resume to check alignment with a target job description.</p>
        </div>

        {localError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center gap-3 text-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{localError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Drag & Drop PDF upload */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
              Resume (Required, PDF only)
            </label>
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 relative group flex flex-col items-center justify-center min-h-[200px] ${
                dragActive
                  ? "border-indigo-500 bg-indigo-500/10"
                  : resumeFile
                  ? "border-emerald-500/40 bg-emerald-500/5"
                  : "border-slate-800 hover:border-slate-700 bg-slate-950/40"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
              />

              {resumeFile ? (
                <div className="space-y-3 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-200 truncate max-w-md">{resumeFile.name}</p>
                    <p className="text-xs text-slate-400">
                      {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB • PDF Document
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs font-semibold uppercase tracking-wider transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="space-y-3 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:scale-105 transition-transform duration-200">
                    <Upload className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-200">Drag and drop your PDF here, or <span className="text-indigo-400 hover:underline">browse</span></p>
                    <p className="text-xs text-slate-500 mt-1">Maximum file size 10MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Optional Job Description */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                Target Job Description (Optional)
              </label>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Highly Recommended</span>
            </div>
            <div className="relative">
              <Briefcase className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={5}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors resize-y leading-relaxed"
                placeholder="Paste the job description or target role requirements here to check ATS match and keyword coverage..."
              />
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-extrabold text-base hover:opacity-90 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <span>Analyze Resume</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
