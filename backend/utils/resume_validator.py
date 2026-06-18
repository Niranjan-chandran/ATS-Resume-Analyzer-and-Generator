from typing import List

from backend.models.state import (
    ParsedResume,
    OptimizedResume
)


LATEX_SPECIAL_CHARS = {
    "&": r"\&",
    "%": r"\%",
    "$": r"\$",
    "#": r"\#",
    "_": r"\_",
    "{": r"\{",
    "}": r"\}",
}


def escape_latex(text: str) -> str:
    """
    Escape LaTeX special characters.
    """

    if not text:
        return ""

    for char, escaped in LATEX_SPECIAL_CHARS.items():
        text = text.replace(char, escaped)

    return text


def validate_resume(
    resume: ParsedResume | OptimizedResume
) -> List[str]:
    """
    Validate resume before PDF generation.
    """

    errors = []

    # =========================
    # Name
    # =========================

    if not resume.personal_info.name.strip():

        errors.append(
            "Full Name is required."
        )

    # =========================
    # Email
    # =========================

    if not resume.personal_info.email.strip():

        errors.append(
            "Email is required."
        )

    # =========================
    # Skills
    # =========================

    if hasattr(
        resume,
        "optimized_skills"
    ):

        if len(
            resume.optimized_skills
        ) == 0:

            errors.append(
                "At least one skill is required."
            )

    elif hasattr(
        resume,
        "skills"
    ):

        if len(
            resume.skills
        ) == 0:

            errors.append(
                "At least one skill is required."
            )

    # =========================
    # Education
    # =========================

    if len(
        resume.education
    ) == 0:

        errors.append(
            "Education information is missing."
        )

    # =========================
    # Projects / Experience
    # =========================

    if hasattr(
        resume,
        "optimized_projects"
    ):

        projects = (
            resume.optimized_projects
        )

        experience = (
            resume.optimized_experience
        )

    else:

        projects = (
            resume.projects
        )

        experience = (
            resume.experience
        )

    if (
        len(projects) == 0
        and len(experience) == 0
    ):

        errors.append(
            "Add at least one project or experience."
        )

    return errors


def limit_project_descriptions(
    resume: ParsedResume | OptimizedResume,
    max_bullets: int = 4
):

    if hasattr(
        resume,
        "optimized_projects"
    ):

        projects = (
            resume.optimized_projects
        )

    else:

        projects = (
            resume.projects
        )

    for project in projects:

        if len(
            project.description
        ) > max_bullets:

            project.description = (
                project.description[
                    :max_bullets
                ]
            )

    return resume


def limit_experience_descriptions(
    resume: ParsedResume | OptimizedResume,
    max_bullets: int = 4
):

    if hasattr(
        resume,
        "optimized_experience"
    ):

        experiences = (
            resume.optimized_experience
        )

    else:

        experiences = (
            resume.experience
        )

    for exp in experiences:

        if len(
            exp.description
        ) > max_bullets:

            exp.description = (
                exp.description[
                    :max_bullets
                ]
            )

    return resume