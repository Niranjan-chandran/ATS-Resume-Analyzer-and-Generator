import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ResumeProvider, useResume } from "./context/ResumeContext";
import Navbar from "./components/Navbar";

// Import Pages
import LandingPage from "./pages/LandingPage";
import UploadPage from "./pages/UploadPage";
import ProcessingPage from "./pages/ProcessingPage";
import DashboardPage from "./pages/DashboardPage";
import ReviewPage from "./pages/ReviewPage";
import PreviewPage from "./pages/PreviewPage";

// Route protection component
const ProtectedRoute = ({ children }) => {
  const { analysisResult } = useResume();
  
  if (!analysisResult) {
    return <Navigate to="/upload" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/processing" element={<ProcessingPage />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/review"
            element={
              <ProtectedRoute>
                <ReviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/preview"
            element={
              <ProtectedRoute>
                <PreviewPage />
              </ProtectedRoute>
            }
          />
          
          {/* Catch-all redirect to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ResumeProvider>
        <AppRoutes />
      </ResumeProvider>
    </BrowserRouter>
  );
}

export default App;