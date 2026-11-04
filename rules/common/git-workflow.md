# Git Workflow

## Commit Message Format
```
<type>: <description>

<optional body>
```

Types: feat, fix, refactor, docs, test, chore, perf, ci

Note: Attribution disabled globally via ~/.claude/settings.json.

## Commits Per Task: Aim for 30 When the Work Allows

Every task (feature or fix) aims for **up to 30 atomic commits** on its branch before opening the PR, **when its real size allows it**:

- Commit continuously while working (1 logical change = 1 commit), never in one big block at the end.
- Granularity examples: new file, new function, new test, edge case fix, rename, doc update — each is its own commit.
- Every commit must build/run and follow the commit message format.
- The count follows the work, not the other way around: a small change that only yields 2 or 3 coherent commits stays at 2 or 3. 30 is not mandatory.
- Never use empty, artificial or useless commits (`--allow-empty`, fabricated whitespace, splitting one line into pieces): each commit must make sense on its own.
- Before opening the PR, check `git rev-list --count main..HEAD`. If a large task has fewer than 30, look for grouped changes that can be split coherently; otherwise keep the count as is.

## Pull Request Workflow

When creating PRs:
1. Analyze full commit history (not just latest commit)
2. Use `git diff [base-branch]...HEAD` to see all changes
3. Draft comprehensive PR summary
4. Include test plan with TODOs
5. Push with `-u` flag if new branch

> For the full development process (planning, TDD, code review) before git operations,
> see [development-workflow.md](./development-workflow.md).
