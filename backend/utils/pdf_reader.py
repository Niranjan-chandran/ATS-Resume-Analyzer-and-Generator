import os
from pypdf import PdfReader


def read_pdf(file_path: str) -> str:
    """
    Extracts text from a PDF file.

    Args:
        file_path (str): Path to PDF.

    Returns:
        str: Extracted text.
    """

    if not os.path.exists(file_path):
        raise FileNotFoundError(
            f"PDF file not found: {file_path}"
        )

    extracted_text = []

    try:
        reader = PdfReader(file_path)

        for page in reader.pages:
            page_text = page.extract_text()

            if page_text:
                extracted_text.append(page_text)

        return "\n".join(extracted_text).strip()

    except Exception as e:
        raise ValueError(
            f"Failed to read PDF: {str(e)}"
        )