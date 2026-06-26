import logging
from typing import Optional

from backend.models.state import (
    ParsedResume,
    OptimizedResume
)
'''
from backend.utils.gemini_client import (
    generate_structured_json,
    get_api_key
)'''

from backend.utils.groq_client import (
    generate_structured_json,
    get_api_key
)

logger = logging.getLogger(
    "resumepilot.optimizer"
)


def optimize_resume(
    parsed_resume: ParsedResume,
    jd: Optional[str] = None,
    detected_domain: Optional[str] = None
) -> OptimizedResume:
    """
    ATS optimization.

    Never invent:
    - skills
    - projects
    - certifications
    - experience
    """

    api_key = get_api_key()

    if not api_key:

        logger.warning(
            "Gemini unavailable. Using fallback optimization."
        )

        return fallback_optimizer(
            parsed_resume
        )

    system_instruction = """
You are an ATS Resume Optimizer.

Return ONLY valid JSON matching OptimizedResume exactly.

CRITICAL RULES:

1. Never invent skills.
2. Never invent projects.
3. Never invent certifications.
4. Never invent experience.
5. Never invent education.

Allowed:

- Improve grammar
- Improve wording
- Improve ATS language
- Reorder skills
- Group skills dynamically
- Improve project descriptions
- Improve experience bullets

Required JSON fields:

{
  "personal_info": {},
  "links": {},
  "optimized_summary": "",
  "education": [],
  "optimized_skills": {},
  "optimized_projects": [],
  "optimized_experience": [],
  "certifications": [],
  "extra_sections": {}
}

Skill categories MUST be dynamic.

Examples:

AI Resume:
- Machine Learning
- Deep Learning
- GenAI

Backend Resume:
- Backend
- Cloud
- Databases

Mechanical Resume:
- CAD
- Manufacturing

Do not use fixed categories.

Project descriptions:
Maximum 4 bullets.

Experience:
Maximum 4 bullets.

Certifications must remain objects:

[
  {
    "name": "Certification Name",
    "date": ""
  }
]

Never use null.
Use "" instead.
Return JSON only.
"""

    prompt = f"""
Optimize this resume.

Return JSON matching OptimizedResume exactly.

Resume:

{parsed_resume.model_dump_json(indent=2)}

Detected Domain:

{detected_domain}

Target JD:

{jd}
"""

    try:

        result = generate_structured_json(
            prompt=prompt,
            response_schema=OptimizedResume,
            system_instruction=system_instruction
        )

        logger.info(
            "Resume optimization completed."
        )

        return result

    except Exception as e:

        logger.error(
            f"Optimization failed: {e}"
        )

        return fallback_optimizer(
            parsed_resume
        )


def fallback_optimizer(
    parsed_resume: ParsedResume
) -> OptimizedResume:

    return OptimizedResume(

        personal_info=parsed_resume.personal_info,

        links=parsed_resume.links,

        optimized_summary=parsed_resume.summary,

        education=parsed_resume.education,

        optimized_skills=parsed_resume.skills,

        optimized_projects=parsed_resume.projects,

        optimized_experience=parsed_resume.experience,

        certifications=parsed_resume.certifications,

        extra_sections=parsed_resume.extra_sections
    )
