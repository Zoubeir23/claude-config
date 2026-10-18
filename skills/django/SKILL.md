---
name: django
description: >
  Polyvalent Django assistant — handles anything in a Django project: creating or refactoring
  REST APIs (DRF), writing migrations, integrating ML models, optimizing queries (N+1, caching),
  adding authentication (JWT/OAuth), customizing admin, writing tests, managing settings for
  multiple environments. Automatically detects the project architecture (Cookiecutter Django,
  standard Django, custom layouts) and adapts to its conventions. Use this skill whenever the
  user asks to add, fix, refactor, or optimize anything in a Django project — even if they don't
  explicitly say "Django skill". Triggers on: "crée une API pour...", "optimise les queries",
  "ajoute du ML dans...", "refactorise cette view", "crée une migration pour...", "ajoute
  l'auth JWT", "améliore les performances", or any request that touches models/views/serializers/
  settings in a Django codebase.
---

# Django Skill

Handle any task in a Django project — from a quick query optimization to a full API with tests —
in one pass, production-ready, respecting the project's architecture and conventions.

The skill is broad by design. Django projects have many moving parts (models, serializers, views,
URLs, migrations, celery tasks, settings) and a good implementation coordinates them all at once.
That's the job here.

---

## Phase 1: Detect Architecture

Before writing anything, identify the project structure. This determines where files go, what
naming to use, and which patterns to follow.

**Detect the layout:**

| Architecture | Signals | API location |
|---|---|---|
| Cookiecutter Django | `config/settings/`, `requirements/` folder | `[project]/api/v1/[app]/` |
| Standard Django | Single `settings.py`, apps at root | `[app]/views.py` |
| Custom modular | `modules/`, `core/`, `domain/` folders | Follow existing pattern |

**Also discover:**
- Django + DRF versions (`requirements*.txt` or `pyproject.toml`)
- Auth method (JWT/SimpleJWT, Token, Session, OAuth)
- Database (PostgreSQL, MySQL, SQLite)
- Async tools (Celery, Redis, Django Channels)
- Test framework (pytest-django, unittest)
- Code style tools (Black, isort, flake8, mypy)

Output a brief summary before coding — "I see Cookiecutter Django with DRF + JWT + PostgreSQL,
API versioned under `myproject/api/v1/`..." — this confirms you understood the project and
gives the developer a chance to correct you before you've done the work.

---

## Phase 2: Plan

Map out what needs to happen across all layers before touching any file.

**Layer impact matrix:**

| Layer | Files | Change needed? |
|---|---|---|
| Data | `models.py` + migration | New fields / models? |
| Service | `services/` or inline | Business logic? |
| Serialization | `serializers.py` | New DTOs? |
| API | `views.py` + `urls.py` | New endpoints? |
| Auth/Permissions | `permissions.py` | New rules? |
| Tests | `tests/` | Cover new behavior? |
| Config | `settings*.py` | New dependencies? |

Show the plan as a numbered task list with file paths before coding. For ambiguous requests,
ask one targeted clarifying question rather than guessing. Keep the plan brief — a list is fine.

---

## Phase 3: Implement

### Implementation order

Follow data dependencies: models → services → serializers → views → URLs → tests.
Migrations come right after model changes.

### Core principles

**Match the project's style exactly.** If views are class-based, don't introduce function-based
ones. If error responses use `{"error": {"code": ..., "message": ...}}`, match that format.
Look at 2-3 existing views/serializers before writing new ones.

**Optimize queries from the start.** Every list endpoint should use `select_related` and
`prefetch_related` where needed. Do not add them as an afterthought.

**Reuse before creating.** Check for base classes (`BaseSerializer`, `BaseViewSet`), mixins,
custom permissions, and utility functions before writing new ones.

**Write tests as part of the implementation**, not after. For each endpoint: happy path +
validation error + permission error.

For framework-specific patterns (DRF ViewSets, serializers, query optimization, Celery tasks,
ML integration), read `references/django-patterns.md`.

For Git branch naming, commit format, and PR conventions, read `references/git-conventions.md`.

---

## Phase 4: Validate and Summarize

After implementation:

- Verify all imports resolve
- Confirm migrations exist for every model change
- Confirm no N+1 queries in list endpoints
- Confirm tests cover the main cases

**Final summary:**

```
✅ Done: [Feature/Task Name]

Files:
- CREATE: [paths]
- MODIFY: [paths]
- MIGRATE: python manage.py makemigrations && python manage.py migrate

Tests: python manage.py test [app] (or: pytest [path])

Next steps:
1. [anything the developer needs to do manually]
```

---

## What This Skill Covers

- **REST APIs**: DRF serializers, ViewSets, APIViews, filtering, search, pagination, Swagger/OpenAPI
- **Refactoring**: extracting services, fixing N+1, restructuring apps
- **Migrations**: schema changes, data migrations, rollbacks
- **Authentication**: JWT, OAuth2, custom permissions, RBAC
- **ML integration**: scikit-learn/TensorFlow models, prediction endpoints, Celery async queues
- **Performance**: Redis caching, query optimization, CDN, compression
- **Admin**: custom admin classes, bulk actions, filters
- **Tests**: pytest-django, factory-boy, API test cases, fixtures

For beginner projects, add brief comments explaining *why* patterns are used (e.g., why
`select_related` matters, what `prefetch_related` does differently). Don't just add the code —
document the reasoning so the developer learns from it.

---

## Reference Files

- `references/django-patterns.md` — DRF implementation patterns, query optimization, ML integration, testing templates
- `references/git-conventions.md` — Branch naming, commit format, PR template, definition of done

---

# Guide d'intégration des ingénieurs

Bienvenue.

Ce document explique notre mode de fonctionnement en tant qu'équipe d'ingénieurs.

Notre force réside non seulement dans notre capacité à écrire du code, mais aussi dans la manière dont nous l'organisons, le structurons et le livrons.

Veuillez lire attentivement. Notre objectif est l'alignement, la rigueur et la cohérence.

---

## Notre méthode de travail

Nous travaillons en mode Agile. Cela signifie que nous privilégions la clarté, l'itération, la collaboration et l'amélioration continue.

Chaque ingénieur doit :

* Fournir des mises à jour quotidiennes sur l'avancement de son travail.

* Signaler rapidement les blocages.

* Livrer des modifications petites, structurées et vérifiables.

* Assumer la responsabilité de son travail.

Les mises à jour quotidiennes doivent indiquer clairement ce qui a été terminé, ce qui est en cours et les éventuels blocages. La communication doit toujours être structurée et contextualisée.

Nous travaillons vite, mais bien.

---

## Gestion des branches et flux de travail

Tout développement commence à partir de la branche `main`.

Avant de commencer toute tâche :

1. Basculez vers `main`
2. Récupérez les dernières modifications
3. Créez une nouvelle branche

Les noms de branches doivent respecter la structure suivante :

```
Feature/<code>-description courte
Fix/<code>-description courte
Docs/<code>-description courte
Chore/<code>-description courte
```

Exemples :

```
Feature/145-add-user-filter
Fix/210-correct-login-validation
Docs/032-update-api-readme
Chore/078-update-precommit-config
```

Les noms de branches doivent être clairs, lisibles et professionnels.

Il est formellement interdit de travailler directement sur `main`.

---

## Convention des messages de commit

Les messages de commit ne sont pas des détails facultatifs. Ils font partie intégrante des bonnes pratiques d'ingénierie.

Chaque commit doit respecter la structure suivante :

```
<code>-titre-court
```

Exemples :

```
145-ajouter-filtre-utilisateur
210-corriger-validation-connexion
```

Les messages de commit doivent être :

* Clairs
* Courts
* Précis
* Professionnels

Évitez les messages génériques tels que :

* correction
* mise-à-jour
* travail
* terminé
* modifications

Chaque commit doit représenter une unité de travail significative.

### Pré-commit et Formatage

Assurez-vous que les vérifications de formatage et de pré-commit sont réussies avant de pousser votre code. Cela garantit que votre travail respecte les normes de qualité et de style de notre codebase.

---

## Push, Revue et Tests

Une fois votre travail terminé :

1. Poussez votre branche.

2. Ouvrez une Pull Request.

3. Contactez un relecteur.

4. Assurez-vous que le relecteur teste la fonctionnalité.

Avant de demander une revue, vous devez :

* Tester la fonctionnalité localement.

* Vérifier qu'elle fonctionne comme prévu.

* Confirmer qu'aucune fonctionnalité existante n'est défectueuse.

* Vous assurer que le formatage et les vérifications pré-commit sont réussis.

Une Pull Request n'est pas un lieu pour tester du code instable.

Elle sert à valider un travail finalisé.

---

## Définition de « Terminé »

Une tâche est considérée comme terminée uniquement lorsque :

* Le code est implémenté.

* Il respecte les règles de nommage des branches.

* Il respecte les conventions des messages de commit.

* Il réussit les vérifications de formatage et de pré-commit.

* Il est relu.

* La fonctionnalité est testée et son bon fonctionnement est confirmé.

Si l'une de ces étapes est manquante, la tâche n'est pas terminée.

---

## Normes d'ingénierie

Nous privilégions la clarté à la complexité.

Le code doit être :

* Lisible
* Maintenable
* Structuré
* Cohérent avec l'architecture existante

Nous attendons des développeurs qu'ils suivent les principes d'une architecture propre et qu'ils écrivent du code compréhensible par un autre ingénieur sans explication.

Un bon travail d'ingénierie est prévisible, pas chaotique.

---

## Comportement professionnel

Nous attendons :

* La responsabilité de votre code.

* Transparence en cas de problème.

* Communication rapide des blocages.

* Collaboration respectueuse.

* Apprentissage continu.

En cas de dysfonctionnement, communiquez immédiatement et proposez une solution.

Les ingénieurs professionnels ne dissimulent pas les problèmes.

Ils les mettent en lumière et les résolvent.
