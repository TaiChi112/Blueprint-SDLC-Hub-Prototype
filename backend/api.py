from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ConfigDict
from google import genai
import json
import os
import hashlib
from pathlib import Path
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone
from db import DualRepository  # นำคลาสเดิมที่คุณเขียนไว้มาใช้ได้เลย!
from llm_to_excalidraw import (
    process_description_to_excalidraw,
    parse_process_steps,
    validate_excalidraw_json
)
from config import RATE_LIMITS, DIAGRAM_STORAGE, MCP_CONFIG, get_rate_limit_for_user, get_backup_path

# 1. Setup Environment & App
load_dotenv()
api_key = os.environ.get("GEMINI_API_KEY")

app = FastAPI(title="Auto-Spec API")

# อนุญาตให้ Next.js (พอร์ต 3000 หรืออื่นๆ) ยิง API เข้ามาได้ (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ใน Production ควรเปลี่ยนเป็น URL ของ Next.js
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

repo = DualRepository()


# Helper Functions for Phase 4

def _is_quota_error(exc: Exception) -> bool:
    """Detect Gemini/OpenAI quota-limit style errors from exception text."""
    msg = str(exc).lower()
    keywords = [
        "quota",
        "resource_exhausted",
        "429",
        "rate limit",
        "too many requests",
        "exceeded",
    ]
    return any(keyword in msg for keyword in keywords)


def _build_mock_spec(prompt: str) -> dict:
    """Fallback mock spec when external LLM quota is exhausted."""
    short_prompt = (prompt or "Untitled project").strip()
    if not short_prompt:
        short_prompt = "Untitled project"

    return {
        "project_name": f"Mock Spec - {short_prompt[:40]}",
        "problem_statement": "LLM quota limit reached. Returning deterministic mock requirement output so workflow can continue.",
        "solution_overview": "Use this mock spec as temporary output. Replace with generated content when quota is available.",
        "functional_requirements": [
            "Create initial project structure",
            "Allow user input and validation",
            "Persist core records",
            "Show status and error feedback",
        ],
        "non_functional_requirements": [
            "Response time under 2s for core operations",
            "Basic authentication and access control",
            "Structured logging for debugging",
        ],
        "tech_stack_recommendation": ["Next.js", "FastAPI", "PostgreSQL"],
        "status": "Mock",
        "processDescription": "Process Flow:\n→ Step 1: User submits request\n→ Step 2: System validates input\n→ Step 3: System persists data\n→ Step 4: System returns response",
    }


def _build_mock_mermaid(project_name: str) -> str:
    """Fallback mermaid diagram when external LLM quota is exhausted."""
    title = (project_name or "Process Flow").replace('"', "")[:40]
    return f"""flowchart TD
    A[Start: {title}] --> B[Validate Input]
    B --> C[Process Request]
    C --> D[Save Result]
    D --> E[Return Response]
"""


def _build_mock_excalidraw(spec_id: str) -> dict:
    """Fallback Excalidraw diagram when diagram generation hits quota."""
    safe_spec = (spec_id or "spec").strip()[:40]
    process_description = (
        "Process Flow:\n"
        f"→ Step 1: Open {safe_spec}\n"
        "→ Step 2: Validate input\n"
        "→ Step 3: Generate fallback visualization\n"
        "→ Step 4: Return response"
    )
    return process_description_to_excalidraw(process_description)


def compute_spec_hash(spec_data: dict) -> str:
    """Compute SHA-256 hash of spec content for change detection."""
    content = json.dumps({
        "problem_statement": spec_data.get("problemStatement", ""),
        "functional_requirements": spec_data.get("functionalRequirements", []),
        "non_functional_requirements": spec_data.get("nonFunctionalRequirements", []),
        "tech_stack": spec_data.get("techStackRecommendation", [])
    }, sort_keys=True)
    return hashlib.sha256(content.encode()).hexdigest()


def check_rate_limit(user_id: str) -> tuple[bool, int]:
    """
    Check if user has exceeded daily rate limit.
    Returns (allowed, remaining_count)

    Note: This is a simplified implementation.
    In production, use Redis or database queries.
    """
    # TODO: Query DiagramGenerationLog table for today's count
    # For now, return mock values
    max_limit = get_rate_limit_for_user(user_id, is_premium=False)

    # Mock: Always allow for development
    return (True, max_limit - 0)


def save_diagram_backup(user_id: str, spec_id: str, diagram_data: dict, version: int):
    """Save diagram to file backup (in addition to database)."""
    if not DIAGRAM_STORAGE["file_backup_enabled"]:
        return

    backup_path = get_backup_path(user_id, spec_id, version)
    file_path = Path(backup_path)

    # Create directory if not exists
    file_path.parent.mkdir(parents=True, exist_ok=True)

    # Write JSON file
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(diagram_data, f, indent=2)

    print(f"✅ Diagram backup saved: {backup_path}")


def generate_process_diagram(spec_data: dict, mcp_type: str = "excalidraw") -> dict:
    """
    Generate Process Flow diagram using specified MCP.

    Phase 4: Excalidraw only (overview, no details)
    Phase 5+: Draw.io (architecture), Figma (wireframes)

    Args:
        spec_data: Specification data
        mcp_type: 'excalidraw' | 'drawio' | 'figma'

    Returns:
        { "diagram": { excalidraw/drawio/figma JSON } }
    """
    if mcp_type == "excalidraw":
        # Excalidraw: Process Flow Overview (MVP level, คร่าวๆ)
        process_description = spec_data.get("processDescription", "")
        if not process_description:
            # Generate from functional requirements (top 5)
            reqs = spec_data.get("functionalRequirements", [])[:5]
            process_description = "Process Flow:\n" + "\n".join([
                f"→ Step {i+1}: {req}" for i, req in enumerate(reqs)
            ])

        diagram_json = process_description_to_excalidraw(process_description, theme="light")
        return {"diagram": diagram_json, "type": "process_flow", "mcp": "excalidraw"}

    elif mcp_type == "drawio":
        # Future: Draw.io MCP for Architecture Diagrams
        raise HTTPException(
            status_code=501,
            detail={"status": "error", "code": "NOT_IMPLEMENTED", "message": "Draw.io MCP coming in Phase 5"}
        )

    elif mcp_type == "figma":
        # Future: Figma MCP for Wireframe Prototypes
        raise HTTPException(
            status_code=501,
            detail={"status": "error", "code": "NOT_IMPLEMENTED", "message": "Figma MCP coming in Phase 5"}
        )

    else:
        raise ValueError(f"Unknown MCP type: {mcp_type}")


# 2. Schema สำหรับรับข้อมูลจาก Next.js
class PromptRequest(BaseModel):
    prompt: str
    userId: str | None = None  # User ID from NextAuth


class SaveSpecRequest(BaseModel):
    data: dict
    userId: str | None = None  # User ID from session
    authorId: str | None = None  # Fallback
    isPublished: bool = True


class GenerateVizRequest(BaseModel):
    """Request body for /api/generate-viz"""
    processDescription: str = Field(
        ...,
        min_length=10,
        description="Process flow description text from LLM"
    )
    specId: str | None = Field(
        None,
        description="Optional spec ID for tracking"
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "processDescription": "Process Flow:\n→ Step 1: User submits form (Input: form data)\n→ Step 2: Validate input (Duration: <1s)\n→ Step 3: LLM generates spec (Duration: 5-10s)",
                "specId": "spec_123"
            }
        }
    )


class GenerateVizResponse(BaseModel):
    """Successful response from /api/generate-viz"""
    status: str = "success"
    excalidrawJson: dict
    processDescription: str
    elementCount: int
    timestamp: str
    specId: str | None = None


class GenerateDiagramRequest(BaseModel):
    """Request body for /api/generate-diagram"""
    processDescription: str = Field(
        ...,
        min_length=10,
        description="Process flow description text from LLM"
    )
    projectName: str = Field(
        default="Process Flow",
        description="Project/diagram title"
    )
    userId: str | None = Field(
        None,
        description="User ID from NextAuth"
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "processDescription": "Process Flow:\n→ Step 1: User submits form\n→ Step 2: Validate input\n→ Step 3: LLM generates spec",
                "projectName": "Auto-Spec Flow"
            }
        }
    )


class GenerateDiagramResponse(BaseModel):
    """Successful response from /api/generate-diagram"""
    status: str = "success"
    mermaidCode: str
    projectName: str
    timestamp: str


class ErrorResponse(BaseModel):
    """Error response from /api/generate-viz"""
    status: str = "error"
    code: str
    message: str
    detail: str | None = None


class VisualizeSpecRequest(BaseModel):
    """Request body for /api/visualize-spec"""
    specId: str = Field(..., description="ProjectSpec ID")
    userId: str = Field(..., description="User ID from NextAuth")
    forceRegenerate: bool = Field(default=False, description="Ignore cache and regenerate")
    diagramTypes: list[str] = Field(default=["excalidraw"], description="MCP types: 'excalidraw' | 'drawio' | 'figma'")


class VisualizeSpecResponse(BaseModel):
    """Successful response from /api/visualize-spec"""
    status: str = "success"
    diagram: dict  # Excalidraw/Draw.io/Figma JSON
    diagramType: str  # 'process_flow' | 'architecture' | 'wireframe'
    mcp: str  # 'excalidraw' | 'drawio' | 'figma'
    specHash: str
    generatedAt: str
    rateLimitRemaining: int
    version: int


# 3. API Endpoints


@app.get("/api/health")
def health_check():
    """เช็คว่า API และ DB ปกติไหม"""
    if repo.postgres_available:
        return {"status": "connected", "db": "PostgreSQL"}
    return {"status": "warning", "db": "JSON Only (Postgres down)"}


@app.get("/api/specs")
def get_all_specs(userId: str | None = None):
    """ดึงข้อมูล History ทั้งหมด หรือเฉพาะของ user นั้น"""
    specs = repo.list_all_specs(userId)
    # แปลงข้อมูลให้อยู่ในรูปแบบที่ Next.js คาดหวัง
    formatted_specs = []
    for spec in specs:
        full_data = repo.load_spec(spec["filename"])
        if full_data:
            formatted_specs.append(
                {
                    "id": spec["filename"],
                    "filename": spec["filename"],
                    "project_name": spec["project_name"],
                    "created_at": spec["created_at"],
                    "status": spec["status"],
                    "content": full_data,
                }
            )
    return formatted_specs


@app.post("/api/generate")
def generate_new_spec(req: PromptRequest):
    """
    รับ Prompt -> คุยกับ Gemini -> เซฟลง DB -> ส่ง JSON กลับ
    หากมี userId จะบันทึกไปยัง project_specs พร้อม userId
    """
    client = genai.Client(api_key=api_key)
    system_prompt = """
    You are an expert Senior System Analyst.
    Your task is to analyze the unstructured raw text provided by the user.
    Extract relevant information and map it into the following JSON structure.

    Target JSON Structure:
    {
      "project_name": "String",
      "problem_statement": "String",
      "solution_overview": "String",
      "functional_requirements": ["Array"],
      "non_functional_requirements": ["Array"],
      "tech_stack_recommendation": ["Array"],
      "status": "String",
      "processDescription": "String (process flow - see below)"
    }

    IMPORTANT: Also include "processDescription" field that describes the system process flow.
    Format the processDescription as simple steps following this pattern:

    Process Flow:
    → Step 1: [Action description] (Input/Output: ...) (Duration: ...)
    → Step 2: [Action description] (Input/Output: ...) (Duration: ...)
    → Step 3: [Action description] (Input/Output: ...) (Duration: ...)

    Keep steps simple, clear, and focused on the main workflow. 4-7 steps is ideal.

    Example processDescription for an e-learning platform:
    Process Flow:
    → Step 1: User logs in to platform (Input: username/password)
    → Step 2: User browses available courses (Duration: variable)
    → Step 3: User watches course video (Duration: depends on video length)
    → Step 4: User takes quiz at end of chapter (Duration: 10-30 minutes)
    → Step 5: System evaluates results (Duration: <1s)
    → Step 6: User receives certificate if passed (Output: certificate PDF)
    """
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"{system_prompt}\n\nUser Input:\n{req.prompt}",
        )
        cleaned_text = response.text.replace("```json", "").replace("```", "").strip()
        data = json.loads(cleaned_text)

        # Save ลง Database พร้อม userId
        filename = repo.save_spec(data, req.userId)

        return {"message": "Success", "filename": filename, "data": data, "isMock": False}
    except Exception as e:
        if _is_quota_error(e):
            mock_data = _build_mock_spec(req.prompt)
            filename = repo.save_spec(mock_data, req.userId)
            return {
                "message": "Success (mock fallback)",
                "filename": filename,
                "data": mock_data,
                "isMock": True,
                "fallbackReason": "quota_limit",
            }
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/specs")
def save_spec(req: SaveSpecRequest):
    """รับ spec จาก Next.js แล้วบันทึกลง storage พร้อม userId"""
    try:
        user_id = req.userId or req.authorId or "system"
        payload = {
            **req.data,
            "isPublished": req.isPublished,
        }
        filename = repo.save_spec(payload, user_id)
        return {
            "message": "Saved",
            "filename": filename,
            "userId": user_id,
            "isPublished": req.isPublished
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/specs/{filename}")
def delete_spec(filename: str):
    """ลบข้อมูลเมื่อกดรูปถังขยะ"""
    if repo.delete_spec(filename):
        return {"message": f"Deleted {filename}"}
    raise HTTPException(status_code=404, detail="Spec not found or delete failed")


@app.post("/api/generate-viz")
def generate_visualization(req: GenerateVizRequest):
    """
    Generate Excalidraw visualization JSON from process description.

    Receives process description text from LLM, converts it to Excalidraw JSON.

    Args:
        processDescription: Text describing process flow steps
        specId: Optional spec ID for tracking

    Returns:
        excalidrawJson: Valid Excalidraw JSON structure
        status: "success" or "error"
        elementCount: Number of shapes/arrows generated
    """
    try:
        # 1. Validate input
        if not req.processDescription or len(req.processDescription.strip()) < 10:
            raise HTTPException(
                status_code=400,
                detail={
                    "status": "error",
                    "code": "INVALID_INPUT",
                    "message": "processDescription must be at least 10 characters",
                    "detail": "Received: " + (req.processDescription[:50] if req.processDescription else "empty")
                }
            )

        # 2. Parse steps from description
        steps = parse_process_steps(req.processDescription)

        if not steps:
            # Warning: No steps found but continue trying to generate
            # This might happen if format is slightly different
            print(f"⚠️  [WARNING] No steps parsed from description: {req.processDescription[:100]}")

        # 3. Generate Excalidraw JSON
        exc_json = process_description_to_excalidraw(req.processDescription)

        # 4. Validate output
        if not validate_excalidraw_json(exc_json):
            raise ValueError("Generated JSON failed validation")

        # 5. Count elements (shapes + arrows)
        element_count = len(exc_json.get("elements", []))

        # 6. Return success response
        return {
            "status": "success",
            "excalidrawJson": exc_json,
            "processDescription": req.processDescription,
            "elementCount": element_count,
            "timestamp": datetime.now(timezone.utc).isoformat() + "Z",
            "specId": req.specId
        }

    except HTTPException:
        # Re-raise HTTPException as-is
        raise
    except ValueError as e:
        # Generation or validation failed
        print(f"❌ [ERROR] Excalidraw generation failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "code": "GENERATION_FAILED",
                "message": "Failed to generate visualization",
                "detail": str(e)
            }
        )
    except Exception as e:
        # Unexpected error
        print(f"❌ [ERROR] Unexpected error in generate-viz: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "code": "INTERNAL_ERROR",
                "message": "Internal server error",
                "detail": str(e)
            }
        )


@app.post("/api/generate-diagram")
def generate_diagram(req: GenerateDiagramRequest):
    """
    Generate Mermaid diagram code from process description.

    Uses LLM to create a flowchart/diagram in Mermaid syntax that visualizes
    the process flow described in the processDescription.

    Args:
        processDescription: Text describing the process flow
        projectName: Optional project/diagram title
        userId: Optional user ID from NextAuth

    Returns:
        mermaidCode: Valid Mermaid flowchart syntax
        projectName: The diagram title
        status: "success" or error details
    """
    try:
        # 1. Validate input
        if not req.processDescription or len(req.processDescription.strip()) < 10:
            raise HTTPException(
                status_code=400,
                detail={
                    "status": "error",
                    "code": "INVALID_INPUT",
                    "message": "processDescription must be at least 10 characters",
                    "detail": "Received: " + (req.processDescription[:50] if req.processDescription else "empty")
                }
            )

        # 2. Create LLM prompt to generate Mermaid code
        prompt = f"""Generate a Mermaid flowchart diagram code for the following process:

{req.processDescription}

Requirements:
1. Create valid Mermaid flowchart syntax
2. Use flowchart TD (top-down) direction
3. Include decision points (diamonds) where branching occurs
4. Include process boxes and arrows
5. Keep node text concise (max 20 chars per line if possible)
6. Start with: flowchart TD
7. End with proper syntax (no incomplete statements)

Output ONLY the Mermaid code, no explanations or markdown backticks:"""

        # 3. Call LLM to generate Mermaid code
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )

        mermaid_code = response.text.strip()

        # 4. Basic validation - must contain flowchart TD
        if not mermaid_code.startswith("flowchart"):
            # Add "flowchart TD" if missing
            mermaid_code = "flowchart TD\n" + mermaid_code

        # 5. Remove markdown code blocks if present (```mermaid ... ```)
        if mermaid_code.startswith("```"):
            mermaid_code = "\n".join(mermaid_code.split("\n")[1:-1])
            mermaid_code = mermaid_code.lstrip("mermaid").strip()

        # 6. Return success response
        return {
            "status": "success",
            "mermaidCode": mermaid_code,
            "projectName": req.projectName or "Process Flow",
            "timestamp": datetime.now(timezone.utc).isoformat() + "Z",
            "isMock": False,
        }

    except HTTPException:
        # Re-raise HTTPException as-is
        raise
    except Exception as e:
        if _is_quota_error(e):
            mock_mermaid = _build_mock_mermaid(req.projectName)
            return {
                "status": "success",
                "mermaidCode": mock_mermaid,
                "projectName": req.projectName or "Process Flow",
                "timestamp": datetime.now(timezone.utc).isoformat() + "Z",
                "isMock": True,
                "fallbackReason": "quota_limit",
            }

        # Generation or validation failed
        print(f"❌ [ERROR] Mermaid diagram generation failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "code": "GENERATION_FAILED",
                "message": "Failed to generate Mermaid diagram",
                "detail": str(e)
            }
        )


@app.post("/api/visualize-spec")
def visualize_spec(req: VisualizeSpecRequest):
    """
    Generate Process Flow diagram for a ProjectSpec using Excalidraw MCP.

    Phase 4: Excalidraw MCP - Process Overview (MVP level, no details)
    Phase 5+: Draw.io MCP (Architecture), Figma MCP (Wireframes)

    Args:
        specId: ProjectSpec ID to visualize
        userId: User ID from NextAuth
        forceRegenerate: Force regeneration even if cached
        diagramTypes: MCP types to use (default: ['excalidraw'])

    Returns:
        diagram: Excalidraw JSON (Process Flow overview)
        specHash: Content hash for change detection
        rateLimitRemaining: Remaining generations today
        version: Diagram version number
    """
    try:
        # 1. Check rate limit
        allowed, remaining = check_rate_limit(req.userId)
        if not allowed and not req.forceRegenerate:
            raise HTTPException(
                status_code=429,
                detail={
                    "status": "error",
                    "code": "RATE_LIMIT_EXCEEDED",
                    "message": f"Daily diagram generation limit reached ({RATE_LIMITS['diagram_generation']['max_per_day']} per day)",
                    "detail": "Limit resets at midnight UTC",
                    "rateLimitRemaining": 0,
                    "resetAt": (datetime.now(timezone.utc) + timedelta(days=1)).replace(hour=0, minute=0, second=0).isoformat() + "Z"
                }
            )

        # 2. Fetch spec data from database (mock for now)
        # TODO: Query ProjectSpec from database
        spec_data = {
            "id": req.specId,
            "problemStatement": "Build a project management tool",
            "functionalRequirements": [
                "User authentication",
                "Project creation",
                "Task management",
                "Real-time collaboration",
                "File attachments"
            ],
            "nonFunctionalRequirements": [
                "Fast response time (<200ms)",
                "Secure data storage",
                "Mobile responsive"
            ],
            "techStackRecommendation": ["Next.js", "FastAPI", "PostgreSQL", "Redis"],
            "processDescription": "Step 1: User logs in\nStep 2: Create project\nStep 3: Add tasks\nStep 4: Collaborate"
        }

        # 3. Compute spec hash
        spec_hash = compute_spec_hash(spec_data)

        # 4. Check if diagrams exist and spec hasn't changed
        # TODO: Query ProjectSpec.visualizations from database
        # For now, always generate

        # 5. Generate Process Flow diagram (Excalidraw MCP)
        mcp_type = req.diagramTypes[0] if req.diagramTypes else "excalidraw"
        print(f"🎨 Generating {mcp_type} diagram for spec {req.specId}...")
        diagram_result = generate_process_diagram(spec_data, mcp_type=mcp_type)

        # 6. Validate generated diagram
        if mcp_type == "excalidraw":
            if not validate_excalidraw_json(diagram_result["diagram"]):
                raise ValueError("Excalidraw diagram validation failed")

        # 7. Save to database
        # TODO: Update ProjectSpec.visualizations and specHash in database

        # 8. Backup to file
        version = 1  # TODO: Get next version from database
        save_diagram_backup(req.userId, req.specId, diagram_result["diagram"], version)

        # 9. Log generation event (for rate limiting)
        # TODO: Insert into DiagramGenerationLog table

        # 10. Return success response
        return {
            "status": "success",
            "diagram": diagram_result["diagram"],
            "diagramType": diagram_result["type"],
            "mcp": diagram_result["mcp"],
            "specHash": spec_hash,
            "generatedAt": datetime.now(timezone.utc).isoformat() + "Z",
            "rateLimitRemaining": remaining - 1,
            "version": version
        }

    except HTTPException:
        raise
    except Exception as e:
        if _is_quota_error(e):
            fallback_diagram = _build_mock_excalidraw(req.specId)
            return {
                "status": "success",
                "diagram": fallback_diagram,
                "diagramType": "process_flow",
                "mcp": "excalidraw",
                "specHash": compute_spec_hash(spec_data),
                "generatedAt": datetime.now(timezone.utc).isoformat() + "Z",
                "rateLimitRemaining": max(remaining - 1, 0),
                "version": 1,
                "isMock": True,
                "fallbackReason": "quota_limit",
            }

        print(f"❌ [ERROR] Diagram generation failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "code": "GENERATION_FAILED",
                "message": "Failed to generate diagrams",
                "detail": str(e)
            }
        )

