from typing import List, Dict, Optional, TypedDict
from pydantic import BaseModel, Field, AliasChoices


# ==========================================
# Resume Core Models
# ==========================================

class PersonalInfo(BaseModel):
    name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""


class Links(BaseModel):
    linkedin: Optional[str] = ""
    github: Optional[str] = ""
    portfolio: Optional[str] = ""
    leetcode: Optional[str] = ""
    hackerrank: Optional[str] = ""
    kaggle: Optional[str] = ""

    other_urls: List[str] = Field(default_factory=list)


class EducationItem(BaseModel):
    institution: str = ""
    degree: str = ""
    major: str = ""
    start_date: str = ""
    end_date: str = ""
    gpa: str = ""



class ProjectItem(BaseModel):
    title: str = Field(
        default="",
        validation_alias=AliasChoices(
            "title",
            "name"
        )
    )

    technologies: List[str] = Field(
        default_factory=list
    )

    description: List[str] = Field(
        default_factory=list
    )

    link: str = Field(
        default="",
        validation_alias=AliasChoices(
            "link",
            "github"
        )
    )


class ExperienceItem(BaseModel):

    company: str = ""

    role: str = Field(
        default="",
        validation_alias=AliasChoices(
            "role",
            "title"
        )
    )

    location: str = ""

    start_date: str = ""

    end_date: str = ""

    description: List[str] = Field(
        default_factory=list
    )


# ==========================================
# Dynamic Sections
# ==========================================

class ExtraSections(BaseModel):
    awards: List[str] = Field(default_factory=list)
    publications: List[str] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)
    volunteer_work: List[str] = Field(default_factory=list)
    research_papers: List[str] = Field(default_factory=list)
    patents: List[str] = Field(default_factory=list)
    hackathons: List[str] = Field(default_factory=list)

    unknown: Dict[str, List[str]] = Field(default_factory=dict)


class CertificationItem(BaseModel):
    name: str = ""
    date: Optional[str] = ""    


# ==========================================
# Parsed Resume
# ==========================================

class ParsedResume(BaseModel):
    personal_info: PersonalInfo = Field(default_factory=PersonalInfo)

    links: Links = Field(default_factory=Links)

    summary: str = ""

    education: List[EducationItem] = Field(default_factory=list)

    skills: Dict[str, List[str]] = Field(default_factory=dict)

    projects: List[ProjectItem] = Field(default_factory=list)

    experience: List[ExperienceItem] = Field(default_factory=list)

    certifications: List[CertificationItem] = Field(
    default_factory=list
)

    extra_sections: ExtraSections = Field(default_factory=ExtraSections)


# ==========================================
# JD Confidence
# ==========================================

class ConfidenceCheck(BaseModel):
    confidence: str
    suggestions: List[str]


# ==========================================
# ATS Scoring
# ==========================================

class BreakdownItem(BaseModel):
    score: int
    color: str
    reason: str


class ScoringReport(BaseModel):
    score: int
    score_type: str

    skills_match: BreakdownItem
    projects_match: BreakdownItem
    experience_match: BreakdownItem
    keyword_coverage: BreakdownItem


# ==========================================
# Analysis
# ==========================================

class StrengthItem(BaseModel):
    title: str
    points: List[str]


class WeaknessItem(BaseModel):
    title: str
    description: str


class SkillGapItem(BaseModel):
    skill: str
    why_it_matters: str
    suggested_action: str


class AnalysisReport(BaseModel):
    strengths: List[StrengthItem]
    weaknesses: List[WeaknessItem]
    skill_gaps: List[SkillGapItem]
    missing_keywords: List[str]


# ==========================================
# Optimized Resume
# ==========================================

class OptimizedResume(BaseModel):
    personal_info: PersonalInfo = Field(default_factory=PersonalInfo)

    links: Links = Field(default_factory=Links)

    optimized_summary: str = ""

    education: List[EducationItem] = Field(default_factory=list)

    optimized_skills: Dict[str, List[str]] = Field(default_factory=dict)

    optimized_projects: List[ProjectItem] = Field(default_factory=list)

    optimized_experience: List[ExperienceItem] = Field(default_factory=list)

    certifications: List[CertificationItem] = Field(
    default_factory=list
)

    extra_sections: ExtraSections = Field(default_factory=ExtraSections)


# ==========================================
# Score Reevaluation
# ==========================================

class ScoreReevaluation(BaseModel):
    old_score: int
    new_score: int
    improvement_percent: int


# ==========================================
# Interview Questions
# ==========================================

class InterviewQuestions(BaseModel):
    technical_questions: List[str]
    project_questions: List[str]
    hr_questions: List[str]


# ==========================================
# Learning Roadmap
# ==========================================

class RoadmapWeek(BaseModel):
    week: str
    topic: str
    tasks: List[str]


class CourseRecommendation(BaseModel):
    name: str
    provider: str
    link: str
    certification: str


class RecommendedProject(BaseModel):
    name: str
    description: str
    technologies: List[str]
    steps: List[str]


class RecommendationsReport(BaseModel):
    roadmap: List[RoadmapWeek]
    courses: List[CourseRecommendation]
    projects: List[RecommendedProject]


# ==========================================
# Completeness
# ==========================================

class CompletenessReport(BaseModel):
    completeness_score: int
    missing_fields: List[str]


# ==========================================
# LangGraph State
# ==========================================

class AgentState(TypedDict, total=False):

    raw_resume_text: str

    job_description: Optional[str]

    detected_domain: Optional[str]

    parsed_resume: Optional[ParsedResume]

    jd_confidence: Optional[ConfidenceCheck]

    scoring: Optional[ScoringReport]

    analysis: Optional[AnalysisReport]

    optimized_resume: Optional[OptimizedResume]

    score_reeval: Optional[ScoreReevaluation]

    interview_questions: Optional[InterviewQuestions]

    recommendations: Optional[RecommendationsReport]

    completeness: Optional[CompletenessReport]

    reviewed_resume: Optional[ParsedResume]

    review_required: Optional[bool]

    latex_code: Optional[str]

    latex_path: Optional[str]

    pdf_path: Optional[str]

    error: Optional[str]