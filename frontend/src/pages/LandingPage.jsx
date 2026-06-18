import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Sparkles, BrainCircuit, Terminal, ArrowRight, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 max-w-5xl mx-auto relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Agentic AI Resume Optimization Platform</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
          Accelerate Your Career with <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            ResumePilot AI
          </span>
        </h1>

        <p className="text-base md:text-lg text-slate-400 max-w-2xl mb-10 leading-relaxed">
          Upload your resume and target job description to run an autonomous agentic analysis. 
          Discover ATS gaps, optimize bullet points, generate custom learning paths, and compile professional LaTeX-grade PDF resumes.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/upload"
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-extrabold text-base hover:opacity-90 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-0.5 transition-all duration-300"
          >
            <span>Get Started Now</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#features"
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 transition-all font-semibold"
          >
            Explore Features
          </a>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 pb-24 relative z-10 w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Powered by Advanced Agent Workflows</h2>
          <p className="text-sm text-slate-400 mt-2">ResumePilot automatically executes multi-agent analysis on your PDF resume.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-md hover:border-indigo-500/30 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-white">ATS Gap Analytics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Scan your resume against target keyword maps and parser algorithms. Instantly read ATS score breakdowns.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-md hover:border-indigo-500/30 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-105 transition-transform">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-white">Upskill Recommendations</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Detect critical skill gaps and receive a week-by-week roadmap complete with online courses and project build specs.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-md hover:border-indigo-500/30 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-105 transition-transform">
              <Terminal className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-white">LaTeX & PDF Compilation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Directly download optimized resume copies in LaTeX format and clean, ATS-compliant recruiter PDFs.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}