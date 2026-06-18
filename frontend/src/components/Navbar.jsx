import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useResume } from "../context/ResumeContext";
import { FileText, RotateCcw, LayoutDashboard, FileEdit, Eye, UploadCloud } from "lucide-react";

export default function Navbar() {
  const { analysisResult, resetAll } = useResume();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleReset = () => {
    if (window.confirm("Are you sure you want to start over? All current analysis and edits will be lost.")) {
      resetAll();
      navigate("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-2 rounded-xl text-white shadow-lg shadow-purple-500/10 group-hover:scale-105 transition-all">
            <FileText className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
            ResumePilot <span className="font-extrabold text-blue-500">AI</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive("/") 
                ? "bg-slate-800 text-white font-semibold" 
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            Home
          </Link>
          
          <Link
            to="/upload"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              isActive("/upload") 
                ? "bg-slate-800 text-white font-semibold" 
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            Upload
          </Link>

          {analysisResult && (
            <>
              <Link
                to="/dashboard"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  isActive("/dashboard") 
                    ? "bg-slate-800 text-white font-semibold" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              
              <Link
                to="/review"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  isActive("/review") 
                    ? "bg-slate-800 text-white font-semibold" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <FileEdit className="w-4 h-4" />
                Review
              </Link>

              <Link
                to="/preview"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  isActive("/preview") 
                    ? "bg-slate-800 text-white font-semibold" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <Eye className="w-4 h-4" />
                Preview & Download
              </Link>
            </>
          )}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {analysisResult ? (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs font-semibold uppercase tracking-wider transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset App
            </button>
          ) : (
            <Link
              to="/upload"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm hover:opacity-90 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all"
            >
              Analyze Resume
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
