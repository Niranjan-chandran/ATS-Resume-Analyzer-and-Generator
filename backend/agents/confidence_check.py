import logging

from backend.models.state import (
    ConfidenceCheck
)

from backend.utils.groq_client import (
    generate_structured_json,
    get_api_key
)

logger = logging.getLogger(
    "resumepilot.confidence_check"
)


def check_jd_confidence(
    jd: str
) -> ConfidenceCheck:
    """
    Evaluate Job Description quality.

    This should NEVER block the user.
    """

    if not jd or not jd.strip():

        return ConfidenceCheck(
            confidence="Low",
            suggestions=[
                "No Job Description provided."
            ]
        )

    api_key = get_api_key()

    if not api_key:

        logger.warning(
            "Groq unavailable. Using heuristic JD evaluation."
        )

        return heuristic_confidence_check(
            jd
        )

    system_instruction = """
You are an ATS Job Description Evaluator.

Return ONLY valid JSON.

Required JSON format:

{
  "confidence": "High",
  "suggestions": [
    "Suggestion 1",
    "Suggestion 2"
  ]
}

Rules:

- confidence must be one of:
  High
  Medium
  Low

- suggestions must be a list of strings

Evaluate:

- Job Title
- Responsibilities
- Required Skills
- Qualifications
- Technologies

Never reject the JD.

Return JSON only.
Do not return markdown.
Do not return explanations.
Do not return extra fields.
"""

    prompt = f"""
Evaluate the following Job Description.

Return JSON matching ConfidenceCheck exactly.

Job Description:

{jd}
"""

    try:

        result = generate_structured_json(
            prompt=prompt,
            response_schema=ConfidenceCheck,
            system_instruction=system_instruction
        )

        logger.info(
            "JD confidence evaluation completed."
        )

        return result

    except Exception as e:

        logger.error(
            f"JD evaluation failed: {e}"
        )

        return heuristic_confidence_check(
            jd
        )


def heuristic_confidence_check(
    jd: str
) -> ConfidenceCheck:
    """
    Fallback JD quality evaluation.
    """

    jd_lower = jd.lower()

    suggestions = []

    has_skills = any(
        word in jd_lower
        for word in [
            "skills",
            "requirements",
            "qualification",
            "experience",
            "proficient"
        ]
    )

    has_responsibilities = any(
        word in jd_lower
        for word in [
            "responsibilities",
            "duties",
            "role",
            "develop",
            "build",
            "design"
        ]
    )

    length = len(jd)

    if length < 100:

        confidence = "Low"

        suggestions.extend([
            "Add required skills.",
            "Add responsibilities.",
            "Add job qualifications."
        ])

    elif length < 300:

        confidence = "Medium"

        if not has_skills:
            suggestions.append(
                "Specify required technical skills."
            )

        if not has_responsibilities:
            suggestions.append(
                "Describe key responsibilities."
            )

    else:

        confidence = "High"

    return ConfidenceCheck(
        confidence=confidence,
        suggestions=suggestions
    )

