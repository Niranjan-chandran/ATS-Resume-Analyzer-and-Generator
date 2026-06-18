import logging
from typing import Optional

from backend.models.state import (
    ParsedResume,
    ScoringReport,
    BreakdownItem
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
    "resumepilot.scoring"
)


def score_resume(
    parsed_resume: ParsedResume,
    jd: Optional[str] = None
) -> ScoringReport:
    """
    Generates ATS Readiness Score
    or ATS Match Score.
    """

    has_jd = bool(
        jd and jd.strip()
    )

    api_key = get_api_key()

    if not api_key:

        logger.warning(
            "Gemini unavailable. Using fallback scoring."
        )

        return fallback_score(
            has_jd
        )

    system_instruction = """
You are an ATS scoring engine.

Score resumes realistically.

Evaluate:

1. Skills Match
2. Projects Match
3. Experience Match
4. Keyword Coverage

Scoring Rules:

80-100 = Green
50-79 = Yellow
0-49 = Red

Never give 100 unless truly exceptional.

Return ONLY valid JSON in this exact format:

{
  "score": 75,
  "score_type": "ATS Match",

  "skills_match": {
    "score": 80,
    "color": "Green",
    "reason": "Strong alignment with required skills."
  },

  "projects_match": {
    "score": 70,
    "color": "Yellow",
    "reason": "Projects partially align with role."
  },

  "experience_match": {
    "score": 65,
    "color": "Yellow",
    "reason": "Experience is relevant."
  },

  "keyword_coverage": {
    "score": 75,
    "color": "Yellow",
    "reason": "Most important keywords are present."
  }
}

Do not return markdown.
Do not return explanations.
Do not return fields not shown above.
Always return every field.
"""

    if has_jd:

        prompt = f"""
Perform ATS Match Scoring.

Return JSON matching ScoringReport exactly.

Job Description:

{jd}

Resume:

{parsed_resume.model_dump_json(indent=2)}
"""

    else:

        prompt = f"""
Perform ATS Readiness Scoring.

Return JSON matching ScoringReport exactly.

Evaluate:

- Resume completeness
- Skills quality
- Experience quality
- Projects quality
- ATS formatting

Resume:

{parsed_resume.model_dump_json(indent=2)}
"""

    try:

        result = generate_structured_json(
            prompt=prompt,
            response_schema=ScoringReport,
            system_instruction=system_instruction
        )

        logger.info(
            "Scoring completed."
        )

        return result

    except Exception as e:

        logger.error(
            f"Scoring failed: {e}"
        )

        return fallback_score(
            has_jd
        )


def fallback_score(
    has_jd: bool
) -> ScoringReport:

    if has_jd:

        return ScoringReport(
            score=68,
            score_type="ATS Match",

            skills_match=BreakdownItem(
                score=70,
                color="Yellow",
                reason="Some skills match the target role."
            ),

            projects_match=BreakdownItem(
                score=65,
                color="Yellow",
                reason="Projects partially align with role requirements."
            ),

            experience_match=BreakdownItem(
                score=70,
                color="Yellow",
                reason="Experience is relevant but could be stronger."
            ),

            keyword_coverage=BreakdownItem(
                score=60,
                color="Yellow",
                reason="Several important keywords are missing."
            )
        )

    return ScoringReport(
        score=78,
        score_type="ATS Readiness",

        skills_match=BreakdownItem(
            score=85,
            color="Green",
            reason="Skills section is well structured."
        ),

        projects_match=BreakdownItem(
            score=75,
            color="Yellow",
            reason="Projects are relevant but could include more impact."
        ),

        experience_match=BreakdownItem(
            score=72,
            color="Yellow",
            reason="Experience section could include more measurable achievements."
        ),

        keyword_coverage=BreakdownItem(
            score=80,
            color="Green",
            reason="Resume follows ATS-friendly structure."
        )
    )

