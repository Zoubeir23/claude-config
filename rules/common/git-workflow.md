# Git Workflow

## Commit Message Format
```
<type>: <description>

<optional body>
```

Types: feat, fix, refactor, docs, test, chore, perf, ci

Note: Attribution disabled globally via ~/.claude/settings.json.

## Minimum Commits Per Task

Every task (feature or fix) must produce **at least 30 atomic commits** on its branch before opening the PR:

- Commit continuously while working (1 logical change = 1 commit), never in one big block at the end.
- Granularity examples: new file, new function, new test, edge case fix, rename, doc update — each is its own commit.
- Every commit must build/run and follow the commit message format.
- Never use empty or artificial commits (`--allow-empty`, fabricated whitespace changes): reach the minimum by genuinely splitting the work.
- Before opening the PR, verify: `git rev-list --count main..HEAD` — if < 30, split remaining work further.

## Pull Request Workflow

When creating PRs:
1. Analyze full commit history (not just latest commit)
2. Use `git diff [base-branch]...HEAD` to see all changes
3. Draft comprehensive PR summary
4. Include test plan with TODOs
5. Push with `-u` flag if new branch

> For the full development process (planning, TDD, code review) before git operations,
> see [development-workflow.md](./development-workflow.md).
