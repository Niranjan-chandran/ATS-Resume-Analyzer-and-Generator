from backend.models.state import (
    ParsedResume,
    OptimizedResume
)

from backend.utils.resume_validator import (
    escape_latex
)


def normalize_url(url: str) -> str:
    if not url:
        return ""
    url = url.strip()
    if not url:
        return ""
    if url.lower().startswith(("http://", "https://", "mailto:")):
        return url
    return f"https://{url}"


def render_resume_template(
    resume: ParsedResume | OptimizedResume
) -> str:

    personal = resume.personal_info
    links = resume.links

    summary = (
        getattr(
            resume,
            "optimized_summary",
            ""
        )
        or getattr(
            resume,
            "summary",
            ""
        )
    )

    if (
        not summary
        and hasattr(
            resume,
            "extra_sections"
        )
    ):
        summary = (
            getattr(
                resume.extra_sections,
                "Summary",
                ""
            )
            or getattr(
                resume.extra_sections,
                "summary",
                ""
            )
        )


    latex = []

    # =====================================
    # Header
    # =====================================

    latex.append(r"\documentclass{resume}")
    latex.append("")
    latex.append(
        r"\usepackage[left=0.4 in,top=0.4in,right=0.4 in,bottom=0.4in]{geometry}"
    )

    latex.append(
        r"\usepackage{needspace}"
    )

    latex.append(
        f"\\name{{{escape_latex(personal.name)}}}"
    )

    latex.append(
        f"\\address{{{escape_latex(personal.phone)} \\\\ {escape_latex(personal.location)}}}"
    )

    links_line = []

    if personal.email:
        email_clean = personal.email.strip()
        if email_clean:
            links_line.append(
                f"\\href{{mailto:{email_clean}}}{{{escape_latex(email_clean)}}}"
            )

    linkedin = normalize_url(links.linkedin)
    if linkedin:
        links_line.append(
            f"\\href{{{linkedin}}}{{LinkedIn}}"
        )

    github = normalize_url(links.github)
    if github:
        links_line.append(
            f"\\href{{{github}}}{{GitHub}}"
        )

    leetcode = normalize_url(links.leetcode)
    if leetcode:
        links_line.append(
            f"\\href{{{leetcode}}}{{LeetCode}}"
        )    

    portfolio = normalize_url(links.portfolio)
    if portfolio:
        links_line.append(
            f"\\href{{{portfolio}}}{{Portfolio}}"
        )

    latex.append(
        "\\address{" +
        " \\;|\\; ".join(links_line)
        + "}"
    )

    latex.append("")
    latex.append(r"\begin{document}")

    # =====================================
    # SUMMARY
    # =====================================

    if summary:

        latex.append(
            r"\needspace{5\baselineskip}"
        )
        latex.append(
            r"\begin{rSection}{SUMMARY}"
        )

        latex.append(
            escape_latex(summary)
        )

        latex.append(
            r"\end{rSection}"
        )

    # =====================================
    # EDUCATION
    # =====================================

    if resume.education:

        latex.append(
            r"\needspace{6\baselineskip}"
        )
        latex.append(
            r"\begin{rSection}{EDUCATION}"
        )

        for edu in resume.education:

            latex.append(
                f"{{\\bf {escape_latex(edu.degree)}}}, "
                f"{escape_latex(edu.institution)} "
                f"\\hfill {escape_latex(edu.start_date)} -- {escape_latex(edu.end_date)} \\\\"
            )

            if edu.gpa:

                latex.append(
                    f"GPA: {escape_latex(edu.gpa)}"
                )

            latex.append("")

        latex.append(
            r"\end{rSection}"
        )

    # =====================================
    # SKILLS
    # =====================================

    skill_categories = getattr(
        resume,
        "optimized_skills",
        None
    ) or getattr(
        resume,
        "skills",
        None
    )

    if skill_categories and isinstance(skill_categories, dict):

        latex.append(
            r"\needspace{5\baselineskip}"
        )
        latex.append(
            r"\begin{rSection}{SKILLS}"
        )

        for category, skills in skill_categories.items():
            if not skills:
                continue

            latex.append(
                f"\\textbf{{{escape_latex(category)}}}:\\\\"
            )

            latex.append(
                ", ".join(
                    escape_latex(skill)
                    for skill in skills
                )
            )
            latex.append(
                r"\\"
            )

        latex.append(
            r"\end{rSection}"
        )

    elif hasattr(resume, "skills") and resume.skills:

        latex.append(
            r"\needspace{5\baselineskip}"
        )
        latex.append(
            r"\begin{rSection}{SKILLS}"
        )

        if isinstance(resume.skills, list):
            latex.append(
                ", ".join(
                    escape_latex(skill)
                    for skill in resume.skills
                )
            )

        latex.append(
            r"\end{rSection}"
        )

    # =====================================
    # PROJECTS
    # =====================================

    projects = getattr(
        resume,
        "optimized_projects",
        None
    ) or getattr(
        resume,
        "projects",
        []
    )

    if projects:

        latex.append(
            r"\needspace{8\baselineskip}"
        )
        latex.append(
            r"\begin{rSection}{PROJECTS}"
        )

        for project in projects:

            latex.append(
                r"\begin{samepage}"
            )

            project_title=getattr(
                project,
                "title",
                getattr(
                    project,
                    "name",
                    ""
                )
            )

            latex.append(
                f"\\item \\textbf{{{escape_latex(project_title)}}}:"

            )

            for bullet in project.description:

                latex.append(
                    escape_latex(bullet)
                )

            project_link = normalize_url(getattr(project, "link", ""))
            if project_link: 
                latex.append(
                    f"\\href{{{project_link}}}{{GitHub}}"
                )  

            latex.append(
                r"\end{samepage}"
            )    

            latex.append("")

        latex.append(
            r"\end{rSection}"
        )

    # =====================================
    # EXPERIENCE
    # =====================================

    experience = getattr(
        resume,
        "optimized_experience",
        None
    ) or getattr(
        resume,
        "experience",
        []
    )

    if experience:

        latex.append(
            r"\needspace{9\baselineskip}"
        )
        latex.append(
            r"\begin{rSection}{EXPERIENCE}"
        )
        
        for exp in experience:

            latex.append(
                r"\begin{samepage}"
            )

            print("EXPERIENCE OBJECT =", exp)

            latex.append(
                f"\\textbf{{{escape_latex(exp.role)}}} "
                f"\\hfill {escape_latex(exp.start_date)} -- {escape_latex(exp.end_date)} \\\\"
            )

            latex.append(
                escape_latex(exp.company)
            )

            latex.append(
                r"\begin{itemize}"
            )


            for bullet in exp.description:

                latex.append(
                    f"\\item {escape_latex(bullet)}"
                )

            latex.append(
                r"\end{itemize}"
            )

            latex.append(
                r"\end{samepage}"
            )

        latex.append(
            r"\end{rSection}"
        )

        

    # =====================================
    # CERTIFICATIONS
    # =====================================


    if resume.certifications:


        latex.append(
            r"\needspace{5\baselineskip}"
        )
        latex.append(
            r"\begin{samepage}"
        )


        latex.append(
            r"\begin{rSection}{CERTIFICATIONS}"
        )

        for cert in resume.certifications:

            cert_text = cert.name

            if cert.date:
                cert_text += (
                    f" ({cert.date})"
                )

            latex.append(
                escape_latex(
                    cert_text
                ) + r" \\"
            )

        latex.append(
            r"\end{rSection}"
        )

        latex.append(
            r"\end{samepage}"
        )

    # =====================================
    # EXTRA SECTIONS
    # =====================================

    extra = resume.extra_sections

    dynamic_sections = {
        "AWARDS": extra.awards,
        "PUBLICATIONS": extra.publications,
        "LANGUAGES": extra.languages,
        "VOLUNTEER WORK": extra.volunteer_work,
        "RESEARCH PAPERS": extra.research_papers,
        "PATENTS": extra.patents,
        "HACKATHONS": extra.hackathons,
    }

    for title, values in dynamic_sections.items():

        if values:

            latex.append(
                f"\\needspace{{5\\baselineskip}}"
            )
            latex.append(
                f"\\begin{{rSection}}{{{title}}}"
            )

            for item in values:

                latex.append(
                    escape_latex(item)
                    + r" \\"
                )

            latex.append(
                r"\end{rSection}"
            )

    latex.append(
        r"\end{document}"
    )

    return "\n".join(latex)