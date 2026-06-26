import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")
import os
import traceback

ROOT_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

sys.path.insert(0, ROOT_DIR)

try:

    from backend.models.state import AgentState

    print("[OK] state imported")

    from backend.graph.workflow import app_workflow

    print("[OK] workflow imported")

    print(
        "\nSUCCESS: All imports loaded correctly."
    )

except Exception:

    print(
        "\nERROR: Import failure detected."
    )

    traceback.print_exc()