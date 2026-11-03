---
name: setup-seo-team
description: "Restaure l'équipe des 32 agents SEO et le MCP Search Console gratuit (mcp-search-console, sans ChatSEO) sur une nouvelle machine, pour Claude Code et Antigravity CLI."
---

Tu es l'installateur de l'infrastructure SEO. Objectif : équipe de 32 agents SEO + serveur MCP Google Search Console gratuit opérationnels, sans aucun service payant.

## 1. Prérequis

Vérifie via Bash, installe ce qui manque :

- `uv` (fournit `uvx`) : `brew install uv`
- `python3`, `git`, `jq`

## 2. Clé du compte de service Google Cloud

1. La clé doit être à `~/.claude/mcp-gsc/service_account.json`. Si elle est absente, arrête-toi et demande-la à l'utilisateur (Google Cloud Console > IAM > Comptes de service > Clés). Ne la génère jamais toi-même.
2. Restreins les droits : `chmod 600 ~/.claude/mcp-gsc/service_account.json`
3. Vérifie qu'elle ne peut pas être commitée : `git -C ~/.claude check-ignore -q mcp-gsc/service_account.json` doit réussir. Sinon, ajoute `mcp-gsc/` à `~/.claude/.gitignore` avant toute autre action.
4. Récupère l'adresse du compte de service (ne l'écris pas en dur, le dépôt est public) :
   `jq -r .client_email ~/.claude/mcp-gsc/service_account.json`
   Cette adresse doit être ajoutée avec le rôle **Propriétaire** dans Google Search Console > Paramètres > Utilisateurs et autorisations.

## 3. Serveur MCP Search Console (scope global)

```bash
claude mcp add gsc -s user \
  -e GSC_CREDENTIALS_PATH="$HOME/.claude/mcp-gsc/service_account.json" \
  -e GSC_SKIP_OAUTH=true \
  -- uvx mcp-search-console
```

`-s user` est obligatoire : sans lui, le serveur n'existe que dans le dossier courant. Vérifie avec `claude mcp list` que `gsc` est `Connected`.

## 4. Agents SEO

Les 32 fichiers `seo-*.md` sont versionnés dans `~/.claude/agents/` (dépôt claude-config) : un `git pull` suffit. Contrôle qu'ils sont tous là : `ls ~/.claude/agents/seo-*.md | wc -l` (32 attendus, `seo-optimizer.md` en plus).

Si tu repars de l'archive d'origine (zip d'Eric Djavid), décompresse-la dans `~/.claude/agents/`, puis nettoie chaque agent :

- Supprime la phrase bloquante « Si le MCP n'est pas connecté, arrête-toi et dis-le, au lieu d'estimer ».
- Supprime toute mention de « ChatSEO », notamment dans « Garde-fous ».
- Réécris la section `## Données` :
  - Audit et reporting (seo-audit-global, seo-reporting, seo-quick-wins, seo-chute-trafic, seo-indexation) : outils MCP `gsc` réels : `list_properties`, `get_performance_overview`, `get_search_analytics`, `get_search_by_page_query`, `compare_search_periods`, `check_indexing_issues`, `inspect_url_enhanced`, `list_sitemaps_enhanced`.
  - Rédaction, on-page, technique (seo-redacteur, seo-brief, seo-structure-hn, seo-crawl, ...) : fichiers locaux, WebFetch, `curl` via Bash.
  - Concurrence et mots-clés : requêtes réelles via `get_search_analytics` + lecture web via WebFetch.

Contrôle final : `grep -li chatseo ~/.claude/agents/seo-*.md` ne doit rien renvoyer.

## 5. Antigravity CLI

Réplique la configuration (agents, skills, MCP gsc) vers Antigravity :

```bash
cd ~/.claude/scripts && bun run antigravity-sync
agy mcp list    # gsc doit apparaître "enabled"
```

## 6. Validation

1. Appelle l'outil MCP `list_properties` du serveur `gsc`.
2. Si le site apparaît : invite l'utilisateur à se placer à la racine de son site et à lancer « Utilise seo-directeur pour faire le point sur mon site et me proposer les 3 actions de la semaine. »
3. Si aucune propriété : rappelle-lui d'ajouter l'adresse obtenue à l'étape 2.4 dans Search Console avec le rôle Propriétaire, puis de réessayer (la propagation prend quelques minutes).
