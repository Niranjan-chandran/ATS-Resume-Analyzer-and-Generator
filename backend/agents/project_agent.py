import logging
from typing import List, Optional

from pydantic import BaseModel

from backend.models.state import (
    ParsedResume,
    AnalysisReport,
    RecommendedProject
)

from backend.utils.groq_client import (
    generate_structured_json,
    get_api_key
)

logger = logging.getLogger(
    "resumepilot.project"
)


class ProjectContainer(BaseModel):
    projects: List[RecommendedProject]


def recommend_projects(
    parsed_resume: ParsedResume,
    analysis: AnalysisReport,
    detected_domain: Optional[str] = None,
    jd: Optional[str] = None
) -> List[RecommendedProject]:

    api_key = get_api_key()

    if not api_key:

        logger.warning(
            "Groq unavailable. Using fallback projects."
        )

        return get_mock_projects(
            detected_domain
        )

    system_instruction = """
You are a senior software mentor.

Return ONLY valid JSON matching ProjectContainer exactly.

Required JSON structure:

{
  "projects": [
    {
      "name": "Project Name",
      "description": "Project Description",
      "technologies": [
        "Python",
        "FastAPI"
      ],
      "steps": [
        "Step 1",
        "Step 2"
      ]
    }
  ]
}

Rules:

- projects must be a list.
- Recommend 2 to 5 projects.
- Each project must contain:
  - name
  - description
  - technologies
  - steps

- technologies must be a list of strings.
- steps must be a list of strings.

Use:
- Candidate domain
- Resume
- Skill gaps
- Weaknesses
- Job description

Projects should be:
- realistic
- portfolio worthy
- resume worthy
- practical

Return JSON only.
Do not return markdown.
Do not return explanations.
Do not return extra fields.
"""

    prompt = f"""
Recommend projects.

Return JSON matching ProjectContainer exactly.

Detected Domain:

{detected_domain}

Skill Gaps:

{[g.skill for g in analysis.skill_gaps]}

Weaknesses:

{[w.title for w in analysis.weaknesses]}

Resume:

{parsed_resume.model_dump_json(indent=2)}

Job Description:

{jd}
"""

    try:

        result = generate_structured_json(
            prompt=prompt,
            response_schema=ProjectContainer,
            system_instruction=system_instruction
        )

        logger.info(
            "Project recommendations generated."
        )

        return result.projects

    except Exception as e:

        logger.error(
            f"Project generation failed: {e}"
        )

        return get_mock_projects(
            detected_domain
        )


def get_mock_projects(
    detected_domain: Optional[str]
) -> List[RecommendedProject]:

    domain = (
        detected_domain or ""
    ).lower()

    if "ai" in domain:

        return [

            RecommendedProject(
                name="Advanced RAG Chatbot",
                description=(
                    "Build a production-ready RAG chatbot "
                    "using LangChain, ChromaDB, and Gemini."
                ),
                technologies=[
                    "LangChain",
                    "ChromaDB",
                    "FastAPI",
                    "Gemini"
                ],
                steps=[
                    "Create document ingestion pipeline",
                    "Generate embeddings",
                    "Store vectors in ChromaDB",
                    "Build retrieval workflow",
                    "Deploy with FastAPI"
                ]
            ),

            RecommendedProject(
                name="LLM Evaluation Platform",
                description=(
                    "Compare multiple LLM responses "
                    "and evaluate answer quality."
                ),
                technologies=[
                    "Python",
                    "FastAPI",
                    "LLMs"
                ],
                steps=[
                    "Collect prompts",
                    "Call multiple models",
                    "Score responses",
                    "Create dashboard"
                ]
            )
        ]

    if "backend" in domain:

        return [

            RecommendedProject(
                name="Containerized FastAPI Application",
                description=(
                    "Containerize a FastAPI backend "
                    "using Docker and PostgreSQL."
                ),
                technologies=[
                    "Docker",
                    "FastAPI",
                    "PostgreSQL"
                ],
                steps=[
                    "Create Dockerfile",
                    "Add docker-compose",
                    "Connect database",
                    "Test containers"
                ]
            ),

            RecommendedProject(
                name="AWS Deployment Pipeline",
                description=(
                    "Deploy a backend application "
                    "using AWS and GitHub Actions."
                ),
                technologies=[
                    "AWS",
                    "Docker",
                    "GitHub Actions"
                ],
                steps=[
                    "Create EC2 instance",
                    "Build CI/CD pipeline",
                    "Deploy automatically",
                    "Monitor logs"
                ]
            )
        ]

    if "mechanical" in domain:

        return [

            RecommendedProject(
                name="3D Mechanical Assembly",
                description=(
                    "Design and analyze a complete "
                    "mechanical assembly."
                ),
                technologies=[
                    "SolidWorks",
                    "ANSYS"
                ],
                steps=[
                    "Create CAD model",
                    "Run stress analysis",
                    "Optimize design",
                    "Document findings"
                ]
            )
        ]

    return [

        RecommendedProject(
            name="Portfolio Enhancement Project",
            description=(
                "Build a project aligned with your target role."
            ),
            technologies=[
                "Role-specific tools"
            ],
            steps=[
                "Identify missing skills",
                "Build project",
                "Document results",
                "Add to resume"
            ]
        )
    ]

