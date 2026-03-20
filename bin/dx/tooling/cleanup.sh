#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
KEEP_PNPM_LOCK=false

if [[ "${1:-}" == "--keep-pnpm-lock" ]]; then
  KEEP_PNPM_LOCK=true
elif [[ -n "${1:-}" ]]; then
  echo "Unknown option: $1"
  echo "Usage: $0 [--keep-pnpm-lock]"
  exit 1
fi

if [[ ! -f "$ROOT_DIR/package.json" || ! -f "$ROOT_DIR/turbo.json" ]]; then
  echo "Refusing to run: could not confirm Turborepo root at $ROOT_DIR"
  exit 1
fi

TARGET_NAMES=("node_modules" ".turbo" "dist" ".next" ".mastra")

FIND_ARGS=("$ROOT_DIR" -type d \( )
for i in "${!TARGET_NAMES[@]}"; do
  name="${TARGET_NAMES[$i]}"
  if [[ "$i" -gt 0 ]]; then
    FIND_ARGS+=( -o )
  fi
  FIND_ARGS+=( -name "$name" )
done
FIND_ARGS+=( \) -prune -print )

mapfile -t TARGETS < <(find "${FIND_ARGS[@]}" | sort)

if [[ "${#TARGETS[@]}" -eq 0 ]]; then
  echo "No cache/build directories found."
else
  echo "Found ${#TARGETS[@]} directory(ies):"
  printf ' - %s\n' "${TARGETS[@]}"

  echo "Removing..."
  for target in "${TARGETS[@]}"; do
    # Make files writable before removal to bypass permission issues in pnpm cache
    find "$target" -type f -exec chmod +w {} \; 2>/dev/null || true
    find "$target" -type d -exec chmod +w {} \; 2>/dev/null || true
    rm -rf "$target" 2>/dev/null || true
  done
fi

LOCK_FILE="$ROOT_DIR/pnpm-lock.yaml"
if [[ "$KEEP_PNPM_LOCK" == false && -f "$LOCK_FILE" ]]; then
  rm -f "$LOCK_FILE"
  echo "Removed pnpm-lock.yaml"
fi

mapfile -t TSBUILDINFO_FILES < <(
  find "$ROOT_DIR" -type f -name "tsconfig.tsbuildinfo" | sort
)

if [[ "${#TSBUILDINFO_FILES[@]}" -gt 0 ]]; then
  echo "Removing ${#TSBUILDINFO_FILES[@]} tsbuildinfo file(s)..."
  for file in "${TSBUILDINFO_FILES[@]}"; do
    rm -f "$file"
  done
fi

echo "DX cleanup complete."

# Prune pnpm store to remove corrupted/cached entries
pnpm store prune 2>/dev/null || true
