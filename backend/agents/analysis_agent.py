import logging
from typing import Optional

from backend.models.state import (
    ParsedResume,
    AnalysisReport
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
    "resumepilot.analysis"
)


def analyze_resume(
    parsed_resume: ParsedResume,
    jd: Optional[str] = None
) -> AnalysisReport:
    """
    Generates strengths,
    weaknesses,
    skill gaps,
    and missing keywords.
    """

    api_key = get_api_key()

    if not api_key:

        logger.warning(
            "Gemini unavailable. Using fallback analysis."
        )

        return get_mock_analysis()

    system_instruction = """
You are an ATS analyst and hiring expert.

Analyze the resume and return ONLY valid JSON matching AnalysisReport exactly.

Required JSON structure:

{
  "strengths": [
    {
      "title": "Strong Backend Development",
      "points": [
        "FastAPI experience",
        "REST API development"
      ]
    }
  ],

  "weaknesses": [
    {
      "title": "Cloud Deployment Gap",
      "description": "AWS experience not identified."
    }
  ],

  "skill_gaps": [
    {
      "skill": "Docker",
      "why_it_matters": "Containerization is commonly used.",
      "suggested_action": "Containerize a FastAPI project."
    }
  ],

  "missing_keywords": [
    "Docker",
    "AWS"
  ]
}

Rules:

- strengths must be a list.
- each strength must contain title and points.
- points must be a list of strings.

- weaknesses must be a list.
- each weakness must contain title and description.

- skill_gaps must be a list.
- each skill gap must contain:
  - skill
  - why_it_matters
  - suggested_action

- missing_keywords must be a list of strings.

Do not return markdown.
Do not return explanations.
Do not return extra fields.

Never invent experience.
Never invent certifications.
Never invent projects.

Use only information available in the resume and job description.
"""

    prompt = f"""
Analyze this resume.

Return JSON matching AnalysisReport exactly.

Resume:

{parsed_resume.model_dump_json(indent=2)}
"""

    if jd:

        prompt += f"""

Target Job Description:

{jd}
"""

    try:

        result = generate_structured_json(
            prompt=prompt,
            response_schema=AnalysisReport,
            system_instruction=system_instruction
        )

        logger.info(
            "Analysis completed."
        )

        return result

    except Exception as e:

        logger.error(
            f"Analysis failed: {e}"
        )

        return get_mock_analysis()


def get_mock_analysis() -> AnalysisReport:

    from backend.models.state import (
        StrengthItem,
        WeaknessItem,
        SkillGapItem
    )

    return AnalysisReport(

        strengths=[

            StrengthItem(
                title="Strong Backend Development",
                points=[
                    "FastAPI",
                    "REST APIs",
                    "Python backend development"
                ]
            ),

            StrengthItem(
                title="AI/ML Foundation",
                points=[
                    "TensorFlow",
                    "Scikit-learn",
                    "Machine Learning projects"
                ]
            )
        ],

        weaknesses=[

            WeaknessItem(
                title="Cloud Deployment Gap",
                description="AWS experience not identified."
            ),

            WeaknessItem(
                title="Containerization Gap",
                description="Docker experience not identified."
            )
        ],

        skill_gaps=[

            SkillGapItem(
                skill="Docker",
                why_it_matters="Containerization is widely used for backend and AI deployments.",
                suggested_action="Containerize an existing FastAPI project using Docker."
            ),

            SkillGapItem(
                skill="AWS",
                why_it_matters="Cloud deployment skills are expected in many modern software roles.",
                suggested_action="Deploy a personal project using AWS EC2."
            )
        ],

        missing_keywords=[
            "Docker",
            "AWS",
            "CI/CD",
            "Kubernetes"
        ]
    )
