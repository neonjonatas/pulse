#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"

if [[ ! -d "$ROOT_DIR/repos/apps" && ! -d "$ROOT_DIR/repos/packages" && ! -d "$ROOT_DIR/repos/domain" && ! -d "$ROOT_DIR/repos/agents" ]]; then
  echo "Refusing to run: expected repos/apps/, repos/packages/, repos/domain/, or repos/agents/ in repo root."
  exit 1
fi

SEARCH_DIRS=()
for d in repos/apps repos/packages repos/domain repos/agents; do
  [[ -d "$ROOT_DIR/$d" ]] && SEARCH_DIRS+=("$ROOT_DIR/$d")
done
mapfile -t TEMPLATE_FILES < <(
  find "${SEARCH_DIRS[@]}" -type f -name ".env.template" 2>/dev/null | sort
)

if [[ "${#TEMPLATE_FILES[@]}" -eq 0 ]]; then
  echo "No .env.template files found in repos/apps/, repos/packages/, repos/domain/, or repos/agents/."
  exit 0
fi

created_count=0
skipped_count=0

for template_file in "${TEMPLATE_FILES[@]}"; do
  target_dir="$(dirname "$template_file")"
  target_env="$target_dir/.env"

  if [[ -f "$target_env" ]]; then
    echo "Skipped (already exists): $target_env"
    skipped_count=$((skipped_count + 1))
    continue
  fi

  cp "$template_file" "$target_env"
  echo "Created: $target_env"
  created_count=$((created_count + 1))
done

echo "DX env template complete. created=$created_count skipped=$skipped_count"
