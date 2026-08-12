# Learning notes site (MkDocs Material)

Publishes a curated subset of the vault as a static site, deployed to GitHub Pages.

## What's published

Controlled entirely by `scripts/sync_docs.py` — edit the `INCLUDE` list there to add
or drop vault folders, then re-run the sync. Nothing else (mkdocs.yml, CI workflow)
needs to change. The vault itself is never modified; sync only writes into `docs/learning/`.

## Local preview

```bash
cd proj
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 scripts/sync_docs.py
mkdocs serve
```

Open http://127.0.0.1:8000

## Deployment

`.github/workflows/deploy-docs.yml` (at the repo root) rebuilds and publishes to the
`gh-pages` branch on every push to `main` that touches `proj/`. In the GitHub repo
settings, set **Pages → Source** to the `gh-pages` branch (one-time setup).
