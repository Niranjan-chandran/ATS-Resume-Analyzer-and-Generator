import logging

from backend.models.state import (
    ParsedResume
)
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
    "resumepilot.resume_parser"
)


def parse_resume(raw_text: str) -> ParsedResume:
    """
    Extract resume information from raw PDF text.
    """

    logger.info("Resume parsing started.")

    api_key = get_api_key()

    if not api_key:
        logger.warning(
            "Gemini API key not configured. Using fallback parser."
        )
        return get_mock_parsed_resume()

    system_instruction = """
You are an expert ATS Resume Parser.

Your task:

Extract information from the resume and return it
using the provided schema.

CRITICAL RULES:

- Never invent skills.
- Never invent projects.
- Never invent certifications.
- Never invent experience.
- Never invent education.
- Only extract information present in the resume.

Unknown sections should be placed inside:
extra_sections

Supported extra sections:

- Awards
- Publications
- Languages
- Volunteer Work
- Research Papers
- Patents
- Hackathons
- Any custom section

=====================================
CRITICAL JSON FORMAT RULES
=====================================

personal_info must be:

{
  "name": "",
  "email": "",
  "phone": "",
  "location": ""
}

links must be:

{
  "linkedin": "",
  "github": "",
  "portfolio": "",
  "leetcode": "",
  "hackerrank": "",
  "kaggle": "",
  "other_urls": []
}

skills MUST be a flat list:

"skills": [
  "Python",
  "SQL",
  "TensorFlow",
  "FastAPI"
]

DO NOT return:

"skills": {
  "languages": ["Python"]
}

Project descriptions MUST be a list:

"description": [
  "Built RAG chatbot using Gemini",
  "Used ChromaDB vector database",
  "Implemented retrieval pipeline"
]

DO NOT return:

"description": "Built RAG chatbot"

Experience descriptions MUST be a list:

"description": [
  "Built ML models",
  "Performed preprocessing",
  "Evaluated models"
]

DO NOT return:

"description": "Built ML models"

=====================================
SUMMARY FORMAT
=====================================

If the resume contains a Summary, Profile,
Professional Summary, Career Objective,
or About Me section:

Store it in:

"summary": "..."

Preserve the original meaning.

Do not leave summary empty if such a section exists.


=====================================
PROJECT FORMAT
=====================================

projects MUST be:

[
  {
    "title": "Project Name",
    "technologies": [
      "Technology 1",
      "Technology 2"
    ],
    "description": [
      "Achievement 1",
      "Achievement 2"
    ],
    "link": ""
  }
]

Every project MUST have a title.

Extract the project name exactly as written.

Never leave title empty if a project exists.


=====================================
PROJECT LINK RULES
=====================================

If a GitHub URL exists, extract the FULL URL.

Example:

https://github.com/user/project

Store:

"link": "https://github.com/user/project"

Never store:

"GitHub"
"Github Repo"
"GitHub Link"

The link field must contain the actual URL.

=====================================
EXPERIENCE FORMAT
=====================================

experience MUST be:

[
  {
    "company": "Company Name",
    "role": "Job Title",
    "location": "",
    "start_date": "Jan 2023",
    "end_date": "Dec 2023",
    "description": [
      "Responsibility 1",
      "Responsibility 2"
    ]
  }
]

Extract:

- company
- role
- start_date
- end_date

If present in the resume.

Never leave role empty if a job title exists.

Never leave start_date or end_date empty if dates exist.


=====================================
DATE EXTRACTION RULES
=====================================


Experience dates may appear:

Job Title | Jan 2023 - Dec 2023

Extract:

start_date = "Jan 2023"
end_date = "Dec 2023"

If a date range exists anywhere near the company name or role,
you MUST populate start_date and end_date.

Never leave them empty when dates are present.


=====================================
ROLE vs COMPANY RULES
=====================================

For every experience entry:

- role = job title or designation
- company = employer or organization name

Examples:

Software Engineer
Google

Extract:

role = "Software Engineer"
company = "Google"

Data Analyst Intern
Microsoft

Extract:

role = "Data Analyst Intern"
company = "Microsoft"

Do not swap role and company.

Experience dates may appear:

Job Title | Jan 2023 - Dec 2023

Extract:

start_date = "Jan 2023"
end_date = "Dec 2023"

If a date range exists anywhere near the company name or role,
you MUST populate start_date and end_date.

Never leave them empty when dates are present.


=====================================
CERTIFICATIONS FORMAT
=====================================

certifications MUST be:

[
  {
    "name": "Advanced Learning Algorithms",
    "date": ""
  }
]

DO NOT return:

[
  "Advanced Learning Algorithms"
]

Every certification must be an object.

If certification date is unknown:
use ""

Never use null.

=====================================
GENERAL RULES
=====================================

education MUST be a list.

projects MUST be a list.

experience MUST be a list.

certifications MUST be a list.

Never use null for string fields.

Use "" instead of null.

Always return valid JSON matching ParsedResume exactly.
"""

    prompt = f"""
Parse the following resume and return ONLY JSON.

Resume:

{raw_text}
"""

    try:

        parsed_resume = generate_structured_json(
            prompt=prompt,
            response_schema=ParsedResume,
            system_instruction=system_instruction
        )

        print(
            "\n========== PARSER DEBUG =========="
        )

        print(
            "SUMMARY =",
            repr(
                parsed_resume.summary
            )
        )

        print(
             "\n==================================\n"
        )

        

        logger.info(
            "Resume parsing completed successfully."
        )

        return parsed_resume

    except Exception as e:

        logger.error(
            f"Resume parser failed: {str(e)}"
        )

        return get_mock_parsed_resume()


def get_mock_parsed_resume() -> ParsedResume:
    """
    Fallback parser output when Gemini
    is unavailable.
    """

    return ParsedResume()