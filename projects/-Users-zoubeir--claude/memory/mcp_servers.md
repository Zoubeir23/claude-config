---
name: Serveurs MCP configurés
description: Liste des serveurs MCP installés et leur statut de connexion observé
type: reference
---

Serveurs MCP configurés dans l'environnement de Zoubeir :

**Supabase** (ajouté 2026-03-09)
- Transport : HTTP
- URL : `https://mcp.supabase.com/mcp`
- Ajouté via : `claude mcp add --transport http supabase https://mcp.supabase.com/mcp`
- Config dans : `/Users/zoubeir/.claude.json`

**GitHub** (configuré 2026-03-09)
- Transport : HTTP
- URL : `https://api.githubcopilot.com/mcp/`
- Auth : Bearer token via `GITHUB_PERSONAL_ACCESS_TOKEN`
- Config template : `/Users/zoubeir/.claude/plugins/marketplaces/claude-plugins-official/external_plugins/github/.mcp.json`

**Vercel** (configuré, connexion instable observée 2026-03-23)
- Reconnexion échouée lors d'une session, nécessite parfois un redémarrage de Claude Code

**Slack** (configuré, connexion instable observée 2026-03-23)
- Reconnexion échouée lors d'une session

**Note** : Après re-authentification MCP, il peut être nécessaire de redémarrer Claude Code manuellement pour que les changements prennent effet.
