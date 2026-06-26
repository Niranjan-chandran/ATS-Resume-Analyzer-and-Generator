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

UNICODE_REPLACEMENTS = {
    "⋄": "-",
    "•": "-",
    "▪": "-",
    "■": "-",
    "★": "*",
    "✓": "[Checked]",
    "→": "->",
    "–": "-",
    "—": "--",
    "‘": "'",
    "’": "'",
    "“": '"',
    "”": '"',
}


def escape_latex(text: str) -> str:
    """
    Escape LaTeX special characters and clean up problematic Unicode symbols.
    """

    if not text:
        return ""

    # Replace problematic Unicode symbols first
    for char, replaced in UNICODE_REPLACEMENTS.items():
        text = text.replace(char, replaced)

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

    # Check key fields
    name_missing = not resume.personal_info.name.strip()
    education_missing = len(resume.education) == 0

    if hasattr(resume, "optimized_projects"):
        projects = resume.optimized_projects
        experience = resume.optimized_experience
    else:
        projects = resume.projects
        experience = resume.experience

    projects_missing = len(projects) == 0
    experience_missing = len(experience) == 0

    # Safety rule: Only block PDF generation when: Name missing AND Education missing AND Experience missing AND Projects missing
    if name_missing and education_missing and experience_missing and projects_missing:
        errors.append(
            "Cannot generate PDF: Name, Education, Experience, and Projects are all missing."
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