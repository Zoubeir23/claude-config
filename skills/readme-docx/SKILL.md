---
name: readme-docx
description: >
  Generate complete, professional project documentation in one shot — a polished README.md with
  tech stack badges AND a full docs/ folder containing Word (.docx) documents organized by topic
  (Getting Started, Architecture, API Reference, Database, Deployment, etc.). Use this skill
  whenever the user asks to "create documentation", "generate a README", "make a docs folder",
  "document my project", "write a docx for my API", or any request involving producing
  structured project documentation. Supports Django, FastAPI, SpringBoot, React, Node.js,
  and any other stack. Also trigger when the user says things like "fais-moi une doc complète",
  "crée un README professionnel", or "génère la documentation de mon projet".
---

# Readme-DocX

Generate complete, production-ready documentation for a software project: a polished
`README.md` with shields.io badges + a structured `docs/` folder containing `.docx` files
organized by section. One request, fully documented project.

The goal is documentation that looks like it was written by a senior developer who cares
about quality — not generic boilerplate. That means reading the actual project, understanding
what it does, and producing docs that reflect reality.

---

## Output Structure

```
project-root/
├── README.md
└── docs/
    ├── TABLE-OF-CONTENTS.md
    ├── 1-GETTING-STARTED/
    │   ├── README.md
    │   ├── 01-Installation.docx
    │   ├── 02-Configuration.docx
    │   └── 03-Quick-Start.docx
    ├── 2-ARCHITECTURE/
    │   ├── README.md
    │   ├── 01-System-Overview.docx
    │   ├── 02-Project-Structure.docx
    │   └── 03-Design-Patterns.docx
    ├── 3-FEATURES/
    │   ├── README.md
    │   └── (one .docx per major feature)
    ├── 4-API-REFERENCE/          ← if project has an API
    │   ├── README.md
    │   ├── 01-Endpoints.docx
    │   ├── 02-Authentication.docx
    │   └── 03-Error-Handling.docx
    ├── 5-DATABASE/               ← if project has a DB
    │   ├── README.md
    │   ├── 01-Schema.docx
    │   └── 02-Models.docx
    ├── 6-DEPLOYMENT/
    │   ├── README.md
    │   └── (docker, env setup, CI/CD)
    ├── 7-DEVELOPMENT/
    │   ├── README.md
    │   └── (setup, coding standards, tests)
    └── 8-TROUBLESHOOTING/
        ├── README.md
        └── 01-Common-Issues.docx
```

Adapt the sections to what the project actually needs. A simple CLI tool doesn't need
API Reference or Database sections. A frontend app needs a Styling/Components section.
Use judgment — the structure above is a starting point, not a rigid template.

---

## Phase 1: Analyze The Project

Read the project before writing anything. What you produce should reflect what the project
actually is, not a generic "project" placeholder.

Discover:
- **Type**: API, web app, library, CLI, fullstack?
- **Stack**: framework, language, DB, cloud services
- **Main features**: what does it do for users?
- **Entry points**: main files, routes, models
- **Config and env vars**: what needs to be configured?
- **Dependencies**: requirements.txt, pom.xml, package.json

After analysis, briefly state what you found before asking any clarifying questions. Something
like "I see this is a Django REST API with PostgreSQL, JWT auth, and 8 main endpoints. I'll
document it as..." — this confirms you understood the project and builds trust.

If you don't have access to the codebase (user describes the project verbally), ask about:
- Framework + version
- Main features
- Database and auth setup
- Is it deployed? Where?

---

## Phase 2: Plan The Sections

Not every project needs all 8 sections. Choose based on the project type:

| Project type | Sections to include |
|---|---|
| REST API (Django/FastAPI/Spring) | All 8 sections |
| Frontend app (React/Vue) | Getting Started, Architecture, Features, Styling, Deployment, Development |
| Full-stack app | All 8 sections + a Frontend section |
| Library/SDK | Getting Started, API Reference, Examples, Development |
| CLI tool | Getting Started, Features, Development |

Show the plan to the user (sections + number of docs per section) before creating everything.
Keep it brief — a simple list is fine. This catches misunderstandings before you've done all
the work.

---

## Phase 3: Create README.md

The README is what people see first — make it count.

Structure:
1. **Title + description** — catchy, one sentence that says what it does
2. **Features list** — 4-6 bullet points, benefits not just capabilities
3. **Tech stack with shields.io badges** — organized by Backend/Frontend/DevOps/DB
4. **Quick Start** — the minimal steps to get it running (3-5 steps max)
5. **Documentation links** — links to each docs/ section
6. **Status badges** — license, version, build status
7. **Contributing + License** — brief

For badges, always use shields.io format. Read `references/badges.md` for the full badge
library organized by technology category.

The Quick Start section is the most important part of the README after the title. A developer
who can run the project in 2 minutes is more likely to use it. Make it concrete and complete.

---

## Phase 4: Create The .docx Files

Each `.docx` is a self-contained document. Use `python-docx` to generate them programmatically
— this is faster, more consistent, and produces better results than generating markdown and
converting it.

For the exact styling specs (fonts, colors, sizes, spacing), read `references/docx-styling.md`.

Structure of each document:
1. **Title page** — document title, project name, date, version
2. **Table of contents** (for docs longer than ~5 sections)
3. **Content** — headings, paragraphs, code blocks, tables, lists
4. **Navigation footer** — "Part of [Project] documentation — [Section Name]"

Write a Python script to generate all the `.docx` files at once, then run it. Don't create
files one by one manually — scripting it is faster and keeps styling consistent across all
documents. Save the script as `docs/generate_docs.py` so the user can regenerate docs later.

For content templates specific to each section type (Installation, API Reference, etc.),
read `references/templates.md`.

---

## Phase 5: Create Section READMEs and Table Of Contents

Each docs/ subfolder needs a `README.md` that:
- Lists the documents in that section with a one-line description each
- Provides navigation links to sibling sections

The root `docs/TABLE-OF-CONTENTS.md` links to every document in the entire docs/ tree.
This is the main navigation hub.

---

## Delivery Summary

After everything is created:

```
✅ Documentation ready: [Project Name]

📄 README.md + [N] .docx documents across [N] sections
📁 docs/ structure created with navigation READMEs
🐍 docs/generate_docs.py — regenerate docs anytime

Next steps:
1. Review and adjust content that I couldn't infer from the code
2. Add screenshots if relevant (Architecture Overview especially)
3. Run: python docs/generate_docs.py to regenerate after updates
```

---

## Adapting To The Developer

**Beginner projects**: Explain concepts inside the docs ("Why we use migrations", "What JWT
means"). More a learning resource than a reference manual. Keep language accessible.

**Professional/team projects**: Technical, precise, assumes developer knowledge. Focus on
conventions, decision rationale, onboarding for new team members.

**Open source projects**: Add Contributing section, Code of Conduct, issue template guidance.
Public-facing language — clear, welcoming.

---

## Reference Files

- `references/badges.md` — Complete shields.io badge library (Python, Java, JS, DB, DevOps)
- `references/docx-styling.md` — Exact font, color, spacing specs for Word documents
- `references/templates.md` — Content templates for each section type
