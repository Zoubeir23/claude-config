---
name: one-shot-feature
description: >
  Implement a complete, production-ready backend feature in a single iteration — from analysis
  to tested code — respecting the project's existing architecture, conventions, and patterns.
  Supports Django, FastAPI, SpringBoot, and Express/Node.js. Use this skill whenever the user
  asks to add a new feature, endpoint, service, model, or any backend functionality to an
  existing project. Also use it when the user says things like "ajoute un endpoint",
  "crée un service", "implémente cette feature", "add CRUD for X", "I need a new API route",
  or any request that involves building something new on top of an existing backend codebase —
  even if they don't explicitly mention "one-shot" or "feature". Do NOT use for pure refactoring,
  architecture migrations, or debugging existing code.
---

# One-Shot Feature

Deliver a complete backend feature — models, services, endpoints, validations, tests — in one
pass, production-ready, matching the project's style and architecture exactly.

The whole point of this skill is to minimize back-and-forth. A developer (beginner or experienced)
describes what they want, and they get working, integrated code that feels like *they* wrote it,
because it follows every convention their project already uses.

## How It Works

Four phases, always in order. Never skip Phase 1 — it's what makes the output actually fit
the project instead of being generic boilerplate.

---

## Phase 1: Project Analysis

Before writing a single line of code, understand the project deeply. This is the foundation —
without it, the generated code will feel foreign to the codebase.

### What to discover

1. **Framework & structure** — Which framework (Django, SpringBoot, FastAPI, Express)? Map the
   directory hierarchy. Identify the main modules (apps, packages, modules).

2. **Architecture & patterns** — What's the layered structure? (MVC, Clean Architecture, etc.)
   Trace the request-response flow. Understand how data moves through the layers.

3. **Code conventions** — Naming style (snake_case vs camelCase), import patterns
   (absolute vs relative), docstring style, formatting. Match these exactly.

4. **Reusable components** — Find existing utilities, helpers, base classes, decorators,
   middleware, mixins. These are gold — reuse them instead of reinventing.

5. **Dependencies & config** — Read requirements.txt / pom.xml / package.json. Check settings
   files. Note environment variables in use.

For framework-specific analysis guidance, read the relevant reference file:
- Django/FastAPI → `references/django.md`
- SpringBoot → `references/springboot.md`

### Output a brief summary

After analysis, produce a short structured summary (in the conversation, not a file):
- Framework & architecture pattern detected
- Key conventions found
- Reusable components identified

This summary is for the developer's benefit — it confirms you understood their project correctly
before you start building.

---

## Phase 2: Feature Planning

Create a concrete implementation plan before coding. This catches misunderstandings early and
gives the developer a chance to course-correct.

### Plan structure

1. **Understand the feature** — What's the goal? What are the acceptance criteria? What error
   cases matter? What validations are needed?

2. **Map the impact** — Which layers are affected?
   - Models / Entities (data structures)
   - Repositories / DAOs (data access, if separate)
   - Services (business logic)
   - Controllers / Views (endpoints)
   - Serializers / DTOs (data transformation)
   - Migrations (schema changes)
   - Tests
   - Configuration

3. **List all files** — For each file: action (CREATE / MODIFY), path, and what changes.

4. **Identify reuse** — Which existing services, decorators, helpers, or patterns to leverage.

5. **Order the work** — Dependencies between tasks determine the sequence. Always:
   Data layer → Business logic → API layer → Validations → Tests

### Show the plan

Present the plan to the developer before coding. Format it clearly:

```
## Implementation Plan: [Feature Name]

### Layers affected
- [list]

### Files
- CREATE: path/to/new_file.py — [purpose]
- MODIFY: path/to/existing_file.py — [what changes]

### Tasks (in order)
1. [Layer] — Description
2. [Layer] — Description
...

### Reusing from project
- [existing component] for [purpose]
```

If the feature is straightforward and the developer seems experienced (they gave precise specs),
you can present the plan briefly and proceed. If the request is ambiguous, ask clarifying
questions before planning.

---

## Phase 3: Implementation

Now build it. Follow the plan. Match the project's style exactly.

### Principles

- **Reuse first** — Always prefer existing utilities, base classes, and patterns over new ones.
  If the project has a `BaseService`, inherit from it. If there's a custom exception handler,
  use the same pattern.

- **Match conventions** — If every view in the project uses `class-based views`, don't introduce
  a function-based view. If every service method has a docstring, add one to yours.

- **Scope discipline** — Only touch what the feature requires. Don't refactor adjacent code,
  don't "improve" things you noticed, don't add features that weren't asked for.

- **Explain the non-obvious** — Add comments where the code does something that isn't
  self-evident. Skip comments for things that are obvious from the code itself. If the developer
  is a beginner (they said so, or the codebase suggests it), add brief explanations of
  *why* patterns are used, not just *what* they do.

- **Validate at boundaries** — Input validation on API endpoints and service entry points.
  Trust internal code. Don't over-validate.

- **Handle errors like the project does** — If the project uses custom exception classes, use
  them. If it returns specific error response formats, match them exactly.

### Implementation order

Follow the natural dependency order:

1. **Models / Entities** — Data structures first
2. **Migrations** — Schema changes (Django: makemigrations reminder; SpringBoot: Flyway/Liquibase)
3. **Repositories / DAOs** — If the project separates data access
4. **Services** — Business logic
5. **Serializers / DTOs** — Request/response transformation
6. **Controllers / Views** — API endpoints
7. **URL routing** — Wire up the endpoints
8. **Tests** — Unit tests covering happy path + key error cases

---

## Phase 4: Validation & Summary

After implementation, verify everything holds together.

### Validation checklist

- All imports resolve correctly
- File structure follows project conventions
- Existing services/utilities are reused (not duplicated)
- Error handling matches project patterns
- Response format matches other endpoints
- Tests cover the main scenarios
- No breaking changes to existing APIs

Run any available linting/compilation checks to catch issues.

### Final summary

Present a concise summary:

```
## Done: [Feature Name]

**Created:** [N] files
**Modified:** [N] files
**Tests:** [N] test cases

### What was built
- [brief description of each component]

### Suggested commit message
feat([scope]): [description]

- [change 1]
- [change 2]

### Next steps
1. Run tests: [command]
2. Run migrations: [command] (if applicable)
3. [anything else]
```

---

## Beginner Support

When working with developers who are learning (they mention being new, or the codebase is
a tutorial-style project), adjust your approach:

- In the Phase 1 summary, briefly explain the architecture pattern you detected and why it
  matters
- In the plan, explain *why* things go in a certain order
- In implementation, add short comments explaining patterns (e.g., "We inherit from
  `ModelSerializer` because it auto-generates fields from the model")
- In the summary, suggest resources if a complex pattern was used

This isn't about being condescending — it's about turning feature implementation into a
learning moment. A beginner who sees *why* code is structured a certain way learns faster
than one who just gets working code dropped on them.

---

## Framework References

For detailed framework-specific patterns, conventions, and implementation guides:

| Framework   | Reference file              |
|-------------|----------------------------|
| Django/DRF  | `references/django.md`     |
| FastAPI     | `references/django.md` (Python patterns section) |
| SpringBoot  | `references/springboot.md` |
| Express     | Follow project conventions; no dedicated reference |

Read the relevant reference file during Phase 1 when you identify the framework.
