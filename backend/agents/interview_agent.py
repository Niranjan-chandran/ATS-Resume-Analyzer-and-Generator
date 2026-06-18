import logging
from typing import Optional

from backend.models.state import (
    ParsedResume,
    InterviewQuestions
)

from backend.utils.groq_client import (
    generate_structured_json,
    get_api_key
)

logger = logging.getLogger(
    "resumepilot.interview"
)


def generate_interview_questions(
    parsed_resume: ParsedResume,
    jd: Optional[str] = None,
    detected_domain: Optional[str] = None
) -> InterviewQuestions:
    """
    Generate interview questions
    based on resume + JD.
    """

    api_key = get_api_key()

    if not api_key:

        logger.warning(
            "Groq unavailable. Using fallback interview questions."
        )

        return get_mock_questions()

    system_instruction = """
You are a senior technical interviewer.

Return ONLY valid JSON matching InterviewQuestions exactly.

Required JSON structure:

{
  "technical_questions": [
    "Question 1",
    "Question 2"
  ],

  "project_questions": [
    "Question 1",
    "Question 2"
  ],

  "hr_questions": [
    "Question 1",
    "Question 2"
  ]
}

Rules:

- technical_questions must be a list of strings
- project_questions must be a list of strings
- hr_questions must be a list of strings

- Questions must be tailored to the candidate's resume.
- Technical questions should match the candidate's domain.
- Project questions must come from actual projects.
- HR questions should assess communication, teamwork, ownership, and problem solving.

Return JSON only.
Do not return markdown.
Do not return explanations.
Do not return extra fields.
"""

    prompt = f"""
Generate interview questions.

Return JSON matching InterviewQuestions exactly.

Detected Domain:

{detected_domain}

Resume:

{parsed_resume.model_dump_json(indent=2)}

Job Description:

{jd}
"""

    try:

        result = generate_structured_json(
            prompt=prompt,
            response_schema=InterviewQuestions,
            system_instruction=system_instruction
        )

        logger.info(
            "Interview questions generated."
        )

        return result

    except Exception as e:

        logger.error(
            f"Interview generation failed: {e}"
        )

        return get_mock_questions()


def get_mock_questions() -> InterviewQuestions:

    return InterviewQuestions(

        technical_questions=[

            "Explain asynchronous programming in Python and how FastAPI uses async/await.",

            "What is the difference between SQL and NoSQL databases?",

            "How does a Retrieval-Augmented Generation (RAG) pipeline work?"
        ],

        project_questions=[

            "Why did you choose ChromaDB for vector storage in your chatbot project?",

            "How did you handle document chunking and retrieval in your RAG system?",

            "What bottlenecks did you encounter while building the project?"
        ],

        hr_questions=[

            "Tell me about a challenging technical problem you solved.",

            "Describe a situation where requirements were unclear and how you handled it.",

            "Why are you interested in this role?"
        ]
    )

