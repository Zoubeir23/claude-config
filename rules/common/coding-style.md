# Coding Style

## Immutability (CRITICAL)

ALWAYS create new objects, NEVER mutate existing ones:

```
// Pseudocode
WRONG:  modify(original, field, value) → changes original in-place
CORRECT: update(original, field, value) → returns new copy with change
```

Rationale: Immutable data prevents hidden side effects, makes debugging easier, and enables safe concurrency.

## File Organization

MANY SMALL FILES > FEW LARGE FILES:
- High cohesion, low coupling
- 200-400 lines typical, 800 max
- Extract utilities from large modules
- Organize by feature/domain, not by type

## Error Handling

ALWAYS handle errors comprehensively:
- Handle errors explicitly at every level
- Provide user-friendly error messages in UI-facing code
- Log detailed error context on the server side
- Never silently swallow errors

## Input Validation

ALWAYS validate at system boundaries:
- Validate all user input before processing
- Use schema-based validation where available
- Fail fast with clear error messages
- Never trust external data (API responses, user input, file content)

## Naming — NEVER Abbreviate (CRITICAL)

ALWAYS use full, descriptive names. NEVER shorten or abbreviate names of:
- Files (e.g. `order_update_view.py`, NOT `ord_upd_view.py`)
- Functions / methods (e.g. `calculate_total_amount()`, NOT `calc_tot()`)
- Classes (e.g. `AdminOrderUpdateView`, NOT `AdminOrdUpdView`)
- Variables / constants (e.g. `previous_total`, NOT `prev_tot`)
- CSS classes, IDs, HTML attributes (e.g. `btn-submit-order-update`, NOT `btn-sub-ord`)

Apply this rule every time you:
- Create a new file
- Rename an existing file
- Define a function, method, or class
- Declare a variable or constant
- Write any identifier in any language (Python, JS, HTML, CSS, SQL...)

**Correct examples:**
```
# Python
def send_order_update_notification_email(): ...   # NOT send_ord_upd_notif()
class AdminOrderUpdateView: ...                   # NOT AdminOrdUpdView
previous_total = order.total_amount               # NOT prev_tot

# JS
function closeEditOrderPanel() { ... }            # NOT closeEditPanel() if "edit order" is the context
const orderModificationRecord = { ... }           # NOT ordModRec

# Files
order_update_view.py                              # NOT ord_upd_view.py
test_admin_order_update.py                        # NOT test_adm_ord_upd.py
```

**Wrong examples (forbidden):**
```
calc_tot(), upd_ord(), del_usr(), gen_bdc(), prev_amt, new_tot, usr_mgr
AdminOrdView, OrdUpdView, UsrMgr
order_upd.py, adm_ord.py, usr_views.py
```

## Code Quality Checklist

Before marking work complete:
- [ ] Code is readable and well-named
- [ ] Functions are small (<50 lines)
- [ ] Files are focused (<800 lines)
- [ ] No deep nesting (>4 levels)
- [ ] Proper error handling
- [ ] No hardcoded values (use constants or config)
- [ ] No mutation (immutable patterns used)
