#!/bin/bash
# Instala el CLI de graphify en sesiones remotas (contenedor efímero).
set -euo pipefail
[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0
export PATH="$HOME/.local/bin:$PATH"
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo "export PATH=\"$HOME/.local/bin:\$PATH\"" >> "$CLAUDE_ENV_FILE"
fi
command -v graphify >/dev/null && exit 0
command -v uv >/dev/null || pip install -q uv
uv tool install -q graphifyy
