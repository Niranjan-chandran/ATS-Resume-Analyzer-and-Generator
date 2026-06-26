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


def normalize_parsed_data(data: dict) -> dict:
    if not isinstance(data, dict):
        return {}

    # Map name, email, phone, location to personal_info
    if "personal_info" not in data or not isinstance(data["personal_info"], dict):
        data["personal_info"] = {}
    p_info = data["personal_info"]

    # Grab root-level contact info or personal/contact sub-dicts
    contact_sources = [data]
    for key in ["personal", "contact", "personal_details", "contact_info"]:
        if key in data and isinstance(data[key], dict):
            contact_sources.append(data[key])
            
    for src in contact_sources:
        for k in ["name", "email", "phone", "location"]:
            if k in src and src[k] and not p_info.get(k):
                p_info[k] = str(src[k]).strip()

    # Map links
    if "links" not in data or not isinstance(data["links"], dict):
        data["links"] = {}
    links = data["links"]

    # Try to extract links from contact sources as well
    for src in contact_sources:
        for k in ["linkedin", "github", "portfolio", "leetcode", "hackerrank", "kaggle"]:
            if k in src and src[k] and not links.get(k):
                links[k] = str(src[k]).strip()
        if "other_urls" in src and isinstance(src["other_urls"], list) and not links.get("other_urls"):
            links["other_urls"] = [str(u) for u in src["other_urls"]]

    # Map education dates
    if "education" in data and isinstance(data["education"], list):
        for edu in data["education"]:
            if isinstance(edu, dict):
                # Major mapping
                if "major" not in edu or not edu["major"]:
                    edu["major"] = edu.get("field", edu.get("field_of_study", ""))
                # Start / end date mapping
                if "duration" in edu and not edu.get("start_date") and not edu.get("end_date"):
                    dur = str(edu["duration"])
                    parts = dur.split("-")
                    if len(parts) == 2:
                        edu["start_date"] = parts[0].strip()
                        edu["end_date"] = parts[1].strip()
                    else:
                        edu["start_date"] = dur.strip()
                elif "dates" in edu and not edu.get("start_date") and not edu.get("end_date"):
                    dates_str = str(edu["dates"])
                    parts = dates_str.split("-")
                    if len(parts) == 2:
                        edu["start_date"] = parts[0].strip()
                        edu["end_date"] = parts[1].strip()
                    else:
                        edu["start_date"] = dates_str.strip()

    # Map experience dates and responsibilities
    if "experience" in data and isinstance(data["experience"], list):
        for exp in data["experience"]:
            if isinstance(exp, dict):
                # Role vs title mapping
                if "role" not in exp or not exp["role"]:
                    exp["role"] = exp.get("title", exp.get("role_title", ""))
                if "duration" in exp and not exp.get("start_date") and not exp.get("end_date"):
                    dur = str(exp["duration"])
                    parts = dur.split("-")
                    if len(parts) == 2:
                        exp["start_date"] = parts[0].strip()
                        exp["end_date"] = parts[1].strip()
                    else:
                        exp["start_date"] = dur.strip()
                elif "dates" in exp and not exp.get("start_date") and not exp.get("end_date"):
                    dates_str = str(exp["dates"])
                    parts = dates_str.split("-")
                    if len(parts) == 2:
                        exp["start_date"] = parts[0].strip()
                        exp["end_date"] = parts[1].strip()
                    else:
                        exp["start_date"] = dates_str.strip()
                
                # responsibilities/bullet_points to description mapping
                resp = exp.get("responsibilities", exp.get("bullet_points", exp.get("description", [])))
                if isinstance(resp, list):
                    exp["description"] = [str(r) for r in resp]
                elif isinstance(resp, str):
                    exp["description"] = [resp]
                else:
                    exp["description"] = []

    # Map projects
    if "projects" in data and isinstance(data["projects"], list):
        for proj in data["projects"]:
            if isinstance(proj, dict):
                # Map link/github
                if "github" in proj and not proj.get("link"):
                    proj["link"] = proj["github"]
                # Map description to list of strings
                desc = proj.get("description", [])
                if isinstance(desc, list):
                    proj["description"] = [str(d) for d in desc]
                elif isinstance(desc, str):
                    proj["description"] = [desc]
                else:
                    proj["description"] = []

    # Map skills dictionary
    if "skills" in data:
        skills_raw = data["skills"]
        skills_dict = {}
        if isinstance(skills_raw, dict):
            for cat, sk_list in skills_raw.items():
                if isinstance(sk_list, list):
                    skills_dict[cat] = [str(s) for s in sk_list]
                elif isinstance(sk_list, str):
                    skills_dict[cat] = [sk_list]
                else:
                    skills_dict[cat] = []
        elif isinstance(skills_raw, list):
            for item in skills_raw:
                if isinstance(item, dict):
                    cat = item.get("category", item.get("name", "Other Skills"))
                    sk_list = item.get("skills", item.get("values", []))
                    if isinstance(sk_list, list):
                        skills_dict[cat] = [str(s) for s in sk_list]
                    elif isinstance(sk_list, str):
                        skills_dict[cat] = [sk_list]
                elif isinstance(item, str):
                    if "Technical Skills" not in skills_dict:
                        skills_dict["Technical Skills"] = []
                    skills_dict["Technical Skills"].append(item)
        data["skills"] = skills_dict

    # Map certifications
    if "certifications" in data and isinstance(data["certifications"], list):
        certs_normalized = []
        for cert in data["certifications"]:
            if isinstance(cert, str):
                certs_normalized.append({"name": cert, "date": ""})
            elif isinstance(cert, dict):
                certs_normalized.append({
                    "name": cert.get("name", ""),
                    "date": cert.get("date", "") or cert.get("year", "") or ""
                })
        data["certifications"] = certs_normalized

    return data


def parse_resume(raw_text: str) -> ParsedResume:
    """
    Extract resume information from raw PDF text.
    """

    logger.info("Resume parsing started.")
    
    # 1. Temporarily add logs for RAW RESUME TEXT
    print("RAW RESUME TEXT")
    print(raw_text)

    api_key = get_api_key()

    if not api_key:
        logger.warning(
            "API key not configured. Using fallback parser."
        )
        return get_mock_parsed_resume()

    system_instruction = """
You are an expert ATS Resume Parser.

Your task:
Extract information from the resume and return it using the provided schema.

=====================================
CRITICAL FORMAT AGNOSTIC RULES
=====================================
You must be completely layout, template, and format-agnostic.
Resumes may use different layouts, structures, templates, or section headers.
You MUST extract the information correctly and map them as follows:

- Treat all of the following as the "summary" field:
  Summary, Professional Summary, Profile, About Me, Career Objective.
  Preserve the original meaning. Do not leave summary empty if such a section exists.

- Treat all of the following as the "experience" field:
  Experience, Work Experience, Professional Experience, Employment History.

- Treat all of the following as the "projects" field:
  Projects, Key Projects, Personal Projects, Academic Projects.

- Treat all of the following as the "skills" field:
  Skills, Technical Skills, Core Competencies, Technologies, Tech Stack.

- Treat all of the following as the "certifications" field:
  Certifications, Certification, Licenses, Professional Certifications.

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

skills MUST be grouped by categories in a dictionary:
"skills": {
  "Languages": ["Python", "C", "SQL"],
  "Machine Learning": ["TensorFlow", "Keras", "Scikit-learn"],
  "Generative AI": ["RAG", "LangChain", "LangGraph"],
  "Backend & APIs": ["FastAPI", "REST APIs"],
  "Cloud": ["AWS"]
}

If no categories are explicitly mentioned or labeled in the resume, intelligently group the extracted skills into categories (e.g. Languages, Frontend, Backend, Machine Learning, Cloud, Databases, Tools, etc.). Do NOT return a flat list.

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
If a GitHub URL exists for a project, extract the FULL URL.
Example:
https://github.com/user/project
Store:
"link": "https://github.com/user/project"
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
If a date range exists anywhere near the company name or role, you MUST populate start_date and end_date.
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
Every certification must be an object.
If certification date is unknown, use "". Never use null.

=====================================
GENERAL RULES
=====================================
education MUST be a list.
projects MUST be a list.
experience MUST be a list.
certifications MUST be a list.
Never use null for string fields. Use "" instead of null.
Always return valid JSON matching ParsedResume exactly.
"""

    # Generate JSON schema instructions for the LLM
    try:
        schema_json = json.dumps(ParsedResume.model_json_schema(), indent=2)
        schema_instruction = (
            f"\n\nYou MUST return a JSON object matching this JSON schema:\n{schema_json}\n\n"
            f"Do not include any explanation or extra fields. Return ONLY the valid JSON object."
        )
    except Exception:
        schema_instruction = ""

    system_instruction = system_instruction + schema_instruction

    prompt = f"""
Parse the following resume and return ONLY JSON.

Resume:

{raw_text}
"""

    # Predefined mapping for classifying skills if flat list is returned
    DEFAULT_SKILL_MAPPING = {
        "Languages": ["python", "javascript", "typescript", "c++", "c#", "java", "ruby", "php", "go", "golang", "rust", "scala", "kotlin", "swift", "sql", "html", "css", "bash", "shell"],
        "Frontend": ["react", "angular", "vue", "next.js", "nextjs", "nuxt", "svelte", "jquery", "tailwind", "bootstrap", "sass", "webpack", "vite", "html5", "css3"],
        "Backend & APIs": ["django", "fastapi", "flask", "express", "node.js", "nodejs", "spring boot", "laravel", "rails", "graphql", "rest apis", "rest api", "grpc"],
        "Databases": ["postgresql", "postgres", "mysql", "mongodb", "sqlite", "redis", "oracle", "mariadb", "cassandra", "dynamodb", "firebase"],
        "Cloud & DevOps": ["aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "terraform", "ansible", "ci/cd", "github actions", "linux", "nginx", "heroku"],
        "Machine Learning & AI": ["tensorflow", "pytorch", "keras", "scikit-learn", "sklearn", "numpy", "pandas", "opencv", "nltk", "spacy", "huggingface", "llm", "rag", "langchain", "langgraph", "embeddings", "vector database", "llama", "gemini", "openai"],
        "Tools & Methodologies": ["git", "github", "gitlab", "jira", "confluence", "trello", "agile", "scrum", "postman", "figma"]
    }

    def classify_skills(flat_skills) -> dict:
        categorized = {}
        remaining_skills = []
        for skill in flat_skills:
            skill_lower = skill.lower().strip()
            matched = False
            for category, keywords in DEFAULT_SKILL_MAPPING.items():
                if any(kw == skill_lower or (len(kw) > 3 and kw in skill_lower) for kw in keywords):
                    if category not in categorized:
                        categorized[category] = []
                    if skill not in categorized[category]:
                        categorized[category].append(skill)
                    matched = True
                    break
            if not matched:
                remaining_skills.append(skill)
        if remaining_skills:
            categorized["Other Skills"] = remaining_skills
        return categorized

    def validate_extraction(raw_text: str, parsed: ParsedResume) -> bool:
        import re
        raw_lower = raw_text.lower()
        
        # Check email
        has_email_in_raw = bool(re.search(r"[\w\.-]+@[\w\.-]+\.\w+", raw_text))
        if has_email_in_raw and not parsed.personal_info.email.strip():
            logger.warning("Email found in raw text but missing in parsed output.")
            return False
            
        # Check education
        edu_keywords = ["education", "university", "college", "degree", "bachelor", "master", "phd", "b.s", "m.s", "b.tech", "m.tech"]
        has_edu_in_raw = any(kw in raw_lower for kw in edu_keywords)
        if has_edu_in_raw and not parsed.education:
            logger.warning("Education found in raw text but missing in parsed output.")
            return False
            
        # Check experience
        exp_keywords = ["experience", "work", "employment", "history", "job", "intern", "position"]
        has_exp_in_raw = any(kw in raw_lower for kw in exp_keywords)
        if has_exp_in_raw and not parsed.experience:
            logger.warning("Experience found in raw text but missing in parsed output.")
            return False
            
        # Check projects
        proj_keywords = ["project", "projects"]
        has_proj_in_raw = any(kw in raw_lower for kw in proj_keywords)
        if has_proj_in_raw and not parsed.projects:
            logger.warning("Projects found in raw text but missing in parsed output.")
            return False
            
        # Check skills
        skills_keywords = ["skills", "technical skills", "technologies", "languages", "tools", "competencies"]
        has_skills_in_raw = any(kw in raw_lower for kw in skills_keywords)
        if has_skills_in_raw and not parsed.skills:
            logger.warning("Skills found in raw text but missing in parsed output.")
            return False
            
        # Check name
        if len(raw_text.strip()) > 50 and not parsed.personal_info.name.strip():
            logger.warning("Name is missing in parsed output.")
            return False
            
        return True

    from groq import Groq
    from backend.utils.groq_client import get_model_name
    import re
    import json

    client = Groq(api_key=api_key)
    best_parsed_data = None
    best_parsed_object = None
    best_score = -1

    for attempt in range(3):
        try:
            messages = [
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": prompt}
            ]
            completion = client.chat.completions.create(
                model=get_model_name(),
                messages=messages,
                temperature=0.2,
                max_tokens=4096
            )
            response = completion.choices[0].message.content
            
            # Strip <think> reasoning blocks if present
            cleaned_response = re.sub(r"<think>.*?</think>", "", response, flags=re.DOTALL)
            if "<think>" in cleaned_response:
                cleaned_response = cleaned_response.split("<think>")[0]
            cleaned_response = cleaned_response.strip()

            # 2. Temporarily add logs for RAW LLM RESPONSE
            print("RAW LLM RESPONSE (CLEANED)")
            print(cleaned_response)
            
            # Extract JSON block
            content_clean = cleaned_response
            code_block_match = re.search(
                r"```(?:json)?\s*(\{.*?\})\s*```",
                content_clean,
                re.DOTALL | re.IGNORECASE
            )
            if code_block_match:
                json_text = code_block_match.group(1).strip()
            else:
                start = content_clean.find("{")
                end = content_clean.rfind("}")
                if start != -1 and end != -1:
                    json_text = content_clean[start:end + 1]
                else:
                    json_text = content_clean
            
            parsed_data = json.loads(json_text)
            
            # 3. Temporarily add logs for PARSED JSON
            print("PARSED JSON")
            print(parsed_data)
            
            # Normalize JSON structure to match Pydantic expectations
            parsed_data = normalize_parsed_data(parsed_data)
            
            # Ensure skills are categorized if flat list is returned
            if "skills" in parsed_data:
                if isinstance(parsed_data["skills"], list):
                    parsed_data["skills"] = classify_skills(parsed_data["skills"])
                elif not isinstance(parsed_data["skills"], dict):
                    parsed_data["skills"] = {}
            else:
                parsed_data["skills"] = {}
                
            parsed_obj = ParsedResume.model_validate(parsed_data)
            
            # Score this candidate to find best fallback
            score = 0
            if parsed_obj.personal_info.name.strip(): score += 1
            if parsed_obj.personal_info.email.strip(): score += 1
            if parsed_obj.education: score += len(parsed_obj.education)
            if parsed_obj.skills: score += sum(len(v) for v in parsed_obj.skills.values() if isinstance(v, list))
            if parsed_obj.experience: score += len(parsed_obj.experience)
            if parsed_obj.projects: score += len(parsed_obj.projects)
            if parsed_obj.certifications: score += len(parsed_obj.certifications)
            
            if score > best_score:
                best_score = score
                best_parsed_data = parsed_data
                best_parsed_object = parsed_obj
                
            if validate_extraction(raw_text, parsed_obj):
                logger.info(f"Resume parsing validation passed on attempt {attempt + 1}.")
                return parsed_obj
            else:
                logger.warning(f"Resume parsing validation failed on attempt {attempt + 1}.")
                
        except Exception as e:
            logger.error(f"Error parsing resume on attempt {attempt + 1}: {e}")

    # Fallback to best available parser output if validation didn't pass completely
    if best_parsed_object:
        logger.warning("Could not fully validate parsed resume with raw text. Returning best attempt.")
        print("PARSED JSON (FALLBACK)")
        print(best_parsed_data)
        return best_parsed_object

    return get_mock_parsed_resume()


def get_mock_parsed_resume() -> ParsedResume:
    """
    Fallback parser output when Gemini/Groq
    is unavailable.
    """
    return ParsedResume()