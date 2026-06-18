import logging
from typing import List, Optional

from pydantic import BaseModel

from backend.models.state import (
    ParsedResume,
    AnalysisReport,
    RoadmapWeek
)

from backend.utils.groq_client import (
    generate_structured_json,
    get_api_key
)

logger = logging.getLogger(
    "resumepilot.roadmap"
)


class RoadmapContainer(BaseModel):
    roadmap: List[RoadmapWeek]


def generate_roadmap(
    parsed_resume: ParsedResume,
    analysis: AnalysisReport,
    detected_domain: Optional[str] = None,
    jd: Optional[str] = None
) -> List[RoadmapWeek]:

    api_key = get_api_key()

    if not api_key:

        logger.warning(
            "Groq unavailable. Using fallback roadmap."
        )

        return get_mock_roadmap(
            detected_domain
        )

    system_instruction = """
You are a career mentor.

Return ONLY valid JSON matching RoadmapContainer exactly.

Required JSON structure:

{
  "roadmap": [
    {
      "week": "Week 1",
      "topic": "Topic Name",
      "tasks": [
        "Task 1",
        "Task 2",
        "Task 3"
      ]
    }
  ]
}

Rules:

- roadmap must be a list.
- Create exactly 4 weeks.
- Each week must contain:
  - week
  - topic
  - tasks
- tasks must be a list of strings.
- Each week should contain 3-5 tasks.

Use:
- Candidate domain
- Resume
- Skill gaps
- Weaknesses
- Job description

Return JSON only.
Do not return markdown.
Do not return explanations.
Do not return extra fields.
"""

    prompt = f"""
Generate a personalized roadmap.

Return JSON matching RoadmapContainer exactly.

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
            response_schema=RoadmapContainer,
            system_instruction=system_instruction
        )

        logger.info(
            "Roadmap generated."
        )

        return result.roadmap

    except Exception as e:

        logger.error(
            f"Roadmap generation failed: {e}"
        )

        return get_mock_roadmap(
            detected_domain
        )


def get_mock_roadmap(
    detected_domain: Optional[str]
) -> List[RoadmapWeek]:

    domain = (
        detected_domain or ""
    ).lower()

    if "ai" in domain:

        return [

            RoadmapWeek(
                week="Week 1",
                topic="Machine Learning Foundations",
                tasks=[
                    "Revise supervised learning.",
                    "Implement classification models.",
                    "Evaluate models using metrics."
                ]
            ),

            RoadmapWeek(
                week="Week 2",
                topic="Deep Learning",
                tasks=[
                    "Build neural networks.",
                    "Train TensorFlow models.",
                    "Experiment with CNNs."
                ]
            ),

            RoadmapWeek(
                week="Week 3",
                topic="GenAI & RAG",
                tasks=[
                    "Learn embeddings.",
                    "Build a RAG pipeline.",
                    "Use vector databases."
                ]
            ),

            RoadmapWeek(
                week="Week 4",
                topic="Deployment",
                tasks=[
                    "Deploy FastAPI app.",
                    "Containerize project.",
                    "Prepare portfolio."
                ]
            )
        ]

    if "mechanical" in domain:

        return [

            RoadmapWeek(
                week="Week 1",
                topic="CAD Design",
                tasks=[
                    "Practice SolidWorks.",
                    "Create 3D assemblies."
                ]
            ),

            RoadmapWeek(
                week="Week 2",
                topic="ANSYS Simulation",
                tasks=[
                    "Perform stress analysis.",
                    "Run thermal simulations."
                ]
            ),

            RoadmapWeek(
                week="Week 3",
                topic="Manufacturing Concepts",
                tasks=[
                    "Study machining processes.",
                    "Understand tolerances."
                ]
            ),

            RoadmapWeek(
                week="Week 4",
                topic="Industry Project",
                tasks=[
                    "Design a mechanical system.",
                    "Document results."
                ]
            )
        ]

    return [

        RoadmapWeek(
            week="Week 1",
            topic="Core Fundamentals",
            tasks=[
                "Review domain basics.",
                "Practice problem solving."
            ]
        ),

        RoadmapWeek(
            week="Week 2",
            topic="Intermediate Skills",
            tasks=[
                "Build a small project.",
                "Strengthen weak areas."
            ]
        ),

        RoadmapWeek(
            week="Week 3",
            topic="Advanced Concepts",
            tasks=[
                "Study industry tools.",
                "Apply concepts practically."
            ]
        ),

        RoadmapWeek(
            week="Week 4",
            topic="Portfolio Building",
            tasks=[
                "Improve resume.",
                "Prepare for interviews."
            ]
        )
    ]

