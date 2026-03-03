# 🏗️ The Blueprint Hub

**Status**: Prototype V1 (Monorepo Structure)  
**Last Updated**: March 2026

---

## 🎯 Vision & Concept

A centralized platform for **Software Requirements & Architecture artifacts**, bridging the gap between **"Idea"** and **"Implementation"**.

### Core Philosophy

| Principle | Description |
|-----------|-------------|
| **🔓 Decoupling** | แยก Document/Design ออกจาก Source Code เพื่อให้เรียนรู้ Architecture ได้โดยไม่ต้องยึดติดภาษา |
| **📐 Standardization** | บังคับใช้โครงสร้างข้อมูลตามหลัก SDLC Phase 1 (Inception/Requirements) |
| **🤝 Community-Driven** | ระบบ Open Contribution ที่ให้ชุมชนช่วยกันปรับปรุง Requirement ให้สมบูรณ์ |

---

## 🛠️ Key Features Implemented

### ✅ Core Functionality

- **Granular Data Structure**: แบ่งข้อมูลเป็น 9 Standard Sections
  - Project Info, Problem, Scope, Stakeholders
  - Functional Requirements, Non-Functional Requirements
  - Constraints, Assumptions, Acceptance Criteria

- **Structured Artifacts**: รองรับการเก็บข้อมูลหลายรูปแบบ
  - Text: Free-form documentation
  - List: Structured requirement lists
  - Diagram: Mermaid.js rendering (architecture, flowcharts, ERD)

- **Versioning System**: Progressive iteration support
  - V0.1 Idea → V0.5 Draft → V1.0 MVP → V2.0 Production
  - Track evolution of requirements over time

- **Contribution Workflow**: Collaborative editing
  - Suggestion Mode สำหรับ Volunteer contributors
  - แก้ไขโดยไม่กระทบ original blueprint
  - Review & merge suggestions

- **Interactive UI**: Modern, responsive interfaces
  - Accordion sections (expand/collapse)
  - Activity Heatmap visualization
  - Real-time editing preview
  - Toast notifications

---

## 📚 Software Engineering Principles Applied

| Principle | Implementation |
|-----------|----------------|
| **Progressive Disclosure** | การซ่อนรายละเอียด (Collapse sections) เพื่อให้ User focus สิ่งที่สนใจ |
| **Separation of Concerns** | การแยกส่วน UI (React Components) ออกจาก Data Structure (TypeScript Interfaces) |
| **Requirement Engineering** | การบังคับใช้ Template มาตรฐาน (FR/NFR/Constraints) เพื่อฝึกกระบวนการคิดที่เป็นระบบ |
| **Monorepo Architecture** | Frontend + Backend อยู่ใน repo เดียว (coordinated releases, shared context) |

---

## 🚀 Project Structure (Monorepo)

```
special_project_v1/
├── frontend/       # Next.js + React + TypeScript + Tailwind
├── backend/        # Python FastAPI + AI prompt engine
├── docs/           # Documentation & Roadmaps
│   ├── FEATURE_ROADMAP.md
│   ├── BACKEND_SETUP.md
│   └── MONOREPO_STRUCTURE.md
└── README.md       # This overview
```

**For detailed architecture**: See [docs/MONOREPO_STRUCTURE.md](docs/MONOREPO_STRUCTURE.md)

---

## 🔜 Next Steps (Backlog)

### High Priority

- [ ] **Traceability Matrix**
  - Linking Requirements → Tests → Code
  - Bidirectional traceability visualization

- [ ] **Diff View**
  - Visualizing changes between versions (V1.0 → V1.1)
  - Line-by-line comparison for requirements

- [ ] **Export SRS**
  - Auto-generating professional Software Requirements Specification documents
  - Export to PDF/Markdown/Word formats

### Medium Priority

- [ ] **AI Quality Check**
  - Automated feedback on requirement ambiguity
  - Detect missing constraints, unclear acceptance criteria
  - Suggest improvements using LLM

- [ ] **Blueprint Templates**
  - Pre-built templates: Web App, Mobile App, API, Microservices
  - Industry-specific templates: E-commerce, Healthcare, FinTech

- [ ] **Collaboration Features**
  - Real-time editing (Conflict resolution)
  - Comments on specific sections
  - Notification system for contributors

### Long-term Vision

- [ ] **MCP Integration**
  - Excalidraw integration for visual architecture design
  - Sync diagrams with text requirements

- [ ] **Multi-turn LLM Prompting**
  - Iterative spec generation with user feedback
  - Context-aware prompt engineering

- [ ] **Search & Discovery**
  - Full-text search across blueprints
  - Tag-based filtering and categorization

- [ ] **Analytics Dashboard**
  - Blueprint popularity metrics
  - Community contribution stats
  - Version history analytics

---

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| **[README.md](README.md)** | Monorepo overview, quick start guide |
| **[docs/FEATURE_ROADMAP.md](docs/FEATURE_ROADMAP.md)** | Detailed feature analysis, current vs planned features, gaps |
| **[docs/BACKEND_SETUP.md](docs/BACKEND_SETUP.md)** | Python FastAPI backend setup with `uv` package manager |
| **[docs/MONOREPO_STRUCTURE.md](docs/MONOREPO_STRUCTURE.md)** | Project organization rationale & development workflows |

---

## 🧑‍💻 For Developers

### Quick Start

```bash
# Frontend
cd frontend
bun install && bun run dev

# Backend (Python)
cd backend
uv install && uv run uvicorn api:app --reload
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 19, TypeScript, Tailwind CSS v4 |
| **Backend** | Python 3.12+, FastAPI, uv |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | NextAuth.js (Google/GitHub OAuth) |
| **AI** | OpenAI API / Gemini API (backend) |
| **Diagrams** | Mermaid.js (client-side rendering) |

---

## 📝 License

TBD

---

**Last Updated**: March 2026 | **Version**: Monorepo V1 | **Contributors**: The Blueprint Hub Team