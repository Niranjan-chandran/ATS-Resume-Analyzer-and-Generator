import logging
from typing import List, Optional

from pydantic import BaseModel

from backend.models.state import (
    ParsedResume,
    AnalysisReport,
    CourseRecommendation
)

from backend.utils.groq_client import (
    generate_structured_json,
    get_api_key
)

logger = logging.getLogger(
    "resumepilot.course"
)


class CourseContainer(BaseModel):
    courses: List[CourseRecommendation]


def recommend_courses(
    parsed_resume: ParsedResume,
    analysis: AnalysisReport,
    detected_domain: Optional[str] = None,
    jd: Optional[str] = None
) -> List[CourseRecommendation]:

    api_key = get_api_key()

    if not api_key:

        logger.warning(
            "Groq unavailable. Using fallback courses."
        )

        return get_mock_courses(
            detected_domain
        )

    system_instruction = """
You are a career mentor.

Return ONLY valid JSON matching CourseContainer exactly.

Required JSON structure:

{
  "courses": [
    {
      "name": "Course Name",
      "provider": "Provider",
      "link": "https://example.com",
      "certification": "Certificate Name"
    }
  ]
}

Rules:

- courses must be a list.
- Recommend 3 to 5 courses.
- Each course must contain:
  - name
  - provider
  - link
  - certification

Use:
- Candidate domain
- Resume
- Skill gaps
- Weaknesses
- Job description

Recommendations must be practical and relevant.

Return JSON only.
Do not return markdown.
Do not return explanations.
Do not return extra fields.
"""

    prompt = f"""
Recommend courses.

Return JSON matching CourseContainer exactly.

Detected Domain:

{detected_domain}

Skill Gaps:

{[g.skill for g in analysis.skill_gaps]}

Weaknesses:

{[w.title for w in analysis.weaknesses]}

Resume:

{parsed_resume.model_dump_json(indent=2)}

Job Description:

{jd}
"""

    try:

        result = generate_structured_json(
            prompt=prompt,
            response_schema=CourseContainer,
            system_instruction=system_instruction
        )

        logger.info(
            "Course recommendations generated."
        )

        return result.courses

    except Exception as e:

        logger.error(
            f"Course generation failed: {e}"
        )

        return get_mock_courses(
            detected_domain
        )


def get_mock_courses(
    detected_domain: Optional[str]
) -> List[CourseRecommendation]:

    domain = (
        detected_domain or ""
    ).lower()

    if "ai" in domain:

        return [

            CourseRecommendation(
                name="Machine Learning Specialization",
                provider="Coursera",
                link="https://www.coursera.org",
                certification="Machine Learning Specialization"
            ),

            CourseRecommendation(
                name="Deep Learning Specialization",
                provider="Coursera",
                link="https://www.coursera.org",
                certification="Deep Learning Specialization"
            ),

            CourseRecommendation(
                name="Generative AI with LLMs",
                provider="Coursera",
                link="https://www.coursera.org",
                certification="Generative AI Certificate"
            )
        ]

    if "backend" in domain:

        return [

            CourseRecommendation(
                name="Docker Mastery",
                provider="Udemy",
                link="https://www.udemy.com",
                certification="Docker Certificate"
            ),

            CourseRecommendation(
                name="AWS Cloud Practitioner",
                provider="AWS",
                link="https://aws.amazon.com",
                certification="AWS Cloud Practitioner"
            ),

            CourseRecommendation(
                name="System Design Fundamentals",
                provider="Educative",
                link="https://www.educative.io",
                certification="System Design"
            )
        ]

    if "mechanical" in domain:

        return [

            CourseRecommendation(
                name="SolidWorks Essentials",
                provider="SolidWorks",
                link="https://www.solidworks.com",
                certification="CSWA"
            ),

            CourseRecommendation(
                name="ANSYS Simulation Training",
                provider="ANSYS",
                link="https://www.ansys.com",
                certification="ANSYS Certification"
            )
        ]

    return [

        CourseRecommendation(
            name="Professional Career Development",
            provider="Coursera",
            link="https://www.coursera.org",
            certification="Career Development"
        )
    ]

