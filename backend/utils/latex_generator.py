import os
import shutil
import subprocess
from pathlib import Path

from backend.utils.template_renderer import (
    render_resume_template
)

GENERATED_DIR = Path(
    "backend/generated"
)

TEMPLATE_DIR = Path(
    "backend/templates"
)


def generate_and_compile_latex(
    resume,
    output_name: str = "resume"
):
    """
    Generate .tex file and compile to PDF.
    """

    GENERATED_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    latex_code = render_resume_template(
        resume
    )

    tex_path = (
        GENERATED_DIR /
        f"{output_name}.tex"
    )

    pdf_path = (
        GENERATED_DIR /
        f"{output_name}.pdf"
    )

    # =====================================
    # Save TEX
    # =====================================

    with open(
        tex_path,
        "w",
        encoding="utf-8"
    ) as f:

        f.write(
            latex_code
        )

    # =====================================
    # Copy resume.cls
    # =====================================

    template_cls = (
        TEMPLATE_DIR /
        "resume.cls"
    )

    generated_cls = (
        GENERATED_DIR /
        "resume.cls"
    )

    if template_cls.exists():

        shutil.copy(
            template_cls,
            generated_cls
        )

    compiled = False
    error = None

    try:

        result = subprocess.run(
            [
                "pdflatex",
                "-interaction=nonstopmode",
                "-output-directory",
                str(GENERATED_DIR),
                str(tex_path)
            ],
            capture_output=True,
            text=True
        )

        if result.returncode == 0:

            compiled = True

        else:

            print(
                "\n========== PDFLATEX STDOUT =========="
            )

            print(
                result.stdout
            )

            print(
                "\n========== PDFLATEX STDERR =========="
            )

            print(
                result.stderr
            )

            print(
                "\n=====================================\n"
            )

            error = (
                result.stderr
                or result.stdout
            )

    except FileNotFoundError:

        error = (
            "pdflatex not installed. "
            "Install TeX Live or MiKTeX."
        )

    except Exception as e:

        error = str(e)

    return {
        "latex_code": latex_code,
        "tex_path": str(
            tex_path
        ),
        "pdf_path": str(
            pdf_path
        ),
        "compiled": compiled,
        "error": error
    }

