import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

from pathlib import Path
import traceback

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    Form,
    HTTPException
)

from fastapi.middleware.cors import (
    CORSMiddleware
)

from fastapi.responses import (
    FileResponse
)

from backend.utils.pdf_reader import (
    read_pdf
)

from backend.graph.workflow import (
    app_workflow
)

app = FastAPI(
    title="ResumePilot AI",
    version="1.0.0"
)

# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# Directories
# ==========================================

UPLOAD_DIR = Path(
    "backend/uploads"
)

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)

GENERATED_DIR = Path(
    "backend/generated"
)

GENERATED_DIR.mkdir(
    parents=True,
    exist_ok=True
)

# ==========================================
# Root
# ==========================================

@app.get("/")
def root():

    return {
        "message":
        "ResumePilot AI Backend Running"
    }

# ==========================================
# Analyze Resume
# ==========================================

@app.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form("")
):

    try:

        file_path = (
            UPLOAD_DIR /
            resume.filename
        )

        with open(
            file_path,
            "wb"
        ) as f:

            f.write(
                await resume.read()
            )

        import unicodedata
        raw_text = unicodedata.normalize("NFKD", read_pdf(str(file_path)))
        job_description = unicodedata.normalize("NFKD", job_description)

        if not raw_text.strip():
            raise HTTPException(
                status_code=400,
                detail="The uploaded PDF does not contain any readable text. It may be a scanned image or empty. Please upload a text-based PDF."
            )

        state = {
            "raw_resume_text":
            raw_text,

            "job_description":
            job_description
        }

        result = app_workflow.invoke(
            state
        )

        return result

    except Exception as e:
        # Check if there is a UnicodeEncodeError in the exception chain
        curr_e = e
        unicode_err = None
        while curr_e is not None:
            if isinstance(curr_e, UnicodeEncodeError):
                unicode_err = curr_e
                break
            curr_e = getattr(curr_e, "__context__", None) or getattr(curr_e, "__cause__", None)

        if unicode_err is not None:
            bad_char_str = "Unknown"
            if hasattr(unicode_err, "object") and unicode_err.object:
                start = getattr(unicode_err, "start", 0)
                if start < len(unicode_err.object):
                    bad_char = unicode_err.object[start]
                    bad_char_str = f"\\u{ord(bad_char):04x}"

            filename = "Unknown"
            line_number = "Unknown"
            tb = unicode_err.__traceback__ or e.__traceback__
            if tb:
                tb_list = traceback.extract_tb(tb)
                if tb_list:
                    last_tb = tb_list[-1]
                    filename = last_tb.filename
                    line_number = last_tb.lineno

            error_detail = (
                f"UnicodeEncodeError: '{unicode_err.encoding}' codec can't encode character '{bad_char_str}' "
                f"at {filename}:{line_number}"
            )
            print("\n========== UNICODE ERROR ==========")
            traceback.print_exc()
            print("===================================\n")
            raise HTTPException(
                status_code=500,
                detail=error_detail
            )

        print(
            "\n========== ERROR =========="
        )

        traceback.print_exc()

        print(
            "===========================\n"
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# ==========================================
# Compile Edited Resume
# ==========================================

from backend.models.state import ParsedResume
from backend.agents.pdf_generator_agent import generate_pdf

@app.post("/compile")
async def compile_edited_resume(resume: ParsedResume):
    try:
        result = generate_pdf(resume)
        if not result.get("success", False):
            raise HTTPException(
                status_code=500,
                detail=f"PDF compilation failed: {', '.join(result.get('errors', []))}"
            )
        return {"message": "PDF and LaTeX compiled successfully"}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# ==========================================
# Download PDF
# ==========================================

@app.get("/download-pdf")
def download_pdf():

    pdf_path = (
        GENERATED_DIR /
        "resume.pdf"
    )

    if not pdf_path.exists():

        raise HTTPException(
            status_code=404,
            detail="PDF not found"
        )

    return FileResponse(
        path=str(pdf_path),
        media_type="application/pdf",
        filename="optimized_resume.pdf"
    )

# ==========================================
# Download TEX
# ==========================================

@app.get("/download-tex")
def download_tex():

    tex_path = (
        GENERATED_DIR /
        "resume.tex"
    )

    if not tex_path.exists():

        raise HTTPException(
            status_code=404,
            detail="LaTeX file not found"
        )

    return FileResponse(
        path=str(tex_path),
        media_type="text/plain",
        filename="resume.tex"
    )

# ==========================================
# Download CLS
# ==========================================

@app.get("/download-cls")
def download_cls():

    cls_path = Path("backend/templates/resume.cls")

    if not cls_path.exists():

        raise HTTPException(
            status_code=404,
            detail="LaTeX template class file (resume.cls) not found"
        )

    return FileResponse(
        path=str(cls_path),
        media_type="text/plain",
        filename="resume.cls"
    )

# ==========================================
# Download ZIP
# ==========================================

@app.get("/download-zip")
def download_zip():
    import zipfile
    import io
    from fastapi.responses import StreamingResponse

    tex_path = GENERATED_DIR / "resume.tex"
    cls_path = Path("backend/templates/resume.cls")

    if not tex_path.exists() or not cls_path.exists():
        raise HTTPException(
            status_code=404,
            detail="LaTeX source files (resume.tex or resume.cls) not found to build package"
        )

    # Compile zip dynamically in memory
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        zip_file.write(str(tex_path), "resume.tex")
        zip_file.write(str(cls_path), "resume.cls")

    zip_buffer.seek(0)
    return StreamingResponse(
        zip_buffer,
        media_type="application/x-zip-compressed",
        headers={
            "Content-Disposition": "attachment; filename=resume_package.zip"
        }
    )


