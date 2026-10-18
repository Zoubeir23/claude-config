---
name: init-claude-md
description: >
  Initialise un fichier CLAUDE.md professionnel dans un projet. Génère automatiquement
  un CLAUDE.md complet et adapté au projet courant (stack détectée, conventions git,
  workflow engineering senior, patterns par framework). Déclenche cette skill dès que
  l'utilisateur dit "initialise le CLAUDE.md", "crée un CLAUDE.md", "génère le CLAUDE.md",
  "setup le projet", "configure Claude pour ce projet", "init projet", "bootstrap CLAUDE.md",
  ou toute demande de création/mise à jour du fichier CLAUDE.md dans un projet.
  Utiliser aussi quand l'utilisateur commence à travailler sur un nouveau projet et n'a
  pas encore de CLAUDE.md, ou quand il veut documenter ses conventions dans Claude Code.
---

# Init CLAUDE.md — Workflow

Tu crées le fichier `CLAUDE.md` à la racine du projet courant.
Ce fichier est lu par Claude Code à chaque session : il doit être **précis, actionnable, et adapté au projet**.

---

## Étape 1 — Analyser le projet

Avant d'écrire quoi que ce soit, explore le projet pour détecter :

**Stack technique :**
- Fichiers de config : `package.json`, `requirements.txt`, `pom.xml`, `composer.json`, `pyproject.toml`, `build.gradle`, `Cargo.toml`
- Frameworks : Django, Laravel, Spring Boot, Express, React, Next.js, Vue, Nuxt, Flutter...
- Langages : Python, JavaScript/TypeScript, Java, PHP, Dart, Rust...
- Base de données : PostgreSQL, MySQL, MongoDB, SQLite, Redis...

**Structure du projet :**
- Architecture (monolith, microservices, fullstack, API + front séparés)
- Organisation des dossiers (`apps/`, `src/`, `api/`, `frontend/`, etc.)
- Conventions de nommage déjà en place

**Git :**
- Branches existantes (`git branch -a`)
- Historique des commits (`git log --oneline -10`) pour détecter le style de messages
- Présence d'un `.gitignore`, CI/CD (`Dockerfile`, `.github/workflows/`, etc.)

**Tests :**
- Framework de test existant (`pytest`, `jest`, `phpunit`, etc.)
- Dossier `tests/` ou `__tests__/`

---

## Étape 2 — Construire le CLAUDE.md

Génère un `CLAUDE.md` avec ces sections, dans cet ordre :

### Structure du fichier à générer

```markdown
# CLAUDE.md — [Nom du Projet]

## Project Overview
[1-2 lignes décrivant ce que fait le projet]

## Stack
- **Backend**: [framework + version si détectable]
- **Frontend**: [framework ou "N/A"]
- **Base de données**: [DB principale]
- **Tests**: [framework de test]
- **CI/CD**: [si présent, sinon omettre]

## Architecture
[Décrire l'organisation des dossiers clés. Ex: apps Django, modules Node, etc.]

## Key Conventions

### Git Workflow
- **Toujours** : `git pull origin main` avant de créer une branche
- **Nommage des branches** :
  - `Feature/<code>-description-courte`
  - `Fix/<code>-description-courte`
- **Format des commits** : `<code>-titre-court`
  - Exemple : `007-corriger-breadcrumb-produits`
  - Le `<code>` est un numéro de ticket ou identifiant court

### Code Style
[Conventions détectées dans le projet — nommage, indentation, etc.]

### Framework Conventions
[Patterns spécifiques au stack détecté — voir section frameworks ci-dessous]

## Commands
[Commandes essentielles du projet : démarrer, tester, builder, migrer, etc.]

## Testing
[Comment lancer les tests, où sont-ils, règles à respecter]

## Anti-patterns
[Ce qu'il ne faut PAS faire dans ce projet spécifiquement]
```

---

## Conventions Git — Obligatoires dans tout CLAUDE.md

Ces conventions s'appliquent **toujours**, quel que soit le projet :

```markdown
### Git Workflow
- Toujours `git pull origin main` avant de créer une branche
- Branches : `Feature/<code>-description` ou `Fix/<code>-description`
- Commits : `<code>-titre-court` (ex: `042-fix-login-redirect`)
```

---

## Règles Engineering — À inclure dans tout CLAUDE.md

Ces principes doivent apparaître dans le CLAUDE.md généré, adaptés au projet :

```markdown
## Engineering Rules

### Avant de coder
- Lire le code existant avant de proposer une modification
- Identifier le pattern du projet (MVC, MVT, Repository, etc.)
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
- Copier-coller aveugle
- Fixer sans comprendre
- Mélanger les responsabilités
- Ignorer les erreurs/logs
- Écraser du code qui fonctionne sans raison
```

---

## Conventions par Framework

Selon le stack détecté, ajouter la section correspondante :

### Django
```markdown
### Django Conventions
- Pattern MVT strict
- Logique dans les models, views légères
- Serializers pour toute API DRF
- Migrations systématiquement créées et vérifiées
```

### Laravel
```markdown
### Laravel Conventions
- MVC strict
- Services pour la logique métier
- Controllers fins — déléguer aux services
- Eloquent pour l'ORM, pas de raw SQL sauf nécessité
```

### Node.js / Express
```markdown
### Node.js Conventions
- Séparation routes / controllers / services
- Controllers fins
- Services pour la logique métier
- Middleware pour la validation
```

### React / Next.js
```markdown
### React Conventions
- Composants petits et réutilisables
- Séparer UI et logique (hooks/services)
- Éviter le prop drilling — Context ou state manager
- Un composant = une responsabilité
```

### Spring Boot
```markdown
### Spring Boot Conventions
- Architecture en couches : Controller → Service → Repository
- Logique métier dans les services uniquement
- DTOs pour les échanges API
- Pas de logique dans les controllers
```

---

## Étape 3 — Écrire le fichier

- Créer `CLAUDE.md` à la **racine du projet**
- Si un CLAUDE.md existe déjà : le lire d'abord et **fusionner** les conventions existantes avec le nouveau contenu (ne pas écraser ce qui est déjà documenté)
- Le fichier doit être **concis** : pas de blabla, que du concret et actionnable
- Maximum recommandé : 150 lignes (Claude Code le charge à chaque session)

---

## Étape 4 — Confirmer

Après génération, indiquer à l'utilisateur :
- Ce qui a été détecté (stack, architecture)
- Ce qui a été ajouté / fusionné
- Les sections à compléter manuellement si des infos manquaient (ex: numéro de ticket, URL de staging, etc.)
