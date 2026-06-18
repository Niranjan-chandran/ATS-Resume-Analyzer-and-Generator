import React, { createContext, useState, useContext, useEffect } from "react";

// URL Helpers
export const normalizeUrl = (url) => {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed === "") return "";
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

export const isGenericGitHubUrl = (url) => {
  if (!url) return false;
  const cleaned = url.toLowerCase().trim().replace(/^(https?:\/\/)?(www\.)?/, "");
  return cleaned === "github.com" || cleaned === "github.com/";
};

const ResumeContext = createContext(null);

export const ResumeProvider = ({ children }) => {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [editedResume, setEditedResume] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  // Initialize editedResume when analysisResult changes
  useEffect(() => {
    if (analysisResult) {
      const parsed = analysisResult.parsed_resume || {};
      const optimized = analysisResult.optimized_resume || {};

      // Resolve personal info
      const personal_info = {
        name: optimized.personal_info?.name || parsed.personal_info?.name || "",
        email: optimized.personal_info?.email || parsed.personal_info?.email || "",
        phone: optimized.personal_info?.phone || parsed.personal_info?.phone || "",
        location: optimized.personal_info?.location || parsed.personal_info?.location || "",
      };

      // Resolve links helper
      const isPlaceholder = (val) => {
        if (!val) return true;
        const lower = val.toLowerCase().trim();
        return (
          lower === "" ||
          lower === "linkedin" ||
          lower === "github portfolio" ||
          lower === "leetcode (100+)" ||
          lower === "https://portfolio.com" ||
          lower === "github repo" ||
          lower === "placeholder" ||
          lower.includes("example.com")
        );
      };

      const cleanLink = (val) => {
        const cleaned = isPlaceholder(val) ? "" : val;
        return cleaned ? normalizeUrl(cleaned) : "";
      };

      const links = {
        linkedin: "",
        github: "",
        portfolio: "",
        leetcode: "",
        hackerrank: "",
        kaggle: "",
        other_urls: [],
      };

      // Resolve summary (prefer optimized summary if available)
      const summary = optimized.optimized_summary || parsed.summary || "";

      // Resolve skills: parsed_resume.skills is List[str]. optimized_resume.optimized_skills is Dict[str, List[str]]
      // Let's create a combined list or prefer optimized_skills flattened, or parsed_resume.skills
      let skills = [];
      if (optimized.optimized_skills && Object.keys(optimized.optimized_skills).length > 0) {
        skills = Object.values(optimized.optimized_skills).flat();
      } else if (parsed.skills) {
        skills = [...parsed.skills];
      }

      // Resolve projects
      const rawProjects = (optimized.optimized_projects && optimized.optimized_projects.length > 0)
        ? optimized.optimized_projects
        : (parsed.projects || []);
      
      const projects = rawProjects.map(proj => {
        return {
          title: proj.title || "",
          technologies: proj.technologies ? [...proj.technologies] : [],
          description: proj.description ? [...proj.description] : [],
          link: "",
          hadGenericLink: false,
        };
      });

      // Resolve experience
      const rawExperience = (optimized.optimized_experience && optimized.optimized_experience.length > 0)
        ? optimized.optimized_experience
        : (parsed.experience || []);

      const experience = rawExperience.map(exp => ({
        company: exp.company || "",
        role: exp.role || exp.title || "",
        location: exp.location || "",
        start_date: exp.start_date || "",
        end_date: exp.end_date || "",
        description: exp.description ? [...exp.description] : [],
      }));

      // Resolve certifications
      const certifications = (optimized.certifications || parsed.certifications || []).map(cert => ({
        name: cert.name || "",
        date: cert.date || "",
      }));

      // Resolve education
      const education = (optimized.education || parsed.education || []).map(edu => ({
        institution: edu.institution || "",
        degree: edu.degree || "",
        major: edu.major || "",
        start_date: edu.start_date || "",
        end_date: edu.end_date || "",
        gpa: edu.gpa || "",
      }));

      // Resolve extra sections
      const extra_sections = optimized.extra_sections || parsed.extra_sections || {
        awards: [],
        publications: [],
        languages: [],
        volunteer_work: [],
        research_papers: [],
        patents: [],
        hackathons: [],
        unknown: {}
      };

      setEditedResume({
        personal_info,
        links,
        summary,
        education,
        skills,
        projects,
        experience,
        certifications,
        extra_sections,
      });
    } else {
      setEditedResume(null);
    }
  }, [analysisResult]);

  const resetAll = () => {
    setResumeFile(null);
    setJobDescription("");
    setAnalysisResult(null);
    setEditedResume(null);
    setIsAnalyzing(false);
    setError(null);
  };

  return (
    <ResumeContext.Provider
      value={{
        resumeFile,
        setResumeFile,
        jobDescription,
        setJobDescription,
        analysisResult,
        setAnalysisResult,
        editedResume,
        setEditedResume,
        isAnalyzing,
        setIsAnalyzing,
        error,
        setError,
        resetAll,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
};

export const useResume = () => {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error("useResume must be used within a ResumeProvider");
  }
  return context;
};
