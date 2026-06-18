import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useResume } from "../context/ResumeContext";
import { downloadPdf, downloadTex, downloadCls, downloadZip, compileResume } from "../services/api";
import { Eye, FileDown, Download, Globe, Github, Linkedin, Award, Briefcase, FileCode, CheckCircle, ChevronLeft, FileText, Archive, Info, Loader2 } from "lucide-react";

export default function PreviewPage() {
  const { editedResume } = useResume();
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileError, setCompileError] = useState(null);
  const [compiledSuccess, setCompiledSuccess] = useState(false);

  useEffect(() => {
    if (editedResume) {
      const compile = async () => {
        setIsCompiling(true);
        setCompileError(null);
        try {
          await compileResume(editedResume);
          setCompiledSuccess(true);
        } catch (err) {
          console.error("Compilation error:", err);
          setCompileError(err.response?.data?.detail || "Failed to compile LaTeX / PDF resume. Please verify your fields are correct.");
        } finally {
          setIsCompiling(false);
        }
      };
      compile();
    }
  }, [editedResume]);

  if (!editedResume) return null;

  const {
    personal_info = {},
    links = {},
    summary = "",
    skills = [],
    projects = [],
    experience = [],
    certifications = [],
    extra_sections = {}
  } = editedResume;

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top action toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-extrabold uppercase tracking-wider">
            <Eye className="w-3.5 h-3.5" />
            <span>Document Preview</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Your Optimized Resume</h2>
          <p className="text-xs text-slate-400">
            Review your edited sections and download your final resume files below.
          </p>
        </div>

        {/* Back / Edit triggers */}
        <div className="flex items-center gap-3">
          <Link
            to="/review"
            className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold uppercase tracking-wider hover:bg-slate-900/45 transition-all flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Editor</span>
          </Link>
          
          <Link
            to="/dashboard"
            className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold uppercase tracking-wider hover:bg-slate-900/45 transition-all"
          >
            Dashboard
          </Link>
        </div>
      </div>

      {/* Downloader Widget Grid */}
      {isCompiling ? (
        <div className="p-8 rounded-2xl border border-indigo-500/20 bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center space-y-4 animate-pulse min-h-[160px]">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <div className="text-center">
            <h4 className="text-sm font-bold text-white">Compiling PDF & LaTeX Package</h4>
            <p className="text-xs text-slate-400 mt-1">Applying your edits and building your print-ready files...</p>
          </div>
        </div>
      ) : compileError ? (
        <div className="p-8 rounded-2xl border border-red-500/20 bg-red-500/5 flex flex-col items-center justify-center space-y-4 min-h-[160px]">
          <div className="text-center text-slate-300 space-y-1">
            <h4 className="text-sm font-bold text-red-400">Compilation Error</h4>
            <p className="text-xs leading-relaxed max-w-lg mx-auto">{compileError}</p>
          </div>
          <button
            onClick={async () => {
              setIsCompiling(true);
              setCompileError(null);
              try {
                await compileResume(editedResume);
                setCompiledSuccess(true);
              } catch (err) {
                setCompileError(err.response?.data?.detail || "Failed to compile LaTeX / PDF resume.");
              } finally {
                setIsCompiling(false);
              }
            }}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold transition-all border border-red-500/20"
          >
            Retry Compilation
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PDF Download */}
          <a
            href={downloadPdf()}
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 hover:-translate-y-0.5 transition-all flex items-center justify-between group shadow-lg shadow-blue-500/5"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <FileDown className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-extrabold text-white">Download PDF Resume</h4>
                <p className="text-xs text-slate-400 mt-0.5">Recruiter-ready PDF compile</p>
              </div>
            </div>
            <Download className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
          </a>

          {/* TEX Download */}
          <a
            href={downloadTex()}
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-pink-500/5 hover:-translate-y-0.5 transition-all flex items-center justify-between group shadow-lg shadow-purple-500/5"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <FileCode className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-extrabold text-white">Download LaTeX (.tex)</h4>
                <p className="text-xs text-slate-400 mt-0.5">Edit source code on Overleaf</p>
              </div>
            </div>
            <Download className="w-5 h-5 text-slate-400 group-hover:text-purple-400 transition-colors" />
          </a>

          {/* CLS Download */}
          <a
            href={downloadCls()}
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/10 to-emerald-500/5 hover:-translate-y-0.5 transition-all flex items-center justify-between group shadow-lg shadow-teal-500/5"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <FileText className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-extrabold text-white">Download resume.cls</h4>
                <p className="text-xs text-slate-400 mt-0.5">Required template style class</p>
              </div>
            </div>
            <Download className="w-5 h-5 text-slate-400 group-hover:text-teal-400 transition-colors" />
          </a>

          {/* ZIP Download */}
          <a
            href={downloadZip()}
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 hover:-translate-y-0.5 transition-all flex items-center justify-between group shadow-lg shadow-indigo-500/5"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Archive className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-extrabold text-white">Download LaTeX Source Package</h4>
                <p className="text-xs text-slate-400 mt-0.5">ZIP containing resume.tex + resume.cls</p>
              </div>
            </div>
            <Download className="w-5 h-5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
          </a>
        </div>
      )}

      {/* LaTeX Guidance Panel */}
      <div className="p-5 bg-indigo-950/20 border border-indigo-500/15 rounded-2xl flex gap-4 items-start text-left animate-fadeIn">
        <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex-shrink-0">
          <Info className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-extrabold text-white tracking-tight">LaTeX Editing Information</h4>
          <p className="text-xs text-slate-350 leading-relaxed font-medium">
            This resume template uses a custom resume.cls file. To edit the resume in Overleaf or compile locally, download BOTH resume.tex and resume.cls and upload them together.
          </p>
        </div>
      </div>

      {/* Recruiter-Style Interactive Preview */}
      <div className="p-8 md:p-12 rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-md relative overflow-hidden shadow-2xl space-y-8 text-left text-slate-300">
        
        {/* Top Header details */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white tracking-tight">{personal_info.name || "Resume Candidate"}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
              {personal_info.email && <span>{personal_info.email}</span>}
              {personal_info.phone && <span>• {personal_info.phone}</span>}
              {personal_info.location && <span>• {personal_info.location}</span>}
            </div>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-2">
            {links.linkedin && (
              <a
                href={links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-950 border border-slate-850 hover:border-slate-700 hover:text-white transition-all text-slate-400"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {links.github && (
              <a
                href={links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-950 border border-slate-850 hover:border-slate-700 hover:text-white transition-all text-slate-400"
                title="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            {links.portfolio && (
              <a
                href={links.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-950 border border-slate-850 hover:border-slate-700 hover:text-white transition-all text-slate-400"
                title="Portfolio"
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Resume Summary */}
        {summary && (
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase text-indigo-400 tracking-wider">Summary</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {summary}
            </p>
          </div>
        )}

        {/* Technical Skills */}
        {skills && skills.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-indigo-400 tracking-wider">Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-semibold bg-slate-950 border border-slate-850 text-slate-200 px-2.5 py-0.5 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Work History */}
        {experience && experience.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-indigo-400 tracking-wider">Work Experience</h3>
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-sm font-extrabold text-white">{exp.company}</span>
                      <span className="text-xs text-indigo-300 font-semibold">{exp.role}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                      {exp.start_date} – {exp.end_date}
                    </span>
                  </div>
                  
                  {exp.location && (
                    <span className="text-[10px] text-slate-450 block">{exp.location}</span>
                  )}

                  {exp.description && exp.description.length > 0 && (
                    <ul className="space-y-1.5 pl-4 list-disc list-outside text-xs text-slate-355 leading-relaxed">
                      {exp.description.map((bullet, bIdx) => (
                        <li key={bIdx}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-indigo-400 tracking-wider">Projects</h3>
            <div className="space-y-4">
              {projects.map((proj, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-extrabold text-white">{proj.title}</span>
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-[10px] font-bold text-indigo-400 hover:underline"
                        >
                          <Github className="w-3 h-3" />
                          <span>Repo</span>
                        </a>
                      )}
                    </div>
                    
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {proj.technologies.map((tech, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[9px] font-medium bg-slate-950/70 border border-slate-900 text-slate-400 px-2 py-0.5 rounded"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {proj.description && proj.description.length > 0 && (
                    <ul className="space-y-1.5 pl-4 list-disc list-outside text-xs text-slate-355 leading-relaxed">
                      {proj.description.map((bullet, bIdx) => (
                        <li key={bIdx}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-indigo-400 tracking-wider">Certifications</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {certifications.map((cert, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                  <span className="text-xs font-bold text-slate-200">{cert.name}</span>
                  {cert.date && (
                    <span className="text-[10px] text-slate-400 font-semibold">{cert.date}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Extra Sections Dynamic display */}
        {extra_sections && (
          <div className="space-y-4 pt-2">
            {Object.entries(extra_sections).map(([key, value]) => {
              if (!Array.isArray(value) || value.length === 0 || key === "unknown") return null;
              
              // Map keys to readable titles
              const readableTitle = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

              return (
                <div key={key} className="space-y-2">
                  <h3 className="text-xs font-black uppercase text-indigo-400 tracking-wider">{readableTitle}</h3>
                  <ul className="space-y-1 pl-4 list-disc list-outside text-xs leading-relaxed text-slate-300">
                    {value.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
