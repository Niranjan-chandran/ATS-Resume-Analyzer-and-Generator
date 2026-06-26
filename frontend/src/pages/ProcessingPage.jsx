import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useResume } from "../context/ResumeContext";
import { analyzeResume } from "../services/api";
import LoadingScreen from "../components/LoadingScreen";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function ProcessingPage() {
  const { resumeFile, jobDescription, setAnalysisResult, error, setError, resetAll } = useResume();
  const navigate = useNavigate();
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    // If no resume file, redirect back to upload page immediately
    if (!resumeFile) {
      navigate("/upload");
      return;
    }

    // Guard to prevent double execution in React 18+ strict mode
    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;

    const performAnalysis = async () => {
      try {
        setError(null);
        const data = await analyzeResume(resumeFile, jobDescription);
        setAnalysisResult(data);
        navigate("/dashboard");
      } catch (err) {
        console.error("Analysis failed:", err);
        let errMsg = "";
        if (err.response) {
          const status = err.response.status;
          const statusText = err.response.statusText;
          let detail = err.response.data?.detail || err.response.data?.message || err.response.data || "";
          
          if (typeof detail === "object") {
            detail = JSON.stringify(detail, null, 2);
          }
          
          errMsg = `${status} ${statusText}\n\n${detail}`;
        } else if (err.request) {
          errMsg = `Network Error: Failed to connect to the backend server.\n\nRequested URL: ${err.config?.url || "Unknown"}\n\nPlease check if the backend server is running and configured on the correct port (e.g., 8080).`;
        } else {
          errMsg = err.message || "An unexpected error occurred.";
        }
        setError(errMsg);
      }
    };

    performAnalysis();
  }, [resumeFile, jobDescription, navigate, setAnalysisResult, setError]);

  const handleBackToUpload = () => {
    resetAll();
    navigate("/upload");
  };

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[85vh] px-4">
        <div className="w-full max-w-lg p-8 rounded-3xl border border-red-500/20 bg-slate-900/60 backdrop-blur-xl relative overflow-hidden shadow-2xl shadow-red-500/5 text-center space-y-6">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Analysis Failed</h2>
            <p className="text-xs text-slate-400">
              The AI Resume Pilot workflow encountered a problem on the server.
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-left">
            <span className="text-[10px] font-black text-red-400 uppercase tracking-wider block mb-1">Error Details</span>
            <p className="text-xs text-slate-300 font-mono break-words leading-relaxed max-h-[120px] overflow-y-auto pr-1 scrollbar-thin">
              {error}
            </p>
          </div>

          <button
            onClick={handleBackToUpload}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-sm hover:opacity-95 flex items-center justify-center gap-1.5 transition-opacity"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Start Over / Upload Again</span>
          </button>
        </div>
      </div>
    );
  }

  return <LoadingScreen />;
}
