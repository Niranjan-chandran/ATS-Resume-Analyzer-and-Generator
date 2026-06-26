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
        linkedin: cleanLink(optimized.links?.linkedin || parsed.links?.linkedin || ""),
        github: cleanLink(optimized.links?.github || parsed.links?.github || ""),
        portfolio: cleanLink(optimized.links?.portfolio || parsed.links?.portfolio || ""),
        leetcode: cleanLink(optimized.links?.leetcode || parsed.links?.leetcode || ""),
        hackerrank: cleanLink(optimized.links?.hackerrank || parsed.links?.hackerrank || ""),
        kaggle: cleanLink(optimized.links?.kaggle || parsed.links?.kaggle || ""),
        other_urls: (optimized.links?.other_urls || parsed.links?.other_urls || []).map(cleanLink).filter(Boolean),
      };

      // Resolve summary (prefer optimized summary if available)
      const summary = optimized.optimized_summary || parsed.summary || "";

      // Resolve skills: parsed_resume.skills and optimized_resume.optimized_skills are Dict[str, List[str]]
      // Resolve skills defensively
      let skills = {};
      const rawOptimizedSkills = optimized.optimized_skills;
      const rawParsedSkills = parsed.skills;

      if (rawOptimizedSkills && typeof rawOptimizedSkills === "object" && !Array.isArray(rawOptimizedSkills)) {
        skills = { ...rawOptimizedSkills };
      } else if (rawParsedSkills) {
        if (Array.isArray(rawParsedSkills)) {
          skills = { "Skills": [...rawParsedSkills] };
        } else if (typeof rawParsedSkills === "object") {
          skills = { ...rawParsedSkills };
        }
      }

      // Resolve projects
      const rawProjects = (optimized.optimized_projects && optimized.optimized_projects.length > 0)
        ? optimized.optimized_projects
        : (parsed.projects || []);
      
      const projects = Array.isArray(rawProjects) ? rawProjects.map(proj => {
        if (!proj) return { title: "", technologies: [], description: [], link: "", hadGenericLink: false };
        const rawLink = proj.link || proj.github || "";
        const isGeneric = isGenericGitHubUrl(rawLink);
        return {
          title: proj.title || "",
          technologies: Array.isArray(proj.technologies) ? [...proj.technologies] : [],
          description: Array.isArray(proj.description) ? [...proj.description] : [],
          link: isGeneric ? "" : cleanLink(rawLink),
          hadGenericLink: isGeneric,
        };
      }) : [];

      // Resolve experience
      const rawExperience = (optimized.optimized_experience && optimized.optimized_experience.length > 0)
        ? optimized.optimized_experience
        : (parsed.experience || []);

      const experience = Array.isArray(rawExperience) ? rawExperience.map(exp => {
        if (!exp) return { company: "", role: "", location: "", start_date: "", end_date: "", description: [] };
        return {
          company: exp.company || "",
          role: exp.role || exp.title || "",
          location: exp.location || "",
          start_date: exp.start_date || "",
          end_date: exp.end_date || "",
          description: Array.isArray(exp.description) ? [...exp.description] : [],
        };
      }) : [];

      // Resolve certifications
      const rawCertifications = optimized.certifications || parsed.certifications || [];
      const certifications = Array.isArray(rawCertifications) ? rawCertifications.map(cert => ({
        name: cert?.name || "",
        date: cert?.date || "",
      })) : [];

      // Resolve education
      const rawEducation = optimized.education || parsed.education || [];
      const education = Array.isArray(rawEducation) ? rawEducation.map(edu => ({
        institution: edu?.institution || "",
        degree: edu?.degree || "",
        major: edu?.major || "",
        start_date: edu?.start_date || "",
        end_date: edu?.end_date || "",
        gpa: edu?.gpa || "",
      })) : [];

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
