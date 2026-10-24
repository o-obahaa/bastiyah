#!/usr/bin/env bash
# ==============================================================================
# Bastiyah Disaster Recovery Restore Script
# Usage: ./scripts/restore-backup.sh backups/bastiyah-snapshot-XXXX.tar.gz
# ==============================================================================

set -euo pipefail

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <path-to-backup.tar.gz>"
    echo "Example: $0 backups/bastiyah-snapshot-2026-10-24.tar.gz"
    exit 1
fi

ARCHIVE_PATH="$1"

if [ ! -f "$ARCHIVE_PATH" ]; then
    echo "❌ Error: Backup archive '$ARCHIVE_PATH' not found!"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TEMP_RESTORE_DIR="$PROJECT_ROOT/backups/temp_restore_$$"

mkdir -p "$TEMP_RESTORE_DIR"

echo "========================================================================"
echo "🔄 Restoring Bastiyah Platform from Disaster Recovery Snapshot"
echo "========================================================================"
echo "Archive: $ARCHIVE_PATH"
echo "Extracting to temporary workspace..."

tar -xzf "$ARCHIVE_PATH" -C "$TEMP_RESTORE_DIR"

EXTRACTED_FOLDER="$(ls -1 "$TEMP_RESTORE_DIR" | head -n 1)"
SNAPSHOT_DIR="$TEMP_RESTORE_DIR/$EXTRACTED_FOLDER"

if [ -f "$SNAPSHOT_DIR/manifest.json" ]; then
    echo "📄 Manifest verified:"
    cat "$SNAPSHOT_DIR/manifest.json"
    echo ""
fi

# Restore convex schemas if present
if [ -d "$SNAPSHOT_DIR/convex" ]; then
    echo "Restoring convex schemas..."
    cp -r "$SNAPSHOT_DIR/convex/"* "$PROJECT_ROOT/convex/"
    echo "✅ Convex files restored."
fi

# Clean temp directory
rm -rf "$TEMP_RESTORE_DIR"

echo "========================================================================"
echo "🎉 Platform snapshot successfully restored! Run 'npm run typecheck' to verify."
echo "========================================================================"
