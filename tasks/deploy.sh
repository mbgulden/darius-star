#!/usr/bin/env bash
# Deploy task: commit and push to GitHub → triggers Cloudflare Pages deploy
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

echo "🚀 Deploying Darius Star to Cloudflare Pages..."

# Stage all changes
git add -A

# Check if there's anything to commit
if git diff --cached --quiet; then
    echo "📦 No changes to commit. Pushing latest..."
else
    COMMIT_MSG="deploy: production build $(date +'%Y-%m-%d %H:%M')"
    git commit -m "$COMMIT_MSG"
    echo "📦 Committed: $COMMIT_MSG"
fi

# Push to main
git push origin main

echo "✅ Pushed to GitHub. Cloudflare Pages will auto-deploy."
echo "🌐 Live at: https://darius-star.pages.dev"
