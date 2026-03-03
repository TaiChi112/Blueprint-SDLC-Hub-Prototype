"""
llm_to_excalidraw.py - Convert process descriptions to Excalidraw JSON

Converts text-based process flow descriptions into Excalidraw JSON format
that can be rendered directly in the browser.

Usage:
    from llm_to_excalidraw import process_description_to_excalidraw

    description = '''
    → Step 1: User submits form (Input: form data)
    → Step 2: Backend validates (Duration: <1s)
    → Step 3: LLM generates spec (Duration: 5-10s)
    '''

    exc_json = process_description_to_excalidraw(description)
    # exc_json is ready to send to frontend for rendering
"""

import json
import uuid
from typing import Any, Dict, List
from datetime import datetime


def generate_element_id() -> str:
    """Generate a unique element ID for Excalidraw."""
    return str(uuid.uuid4())[:12]


def parse_process_steps(description: str) -> List[Dict[str, Any]]:
    """
    Parse process description into structured steps.

    Expected format:
    → Step 1: Description (Input/Output/Duration: ...)
    → Step 2: Description (Input/Output/Duration: ...)

    Returns list of dicts with keys: order, title, details
    """
    steps = []
    lines = [line.strip() for line in description.split('\n') if line.strip()]

    for line in lines:
        # Skip headers like "Process Flow:"
        if line.lower().startswith('process'):
            continue

        # Match arrow format "→ Step X:"
        if '→' in line or line.startswith('Step'):
            # Remove arrow
            clean = line.replace('→', '').strip()

            # Extract step number and description
            if ':' in clean:
                parts = clean.split(':', 1)
                title = parts[0].strip()  # "Step 1", "Step 2", etc.
                details = parts[1].strip() if len(parts) > 1 else ""

                steps.append({
                    'order': len(steps) + 1,
                    'title': title,
                    'details': details
                })

    return steps


def create_excalidraw_element(
    x: float,
    y: float,
    width: float,
    height: float,
    text: str,
    element_type: str = "rectangle"
) -> Dict[str, Any]:
    """Create a single Excalidraw element (box/shape with text)."""
    return {
        "id": generate_element_id(),
        "type": element_type,
        "x": x,
        "y": y,
        "width": width,
        "height": height,
        "angle": 0,
        "strokeColor": "#1e88e5",
        "backgroundColor": "#e3f2fd",
        "fillStyle": "hachure",
        "strokeWidth": 1,
        "roughness": 1,
        "opacity": 100,
        "text": text,
        "fontSize": 13,
        "fontFamily": 1,
        "textAlign": "center",
        "verticalAlign": "middle",
        "containerId": None,
        "originalText": text,
        "baseline": height // 2
    }


def create_arrow_element(
    x1: float,
    y1: float,
    x2: float,
    y2: float
) -> Dict[str, Any]:
    """Create an arrow connecting two elements."""
    return {
        "id": generate_element_id(),
        "type": "arrow",
        "x": x1,
        "y": y1,
        "width": x2 - x1,
        "height": y2 - y1,
        "angle": 0,
        "strokeColor": "#1e88e5",
        "backgroundColor": "transparent",
        "fillStyle": "hachure",
        "strokeWidth": 2,
        "roughness": 0,
        "opacity": 100,
        "points": [[0, 0], [x2 - x1, y2 - y1]],
        "lastCommittedPoint": None,
        "startBinding": None,
        "endBinding": None,
        "startArrowType": None,
        "endArrowType": "arrow",
        "text": "",
        "fontSize": 13,
        "fontFamily": 1,
        "textAlign": "center",
        "verticalAlign": "middle",
        "containerId": None,
        "originalText": ""
    }


def process_description_to_excalidraw(
    description: str,
    theme: str = "light"
) -> Dict[str, Any]:
    """
    Convert process description to Excalidraw JSON.

    Args:
        description: Process description text with arrow-marked steps
        theme: "light" or "dark" - Excalidraw theme

    Returns:
        Dict with Excalidraw-compatible JSON structure
    """
    # Parse steps from description
    steps = parse_process_steps(description)

    if not steps:
        # Return empty but valid Excalidraw JSON
        return _create_base_excalidraw_json([], theme)

    # Generate elements and spacing
    elements = []
    box_width = 280
    box_height = 70
    start_x = 80
    start_y = 100
    vertical_spacing = 140

    for i, step in enumerate(steps):
        y = start_y + (i * vertical_spacing)

        # Create step box with title and details
        text = f"{step['title']}\n{step['details']}" if step['details'] else step['title']

        element = create_excalidraw_element(
            x=start_x,
            y=y,
            width=box_width,
            height=box_height,
            text=text
        )
        elements.append(element)

        # Add arrow to next step (if not last)
        if i < len(steps) - 1:
            arrow = create_arrow_element(
                x1=start_x + box_width // 2,
                y1=y + box_height,
                x2=start_x + box_width // 2,
                y2=y + vertical_spacing
            )
            elements.append(arrow)

    return _create_base_excalidraw_json(elements, theme)


def _create_base_excalidraw_json(
    elements: List[Dict[str, Any]],
    theme: str = "light"
) -> Dict[str, Any]:
    """Create base Excalidraw JSON structure with given elements."""
    return {
        "type": "excalidraw",
        "version": 2,
        "versionNonce": int(datetime.now().timestamp() * 1000) % 2147483647,
        "source": "special-project-v1",
        "elements": elements,
        "appState": {
            "gridMode": False,
            "gridSize": None,
            "gridModeEnabled": False,
            "viewBackgroundColor": "#ffffff" if theme == "light" else "#1e1e1e",
            "zoom": {
                "value": 1
            },
            "scrollToContent": True
        },
        "files": {}
    }


def validate_excalidraw_json(data: Dict[str, Any]) -> bool:
    """Validate that the data is valid Excalidraw JSON."""
    required_keys = {"type", "version", "versionNonce", "elements", "appState"}
    return required_keys.issubset(data.keys()) and data.get("type") == "excalidraw"


# Test/Example
if __name__ == "__main__":
    test_description = """
    Process Flow:
    → Step 1: User submits project idea (Input: form data)
    → Step 2: Backend validates input (Duration: <1s)
    → Step 3: LLM generates specification (Duration: 5-10s)
    → Step 4: Store result in database (Duration: <1s)
    → Step 5: Return JSON response (Output: spec+metadata)
    """

    result = process_description_to_excalidraw(test_description)

    print("✅ Generation successful!")
    print(f"Elements generated: {len(result['elements'])}")
    print(f"Valid Excalidraw JSON: {validate_excalidraw_json(result)}")

    # Optional: print formatted JSON
    # print(json.dumps(result, indent=2))
