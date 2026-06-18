from backend.models.state import (
    ParsedResume,
    CompletenessReport
)


def check_completeness(
    parsed_resume: ParsedResume
) -> CompletenessReport:
    """
    Checks whether the resume
    contains important sections.
    """

    missing_fields = []

    total_checks = 10
    passed_checks = 0

    # Personal Info

    if parsed_resume.personal_info.name:
        passed_checks += 1
    else:
        missing_fields.append("Full Name")

    if parsed_resume.personal_info.email:
        passed_checks += 1
    else:
        missing_fields.append("Email")

    if parsed_resume.personal_info.phone:
        passed_checks += 1
    else:
        missing_fields.append("Phone Number")

    if parsed_resume.personal_info.location:
        passed_checks += 1
    else:
        missing_fields.append("Location")

    # Links

    if parsed_resume.links.linkedin:
        passed_checks += 1
    else:
        missing_fields.append("LinkedIn")

    if parsed_resume.links.github:
        passed_checks += 1
    else:
        missing_fields.append("GitHub")

    if parsed_resume.links.portfolio:
        passed_checks += 1
    else:
        missing_fields.append("Portfolio")

    # Sections

    if parsed_resume.education:
        passed_checks += 1
    else:
        missing_fields.append("Education")

    if parsed_resume.skills:
        passed_checks += 1
    else:
        missing_fields.append("Skills")

    if (
        parsed_resume.projects
        or parsed_resume.experience
    ):
        passed_checks += 1
    else:
        missing_fields.append(
            "Projects or Experience"
        )

    score = int(
        (passed_checks / total_checks) * 100
    )

    return CompletenessReport(
        completeness_score=score,
        missing_fields=missing_fields
    )