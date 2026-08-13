#!/usr/bin/env bash
# Resync selected vault notes into docs/, verify the site builds, and stage
# the result for commit. Run this after editing notes you want republished.
set -euo pipefail
cd "$(dirname "$0")/.."

source .venv/bin/activate
python3 scripts/sync_docs.py
mkdocs build --strict
rm -rf site

git add docs/ mkdocs.yml scripts/ requirements.txt README.md .gitignore .github/ 2>/dev/null || true
echo
echo "Staged. Review with 'git status' / 'git diff --staged', then:"
echo "  git commit -m 'Update notes'"
echo "  git push"
