---
paths:
  - "**/*.py"
  - "**/*.pyi"
---
# Python Coding Style

> This file extends [common/coding-style.md](../common/coding-style.md) with Python specific content.

## Naming — NEVER Abbreviate (CRITICAL)

See [common/coding-style.md](../common/coding-style.md#naming--never-abbreviate-critical) for the full rule.

In Python specifically:
- Module/file names: `snake_case`, full words — `order_update_view.py` NOT `ord_upd_view.py`
- Function/method names: full verbs — `calculate_total_amount()` NOT `calc_tot()`
- Class names: `PascalCase`, full words — `AdminOrderUpdateView` NOT `AdminOrdUpdView`
- Variable names: full nouns — `previous_total` NOT `prev_tot`, `modification_records` NOT `mod_recs`

## Standards

- Follow **PEP 8** conventions
- Use **type annotations** on all function signatures

## Immutability

Prefer immutable data structures:

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class User:
    name: str
    email: str

from typing import NamedTuple

class Point(NamedTuple):
    x: float
    y: float
```

## Formatting

- **black** for code formatting
- **isort** for import sorting
- **ruff** for linting

## Reference

See skill: `python-patterns` for comprehensive Python idioms and patterns.
