import logging
from typing import Dict, Any, Literal

from langgraph.graph import StateGraph, END

from backend.models.state import (
    AgentState,
    RecommendationsReport
)

# Agents

from backend.agents.resume_parser import parse_resume
from backend.agents.domain_detector import detect_domain
from backend.agents.confidence_check import check_jd_confidence
from backend.agents.scoring_agent import score_resume
from backend.agents.analysis_agent import analyze_resume
from backend.agents.optimizer_agent import optimize_resume
from backend.agents.score_reeval import reevaluate_score
from backend.agents.interview_agent import generate_interview_questions
from backend.agents.roadmap_agent import generate_roadmap
from backend.agents.course_agent import recommend_courses
from backend.agents.project_agent import recommend_projects
from backend.agents.completeness_agent import check_completeness
from backend.agents.review_agent import prepare_review_data
from backend.agents.pdf_generator_agent import generate_pdf

logger = logging.getLogger(
    "resumepilot.graph.workflow"
)

# ==========================================
# Nodes
# ==========================================

def parse_resume_node(
    state: AgentState
) -> Dict[str, Any]:

    logger.info("Parsing Resume")

    parsed = parse_resume(
        state["raw_resume_text"]
    )

    print("\n========== PARSED RESUME ==========")
    print(parsed)
    print("===================================\n")

    return {
        "parsed_resume": parsed
    }


def domain_node(
    state: AgentState
) -> Dict[str, Any]:

    logger.info("Detecting Domain")

    parsed = state["parsed_resume"]

    domain = detect_domain(parsed)

    return {
        "detected_domain": domain
    }


def confidence_node(
    state: AgentState
) -> Dict[str, Any]:

    jd = state.get(
        "job_description"
    )

    if not jd:

        return {}

    result = check_jd_confidence(
        jd
    )

    return {
        "jd_confidence": result
    }


def scoring_node(
    state: AgentState
) -> Dict[str, Any]:

    parsed = state["parsed_resume"]

    jd = state.get(
        "job_description"
    )

    report = score_resume(
        parsed,
        jd
    )

    return {
        "scoring": report
    }


def analysis_node(
    state: AgentState
) -> Dict[str, Any]:

    parsed = state["parsed_resume"]

    jd = state.get(
        "job_description"
    )

    report = analyze_resume(
        parsed,
        jd
    )

    return {
        "analysis": report
    }


def optimizer_node(
    state: AgentState
) -> Dict[str, Any]:

    parsed = state["parsed_resume"]

    jd = state.get(
        "job_description"
    )

    optimized = optimize_resume(
        parsed,
        jd,
        state.get(
            "detected_domain"
        )
    )

    print(
    "\n========== OPTIMIZER DEBUG =========="
    )

    print(
    "OPTIMIZED SKILLS =",
    optimized.optimized_skills
    )

    print(
    "\n=====================================\n"
    )

    return {
        "optimized_resume": optimized
    }

def reeval_node(
    state: AgentState
) -> Dict[str, Any]:

    scoring = state["scoring"]

    optimized = state[
        "optimized_resume"
    ]

    jd = state.get(
        "job_description"
    )

    report = reevaluate_score(
        scoring,
        optimized,
        jd
    )

    return {
        "score_reeval": report
    }


def interview_node(
    state: AgentState
) -> Dict[str, Any]:

    parsed = state["parsed_resume"]

    jd = state.get(
        "job_description"
    )

    questions = (
    generate_interview_questions(
        parsed,
        jd,
        state.get(
            "detected_domain"
        )
    )
)

    return {
        "interview_questions": questions
    }


def recommendation_node(
    state: AgentState
) -> Dict[str, Any]:

    parsed = state["parsed_resume"]

    analysis = state["analysis"]

    jd = state.get(
        "job_description"
    )

    roadmap = generate_roadmap(
        parsed,
        analysis,
        state.get(
            "detected_domain"
        ),
        jd
    )

    courses = recommend_courses(
        parsed,
        analysis,
        state.get(
            "detected_domain"
        ),
        jd
    )

    projects = recommend_projects(
        parsed,
        analysis,
        state.get(
            "detected_domain"
        ),
        jd
    )

    report = RecommendationsReport(
        roadmap=roadmap,
        courses=courses,
        projects=projects
    )

    return {
        "recommendations": report
    }


def completeness_node(
    state: AgentState
) -> Dict[str, Any]:

    logger.info(
        "Running Completeness Agent"
    )

    parsed = state["parsed_resume"]

    report = check_completeness(
        parsed
    )

    logger.info(
        "Completeness Agent Finished"
    )

    return {
        "completeness": report
    }


def review_node(
    state: AgentState
) -> Dict[str, Any]:

    logger.info(
        "Running Review Agent"
    )

    parsed = state["parsed_resume"]

    review = prepare_review_data(
        parsed
    )

    logger.info(
        "Review Agent Finished"
    )

    return {
        "review_required":
        review["review_required"]
    }

def pdf_node(
    state: AgentState
):

    logger.info(
        "Running PDF Agent"
    )

    optimized = state[
        "optimized_resume"
    ]

    # =========================
    # DEBUG OUTPUT
    # =========================

    print(
        "\n========== PDF DEBUG =========="
    )

    print(
        "\nOPTIMIZED SUMMARY =",
        repr(
            getattr(
                optimized,
                "optimized_summary",
                ""
            )
        )
    )

    print(
        "\nOPTIMIZED SKILLS =",
        getattr(
            optimized,
            "optimized_skills",
            {}
        )
    )

    if optimized.optimized_projects:

        print(
            "\nPROJECT OBJECT =",
            optimized.optimized_projects[0]
        )

    if optimized.optimized_experience:

        print(
            "\nEXPERIENCE OBJECT =",
            optimized.optimized_experience[0]
        )

    print(
        "\n===============================\n"
    )

    result = generate_pdf(
        optimized
    )

    logger.info(
        "PDF Agent Finished"
    )

    return {

        "latex_code":
        result.get(
            "latex_code"
        ),

        "pdf_path":
        result.get(
            "pdf_path"
        ),

        "error":
        None if result.get(
            "success"
        ) else str(
            result.get(
                "errors"
            )
        )
    }


# ==========================================
# Routing
# ==========================================

def route_after_domain(
    state: AgentState
) -> Literal[
    "confidence",
    "scoring"
]:

    jd = state.get(
        "job_description"
    )

    if jd and jd.strip():

        return "confidence"

    return "scoring"


def route_after_interview(
    state: AgentState
) -> Literal[
    "recommendations",
    "completeness"
]:

    score = state[
        "scoring"
    ].score

    if score < 75:

        return "recommendations"

    return "completeness"


# ==========================================
# Workflow
# ==========================================

def get_workflow():

    workflow = StateGraph(
        AgentState
    )

    workflow.add_node(
        "parser",
        parse_resume_node
    )

    workflow.add_node(
        "domain",
        domain_node
    )

    workflow.add_node(
        "confidence",
        confidence_node
    )

    workflow.add_node(
        "scoring",
        scoring_node
    )

    workflow.add_node(
        "analysis",
        analysis_node
    )

    workflow.add_node(
        "optimizer",
        optimizer_node
    )

    workflow.add_node(
        "reeval",
        reeval_node
    )

    workflow.add_node(
        "interview",
        interview_node
    )

    workflow.add_node(
        "recommendations",
        recommendation_node
    )

    workflow.add_node(
        "completeness",
        completeness_node
    )

    workflow.add_node(
        "review",
        review_node
    )

    workflow.add_node(
        "pdf",
        pdf_node
    )

    workflow.set_entry_point(
        "parser"
    )

    workflow.add_edge(
        "parser",
        "domain"
    )

    workflow.add_conditional_edges(
        "domain",
        route_after_domain,
        {
            "confidence":
            "confidence",

            "scoring":
            "scoring"
        }
    )

    workflow.add_edge(
        "confidence",
        "scoring"
    )

    workflow.add_edge(
        "scoring",
        "analysis"
    )

    workflow.add_edge(
        "analysis",
        "optimizer"
    )

    workflow.add_edge(
        "optimizer",
        "reeval"
    )

    workflow.add_edge(
        "reeval",
        "interview"
    )

    workflow.add_conditional_edges(
        "interview",
        route_after_interview,
        {
            "recommendations":
            "recommendations",

            "completeness":
            "completeness"
        }
    )

    workflow.add_edge(
        "recommendations",
        "completeness"
    )

    workflow.add_edge(
        "completeness",
        "review"
    )

    workflow.add_edge(
        "review",
        "pdf"
    )

    workflow.add_edge(
        "pdf",
        END
    )

    return workflow.compile()


app_workflow = get_workflow()