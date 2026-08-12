#!/usr/bin/env python3
"""
Copies selected folders out of the Obsidian vault into proj/docs/ so MkDocs
can build a site from a curated subset of notes, and rewrites Obsidian's
[[wikilink]] / ![[embed]] syntax into plain Markdown links along the way.

The vault itself is never modified -- this only writes into proj/docs/.

To publish more (or less) of the vault, edit INCLUDE / EXCLUDE below and
re-run. Nothing else needs to change (not mkdocs.yml, not the CI workflow).
"""
import os
import re
import shutil
from pathlib import Path

VAULT_ROOT = Path(__file__).resolve().parents[2] / "second-brain"
DOCS_DIR = Path(__file__).resolve().parents[1] / "docs" / "learning"

# Each entry: (vault-relative source folder, destination slug under docs/learning/)
INCLUDE = [
    ("01_Active (Projects + Current Focus)/AWS Certified AI Practitioner - AIF C01", "aws-ai-practitioner-aif-c01"),
    ("01_Active (Projects + Current Focus)/AWS Certified AI Practitioner - Remaining Lessons", "aws-ai-practitioner-remaining-lessons"),
    ("01_Active (Projects + Current Focus)/AWS Certified Generative AI Developer - Professional (AIP-C01)", "aws-genai-developer-aip-c01"),
    ("01_Active (Projects + Current Focus)/Learning System Design", "system-design"),
    ("02_Life Systems (Areas)/1_Learning/STUDYING/2_Problem Solving", "problem-solving"),
]

# Glob patterns (relative to each source folder) to skip even inside an included folder.
EXCLUDE_PATTERNS = [
    "*.DS_Store",
    ".obsidian*",
]

WIKILINK_RE = re.compile(r"!?\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]")


def is_excluded(path: Path) -> bool:
    return any(path.match(pat) for pat in EXCLUDE_PATTERNS)


def copy_folder(src: Path, dst: Path):
    if not src.exists():
        print(f"  [skip] source not found: {src}")
        return
    if dst.exists():
        shutil.rmtree(dst)
    dst.mkdir(parents=True)
    for item in src.rglob("*"):
        if is_excluded(item):
            continue
        rel = item.relative_to(src)
        target = dst / rel
        if item.is_dir():
            target.mkdir(parents=True, exist_ok=True)
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(item, target)


def convert_wikilinks(dst: Path, docs_root: Path, name_to_relpath: dict):
    for md_file in dst.rglob("*.md"):
        text = md_file.read_text(encoding="utf-8", errors="ignore")

        def repl(m):
            target, alias = m.group(1).strip(), m.group(2)
            label = alias or target
            is_embed = m.group(0).startswith("!")
            key = target.lower()
            if key in name_to_relpath:
                target_abs = docs_root / name_to_relpath[key]
                rel = Path(os.path.relpath(target_abs, md_file.parent)).as_posix()
                return f"{'!' if is_embed else ''}[{label}]({rel})"
            return label

        new_text = WIKILINK_RE.sub(repl, text)
        if new_text != text:
            md_file.write_text(new_text, encoding="utf-8")


def write_pages_title(dst: Path, title: str):
    """awesome-pages: give the nav section a readable title instead of the slugged folder name."""
    (dst / ".pages").write_text(f"title: {title}\n", encoding="utf-8")


def ensure_section_index(dst: Path, title: str):
    """So a bare section URL like learning/<slug>/ resolves to a real page."""
    if (dst / "index.md").exists():
        return
    entries = []
    for item in sorted(dst.iterdir()):
        if item.name.startswith("."):
            continue
        if item.is_dir():
            child_index = item / "index.md"
            link = f"{item.name}/" if child_index.exists() else None
            if link is None:
                first_md = next(iter(sorted(item.rglob("*.md"))), None)
                link = first_md.relative_to(dst).as_posix() if first_md else None
            if link:
                entries.append((item.name, link))
        elif item.suffix == ".md":
            entries.append((item.stem, item.name))
    lines = [f"# {title}", ""]
    for name, link in entries:
        lines.append(f"- [{name}]({link})")
    (dst / "index.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def main():
    if DOCS_DIR.exists():
        shutil.rmtree(DOCS_DIR)
    DOCS_DIR.mkdir(parents=True)

    name_to_relpath = {}

    for src_rel, slug in INCLUDE:
        src = VAULT_ROOT / src_rel
        dst = DOCS_DIR / slug
        print(f"Syncing '{src_rel}' -> docs/learning/{slug}/")
        copy_folder(src, dst)
        if dst.exists():
            write_pages_title(dst, Path(src_rel).name)
            ensure_section_index(dst, Path(src_rel).name)
            for md_file in dst.rglob("*.md"):
                name_to_relpath[md_file.stem.lower()] = f"learning/{slug}/{md_file.relative_to(dst).as_posix()}"

    for slug in [s for _, s in INCLUDE]:
        dst = DOCS_DIR / slug
        if dst.exists():
            convert_wikilinks(dst, DOCS_DIR.parent, name_to_relpath)

    print("Done.")


if __name__ == "__main__":
    main()
