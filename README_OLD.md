# Blueprint Hub - AI-Powered Requirements & Architecture Management

อังคต system สำหรับจัดการ **Software Requirements** และ **Architecture Artifacts** ด้วย AI

**Production-ready monorepo** ที่รวม Next.js + FastAPI + TypeScript + Python + PostgreSQL

- 🎯 **Purpose**: Centralized platform for design specifications, requirement engineering, and artifact management
- 👥 **For**: Software architects, product teams, and development teams
- 🚀 **Status**: Prototype V1 (Active Development)

---

## 📦 Monorepo Structure

```
special_project_v1/          # Root directory
├── .github/                 # GitHub templates, workflows, configs
│   ├── ISSUE_TEMPLATE/      # Bug/Feature templates
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── workflows/           # CI/CD pipelines (frontend.yml, backend.yml)
│   └── copilot-instructions.md  # Copilot behavior & policies
├── frontend/                # Next.js + React + TypeScript + Tailwind
│   ├── app/                 # App Router pages
│   ├── components/          # Reusable React components
│   ├── lib/                 # Utilities, hooks, services
│   ├── types/               # TypeScript definitions
│   ├── prisma/              # Database schema & migrations
│   └── package.json         # Bun dependencies
├── backend/                 # Python + FastAPI + PostgreSQL
│   ├── api/                 # API route modules
│   ├── models/              # Pydantic schemas
│   ├── services/            # Business logic layer
│   ├── utils/               # Utilities
│   ├── tests/               # Test suite
│   └── pyproject.toml       # uv dependencies
├── docs/                    # Complete documentation
│   ├── README.md            # 📖 Documentation index (start here!)
│   ├── MONOREPO_STRUCTURE.md
│   ├── FEATURE_ROADMAP.md
│   ├── DEVELOPMENT_PLANS.md
│   ├── BACKEND_SETUP.md
│   ├── DATABASE_SETUP.md
│   ├── API_CONTRACTS.md
│   ├── TypeScript_conventions.md
│   ├── Python_conventions.md
│   ├── COPILOT_DATA_MANAGEMENT.md
│   └── session-notes/       # Archived conversations & decisions
├── CONTRIBUTING.md          # How to contribute
├── CODE_OF_CONDUCT.md       # Community guidelines
├── SECURITY.md              # Security policy & best practices
├── TODO.md                  # Project backlog
└── README.md                # This file
```

**Detailed Folder Guide**: See [docs/README.md](docs/README.md)

```
special_project_v1/
├── frontend/           # Next.js UI (TypeScript + Tailwind)
│   ├── app/           # App router pages
│   ├── components/    # React components
│   ├── lib/           # Utilities
│   ├── types/         # TypeScript types
│   ├── prisma/        # Database schema & migrations
│   ├── public/        # Static assets
│   ├── package.json   # Frontend dependencies (Bun)
│   └── ...
├── backend/           # Python FastAPI API
│   ├── api.py         # FastAPI server
│   ├── db.py          # Database models
│   ├── *.py           # Utility scripts
│   ├── pyproject.toml # Python dependencies (uv)
│   ├── uv.lock        # Dependency lock file
│   ├── docker-compose.yml
│   └── init.sql
├── docs/              # Documentation
│   ├── FEATURE_ROADMAP.md
│   ├── BACKEND_SETUP.md
│   └── MONOREPO_STRUCTURE.md
└── README.md          # This file
```

## ��� Quick Start

### Prerequisites

- **Windows/Mac/Linux**
- **Bun** (frontend package manager) - [Install Bun](https://bun.sh)
- **uv** (Python package manager) - [Install uv](https://docs.astral.sh/uv/getting-started/installation/)
- **PostgreSQL** (development database)

Verify installations:

```bash
bun --version
uv --version
psql --version
```

### 1) Frontend Setup

Navigate to the frontend directory and set it up:

```bash
cd frontend

# Install dependencies
bun install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your OAuth credentials (see Frontend Setup below)

# Generate Prisma client & set up database
bunx prisma generate
bunx prisma db push

# Start development server
bun run dev
```

Frontend will be available at: **http://localhost:3000**

### 2) Backend Setup

Navigate to the backend directory and set it up:

```bash
cd backend

# Install Python dependencies (using uv, not pip)
uv install

# Set up environment
cp .env.example .env.local
# Edit .env.local with database credentials

# Start the API server
uv run uvicorn api:app --reload
```

Backend API will be available at: **http://localhost:8000**

---

## ��� Detailed Documentation

### Frontend Setup
See [**Frontend Setup**](./frontend/README.md) for:
- OAuth configuration (Google, GitHub)
- Database setup with Prisma
- Development and build commands

### Backend Setup
See [**Backend Setup**](./docs/BACKEND_SETUP.md) for:
- Python environment setup
- Using `uv` package manager
- Database connection
- API development

### Architecture & Features
See [**Feature Roadmap**](./docs/FEATURE_ROADMAP.md) for:
- Project vision and architecture
- Current features
- Planned features and improvements

### Development Plans
See [**Development Plans**](./docs/DEVELOPMENT_PLANS.md) for:
- MCP (Model Context Protocol) integration strategy
- Multi-turn LLM prompting architecture
- Advanced prompt engineering techniques
- Future innovations and research

### Session Notes & Knowledge Base
See [**Session Notes**](./docs/session-notes/README.md) for:
- Archived planning discussions
- Architecture decision records
- Technical problem-solving sessions
- Meeting notes and action items

### Copilot Integration
See [**Copilot Data Management**](./docs/COPILOT_DATA_MANAGEMENT.md) for:
- GitHub Copilot conversation storage
- How we preserve important discussions
- Knowledge management workflow
- MCP integration possibilities

### Monorepo Organization
See [**Monorepo Structure**](./docs/MONOREPO_STRUCTURE.md) for:
- Folder organization rationale
- Cross-folder dependencies
- Development workflows

---

## ���️ Common Commands

### Frontend

```bash
cd frontend

# Development
bun run dev          # Start dev server

# Building
bun run build        # Production build
bun run start        # Run production build locally

# Database
bunx prisma generate    # Generate Prisma client
bunx prisma db push     # Sync schema changes
bunx prisma migrate dev # Create migration
bunx prisma studio      # Open Prisma Studio UI

# Linting
bun run lint         # Check code quality
```

### Backend

```bash
cd backend

# Dependencies
uv install           # Install all dependencies
uv lock              # Update lockfile

# Development
uv run uvicorn api:app --reload     # Start dev server with auto-reload

# Tools
uv run python db.py                 # Database operations
```

---

## ��� Environment Variables

### Frontend (`.env.local`)

```dotenv
DATABASE_URL="postgresql://user:password@localhost:5432/blueprint_hub"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
GITHUB_ID="your_github_oauth_id"
GITHUB_SECRET="your_github_oauth_secret"
GOOGLE_ID="your_google_oauth_id"
GOOGLE_SECRET="your_google_oauth_secret"
```

### Backend (`.env.local`)

```dotenv
DATABASE_URL="postgresql://user:password@localhost:5432/blueprint_hub"
OPENAI_API_KEY="your_openai_api_key"
```

---

## ��� Project Structure Philosophy

This monorepo keeps frontend and backend together because:

1. **Single Source of Truth** - Both parts evolve together as one Blueprint Hub project
2. **Shared Context** - Easier to understand full feature flow (UI → API → AI)
3. **Simple Onboarding** - New developers clone one repo, not two
4. **Coordinated Releases** - Frontend and backend versions stay in sync

For large teams: Consider splitting into separate repos with a monorepo orchestrator (Nx, Turborepo).

---

## ��� Troubleshooting

### Frontend won't start
- Did you run `bun install`? If not, try `rm -rf node_modules && bun install`
- Check `.env.local` has all required OAuth keys
- Ensure PostgreSQL is running: `pg_isready`
- Try: `bunx prisma db push --force-reset` (dev only!)

### Backend API not responding
- Is Python running? Check: `curl -i http://localhost:8000/docs`
- Did you run `uv install`? Try: `rm -rf .venv && uv install`
- Check `.env.local` has correct `DATABASE_URL`
- Check PostgreSQL connection: `psql $DATABASE_URL`

### OAuth login not working
- Verify callback URLs in GitHub/Google OAuth app settings match exactly
- GitHub: `http://localhost:3000/api/auth/callback/github`
- Google: `http://localhost:3000/api/auth/callback/google`
- NEXTAUTH_SECRET must be set (not empty)

### Database connection issues
- Verify PostgreSQL is running
- Check DATABASE_URL is correct: `psql $DATABASE_URL -c "SELECT 1"`
- Frontend: `bunx prisma db push`
- Backend: Check `python db.py` output

---

## ��� Key Technologies

| Layer | Technology | Package Manager |
|-------|-----------|-----------------|
| **Frontend UI** | Next.js 14 + React + TypeScript | Bun |
| **Frontend DB** | PostgreSQL + Prisma ORM | Bun |
| **Frontend Auth** | Auth.js (NextAuth.js) | Bun |
| **Frontend Styling** | Tailwind CSS v4 | Bun |
| **Backend API** | Python 3.12 + FastAPI | uv |
| **Backend DB** | PostgreSQL (shared) | uv |
| **Diagrams** | Mermaid.js + MermaidDiagram component | CDN |

---

## ��� Additional Resources

- **[Next.js Docs](https://nextjs.org/docs)** - Frontend framework
- **[Prisma Docs](https://www.prisma.io/docs)** - ORM & database setup
- **[Auth.js Docs](https://authjs.dev)** - Authentication
- **[FastAPI Docs](https://fastapi.tiangolo.com)** - Backend framework
- **[uv Docs](https://docs.astral.sh/uv)** - Python package manager
- **[Mermaid Docs](https://mermaid.js.org)** - Diagram syntax

---

## ��� License

TBD

---

**Last Updated**: March 2025 | **Python Backend**: uv package manager | **Frontend**: Bun
