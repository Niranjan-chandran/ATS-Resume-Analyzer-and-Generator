import os
import json
import logging
from typing import Type, TypeVar, Optional

from dotenv import load_dotenv
from pathlib import Path
from pydantic import BaseModel
from groq import Groq

# ==========================================
# Load Environment Variables
# ==========================================

env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

logger = logging.getLogger("resumepilot.groq")

api_key = os.getenv("GROQ_API_KEY")

if api_key:
    logger.info("Groq configured successfully.")
else:
    logger.warning("GROQ_API_KEY not found.")

# ==========================================
# Generic Type
# ==========================================

T = TypeVar("T", bound=BaseModel)

# ==========================================
# Helpers
# ==========================================

def get_api_key() -> Optional[str]:
    return os.getenv("GROQ_API_KEY")


def get_model_name() -> str:
    return os.getenv(
        "GROQ_MODEL",
        "llama-3.3-70b-versatile"
    )

# ==========================================
# Structured Output Generator
# ==========================================

def generate_structured_json(
    prompt: str,
    response_schema: Type[T],
    system_instruction: Optional[str] = None
) -> T:

    if not get_api_key():
        raise ValueError(
            "Groq API key not configured."
        )

    client = Groq(
        api_key=get_api_key()
    )

    last_error = None

    for attempt in range(3):

        try:

            messages = []

            if system_instruction:
                messages.append({
                    "role": "system",
                    "content": system_instruction
                })

            messages.append({
                "role": "user",
                "content": prompt
            })

            completion = client.chat.completions.create(
                model=get_model_name(),
                messages=messages,
                temperature=0.2
            )

            content = (
                completion
                .choices[0]
                .message
                .content
            )

            print("\n========== GROQ RESPONSE ==========")
            print(content)
            print("===================================\n")

            # ======================================
            # Extract JSON from Groq response
            # ======================================

            start = content.find("{")
            end = content.rfind("}")

            if start == -1 or end == -1:
                raise ValueError(
                    "No JSON found in Groq response."
                )

            json_text = content[start:end + 1]

            data = json.loads(
                json_text
            )

            return response_schema.model_validate(
                data
            )

        except Exception as e:

            logger.warning(
                f"Groq attempt {attempt + 1} failed: {e}"
            )

            last_error = e

    raise RuntimeError(
        f"Groq request failed after retries: {last_error}"
    )

