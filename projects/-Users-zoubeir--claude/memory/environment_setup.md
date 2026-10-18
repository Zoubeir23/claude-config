---
name: Environnement Claude Code de Zoubeir
description: Setup complet ~/.claude — hooks, scripts, agents, skills, rules, commands, contexts, exemples
type: project
---

Le répertoire de travail principal est `/Users/zoubeir/.claude`.

## Hooks configurés (`settings.json`)

- `PreToolUse:Bash` → valide les commandes via `bun /Users/zoubeir/.claude/scripts/command-validator/src/cli.ts`
- `SessionStart` → charge le contexte de la session précédente via `scripts/ecc/hooks/session-start.js`
- `PreCompact` → sauvegarde l'état avant compaction via `scripts/ecc/hooks/pre-compact.js`
- `Stop` → son de fin : `afplay -v 0.1 '~/.claude/song/finish.mp3'`
- `Stop` → trace les tokens/coûts dans `~/.claude/metrics/costs.jsonl` via `scripts/ecc/hooks/cost-tracker.js`
- `Stop` → persiste l'état de session via `scripts/ecc/hooks/session-end.js`
- `Stop` → extrait les patterns apprenables via `scripts/ecc/hooks/evaluate-session.js`
- `Notification` → son : `afplay -v 0.1 '~/.claude/song/need-human.mp3'`

## Scripts

- Command validator TypeScript/Bun → `scripts/command-validator/`
- Statusline Bun → `scripts/statusline/`
- Scripts ECC (everything-claude-code) → `scripts/ecc/` :
  - `hooks/` : cost-tracker, session-start/end, evaluate-session, pre-compact + utilitaires
  - `lib/` : utils, package-manager, session-manager, session-aliases, state-store, skill-evolution, etc.
- Package manager par défaut : **bun** (`~/.claude/package-manager.json`)

## Agents (`~/.claude/agents/`)

37 agents au total :
- **Existants** : action, django-senior-dev, explore-codebase, explore-docs, marketing-copy, seo-optimizer, websearch
- **Ajoutés depuis ECC** : architect, planner, chief-of-staff, code-reviewer, typescript-reviewer, python-reviewer, rust-reviewer, go-reviewer, java-reviewer, kotlin-reviewer, cpp-reviewer, flutter-reviewer, database-reviewer, security-reviewer, healthcare-reviewer, build-error-resolver, rust/go/java/kotlin/cpp/pytorch-build-resolver, loop-operator, harness-optimizer, refactor-cleaner, performance-optimizer, tdd-guide, e2e-runner, doc-updater, docs-lookup

## Skills (`~/.claude/skills/`)

136 skills installés depuis everything-claude-code + skills custom antérieurs.
Catégories principales : agents/agentic, fullstack (Next.js, Python, Postgres), tests (TDD, E2E), DevOps, optimisation LLM, mobile (Flutter, Swift, Kotlin), backend (Rust, Go, Java, Spring, Laravel), SEO, auth0, marketing, django.

## Commands (`~/.claude/commands/`)

60 commandes slash depuis ECC : `/verify`, `/tdd`, `/orchestrate`, `/plan`, `/code-review`, `/e2e`, `/eval`, `/git-workflow`, `/security-scan`, `/context-budget`, `/loop-start`, `/multi-*`, etc.

## Rules (`~/.claude/rules/`)

65 fichiers de règles organisés par langage : `common/`, `python/`, `typescript/`, `rust/`, `golang/`, `java/`, `kotlin/`, `cpp/`, `csharp/`, `swift/`, `php/`, `perl/`.
Chaque langage couvre : coding-style, patterns, security, testing, hooks.

## Contexts (`~/.claude/contexts/`)

3 contextes de mode : `dev.md`, `research.md`, `review.md`.

## Examples (`~/.claude/examples/`)

Templates CLAUDE.md par stack : générique, user-level, saas-nextjs, django-api, go-microservice, rust-api, laravel-api + statusline.json alternatif.

## CLAUDE.md global (`~/.claude/CLAUDE.md`)

Actif sur tous les projets. Contient :
- **Git Workflow** : 4 étapes obligatoires avant tout code (branch → main → pull → nouvelle branche)
- **GitHub Rules** : pas de signature Claude Code dans les PRs/commits, pas de post sans confirmation
- **Branch/commit conventions** : `Feature/<code>-desc`, `Fix/<code>-desc`, commit = `<code>-titre-court`
- **Engineering Rules** : lire avant de coder, planifier 3+ étapes, vérifier avant de finir, corriger à la source, anti-patterns interdits (FBV, logique dans templates, etc.)

## Plugins

- Marketplace officielle : `plugins/marketplaces/claude-plugins-official/`
- Plugins activés : `frontend-design@claude-plugins-official`, `skill-creator@claude-plugins-official`

**Why:** Setup très élaboré — l'utilisateur a investi dans l'automatisation complète de son workflow Claude Code.
**How to apply:** S'appuyer sur les outils existants. Le validateur Bash peut bloquer certaines commandes. Toujours respecter le CLAUDE.md global.
