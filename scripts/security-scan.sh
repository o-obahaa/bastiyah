#!/usr/bin/env bash
# ==============================================================================
# Bastiyah DevSecOps Security Scanner
# Scans npm dependencies and Docker container images for vulnerabilities
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REPORTS_DIR="$PROJECT_ROOT/reports"

mkdir -p "$REPORTS_DIR"

echo "========================================================================"
echo "🛡️  Bastiyah DevSecOps Security Scanner"
echo "========================================================================"
echo "Project Root: $PROJECT_ROOT"
echo "Reports Path: $REPORTS_DIR"
echo ""

# ------------------------------------------------------------------------------
# 1. NPM Dependencies Vulnerability Audit
# ------------------------------------------------------------------------------
echo "🔍 [1/2] Auditing NPM Dependencies (Production & Critical)..."
NPM_REPORT="$REPORTS_DIR/npm-audit.json"

if npm audit --production --json > "$NPM_REPORT" 2>&1; then
    echo "✅ NPM dependencies audit passed with 0 known production vulnerabilities!"
else
    echo "⚠️  NPM audit found advisory items. Detailed report saved to: $NPM_REPORT"
    # Print summary if jq is available or parse via node
    node -e "
        try {
            const fs = require('fs');
            const data = JSON.parse(fs.readFileSync('$NPM_REPORT', 'utf8'));
            const vuln = data.metadata ? data.metadata.vulnerabilities : {};
            console.log('   Vulnerabilities Summary:', JSON.stringify(vuln, null, 2));
        } catch (e) {
            console.log('   Audit file written.');
        }
    " || true
fi

echo ""

# ------------------------------------------------------------------------------
# 2. Docker Image Vulnerability Scan (Trivy)
# ------------------------------------------------------------------------------
IMAGE_TAG="${DOCKER_IMAGE_NAME:-bastiyah/nexus-store}:${BUILD_NUMBER:-latest}"
echo "🐳 [2/2] Scanning Docker Image Vulnerabilities: $IMAGE_TAG"

TRIVY_REPORT="$REPORTS_DIR/trivy-scan.json"

if command -v trivy >/dev/null 2>&1; then
    echo "Running local Trivy scanner..."
    trivy image \
        --severity HIGH,CRITICAL \
        --format json \
        --output "$TRIVY_REPORT" \
        "$IMAGE_TAG" || true

    echo "Trivy Table Report:"
    trivy image --severity HIGH,CRITICAL "$IMAGE_TAG" || true
elif command -v docker >/dev/null 2>&1; then
    echo "Local trivy binary not found; running containerized Aquasec Trivy..."
    if docker image inspect "$IMAGE_TAG" >/dev/null 2>&1; then
        docker run --rm \
            -v /var/run/docker.sock:/var/run/docker.sock \
            -v "$REPORTS_DIR:/reports" \
            aquasec/trivy:latest image \
            --severity HIGH,CRITICAL \
            --format json \
            --output /reports/trivy-scan.json \
            "$IMAGE_TAG" || true

        docker run --rm \
            -v /var/run/docker.sock:/var/run/docker.sock \
            aquasec/trivy:latest image \
            --severity HIGH,CRITICAL \
            "$IMAGE_TAG" || true
    else
        echo "ℹ️  Docker image '$IMAGE_TAG' not built yet. Run 'docker build -t $IMAGE_TAG .' first."
    fi
else
    echo "ℹ️  Docker not detected. Skipping container image vulnerability scan."
fi

echo ""
echo "========================================================================"
echo "🎉 Security Scan Phase Completed. Reports located at:"
echo "   - $NPM_REPORT"
echo "   - $TRIVY_REPORT"
echo "========================================================================"
