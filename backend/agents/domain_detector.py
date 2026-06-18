import logging
from pydantic import BaseModel

from backend.models.state import ParsedResume
'''
from backend.utils.gemini_client import (
    generate_structured_json,
    get_api_key
)'''

from backend.utils.groq_client import (
    generate_structured_json,
    get_api_key
)

logger = logging.getLogger(
    "resumepilot.domain_detector"
)


class DomainResult(BaseModel):
    domain: str


def detect_domain(
    parsed_resume: ParsedResume
) -> str:
    """
    Detect the candidate's primary domain.

    Examples:

    AI/ML & GenAI
    Data Science
    Backend Development
    Frontend Development
    Full Stack Development
    DevOps & Cloud
    Cybersecurity
    Mechanical Engineering
    Civil Engineering
    General Software Engineering
    """

    api_key = get_api_key()

    if not api_key:

        logger.warning(
            "Gemini unavailable. Using heuristic domain detection."
        )

        return heuristic_domain_detection(
            parsed_resume
        )

    system_instruction = """
You are a resume classification system.

Determine the candidate's PRIMARY domain.

Possible domains:

AI/ML & GenAI
Data Science
Backend Development
Frontend Development
Full Stack Development
DevOps & Cloud
Cybersecurity
Mechanical Engineering
Civil Engineering
Electrical Engineering
Research
MBA
Product Management
General Software Engineering

IMPORTANT:

Return ONLY valid JSON in this exact format:

{
  "domain": "AI/ML & GenAI"
}

Do not return plain text.
Do not return markdown.
Do not return explanations.
Always return a JSON object with a single field named "domain".
"""

    prompt = f"""
Determine the candidate's primary domain.

Return JSON only:

{{
  "domain": "<best matching domain>"
}}

Resume:

{parsed_resume.model_dump_json(indent=2)}
"""

    try:

        result = generate_structured_json(
            prompt=prompt,
            response_schema=DomainResult,
            system_instruction=system_instruction
        )

        logger.info(
            f"Detected domain: {result.domain}"
        )

        return result.domain

    except Exception as e:

        logger.error(
            f"Domain detection failed: {e}"
        )

        return heuristic_domain_detection(
            parsed_resume
        )


def heuristic_domain_detection(
    parsed_resume: ParsedResume
) -> str:

    text = " ".join(
        parsed_resume.skills
    ).lower()

    ai_keywords = [
        "tensorflow",
        "pytorch",
        "keras",
        "langchain",
        "llm",
        "rag",
        "chromadb",
        "chroma",
        "embeddings",
        "huggingface",
        "transformers",
        "opencv",
        "genai",
        "machine learning",
        "deep learning",
        "scikit-learn",
        "sklearn",
        "gemini"
    ]

    data_science_keywords = [
        "pandas",
        "numpy",
        "matplotlib",
        "seaborn",
        "xgboost",
        "feature engineering",
        "data analysis",
        "data science"
    ]

    backend_keywords = [
        "fastapi",
        "django",
        "flask",
        "postgresql",
        "mongodb",
        "mysql",
        "rest api",
        "api development"
    ]

    frontend_keywords = [
        "react",
        "angular",
        "vue",
        "javascript",
        "typescript",
        "html",
        "css",
        "tailwind"
    ]

    devops_keywords = [
        "docker",
        "kubernetes",
        "aws",
        "azure",
        "gcp",
        "jenkins",
        "github actions",
        "ci/cd"
    ]

    cyber_keywords = [
        "penetration testing",
        "kali",
        "burp suite",
        "network security",
        "ethical hacking"
    ]

    mechanical_keywords = [
        "solidworks",
        "autocad",
        "ansys",
        "manufacturing",
        "thermodynamics",
        "machine design"
    ]

    civil_keywords = [
        "staad",
        "revit",
        "surveying",
        "construction",
        "structural design"
    ]

    frontend_found = any(
        k in text
        for k in frontend_keywords
    )

    backend_found = any(
        k in text
        for k in backend_keywords
    )

    if any(k in text for k in ai_keywords):
        return "AI/ML & GenAI"

    if any(k in text for k in data_science_keywords):
        return "Data Science"

    if frontend_found and backend_found:
        return "Full Stack Development"

    if any(k in text for k in backend_keywords):
        return "Backend Development"

    if any(k in text for k in frontend_keywords):
        return "Frontend Development"

    if any(k in text for k in devops_keywords):
        return "DevOps & Cloud"

    if any(k in text for k in cyber_keywords):
        return "Cybersecurity"

    if any(k in text for k in mechanical_keywords):
        return "Mechanical Engineering"

    if any(k in text for k in civil_keywords):
        return "Civil Engineering"

    return "General Software Engineering"