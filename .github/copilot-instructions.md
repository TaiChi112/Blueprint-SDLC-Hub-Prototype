# Copilot Instructions (Monorepo)

## 1) Project overview (source of truth)
- This project is a **monorepo**:
  - `frontend/` = Next.js App Router + TypeScript + Tailwind
  - `backend/` = Python FastAPI (LLM generation + integrations)
  - `docs/` = roadmap, setup, session notes
- Current frontend runs on `localhost:3000`
- Backend API runs on `localhost:8000`
- Database: PostgreSQL (via Prisma on frontend side)

## 2) Active architecture and flows
- Main frontend routes:
  - `/` home
  - `/generator-test` generate/edit/save specs
  - `/profile` user profile
- Save flow:
  - Generate content from backend LLM endpoint
  - Persist via frontend API routes (Prisma) to PostgreSQL
- Publish flow:
  - `isPublished` controls visibility on homepage
- Auth flow:
  - NextAuth OAuth (Google/GitHub), not mocked login

## 3) Coding conventions
- **STRICT TYPESCRIPT: NO `any` types allowed** - define proper interfaces or use type guards instead
  - ❌ Bad: `const x = data as any`
  - ✅ Good: Define `interface MyData { ... }` and use `const x = data as MyData`
  - ✅ Good: Use type guards: `(data): data is MyType => { return ... }`
- Prefer minimal, safe edits. Do not refactor unrelated files.
- Keep UI consistent with existing navbar/theme choices.
- For Next.js images, always define width/height and keep host whitelist in config.
- Keep API contracts backward-compatible unless explicitly requested.
  - `/d/RepositoryVS/Python/COS2210` (backup must remain intact)

## 5) Documentation and memory policy (important)
When user asks for planning/strategy/important decisions:
1. Save a session note to `docs/session-notes/YYYY-MM-DD-topic.md`
2. Update `docs/session-notes/README.md` index
3. Avoid duplicate notes; reference existing files when possible

Session notes must include:
- Context/problem
- Decision made
- Alternatives considered + tradeoffs
- Action items (next steps)
- Affected files/routes

## 6) Response and execution policy
- If user is in Ask/Plan mode: provide exact patch/content and ask to switch to Agent for file writes.
- If user asks to “save note only”: perform save operation and reply with exactly 1 line: `✅ Saved: <path-to-note>`
- For code changes, always list:
  - Changed files
  - What/why
  - Quick verify commands

## 7) Verification checklist before finishing
- Frontend:
  - `cd frontend && bun run lint` (or npm/pnpm equivalent)
  - `cd frontend && bun run build` (if requested)
- Backend:
  - Validate endpoint behavior and basic error handling for changed routes
- Confirm no accidental path breaks after monorepo move
- If any session note was created/updated in this task:
  - MUST update `docs/session-notes/README.md` index in the same task before final response

## 8) High-priority docs to keep in sync
- `README.md`
- `TODO.md`
- `docs/FEATURE_ROADMAP.md`
- `docs/DEVELOPMENT_PLANS.md`
- `docs/BACKEND_SETUP.md`
- `docs/session-notes/README.md`

## 9) Completion handshake (required)
After finishing any task, always do all of the following:
1. Ask the user one direct follow-up question before closing.
2. Suggest 1-3 high-value next actions relevant to the work just completed.
3. Provide copy-ready prompts the user can run immediately (short, concrete, action-oriented).

Follow-up question style (use this exact style when possible):
- "อยากให้ผมเพิ่ม ‘กติกา auto-save’ ต่อเลยไหม (เช่น ถ้าคุยเกิน 8 ข้อความ หรือมีคำว่า plan/decision ให้บันทึก session note อัตโนมัติ)?"

Response style requirements for this step:
- Keep it concise and practical.
- Prefer "do now" options over broad brainstorming.
- If session-note-worthy decisions were made, include a save prompt option.

Auto-save policy hints (agent behavior):
- If conversation includes planning/strategy/decision content, suggest saving note immediately.
- If user confirms save intent (e.g., "บันทึกการคุยครั้งนี้..."), execute save without extra explanation.
- Recommended trigger to suggest auto-save: chat length > 8 turns or explicit keywords: `plan`, `decision`, `tradeoff`, `architecture`.

Prompt handoff rule:
- Always provide prompts that users can append extra requirements to on the same line.
- Format: base action first, then allow extension after " + ...".

Prompt format examples:
- "บันทึกการคุยครั้งนี้เกี่ยวกับ <topic>"
- "ทำ <specific change> ต่อทันที พร้อมตรวจสอบผล"
- "สรุป diff เฉพาะไฟล์ที่เปลี่ยนพร้อมเหตุผลแบบสั้น"

Appendable prompt examples:
- "บันทึกการคุยครั้งนี้เกี่ยวกับ <topic> + เน้นการตัดสินใจและทางเลือก"
- "ทำ <specific change> ต่อทันที พร้อมตรวจสอบผล + ห้ามแก้ไฟล์อื่น"
- "สรุป diff เฉพาะไฟล์ที่เปลี่ยนพร้อมเหตุผลแบบสั้น + จัดลำดับตามความสำคัญ"

## 10) Macro prompts (Ask / Plan / Agent)
Use these as copy-ready prompts and append constraints with ` + ...`.

### Ask (quick answers)
1. "อธิบาย flow ของฟีเจอร์นี้แบบสั้น + ยกตัวอย่าง request/response"
2. "ช่วยตรวจความเสี่ยงของแนวทางนี้ + สรุป tradeoff 3 ข้อ"
3. "สรุปไฟล์ที่ควรแก้สำหรับงานนี้ + ห้ามแก้โค้ด"

### Plan (execution strategy)
4. "วางแผนงานนี้เป็น 5 ขั้น + บอกลำดับที่ควรทำก่อนหลัง"
5. "เปรียบเทียบ 2 ทางเลือกนี้ + แนะนำทางที่เหมาะกับ MVP"
6. "ทำ implementation checklist สำหรับงานนี้ + เพิ่ม acceptance criteria"

### Agent (do changes)
7. "ทำงานนี้ต่อทันที พร้อมตรวจสอบผล + ห้ามแก้ไฟล์นอก scope"
8. "บันทึกการคุยครั้งนี้เกี่ยวกับ <topic> + อัปเดต session index ด้วย"
9. "สรุป diff เฉพาะไฟล์ที่เปลี่ยนพร้อมเหตุผลแบบสั้น + เรียงตามผลกระทบสูงสุด"
10. "รีวิว copilot-instructions.md ให้กระชับขึ้น + คง policy สำคัญทั้งหมด"
