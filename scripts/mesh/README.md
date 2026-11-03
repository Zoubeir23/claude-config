# mesh: Claude Code to Antigravity runner

Backend of the `orchestrator` skill. Claude Code delegates a task to Antigravity CLI (`agy`, Gemini) and reads one JSON result on stdout.

```bash
~/.claude/bin/antigravity-runner --mode review  --prompt "Review the diff in src/auth for security issues"
~/.claude/bin/antigravity-runner --mode execute --prompt-file plan.md --timeout 900
~/.claude/bin/antigravity-runner --mode worker  --tasks-file tasks.json     # ["subtask 1", "subtask 2"], max 6, in parallel
bun run mesh:test
```

| Mode | Reads cwd | Writes cwd | Shell |
|---|---|---|---|
| `review` | yes | **no** (`write_file(*)` denied) | allowlist |
| `execute` | yes | yes, cwd only | allowlist |
| `worker` | yes | yes, cwd only | allowlist |

The shell allowlist lives in `antigravity-sync/src/lib/sync_permissions.ts`. Destructive commands stay blocked by the command validator hook.

## Result

```json
{ "status": "success", "mode": "review", "response": "...", "errorMessage": null,
  "deniedActions": [], "totalTokens": 14704, "conversationId": "...", "logFile": "~/.claude/mesh/logs/run_....json" }
```

`status` is one of:

- `success`
- `error`: read `errorMessage` and `deniedActions`
- `timeout`
- `recursion_blocked`
- `not_found`
- `invalid_arguments`

## Safety

- **Recursion:** `MESH_DEPTH` refuses any nested call, and the orchestrator skill is never mirrored to agy.
- **False successes:** headless agy reports `SUCCESS` even after a denied permission. The runner turns `denied_actions` or an empty response into an `error`.
- **Logs:** written to `~/.claude/mesh/logs/`, ignored by git, mode 600. Secrets are redacted, entries truncated to 20,000 characters, and only the last 200 runs are kept.
- **Timeout:** agy's own `--print-timeout` applies, plus a hard kill 30 seconds after it.
