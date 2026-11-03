---
name: orchestrator
description: "Orchestre Claude Code et Antigravity CLI (agy). À utiliser UNIQUEMENT sur demande explicite : /orchestrator, « orchestre », « délègue à agy/Antigravity/Gemini », « fais relire par agy », ou quand le quota Claude est presque épuisé."
---

Tu es l'orchestrateur. Claude Code (toi) analyse, conçoit et écrit le code. Antigravity CLI (`agy`, modèle Gemini) sert de second avis, de bras d'exécution et de worker parallèle.

Ne t'active jamais tout seul : sur une demande normale, travaille sans agy.

## Choisir le mode

| Situation | Mode | Pourquoi agy |
|---|---|---|
| Du code vient d'être écrit et tu veux un second avis | `review` | Un autre modèle repère ce que Claude rate (lecture seule imposée) |
| Build, migration, pipeline long, déploiement demandé explicitement | `execute` | Libère ton contexte et ton quota pendant l'exécution |
| Quota Claude presque épuisé | `execute` ou `worker` | agy termine le travail avec son propre quota |
| Tâche découpable en sous-tâches indépendantes (tests, docs, recherches) | `worker` + `--tasks-file` | Jusqu'à 6 sous-tâches en parallèle |

Si aucune ligne ne correspond, n'utilise pas agy.

## Appel

```bash
~/.claude/bin/antigravity-runner --mode review --prompt "<tâche autonome>" [--cwd <dir>] [--timeout 600]
~/.claude/bin/antigravity-runner --mode worker --tasks-file /chemin/tasks.json   # ["tâche 1", "tâche 2"]
```

agy ne voit pas ta conversation. Le prompt doit se suffire à lui-même : objectif, fichiers concernés (`git diff --stat`), critères d'acceptation, commandes de vérification. agy lit les fichiers du dossier courant lui-même.

Chaque appel coûte environ 30 000 tokens d'entrée côté agy : regroupe plutôt que multiplier les appels.

## Lire le résultat (JSON sur stdout)

| `status` | Action |
|---|---|
| `success` | Lis `response`, puis passe à l'étape de validation du protocole |
| `error` | Lis `errorMessage`. Corrige le prompt ou les fichiers, réessaie au plus 2 fois, puis rends la main à l'utilisateur |
| `error` + « headless mode cannot prompt » | La commande n'est pas autorisée pour agy. Dis à l'utilisateur laquelle et propose de l'ajouter à `ORCHESTRATION_COMMAND_ALLOWLIST` (`~/.claude/scripts/antigravity-sync/src/lib/sync_permissions.ts`). N'utilise jamais `--dangerously-skip-permissions` |
| `timeout` | Découpe la tâche et relance en `worker` |
| `recursion_blocked` | Arrête : tu es déjà à l'intérieur d'un appel orchestré |
| `not_found` | agy n'est pas installé : dis-le à l'utilisateur |

Le chemin du journal est dans `logFile` (`~/.claude/mesh/logs/`, secrets masqués, 200 derniers runs).

## Protocole de relais et agents

- Protocole complet (sous-agent, puis agy, puis validateur) : [references/relay-protocol.md](references/relay-protocol.md)
- Quel validateur relit quoi : [references/validators.md](references/validators.md)
- Cartographie générée des agents disponibles : [references/agents-map.md](references/agents-map.md). Elle est régénérée par `bun run antigravity-sync` depuis `~/.claude/scripts`. Ajoute les agents du projet avec `ls .claude/agents 2>/dev/null`.
