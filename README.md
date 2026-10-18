# Claude Code configuration

Portable copy of my `~/.claude` folder (rules, agents, commands, skills, hooks scripts, memory).

## Restore on a new machine

```bash
git clone git@github.com:Zoubeir23/claude-config.git ~/.claude
cd ~/.claude/scripts && bun install        # hook / validator dependencies
cp ~/.claude/settings.example.json ~/.claude/settings.json   # then re-add project-specific settings
```

Then re-authenticate MCP servers / plugins (`claude`, `/mcp`, `/plugin`).

## Not included (on purpose)

Credentials (`~/.claude.json`, `.credentials.json`), `settings.json` (project-specific data),
history, sessions, projects transcripts, caches, `node_modules`, `agent-memory`, synced skills.
The `.gitignore` is a whitelist: new files are ignored unless explicitly allowed.
