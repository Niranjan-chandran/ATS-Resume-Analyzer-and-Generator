import logging

from backend.models.state import (
    ParsedResume
)

from backend.utils.resume_validator import (
    validate_resume,
    limit_project_descriptions,
    limit_experience_descriptions
)

from backend.utils.latex_generator import (
    generate_and_compile_latex
)

logger = logging.getLogger(
    "resumepilot.agents.pdf_generator"
)


def generate_pdf(
    resume: ParsedResume
):
    """
    Final PDF generation pipeline.

    Flow:

    Resume
      ↓
    Validation
      ↓
    Content Limits
      ↓
    LaTeX Generation
      ↓
    PDF Compilation
    """

    # =========================
    # Validation
    # =========================

    errors = validate_resume(
        resume
    )

    if errors:

        return {
            "success": False,
            "errors": errors,
            "latex_code": None,
            "pdf_path": None
        }

    # =========================
    # Prevent Huge Resumes
    # =========================

    resume = limit_project_descriptions(
        resume
    )

    resume = limit_experience_descriptions(
        resume
    )

    # =========================
    # Generate PDF
    # =========================

    result = generate_and_compile_latex(
        resume=resume,
        output_name="resume"
    )

    if not result["compiled"]:

        logger.error(
            f"PDF compilation failed: "
            f"{result['error']}"
        )

        return {
            "success": False,
            "errors": [
                result["error"]
            ],
            "latex_code": result[
                "latex_code"
            ],
            "pdf_path": None
        }

    return {
        "success": True,
        "errors": [],
        "latex_code": result[
            "latex_code"
        ],
        "pdf_path": result[
            "pdf_path"
        ]
    }