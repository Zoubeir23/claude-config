# Protocole de relais

S'applique uniquement quand l'orchestrateur est activé explicitement.

## 1. Cadrer

1. Reformule la demande en une phrase d'objectif et 2 à 5 critères d'acceptation vérifiables.
2. Inspecte le projet courant : stack, conventions, `git status`, agents du projet (`ls .claude/agents 2>/dev/null`).
3. Choisis le mode (review, execute ou worker) avec le tableau de SKILL.md. Si aucun mode ne s'applique, fais le travail sans agy.

## 2. Concevoir et rédiger : sous-agent producteur

Sélectionne dans [agents-map.md](agents-map.md) le sous-agent dont le rôle correspond :

| Besoin | Sous-agent |
|---|---|
| Plan, découpage, risques | `planner`, ou `architect` pour une décision d'architecture |
| Feature ou fix avec tests d'abord | `tdd-guide` |
| Django | `django-senior-dev` |
| Build cassé | `<langage>-build-resolver` ou `build-error-resolver` |
| Base de données, migrations | `database-reviewer` |
| SEO | `seo-directeur`, qui délègue à l'équipe SEO |
| Vercel | `vercel:deployment-expert`, `vercel:ai-architect` |
| Tâche simple | Aucun : fais-la toi-même |

Le producteur écrit les fichiers ou la stratégie. Sa sortie doit lister les fichiers modifiés et les commandes de vérification.

## 3. Passer le relais à agy pour l'exécution technique

Une fois que le producteur a terminé :

1. Construis un prompt autonome :
   - objectif ;
   - liste des fichiers (`git diff --stat`) ;
   - commandes à lancer (build, tests, migration) ;
   - critères d'acceptation ;
   - ce qu'agy ne doit pas toucher.
2. Appelle `~/.claude/bin/antigravity-runner --mode execute --prompt "..."`, ou `--mode worker --tasks-file` si les sous-tâches sont indépendantes.
3. Traite le `status` comme décrit dans SKILL.md.

## 4. Valider la sortie d'agy : sous-agent validateur

1. Récupère le résultat : `response` d'agy, puis `git diff` pour voir ce qu'agy a réellement changé.
2. Confie la relecture au validateur correspondant, selon [validators.md](validators.md).
3. Selon le verdict du validateur :
   - **CRITICAL ou HIGH** : corrige toi-même ou via le producteur, puis relance l'étape 3 (au plus 2 boucles).
   - **Sinon** : résume à l'utilisateur ce qui a été fait, vérifié et laissé de côté.

## Variante second avis (mode review)

Pour faire relire par un autre modèle du code écrit par Claude, lance `--mode review` après l'étape 2, en plus du validateur Claude. Si les deux verdicts divergent, présente les deux à l'utilisateur sans trancher à sa place.

## Garde-fous

- Ne commite et ne pousse jamais dans le cadre du relais. Les règles git de CLAUDE.md restent souveraines.
- Ne fais jamais transiter de secret dans un prompt agy. Les journaux sont masqués, mais le prompt part chez le fournisseur du modèle.
- Un seul niveau de délégation : agy ne rappelle jamais l'orchestrateur (`recursion_blocked`).
