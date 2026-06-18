from backend.models.state import (
    ParsedResume
)


def prepare_review_data(
    parsed_resume: ParsedResume
) -> dict:
    """
    Prepare resume data for review screen.
    """

    suggestions = []

    # =====================================
    # Links
    # =====================================

    if not parsed_resume.links.linkedin:
        suggestions.append(
            "Add LinkedIn Profile"
        )

    if not parsed_resume.links.github:
        suggestions.append(
            "Add GitHub Profile"
        )

    if not parsed_resume.links.leetcode:
        suggestions.append(
            "Add LeetCode Profile"
        )

    if not parsed_resume.links.portfolio:
        suggestions.append(
            "Add Portfolio Website"
        )

    # =====================================
    # Certifications
    # =====================================

    if not parsed_resume.certifications:
        suggestions.append(
            "Add Certifications"
        )

    # =====================================
    # Projects
    # =====================================

    if not parsed_resume.projects:
        suggestions.append(
            "Add Projects"
        )

    # =====================================
    # Experience
    # =====================================

    if not parsed_resume.experience:
        suggestions.append(
            "Add Internship or Work Experience"
        )

    return {
        "resume": parsed_resume,

        "suggestions": suggestions,

        "review_required": True,

        "link_notice": (
            "If LinkedIn, GitHub, LeetCode or Portfolio "
            "links were embedded as PDF hyperlinks, "
            "they may not be detected automatically. "
            "Please verify and add them manually before "
            "generating the final PDF."
        )
    }


def apply_user_edits(
    original_resume: ParsedResume,
    edited_resume: ParsedResume
) -> ParsedResume:
    """
    Final approved resume after review.
    User edits always win.
    """

    return edited_resume