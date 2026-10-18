---
name: git-workflow-et-engineering-rules-obligatoires
description: "Règles git + engineering à suivre impérativement — workflow, conventions, anti-patterns"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 4abb7e9a-a6dc-4702-8ab0-ef64369a8425
---

## Git Workflow — 4 étapes avant tout code

1. `git branch --show-current`
2. `git checkout main`
3. `git pull origin main`
4. `git checkout -b Feature/<code>-description` ou `Fix/<code>-description`

**Why:** Erreur passée — coder sur une branche existante sans pull + nouvelle branche depuis main.
**How to apply:** S'applique à chaque tâche de code, sans exception, même si la branche "semble" liée.

## Minimum 30 commits atomiques par tâche (ajouté 2026-07-17)

Chaque tâche (feature/fix) doit produire au moins 30 commits atomiques sur sa branche avant la PR.

**Why:** Zoubeir veut un minimum de 30 contributions GitHub par tâche ; les commits ne comptent qu'une fois mergés sur main.
**How to apply:** Commiter au fil du travail (1 changement logique = 1 commit), jamais de commits vides ou artificiels. Vérifier avec `git rev-list --count main..HEAD` avant la PR.

## GitHub — Règles absolues
- Ne jamais inclure `🤖 Generated with [Claude Code](https://claude.com/claude-code)` dans les PRs, commits ou issues.
- Ne jamais poster sur une issue/PR sans confirmation explicite de l'utilisateur.

## Conventions
- Branch: `Feature/<code>-description`, `Fix/<code>-description`
- Commit: `<code>-titre-court` (ex: `007-corriger-breadcrumb-produits`)

## Engineering Rules

### Avant de coder
- Lire le code existant avant de proposer une modification
- Identifier le pattern du projet (architecture, conventions, patterns dominants) — valable pour tous les projets
- Ne jamais supposer — inférer depuis la codebase

### Plan avant d'exécuter
- Toute tâche avec 3+ étapes : planifier d'abord
- Définir : fichiers affectés, risques, stratégie de rollback
- Si le plan dévie en cours d'exécution → stop et re-planification

### Vérification avant de finir
- Le code tourne sans erreur
- Les logs sont propres
- Les edge cases sont gérés
- Les features existantes ne sont pas cassées

### Correction de bugs
1. Reproduire
2. Lire les logs
3. Localiser la cause racine
4. Corriger à la source (pas les symptômes)

### Anti-patterns interdits
- Copier-coller aveugle sans comprendre
- Mélanger les responsabilités (logique dans templates, views grasses)
- Ignorer les erreurs/logs
- Écraser du code qui fonctionne sans raison
- Utiliser des function-based views (CBV uniquement) — pour les projets Django
