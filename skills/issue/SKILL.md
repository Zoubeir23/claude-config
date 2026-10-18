---
name: issue
description: >
  Récupère tous les issues GitHub assignés à l'utilisateur, les trie par deadline et priorité,
  génère un fichier issues.md avec la liste complète et priorisée, puis recommande par quelle
  issue commencer en premier. Déclencher cette skill dès que l'utilisateur dit "mes issues",
  "mes tickets", "quelles issues j'ai", "génère issues.md", "récupère mes issues GitHub",
  "montre mes tickets assignés", "par quoi je commence", "priorise mes issues",
  "qu'est-ce que j'ai à faire sur GitHub", ou toute demande de récupération et/ou priorisation
  des issues/tickets assignés sur GitHub. Utiliser aussi si l'utilisateur veut savoir
  sur quelle tâche se concentrer ou quelle issue traiter en priorité aujourd'hui.
---

# Issue — Workflow

Tu récupères tous les issues GitHub assignés à l'utilisateur, tu les priorises intelligemment,
et tu génères un fichier `issues.md` clair et actionnable.

---

## Étape 1 — Récupérer les issues

### Contexte : repo courant ou tous les repos ?

- Si l'utilisateur est dans un repo git (`git remote -v` retourne quelque chose) : proposer de chercher dans ce repo ET dans tous ses repos
- Par défaut : chercher dans **tous les repos** (plus utile)

### Commandes à utiliser

**Tous les repos assignés :**
```bash
gh search issues --assignee @me --state open --limit 100 \
  --json number,title,labels,milestone,url,createdAt,updatedAt,repository
```

**Repo courant uniquement :**
```bash
gh issue list --assignee @me --state open --limit 100 \
  --json number,title,labels,milestone,url,createdAt,updatedAt
```

Si `gh` n'est pas authentifié, indiquer à l'utilisateur de lancer `gh auth login`.

---

## Étape 2 — Analyser et prioriser

Classer chaque issue selon ces critères, dans cet ordre :

### 1. Deadline (plus urgent = premier)

Détecter la deadline depuis :
- **Milestone** : utiliser le champ `milestone.dueOn` (date ISO)
- **Labels** contenant une date : `deadline:2025-04-15`, `due:2025-04-15`
- Si pas de deadline → mettre en dernier (catégorie "Sans deadline")

### 2. Priorité (via labels)

Détecter la priorité depuis les labels :

| Labels détectés | Priorité |
|---|---|
| `urgent`, `critical`, `p0`, `priority: critical` | 🔴 Critique |
| `high`, `p1`, `priority: high` | 🟠 Haute |
| `medium`, `p2`, `priority: medium` | 🟡 Moyenne |
| `low`, `p3`, `priority: low` | 🟢 Basse |
| Aucun label de priorité | ⚪ Non définie |

### 3. Ancienneté (en cas d'égalité)

- Older issue first (createdAt le plus ancien = priorité plus haute)

---

## Étape 3 — Générer `issues.md`

### Emplacement du fichier

**Toujours créer `issues.md` à la racine du projet courant** (répertoire de travail actif, là où se trouve le code).

- Obtenir le chemin du projet avec `pwd` ou utiliser directement le working directory courant.
- Ne JAMAIS créer le fichier dans le répertoire home de l'utilisateur (`~/`, `/Users/<nom>/`, etc.).
- Si l'utilisateur est dans un repo git, la racine du repo est le bon endroit : `git rev-parse --show-toplevel` pour en être sûr.

Créer le fichier `issues.md` dans le répertoire du projet avec cette structure :

```markdown
# Issues Assignées — [date du jour]

> Généré automatiquement depuis GitHub. [N] issues ouvertes.

---

## 🚀 Par où commencer

**Issue recommandée :** [titre de l'issue #numéro]
**Pourquoi :** [1 phrase — deadline proche / priorité critique / la plus ancienne]
**Lien :** [url]

---

## 📋 Liste complète par priorité

### 🔴 Critique / Urgent
| # | Titre | Repo | Deadline | Labels |
|---|-------|------|----------|--------|
| [#num]([url]) | Titre | repo | YYYY-MM-DD | label1, label2 |

### 🟠 Haute priorité
| # | Titre | Repo | Deadline | Labels |
|---|-------|------|----------|--------|

### 🟡 Priorité moyenne
| # | Titre | Repo | Deadline | Labels |
|---|-------|------|----------|--------|

### 🟢 Basse priorité / Sans label
| # | Titre | Repo | Deadline | Labels |
|---|-------|------|----------|--------|

### ⏳ Sans deadline ni priorité définie
| # | Titre | Repo | Créée le | Labels |
|---|-------|------|----------|--------|

---

## 📅 Vue par deadline

### Cette semaine
- [ ] #[num] [Titre] — [repo] — [deadline]

### Ce mois
- [ ] #[num] [Titre] — [repo] — [deadline]

### Plus tard
- [ ] #[num] [Titre] — [repo] — [deadline]

### Sans deadline
- [ ] #[num] [Titre] — [repo]
```

---

## Étape 4 — Recommandation finale

Après génération du fichier, afficher dans la conversation un résumé court :

```
✅ issues.md généré — [N] issues trouvées

🚀 Commence par : #[num] "[titre]"
   → [Raison en 1 phrase : deadline dans X jours / priorité critique / etc.]
   → [url]

📊 Résumé :
   - 🔴 Critique : X
   - 🟠 Haute : X
   - 🟡 Moyenne : X
   - 🟢 Basse : X
   - ⚪ Non définie : X
```

---

## Règles importantes

- **`issues.md` est toujours créé dans le répertoire du projet courant** — jamais dans `~/` ou le home de l'utilisateur
- Ne jamais filtrer les issues silencieusement — si une issue est ambiguë (labels inconnus, milestone sans date), la mettre dans "Sans deadline ni priorité définie" et le mentionner
- Si 0 issues trouvées : vérifier que `gh` est authentifié et que le bon utilisateur est connecté (`gh api user --jq '.login'`)
- Le fichier `issues.md` est écrasé à chaque appel — c'est normal, il représente l'état actuel
- Si l'utilisateur précise un repo spécifique dans sa demande (ex: "mes issues sur mon-projet"), utiliser `gh issue list` sur ce repo plutôt que `gh search`
