# antigravity-sync

Mirrors this Claude Code configuration into Antigravity CLI (`agy`). `~/.claude` stays the single source of truth; everything written under `~/.gemini` is derived and never committed.

```bash
cd ~/.claude/scripts && bun run antigravity-sync    # re-run after any change in ~/.claude
bun run antigravity-sync:test
```

| Claude Code | Antigravity | Notes |
|---|---|---|
| `CLAUDE.md` + `rules/common/*` | `~/.gemini/GEMINI.md` | Inlined (24 KB cap). Language rules are referenced, read on demand |
| `skills/*`, plugin skills | `~/.gemini/config/skills/<name>/` | Files symlinked, `SKILL.md` regenerated with a description of 100 characters max |
| `commands/*.md` | `~/.gemini/config/skills/<name>/` | Workflows are deprecated in Antigravity |
| `agents/*.md`, plugin agents | `~/.gemini/config/agents/` | Tools mapped to names verified in the agy binary; opus becomes `pro`, haiku becomes `flash` |
| `~/.claude.json` MCP servers | `~/.gemini/config/mcp_config.json` | Mode 600: contains API keys |
| Bash validator hook, finish sound | `~/.gemini/config/hooks.json` | Through `src/command_validator_adapter.ts` |
| `permissions` + orchestration allowlist | `~/.gemini/antigravity-cli/settings.json` | `Bash(x:*)` becomes `command(x)` |
| Agent list | `skills/orchestrator/references/agents-map.md` | Generated for the orchestrator |

## Antigravity constraints

- **Skill budget:** agy silently drops skills once the total description size overflows, longest descriptions first. This is why descriptions are shortened and why `EXCLUDED_SKILL_NAME_PATTERNS` exists.
- **Unknown tool names:** an unknown name in an agent's `tools` list can hang the subagent, so unmapped tools (for example MCP tools) are dropped with a warning.
- **Empty hook output:** an empty `PreToolUse` output is treated as a denial, so the adapter always returns an explicit decision.
- **Not ported:** ECC session/cost/compact hooks (they depend on the Claude transcript format) and the `Notification` sound (agy has no such event).

Generated paths are tracked in `~/.gemini/claude_sync_manifest.json` and removed at the start of each run.
