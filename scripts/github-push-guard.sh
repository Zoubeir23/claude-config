#!/usr/bin/env bash
# github-push-guard.sh
# Bloque git push / gh pr create / gh pr merge tant que l'utilisateur
# n'a pas confirmé explicitement que tous les critères ont été vérifiés.
#
# Appelé en PreToolUse sur Bash. Lit le JSON stdin et bloque si la commande
# tente de publier du code sur GitHub sans vérification préalable.

cmd=$(jq -r '.tool_input.command // ""' 2>/dev/null)

if echo "$cmd" | grep -qE '(git push|gh pr create|gh pr merge)'; then
  jq -n '{
    "continue": false,
    "stopReason": "⛔ PUSH BLOQUÉ — Vérification requise avant publication.\n\nAvant tout git push / gh pr create / gh pr merge, tu dois confirmer explicitement que :\n\n1. Tous les critères d'\''acceptation de l'\''issue/prompt ont été vérifiés un par un\n2. L'\''implémentation respecte EXACTEMENT ce qui a été demandé\n3. Les tests passent (ou les écarts sont justifiés)\n4. Aucun critère n'\''est manquant\n\nSi tout est vérifié → indique-le explicitement dans ton message et je relancerai le push."
  }'
  exit 0
fi

exit 0
