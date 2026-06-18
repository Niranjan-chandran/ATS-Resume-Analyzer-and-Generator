import logging
from typing import Optional

from backend.models.state import (
    ParsedResume,
    OptimizedResume,
    ScoringReport,
    ScoreReevaluation
)

from backend.agents.scoring_agent import (
    score_resume
)
'''
from backend.utils.gemini_client import (
    get_api_key
)'''

from backend.utils.groq_client import (
    get_api_key
)

logger = logging.getLogger(
    "resumepilot.score_reeval"
)


def reevaluate_score(
    old_report: ScoringReport,
    optimized_resume: OptimizedResume,
    jd: Optional[str] = None
) -> ScoreReevaluation:
    """
    Re-score optimized resume
    and calculate improvement.
    """

    try:

        parsed_resume = convert_to_parsed_resume(
            optimized_resume
        )

        new_report = score_resume(
            parsed_resume,
            jd
        )

        old_score = old_report.score

        new_score = max(
            old_score,
            new_report.score
        )

        return ScoreReevaluation(
            old_score=old_score,
            new_score=new_score,
            improvement_percent=new_score - old_score
        )

    except Exception as e:

        logger.error(
            f"Score reevaluation failed: {e}"
        )

        old_score = old_report.score

        return ScoreReevaluation(
            old_score=old_score,
            new_score=old_score,
            improvement_percent=0
        )


def convert_to_parsed_resume(
    optimized_resume: OptimizedResume
) -> ParsedResume:
    """
    Convert OptimizedResume
    back into ParsedResume.
    """

    flat_skills = []

    for category_skills in (
        optimized_resume.optimized_skills.values()
    ):
        flat_skills.extend(
            category_skills
        )

    return ParsedResume(

        personal_info=
        optimized_resume.personal_info,

        links=
        optimized_resume.links,

        summary=
        optimized_resume.optimized_summary,

        education=
        optimized_resume.education,

        skills=
        flat_skills,

        projects=
        optimized_resume.optimized_projects,

        experience=
        optimized_resume.optimized_experience,

        certifications=
        optimized_resume.certifications,

        extra_sections=
        optimized_resume.extra_sections
    )