#!/usr/bin/env bash
set -euo pipefail

MIN_NODE=18

echo ""
echo "  🦴 instalando troglodita..."
echo ""

if ! command -v node &>/dev/null; then
  echo "  Node.js não encontrado. Instale Node >= $MIN_NODE e rode novamente."
  exit 1
fi

NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]')
if [ "$NODE_MAJOR" -lt "$MIN_NODE" ]; then
  echo "  Node.js $NODE_MAJOR encontrado, mas precisa >= $MIN_NODE."
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ -f "$SCRIPT_DIR/bin/install.js" ]; then
  node "$SCRIPT_DIR/bin/install.js" "$@"
else
  TMPDIR=$(mktemp -d)
  trap 'rm -rf "$TMPDIR"' EXIT
  git clone --depth 1 https://github.com/leninejunior/troglodita.git "$TMPDIR/troglodita" 2>/dev/null
  node "$TMPDIR/troglodita/bin/install.js" "$@"
fi
