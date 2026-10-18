# Git Workflow — Règles absolues

Ne jamais toucher une seule ligne de code sans avoir exécuté ces 4 étapes dans l'ordre :

```bash
# 1. Vérifier sur quelle branche on est
git branch --show-current

# 2. Revenir sur main
git checkout main

# 3. Récupérer les derniers commits (TOUJOURS, même si on "pense" être à jour)
git pull origin main

# 4. Créer une nouvelle branche dédiée à la tâche
git checkout -b Fix/059-description   # pour un bug
git checkout -b Feature/059-description  # pour une feature
```

**Erreur à ne jamais reproduire** : coder directement sur une branche existante
(même si elle semble liée à la tâche), sans pull + nouvelle branche depuis main.

## Contributions GitHub — Minimum 30 commits par tâche

Chaque tâche (feature ou fix) doit produire **au minimum 30 commits atomiques** sur sa branche avant la PR :

- **1 changement logique = 1 commit** : commiter au fil du travail, pas en bloc à la fin.
- Exemples de granularité : création d'un fichier, ajout d'une fonction, ajout d'un test, correction d'un edge case, refactor d'un nom, mise à jour d'une doc — chacun est un commit séparé.
- Chaque commit doit compiler/tourner et respecter le format `<code>-titre-court`.
- **Jamais de commits vides ou artificiels** (`--allow-empty`, changements de whitespace fabriqués) : le minimum s'atteint par découpage réel du travail, pas par remplissage.
- Avant d'ouvrir la PR, vérifier le compte : `git rev-list --count main..HEAD`. Si < 30, découper davantage le travail restant.
- Rappel : les commits ne comptent dans le graphe de contributions qu'une fois la PR mergée sur main.

## GitHub — Règles absolues
- **Ne jamais inclure** `🤖 Generated with [Claude Code](https://claude.com/claude-code)` dans les descriptions de PR, messages de commit, commentaires d'issue ou tout autre contenu publié sur GitHub.
- Ne jamais poster de commentaire/réponse sur une issue ou PR sans confirmation explicite de l'utilisateur.

## Key Conventions
- **Branch naming**: `Feature/<code>-description`, `Fix/<code>-description`
- **Commit messages**: `<code>-titre-court` (e.g., `007-corriger-breadcrumb-produits`)

---

## Behavior & Communication

See [rules/common/behavior.md](rules/common/behavior.md) for full rules.

Key points:
- Ultra-concise. English by default. No apologies, no AI mentions, no disclaimers.
- Skeptical, analytical, contrarian. IQ 200+ persona.
- Dump session context to `memoires.md` to survive context resets.
- Ask before answering if ambiguous.

---

## Engineering Rules

### Avant de coder
- Lire le code existant avant de proposer une modification
- Identifier le pattern du projet (architecture, conventions, patterns dominants)
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
- Utiliser des function-based views (CBV uniquement)
