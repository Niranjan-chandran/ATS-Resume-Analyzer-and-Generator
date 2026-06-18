import os
import json
import logging
from typing import Type, TypeVar, Optional

from dotenv import load_dotenv
from pathlib import Path
from pydantic import BaseModel

import google.generativeai as genai


# ==========================================
# Load Environment Variables
# ==========================================
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

logger = logging.getLogger("resumepilot.gemini")

api_key = os.getenv("GEMINI_API_KEY")

if api_key:
    genai.configure(api_key=api_key)
    logger.info("Gemini configured successfully.")
else:
    logger.warning("GEMINI_API_KEY not found.")


# ==========================================
# Generic Type
# ==========================================

T = TypeVar("T", bound=BaseModel)


# ==========================================
# Helpers
# ==========================================

def get_api_key() -> Optional[str]:
    return os.getenv("GEMINI_API_KEY")


def get_model_name() -> str:
    return os.getenv(
        "GEMINI_MODEL",
        "gemini-2.5-flash"
    )


# ==========================================
# Structured Output Generator
# ==========================================

def generate_structured_json(
    prompt: str,
    response_schema: Type[T],
    system_instruction: Optional[str] = None
) -> T:
    """
    Sends prompt to Gemini and validates
    output using a Pydantic schema.
    """

    if not get_api_key():
        raise ValueError(
            "Gemini API key not configured."
        )

    model = genai.GenerativeModel(
        model_name=get_model_name(),
        system_instruction=system_instruction
    )

    last_error = None

    for attempt in range(3):

        try:

            response = model.generate_content(
    prompt,
    generation_config={
        "temperature": 0.2,
        "response_mime_type": "application/json"
    }
)

            data = json.loads(
                response.text.strip()
            )

            return response_schema.model_validate(
                data
            )

        except Exception as e:

            logger.warning(
                f"Gemini attempt {attempt + 1} failed: {e}"
            )

            last_error = e

    raise RuntimeError(
        f"Gemini request failed after retries: {last_error}"
    )