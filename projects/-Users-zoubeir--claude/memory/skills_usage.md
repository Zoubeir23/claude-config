---
name: Skills installés et utilisation
description: 136 skills Claude Code installés — sources, catégories, comment en ajouter
type: reference
---

## Source principale

Tous les skills viennent de **affaan-m/everything-claude-code** (118k+ stars, installés le 2026-03-30).
Les skills custom antérieurs ont été conservés.

## Catégories

**Agents & IA** : agentic-engineering, ai-first-engineering, autonomous-loops, continuous-agent-loop, agent-eval, agent-harness-construction, mcp-server-patterns, claude-api, eval-harness, cost-aware-llm-pipeline, deep-research, context-budget, token-budget-advisor, prompt-optimizer, verification-loop, codebase-onboarding

**Fullstack** : nextjs-turbopack, nuxt4-patterns, frontend-patterns, frontend-design, ui-ux-pro-max, backend-patterns, api-design, python-patterns, python-testing, postgres-patterns, database-migrations

**Tests & qualité** : tdd-workflow, e2e-testing, security-review, security-scan, benchmark, ai-regression-testing, plankton-code-quality

**DevOps** : docker-patterns, deployment-patterns, git-workflow

**Mobile** : flutter-* (14 skills), android-clean-architecture, swift-*, kotlin-*, compose-multiplatform-patterns, swiftui-patterns

**Backend** : rust-patterns, rust-testing, golang-patterns, golang-testing, java-coding-standards, springboot-*, laravel-*, django-patterns, django-security, django-tdd

**SEO** : alert-manager, backlink-analyzer, competitor-analysis, keyword-research, on-page-seo-auditor, technical-seo-checker, seo-content-writer, serp-analysis, rank-tracker, etc.

**Auth & Identity** : auth0-react, auth0-nextjs, auth0-vue, auth0-angular, auth0-express, auth0-fastify, auth0-mfa, auth0-migration, auth0-quickstart, auth0-react-native, auth0-nuxt

**Marketing & contenu** : marketing-copy, landing-page-architect, content-quality-auditor, content-refresher, article-writing

**Skill system** : skill-creator, skill-comply, skill-stocktake, find-skills

## Comment ajouter un skill manuellement

```bash
# Via gh API + base64
mkdir -p ~/.claude/skills/<nom>
gh api "repos/<owner>/<repo>/contents/skills/<nom>/SKILL.md" --jq '.content' | base64 -d > ~/.claude/skills/<nom>/SKILL.md
```

## Observation

Les skills sont chargés au démarrage de session. Un skill ajouté en cours de session sera disponible à la prochaine session.
