# Git Conventions

Project-specific Git workflow. Apply these conventions to all work done in Django projects
that use this skill.

---

## Branch Naming

Always start from `main`:

```bash
git checkout main
git pull origin main
git checkout -b [TYPE]/[CODE]-[description]
```

| Type | When to use |
|------|-------------|
| `Feature/` | New functionality |
| `Fix/` | Bug fixes |
| `Docs/` | Documentation only |
| `Chore/` | Tooling, deps, config (no production code change) |

**Format**: `Type/CODE-kebab-case-description`

**Good examples:**
```
Feature/145-add-user-profile-api
Fix/210-correct-login-validation
Docs/032-update-api-endpoints-doc
Chore/078-update-requirements-txt
```

**Bad examples:**
```
feature          # no code, no description
fix-login        # no code
Feature/145      # no description
main             # never work directly on main
Feature/145_add_user  # underscores not kebab
```

---

## Commit Messages

Format: `CODE-short-description`

```
145-add-user-profile-serializer
210-fix-login-token-expiry
032-update-swagger-endpoint-docs
078-bump-django-to-4-2-13
```

Rules:
- Always include the task code
- Lowercase, kebab-case
- Describe *what changed*, not *what you did* ("add" not "added", "fix" not "fixed")
- One logical unit per commit — don't bundle unrelated changes

**Avoid:**
```
fix
update
wip
done
corrections
changes
misc
```

---

## Pre-Commit Checks

Before pushing, verify these pass locally:

```bash
# Format
black . && isort .

# Lint
flake8 . --max-line-length=88

# Type check (if mypy configured)
mypy .

# Tests
python manage.py test
# or: pytest
```

All checks must pass. Don't push code that fails formatting or linting — this blocks the
CI pipeline and wastes reviewer time.

---

## Pull Request

Once work is complete and checks pass:

```bash
git push origin [branch-name]
```

Then open a PR with this template:

```markdown
## [CODE] Short description

### What changed
Brief explanation of what was implemented or fixed.

### Type
- [ ] New feature
- [ ] Bug fix
- [ ] Refactoring
- [ ] Documentation
- [ ] Chore

### Checklist
- [ ] Tested locally
- [ ] Unit tests written
- [ ] Migrations created (if schema changed)
- [ ] Pre-commit checks pass
- [ ] No existing functionality broken
- [ ] Documentation updated if needed

### Run migrations
python manage.py migrate

### Run tests
python manage.py test [app_name]

### Screenshots (if UI change)
```

**A PR is for validating finished work, not for testing unstable code.**
Do not open a PR until the feature works locally and all checks pass.

---

## Definition of Done

A task is complete only when ALL of these are true:

- [ ] Code implemented and working locally
- [ ] Branch follows `Type/CODE-description` format
- [ ] Commits follow `CODE-description` format
- [ ] Pre-commit checks pass (black, isort, flake8)
- [ ] Unit tests written and passing
- [ ] PR opened with correct template
- [ ] Reviewer has tested the functionality
- [ ] No regressions detected
- [ ] PR approved and merged

Missing any of these = the task is not done.
