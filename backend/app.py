import streamlit as st
from google import genai
import json
import os
from dotenv import load_dotenv
from pathlib import Path
from db import FileSystemRepository, PostgreSQLRepository, DualRepository

# --- 1. CONFIG & SETUP ---
st.set_page_config(page_title="Auto-Spec Generator", page_icon="🚀", layout="wide")

# Load API Key
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)
api_key = os.environ.get("GEMINI_API_KEY")

# --- 2. INITIALIZE DATABASE ---
repo = FileSystemRepository()

# --- 3. SIDEBAR (Configuration & Saved Specs) ---
with st.sidebar:
    # Database selection
    st.header("🗄️ Storage Backend")
    db_type = st.radio(
        "Choose storage backend:",
        ["📁 File System (JSON)", "🐘 PostgreSQL"],
        help="Switch between local JSON files or PostgreSQL database",
    )

    if db_type == "🐘 PostgreSQL":
        repo = DualRepository()
        if repo.postgres_available:
            st.success("✅ Connected to PostgreSQL (Dual save enabled)")
        else:
            st.warning("⚠️ PostgreSQL unavailable, saving JSON only")
            if repo.postgres_error:
                st.info(f"Details: {repo.postgres_error[:120]}")
            st.info(
                "💡 Make sure Docker containers are running: `wsl docker-compose up`"
            )
    else:
        repo = FileSystemRepository()
        st.success("✅ Using File System (JSON)")

    st.divider()

    # Configuration tabs
    config_tab, saved_tab = st.tabs(["⚙️ Config", "📚 Saved Specs"])

    with config_tab:
        st.header("⚙️ Configuration")

        # เช็ค API Key
        if not api_key:
            st.error("❌ ไม่พบ API Key! กรุณาเช็คไฟล์ .env")
            st.stop()
        else:
            st.success(f"✅ API Connected (...{api_key[-4:]})")

        # เลือก Model (เผื่ออยากปรับเปลี่ยนในอนาคต)
        model_id = st.text_input(
            "Model ID",
            value="gemini-2.5-flash",
            help="ถ้า Error ให้ลองเปลี่ยนเป็น gemini-1.5-flash",
        )

        st.info("💡 Tip: ใส่ไอเดียดิบๆ ลงไป ระบบจะจัดระเบียบให้เอง")

    with saved_tab:
        st.header("📚 Saved Specifications")

        # Get list of saved specs
        saved_specs = repo.list_all_specs()

        if saved_specs:
            st.write(f"**Total: {len(saved_specs)} specs**")

            for spec in saved_specs:
                with st.expander(f"📄 {spec['project_name']} ({spec['created_at']})"):
                    st.caption(f"Status: `{spec['status']}`")

                    if st.button(
                        "👁️ View Full Spec",
                        key=f"view_{spec['filename']}",
                        use_container_width=True,
                    ):
                        st.session_state.selected_spec = spec["filename"]

                    col1, col2 = st.columns(2)
                    with col1:
                        if st.button(
                            "📥 Load & Edit",
                            key=f"load_{spec['filename']}",
                            use_container_width=True,
                        ):
                            st.session_state.load_spec = spec["filename"]

                    with col2:
                        if st.button(
                            "🗑️ Delete",
                            key=f"delete_{spec['filename']}",
                            use_container_width=True,
                        ):
                            if repo.delete_spec(spec["filename"]):
                                st.success(f"Deleted {spec['filename']}")
                                st.rerun()
                            else:
                                st.error("Failed to delete")
        else:
            st.info("ยังไม่มี specs ที่ saved ให้สร้างตัวแรกได้เลย ✨")


# --- 4. CORE LOGIC (AI Function) ---
def generate_spec(raw_text):
    client = genai.Client(api_key=api_key)

    system_prompt = """
    You are an expert Senior System Analyst.
    Your task is to analyze the unstructured raw text provided by the user.
    Extract relevant information and map it into the following JSON structure.

    Rules:
    1. Output MUST be valid JSON only. No Markdown code blocks.
    2. If information is missing, try to reasonably INFER it based on standard software engineering practices.
    3. If inference is impossible, use null.
    4. "Status" field should be "Draft", "Incomplete", or "Ready".

    Target JSON Structure:
    {
      "project_name": "String",
      "problem_statement": "String",
      "solution_overview": "String",
      "functional_requirements": ["Array of Strings"],
      "non_functional_requirements": ["Array of Strings"],
      "tech_stack_recommendation": ["Array of Strings"],
      "status": "String"
    }
    """

    try:
        response = client.models.generate_content(
            model=model_id,
            contents=f"{system_prompt}\n\nUser Input:\n{raw_text}",
        )
        # Cleaning & Parsing
        cleaned_text = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(cleaned_text)
    except Exception as e:
        st.error(f"Error: {e}")
        return None


# --- 5. MAIN UI ---
st.title("🚀 Auto-Spec Generator")
st.caption("เปลี่ยนไอเดียฟุ้งๆ ให้เป็น Software Requirement แบบมืออาชีพ")

# Handle loading previous spec into input
if "load_spec" in st.session_state:
    loaded_data = repo.load_spec(st.session_state.load_spec)
    if loaded_data:
        st.session_state.raw_input = loaded_data.get("problem_statement", "")
    del st.session_state.load_spec
    st.rerun()

# Input Area
col1, col2 = st.columns([1, 1])

with col1:
    st.subheader("📥 Raw Idea Input")
    raw_input = st.text_area(
        "พิมพ์สิ่งที่คิดออกลงไปเลย (ไม่จำเป็นต้องเรียบเรียง)",
        height=400,
        placeholder="ตัวอย่าง: อยากทำแอพจดหวย ที่สแกนโพยได้ แล้วคำนวณกำไรขาดทุนให้อัตโนมัติ...",
        value=st.session_state.get("raw_input", ""),
        key="raw_input_area",
    )

    generate_btn = st.button(
        "✨ Generate Specification", type="primary", use_container_width=True
    )

# Output Area
with col2:
    st.subheader("📄 Structured Requirement")

    # Display selected spec from sidebar
    if "selected_spec" in st.session_state:
        selected_data = repo.load_spec(st.session_state.selected_spec)
        if selected_data:
            st.markdown(f"# 🏗️ {selected_data.get('project_name', 'Untitled Project')}")
            st.info(f"**Status:** {selected_data.get('status')}")
            st.caption(f"Saved at: {selected_data.get('_saved_at', 'Unknown')}")

            st.markdown("### 1. Problem Statement")
            st.write(selected_data.get("problem_statement"))

            st.markdown("### 2. Solution Overview")
            st.write(selected_data.get("solution_overview"))

            st.markdown("### 3. Functional Requirements")
            for req in selected_data.get("functional_requirements", []):
                st.markdown(f"- {req}")

            st.markdown("### 4. Non-Functional Requirements")
            for nfr in selected_data.get("non_functional_requirements", []):
                st.markdown(f"- {nfr}")

            st.markdown("### 5. Tech Stack Recommendation")
            for tech in selected_data.get("tech_stack_recommendation", []):
                st.code(tech, language="text")

            if st.button("❌ Close", use_container_width=True):
                if "selected_spec" in st.session_state:
                    del st.session_state.selected_spec
                st.rerun()

    elif generate_btn and raw_input:
        with st.spinner("🤖 AI กำลังวิเคราะห์และเขียน Spec ให้คุณ..."):
            data = generate_spec(raw_input)

            if data:
                # Auto-save spec
                saved_filename = repo.save_spec(data)

                save_result = getattr(repo, "last_save_result", None)
                if save_result and "postgres_saved" in save_result:
                    if save_result.get("file_saved"):
                        st.success(f"✅ JSON saved: **{saved_filename}**")
                    if save_result.get("postgres_saved"):
                        st.success("✅ PostgreSQL saved")
                    else:
                        st.warning(
                            "⚠️ PostgreSQL save failed (JSON saved). Check DB connection."
                        )
                        if save_result.get("postgres_error"):
                            st.info(
                                f"PostgreSQL error: {save_result['postgres_error'][:200]}"
                            )
                else:
                    st.success(f"✅ Spec saved: **{saved_filename}**")

                with st.expander("📝 View Generated Spec", expanded=True):
                    # สร้าง Tab เพื่อดูข้อมูล 2 แบบ
                    tab1, tab2 = st.tabs(["📋 Document View", "📄 JSON View"])

                    with tab1:
                        # แสดงผลแบบเอกสาร Markdown สวยๆ
                        st.markdown(
                            f"# 🏗️ {data.get('project_name', 'Untitled Project')}"
                        )

                        st.info(f"**Status:** {data.get('status')}")

                        st.markdown("### 1. Problem Statement")
                        st.write(data.get("problem_statement"))

                        st.markdown("### 2. Solution Overview")
                        st.write(data.get("solution_overview"))

                        st.markdown("### 3. Functional Requirements")
                        for req in data.get("functional_requirements", []):
                            st.markdown(f"- {req}")

                        st.markdown("### 4. Non-Functional Requirements")
                        for nfr in data.get("non_functional_requirements", []):
                            st.markdown(f"- {nfr}")

                        st.markdown("### 5. Tech Stack Recommendation")
                        for tech in data.get("tech_stack_recommendation", []):
                            st.code(tech, language="text")

                    with tab2:
                        # แสดง JSON ดิบเผื่อเอาไปใช้ต่อ
                        st.json(data)

    elif generate_btn and not raw_input:
        st.warning("⚠️ กรุณาใส่ข้อมูลก่อนกดปุ่มครับ")

    else:
        st.info("👈 ใส่ข้อมูลด้านซ้าย แล้วกดปุ่มเพื่อเริ่มงาน")
