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

    # Generate JSON schema instructions for the LLM
    try:
        schema_json = json.dumps(response_schema.model_json_schema(), indent=2)
        schema_instruction = (
            f"\n\nYou MUST return a JSON object matching this JSON schema:\n{schema_json}\n\n"
            f"Do not include any explanation or extra fields. Return ONLY the valid JSON object."
        )
    except Exception:
        schema_instruction = ""

    last_error = None

    for attempt in range(3):

        try:

            messages = []

            # Combine system instructions with schema instruction
            combined_system = (system_instruction or "You are a helpful assistant.") + schema_instruction

            messages.append({
                "role": "system",
                "content": combined_system
            })

            messages.append({
                "role": "user",
                "content": prompt
            })

            completion = client.chat.completions.create(
                model=get_model_name(),
                messages=messages,
                temperature=0.2,
                max_tokens=4096
            )

            content = (
                completion
                .choices[0]
                .message
                .content
            )

            # Strip <think>...</think> reasoning blocks if present
            import re
            cleaned_content = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL)
            if "<think>" in cleaned_content:
                cleaned_content = cleaned_content.split("<think>")[0]
            cleaned_content = cleaned_content.strip()

            print("\n========== GROQ RESPONSE (CLEANED) ==========")
            print(cleaned_content)
            print("=============================================\n")

            # ======================================
            # Extract JSON from Groq response
            # ======================================

            content_clean = cleaned_content
            
            # 1. Try to find markdown json code block
            code_block_match = re.search(
                r"```(?:json)?\s*(\{.*?\})\s*```",
                content_clean,
                re.DOTALL | re.IGNORECASE
            )
            if code_block_match:
                json_text = code_block_match.group(1).strip()
            else:
                # 2. Fall back to finding the outermost curly braces
                start = content_clean.find("{")
                end = content_clean.rfind("}")
                if start != -1 and end != -1:
                    json_text = content_clean[start:end + 1]
                else:
                    json_text = content_clean

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

