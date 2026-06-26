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
    try:
        logger.info("Parsing Resume")

        print("\n=============================================")
        print("STAGE 1 & 2 & 3: EXTRACTED / NORMALIZED TEXT")
        print(f"Text length: {len(state['raw_resume_text'])} characters")
        print(f"Sample text (first 500 chars):\n{state['raw_resume_text'][:500]}")
        print("=============================================\n")

        print("\n=============================================")
        print("STAGE 4: TEXT SENT TO THE LLM")
        print(f"Length of text sent to LLM: {len(state['raw_resume_text'])} chars")
        print("=============================================\n")

        parsed = parse_resume(
            state["raw_resume_text"]
        )

        print("\n========== STAGE 7: PARSED RESUME OBJECT ==========")
        print(parsed)
        print("===================================================\n")

        # Validate that resume parsing did not fail completely
        is_empty = (
            not parsed.personal_info.name.strip() and
            not parsed.personal_info.email.strip() and
            not parsed.education and
            not parsed.experience and
            not parsed.skills
        )

        if is_empty:
            raise ValueError(
                "Resume parsing failed completely. The document could not be read or does not contain standard sections like Name, Email, Education, or Experience."
            )

        updated_state = {
            "parsed_resume": parsed
        }

        print("\n=============================================")
        print("STAGE 8: LANGGRAPH STATE AFTER RESUME PARSER")
        print(f"Parsed keys in state update: {list(updated_state.keys())}")
        print(f"Parsed resume name: {parsed.personal_info.name}")
        print("=============================================\n")

        return updated_state
    except Exception as e:
        logger.error(f"Error in parse_resume_node: {e}")
        import traceback
        traceback.print_exc()
        raise


def domain_node(
    state: AgentState
) -> Dict[str, Any]:
    try:
        logger.info("Detecting Domain")

        parsed = state["parsed_resume"]

        domain = detect_domain(parsed)

        return {
            "detected_domain": domain
        }
    except Exception as e:
        logger.error(f"Error in domain_node: {e}")
        import traceback
        traceback.print_exc()
        raise


def confidence_node(
    state: AgentState
) -> Dict[str, Any]:
    try:
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
    except Exception as e:
        logger.error(f"Error in confidence_node: {e}")
        import traceback
        traceback.print_exc()
        raise


def scoring_node(
    state: AgentState
) -> Dict[str, Any]:
    try:
        print("\n=============================================")
        print("STAGE 9: LANGGRAPH STATE BEFORE ATS SCORING")
        print(f"Job Description length: {len(state.get('job_description', ''))}")
        print(f"Parsed Resume available: {state.get('parsed_resume') is not None}")
        print("=============================================\n")

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
    except Exception as e:
        logger.error(f"Error in scoring_node: {e}")
        import traceback
        traceback.print_exc()
        raise


def analysis_node(
    state: AgentState
) -> Dict[str, Any]:
    try:
        print("\n=============================================")
        print("STAGE 10: DATA RECEIVED BY ANALYSIS AGENT")
        print(f"Parsed Resume: {state.get('parsed_resume') is not None}")
        print(f"Job Description: {state.get('job_description', '')[:100]}...")
        print("=============================================\n")

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
    except Exception as e:
        logger.error(f"Error in analysis_node: {e}")
        import traceback
        traceback.print_exc()
        raise


def optimizer_node(
    state: AgentState
) -> Dict[str, Any]:
    try:
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
    except Exception as e:
        logger.error(f"Error in optimizer_node: {e}")
        import traceback
        traceback.print_exc()
        raise

def reeval_node(
    state: AgentState
) -> Dict[str, Any]:
    try:
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
    except Exception as e:
        logger.error(f"Error in reeval_node: {e}")
        import traceback
        traceback.print_exc()
        raise


def interview_node(
    state: AgentState
) -> Dict[str, Any]:
    try:
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
    except Exception as e:
        logger.error(f"Error in interview_node: {e}")
        import traceback
        traceback.print_exc()
        raise


def recommendation_node(
    state: AgentState
) -> Dict[str, Any]:
    try:
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
    except Exception as e:
        logger.error(f"Error in recommendation_node: {e}")
        import traceback
        traceback.print_exc()
        raise


def completeness_node(
    state: AgentState
) -> Dict[str, Any]:
    try:
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
    except Exception as e:
        logger.error(f"Error in completeness_node: {e}")
        import traceback
        traceback.print_exc()
        raise


def review_node(
    state: AgentState
) -> Dict[str, Any]:
    try:
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
    except Exception as e:
        logger.error(f"Error in review_node: {e}")
        import traceback
        traceback.print_exc()
        raise

def pdf_node(
    state: AgentState
):
    try:
        logger.info(
            "Running PDF Agent"
        )

        print("\n=============================================")
        print("STAGE 11: DATA RECEIVED BY PDF GENERATOR")
        print(f"Optimized Resume: {state.get('optimized_resume') is not None}")
        print("=============================================\n")

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
    except Exception as e:
        logger.error(f"Error in pdf_node: {e}")
        import traceback
        traceback.print_exc()
        raise


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