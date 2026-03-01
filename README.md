# Blueprint Hub - AI-Powered Requirements & Architecture Management

อังคต system สำหรับจัดการ **Software Requirements** และ **Architecture Artifacts** ด้วย AI  
**Production-ready monorepo**: Next.js + FastAPI + TypeScript + Python + PostgreSQL

- 🎯 Centralized platform for design specifications and requirement engineering
- 👥 For software architects, product teams, and development teams  
- 🚀 Status: Prototype V1 (Active Development)

---

## 📦 Monorepo Structure

```
special_project_v1/
├── .github/                 # Templates, workflows, configs
│   ├── ISSUE_TEMPLATE/      # Bug/Feature report templates
│   ├── workflows/           # CI/CD pipelines
│   └── copilot-instructions.md
├── frontend/                # Next.js 16 + React 19 + TypeScript
├── backend/                 # Python FastAPI + LLM integration
├── docs/                    # Complete documentation
│   ├── README.md           # 📖 Documentation index
│   ├── MONOREPO_STRUCTURE.md
│   ├── FEATURE_ROADMAP.md
│   ├── API_CONTRACTS.md
│   ├── DATABASE_SETUP.md
│   ├── TypeScript_conventions.md
│   ├── Python_conventions.md
│   └── session-notes/      # Archived discussions
├── CONTRIBUTING.md          # How to contribute
├── CODE_OF_CONDUCT.md       # Community guidelines
├── SECURITY.md              # Security policy
└── TODO.md                  # Project backlog
```

---

## ⚡ Quick Start

### Prerequisites

- **Bun** - [Install](https://bun.sh) | `bun --version`
- **uv** - [Install](https://docs.astral.sh/uv/) | `uv --version`  
- **PostgreSQL 14+** - [Install](https://www.postgresql.org/download/) | `psql --version`

### 1️⃣ Clone & Install

```bash
git clone https://github.com/your-org/special_project_v1.git
cd special_project_v1

cd frontend && bun install && cd ..
cd backend && uv sync && cd ..
```

### 2️⃣ Database Setup

```bash
# Create PostgreSQL database
createdb blueprint_hub_dev

# Configure & migrate
cd frontend
cp .env.local.example .env.local
# Edit .env.local: DATABASE_URL="postgresql://user:pass@localhost:5432/blueprint_hub_dev"
bunx prisma migrate deploy
```

### 3️⃣ Run Locally

**Backend** (Terminal 1):
```bash
cd backend && cp .env.example .env.local && uv run python app.py
# http://localhost:8000
```

**Frontend** (Terminal 2):
```bash
cd frontend && bun run dev
# http://localhost:3000
```

---

## � Quick Links (Start Here!)

👋 **New to Blueprint Hub?** Use these links to get up to speed:

### For Developers
📖 **[Developer Onboarding Checklist](docs/ONBOARDING.md)** (2-3 hours)
- 7-phase guided tour of the codebase
- Links to all visual diagrams
- Success criteria & next steps
- **Perfect for**: New hires, self-paced learning

### For Project Managers
📊 **[GitHub Project Board Setup](docs/PROJECT_BOARD_SETUP.md)** (15 min to set up)
- Step-by-step MCP roadmap creation
- 8 MCP integrations planned for Q2-Q3 2026
- Custom fields & automation configuration
- **Perfect for**: Tech leads, product managers

### For Everyone
💼 **[Stakeholder Benefits Analysis](docs/session-notes/2026-03-02-stakeholder-benefits-analysis.md)**
- Quantified business value ($47K-74K annual productivity gain)
- Time savings by role
- ROI analysis
- **Perfect for**: Leadership, team planning

### Visual System Overview
📐 **[Complete Diagram Library](docs/diagrams/)** (30+ diagrams)
- [Architecture](docs/diagrams/architecture.md) - System components (5 min read)
- [Data Flows](docs/diagrams/data-flow.md) - How data moves through system (10 min)
- [User Journeys](docs/diagrams/user-journey.md) - User experiences (10 min)
- [MCP Integration](docs/diagrams/mcp-integration.md) - Future roadmap (15 min)
- [Deployment](docs/diagrams/deployment.md) - Infrastructure guide (10 min)

**📚 Need more?** See [docs/README.md](docs/README.md) for complete documentation index

---

## �📚 Documentation

**👉 [START HERE: docs/README.md](docs/README.md)** - Complete documentation index

| Document | Purpose |
|----------|---------|
| [docs/MONOREPO_STRUCTURE.md](docs/MONOREPO_STRUCTURE.md) | Architecture & folder layout |
| [docs/FEATURE_ROADMAP.md](docs/FEATURE_ROADMAP.md) | Features & milestones |
| [docs/DEVELOPMENT_PLANS.md](docs/DEVELOPMENT_PLANS.md) | Strategic plans & technical details |
| [docs/API_CONTRACTS.md](docs/API_CONTRACTS.md) | Frontend-Backend API specification |
| [docs/DATABASE_SETUP.md](docs/DATABASE_SETUP.md) | PostgreSQL & Prisma guide |
| [docs/BACKEND_SETUP.md](docs/BACKEND_SETUP.md) | Python FastAPI setup |
| [docs/TypeScript_conventions.md](docs/TypeScript_conventions.md) | Frontend code style |
| [docs/Python_conventions.md](docs/Python_conventions.md) | Backend code style |
| [docs/TESTING_STRATEGY.md](docs/TESTING_STRATEGY.md) | Testing plan & quality assurance strategy (SDLC Standard) |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute |
| [SECURITY.md](SECURITY.md) | Security & deployment checklist |

### 📊 Visual Documentation

Complete system diagrams in [docs/diagrams/](docs/diagrams/):

| Diagram | Purpose |
|---------|---------|
| [Architecture](docs/diagrams/architecture.md) | System components & tech stack |
| [Data Flow](docs/diagrams/data-flow.md) | Sequences, operations & API flows |
| [User Journey](docs/diagrams/user-journey.md) | User experience across personas |
| [MCP Integration](docs/diagrams/mcp-integration.md) | Future architecture & roadmap |
| [Deployment](docs/diagrams/deployment.md) | Infrastructure & DevOps |

---

## ✨ Key Features

- **Granular Data Structure**: 9 standard requirement sections
- **Rich Artifacts**: Text, lists, Mermaid.js diagrams
- **Version Tracking**: V0.1 → V1.0 → V2.0
- **Contribution Workflow**: Suggestion mode for collaborative editing
- **Interactive UI**: Accordion sections, heatmap visualization
- **NextAuth Integration**: Google & GitHub OAuth
- **Type-Safe**: TypeScript strict mode + Python type hints
- **CI/CD Ready**: GitHub Actions workflows for frontend & backend
- **Production Grade**: Rate limiting, validation, error handling

---

## 🛠️ Development

### Code Style

**Frontend**: [TypeScript conventions](docs/TypeScript_conventions.md)  
- Functional components, PascalCase, hooks
- ESLint + Prettier

**Backend**: [Python conventions](docs/Python_conventions.md)  
- PEP 8, type hints, snake_case
- Ruff linter

### Commands

```bash
# Frontend
cd frontend
bun run dev          # Dev server
bun run lint         # Check code
bun run build        # Production build
bunx prisma studio  # Database UI

# Backend
cd backend
uv run python app.py           # Dev server
uv run ruff check .            # Lint
uv run pytest                  # Tests
```

### GitHub Workflows

Automatic CI/CD on push/PR:
- **Frontend**: Linting → TypeScript → Build
- **Backend**: Linting → Type check → Tests

---

## 🤝 Contributing

1. Read [CONTRIBUTING.md](CONTRIBUTING.md) & [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
2. Fork & create branch: `git checkout -b feature/amazing-feature`
3. Follow code conventions
4. Run: `lint` & `build`
5. Use [PR template](.github/PULL_REQUEST_TEMPLATE.md)

**Templates:**
- [Bug Report](https://github.com/special_project_v1/issues/new?template=bug_report.md)
- [Feature Request](https://github.com/special_project_v1/issues/new?template=feature_request.md)

---

## 🔒 Security

**Found a vulnerability?** Email: `security@example.com` (do NOT open public issues)

Production checklist in [SECURITY.md](SECURITY.md):
- ✅ Database backups
- ✅ Rate limiting
- ✅ HTTPS/TLS
- ✅ CORS configured
- ✅ Input validation
- ✅ Secrets in env vars

---

## 📊 Tech Stack

| Layer | Tech | Package Mgr |
|-------|------|-------------|
| **Frontend** | Next.js 16 + React 19 + TypeScript + Tailwind | Bun |
| **Database** | PostgreSQL + Prisma ORM | Bun |
| **Auth** | NextAuth.js (OAuth) | Bun |
| **Backend API** | Python 3.11 + FastAPI | uv |
| **Diagrams** | Mermaid.js | CDN |

---

## 📊 Project Status

| Phase | Status | Timeline |
|-------|--------|----------|
| MVP Features | ✅ | Mar 2026 |
| Monorepo Architecture | ✅ | Mar 2026 |
| Documentation | ✅ | Mar 2026 |
| Multi-turn LLM | 🔄 | Q2 2026 |
| Traceability Matrix | 📋 | Q3 2026 |
| Visual Design Mode | 📋 | Q3 2026 |

---

## 🆘 Troubleshooting

**Frontend won't start?**
- `rm -rf frontend/node_modules && cd frontend && bun install`
- Check `.env.local` has all OAuth credentials
- Ensure PostgreSQL running: `pg_isready`

**Backend API not responding?**
- Check: `curl http://localhost:8000/docs`
- `rm -rf backend/.venv && cd backend && uv sync`
- Verify `DATABASE_URL` in `.env.local`

**OAuth not working?**
- Verify GitHub/Google callback URLs: `http://localhost:3000/api/auth/callback/{provider}`
- Ensure `NEXTAUTH_SECRET` is set

**Database issues?**
- Test connection: `psql $DATABASE_URL -c "SELECT 1"`
- Frontend: `bunx prisma db push`
- Check logs: `tail -f backend/.logs`

---

## 📖 Resources

- [Next.js](https://nextjs.org/) | [Prisma](https://www.prisma.io/) | [Auth.js](https://authjs.dev/)
- [FastAPI](https://fastapi.tiangolo.com/) | [uv](https://docs.astral.sh/uv/) | [Mermaid](https://mermaid.js.org/)

---

## 📄 License

TBD

---

## 📞 Support

| Type | Where |
|------|-------|
| 🐛 Bug | [GitHub Issues](https://github.com/special_project_v1/issues/new?template=bug_report.md) |
| ✨ Feature | [GitHub Issues](https://github.com/special_project_v1/issues/new?template=feature_request.md) |
| 💬 Question | GitHub Discussions |
| 🔐 Security | security@example.com |

---

**Last Updated**: March 2026 | **Version**: 0.1.0 (MVP) | **Maintained By**: Development Team
