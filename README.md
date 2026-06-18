# ATS Resume Analyzer and Generator

An AI-powered multi-agent resume intelligence platform that analyzes resumes, evaluates ATS compatibility, identifies skill gaps, generates interview questions, recommends learning roadmaps, and creates optimized ATS-friendly resumes in PDF and LaTeX formats.

Built using FastAPI, LangGraph, Groq LLMs, React, and Tailwind CSS.

---

## Features

### Resume Analysis

* Extracts and parses resume content from PDF files
* Detects candidate domain and specialization
* Evaluates ATS readiness and resume quality
* Identifies strengths, weaknesses, and improvement areas

### ATS Optimization

* Generates ATS-friendly resume improvements
* Improves wording, formatting, and keyword alignment
* Provides ATS score breakdown and recommendations

### Skill Gap Analysis

* Identifies missing skills for target roles
* Suggests learning paths to close skill gaps
* Highlights high-impact improvements

### Interview Preparation

* Generates role-specific interview questions
* Covers technical, project-based, and behavioral questions
* Helps candidates prepare for real-world interviews

### Personalized Recommendations

* Learning roadmap generation
* Course recommendations
* Project recommendations
* Career development guidance

### Resume Generation

* Generates ATS-optimized LaTeX resumes
* Produces recruiter-friendly PDF resumes
* Supports interactive review and editing before final generation

### Modern Frontend

* Dark SaaS-inspired UI
* Glassmorphism design
* Interactive editing workflow
* Resume preview and download experience

---

## Tech Stack

### Backend

* FastAPI
* LangGraph
* Groq API
* Python
* Pydantic
* PyPDF

### Frontend

* React
* Vite
* Tailwind CSS
* Axios
* React Router

### AI & LLM

* Agentic AI Architecture
* Multi-Agent Workflow
* Groq LLMs
* Prompt Engineering

---

## Multi-Agent Architecture

The platform uses multiple specialized AI agents:

1. Resume Parser Agent
2. Domain Detection Agent
3. ATS Scoring Agent
4. Analysis Agent
5. Optimization Agent
6. Score Reevaluation Agent
7. Interview Question Agent
8. Roadmap Agent
9. Course Recommendation Agent
10. Project Recommendation Agent
11. Completeness Review Agent
12. PDF Generation Agent

Workflow:

Resume Upload
→ Resume Parsing
→ Domain Detection
→ ATS Scoring
→ Resume Analysis
→ Optimization
→ Score Reevaluation
→ Interview Generation
→ Recommendations
→ Resume Review
→ PDF Generation

---

## Project Structure

```text
backend/
├── agents/
├── graph/
├── models/
├── templates/
├── utils/
└── main.py

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── context/
├── package.json
└── vite.config.js
```

## Installation

### Clone Repository

```bash
git clone https://github.com/Niranjan-chandran/ATS-Resume-Analyzer-and-Generator.git
cd ATS-Resume-Analyzer-and-Generator
```

### Backend Setup

```bash
python -m venv venv

# Windows
venv\Scripts\activate

pip install -r backend/requirements.txt
```

Create a `.env` file:

```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
```

Run backend:

```bash
python -m uvicorn backend.main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

## API Endpoints

### Analyze Resume

```http
POST /analyze
```

Inputs:

* Resume PDF
* Job Description (optional)

Returns:

* Parsed Resume
* ATS Score
* Analysis
* Skill Gaps
* Optimized Resume
* Interview Questions
* Recommendations
* PDF Generation Data

### Download Resume PDF

```http
GET /download-pdf
```

### Download LaTeX Source

```http
GET /download-tex
```

---

## Future Improvements

* Resume version comparison
* Resume-to-job matching analytics
* RAG-based career advisor
* Cover letter generation
* LinkedIn profile optimization
* Deployment on Render + Vercel
* Recruiter feedback simulation

---

## Author

Niranjan Chandran

* GitHub: https://github.com/Niranjan-chandran
* LinkedIn: https://www.linkedin.com/in/niranjan-chandran-b02201336/

---

## License

This project is intended for educational and portfolio purposes.
