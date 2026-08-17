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
from urllib.parse import quote, unquote

VAULT_ROOT = Path(__file__).resolve().parents[2] / "second-brain"
DOCS_DIR = Path(__file__).resolve().parents[1] / "docs" / "learning"

# Each entry: (vault-relative source folder, destination slug under docs/learning/)
# NOTE: the AI Practitioner notes live under 04_Cold Storage now, not 01_Active --
# the old 01_Active paths were empty, which is why those sections were bare stubs.
INCLUDE = [
    ("04_Cold Storage (Archive)/Notes/AWS/AWS Certified AI Practitioner - AIF C01", "aws-ai-practitioner-aif-c01"),
    ("01_Active (Projects + Current Focus)/AWS Certified Generative AI Developer - Professional (AIP-C01)", "aws-genai-developer-aip-c01"),
    ("01_Active (Projects + Current Focus)/AIP-C01 Exam Prep", "aip-c01-exam-prep"),
    ("01_Active (Projects + Current Focus)/Learning System Design", "system-design"),
    ("01_Active (Projects + Current Focus)/LLD", "lld"),
    ("02_Life Systems (Areas)/1_Learning/STUDYING/2_Problem Solving", "problem-solving"),
    # Essay-style reads -- narrative explainers rather than study notes
    ("03_Knowledge Assets (Resources)/6_Foundations", "reads-foundations"),
    ("03_Knowledge Assets (Resources)/1_Tech & Engineering", "reads-tech"),
    ("03_Knowledge Assets (Resources)/5_General Reads", "reads-general"),
    ("02_Life Systems (Areas)/4_Finance", "reads-economics"),
    ("03_Knowledge Assets (Resources)/7_Books", "reads-books"),
]

# Glob patterns (relative to each source folder) to skip even inside an included folder.
# The named entries below are personal and must never reach the published site --
# 4_Finance is included for its general economics essays only.
EXCLUDE_PATTERNS = [
    "*.DS_Store",
    ".obsidian*",
    "1_ETFS System.md",
    "Sort Payment*",
    "*Lokhandwala*",
]

WIKILINK_RE = re.compile(r"!?\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]")

# Average adult reading speed for non-fiction prose. Deliberately conservative --
# these notes are dense, so over-estimating the pace would be unhelpful.
READING_WPM = 200
FRONTMATTER_RE = re.compile(r"\A---\n.*?\n---\n", re.DOTALL)


def add_reading_time(dst: Path):
    """Stamp an estimated reading time under each page's H1, so a page can be
    picked to fit the time actually available. Skips generated index stubs and
    anything too short for the estimate to mean anything."""
    for md_file in sorted(dst.rglob("*.md")):
        if md_file.name == "index.md":
            continue
        text = md_file.read_text(encoding="utf-8", errors="ignore")
        if "min read*" in text:
            continue

        body = FRONTMATTER_RE.sub("", text)
        words = len(re.findall(r"\b[\w'-]+\b", body))
        if words < 300:
            continue
        minutes = max(1, round(words / READING_WPM))

        lines = text.split("\n")
        in_fence = False
        for i, line in enumerate(lines):
            if line.lstrip().startswith("```"):
                in_fence = not in_fence
                continue
            if not in_fence and line.startswith("# "):
                lines.insert(i + 1, f"\n<small>{minutes} min read</small>")
                md_file.write_text("\n".join(lines), encoding="utf-8")
                break


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


def promote_readme_to_index(dst: Path):
    """MkDocs maps README.md and index.md to the same URL, so having both drops one
    and breaks every link to it. A hand-written README is a better landing page than
    a generated stub, so rename it into place before ensure_section_index() runs."""
    for readme in sorted(dst.rglob("README.md")):
        index = readme.parent / "index.md"
        if not index.exists():
            readme.rename(index)


def fix_readme_links(dst: Path):
    """Repoint any link still aimed at README.md now that it has become index.md."""
    pattern = re.compile(r"\]\(([^)]*?)README\.md\)")
    for md_file in dst.rglob("*.md"):
        text = md_file.read_text(encoding="utf-8", errors="ignore")
        new_text = pattern.sub(r"](\1index.md)", text)
        if new_text != text:
            md_file.write_text(new_text, encoding="utf-8")


MD_LINK_RE = re.compile(r"\]\(([^)]+\.md)\)")


def add_backlinks(docs_root: Path):
    """Append a 'Linked from' section to each note listing the pages that point at
    it. The vault is a graph; without this the published copy is only a tree."""
    incoming = {}   # canonical target path -> set of (title, source path)
    titles = {}

    pages = sorted(docs_root.rglob("*.md"))
    for md in pages:
        text = md.read_text(encoding="utf-8", errors="ignore")
        m = re.search(r"^#\s+(.+)$", text, re.MULTILINE)
        titles[md] = m.group(1).strip() if m else md.stem

    for md in pages:
        text = md.read_text(encoding="utf-8", errors="ignore")
        for raw in MD_LINK_RE.findall(text):
            if raw.startswith(("http://", "https://", "#")):
                continue
            target = (md.parent / unquote(raw)).resolve()
            if target == md.resolve() or not target.exists():
                continue
            incoming.setdefault(target, set()).add(md)

    for md in pages:
        sources = incoming.get(md.resolve())
        if not sources or md.name == "index.md":
            continue
        entries = []
        for src in sorted(sources, key=lambda p: titles[p].lower()):
            rel = Path(os.path.relpath(src, md.parent)).as_posix()
            entries.append(f"- [{titles[src]}]({quote(rel)})")
        if not entries:
            continue
        block = "\n\n## Linked from\n\n" + "\n".join(entries) + "\n"
        with md.open("a", encoding="utf-8") as fh:
            fh.write(block)


NUMERIC_PREFIX_RE = re.compile(r"^\d+[_.]\s*")


def write_pages_title(dst: Path, title: str):
    """awesome-pages: give the nav section a readable title instead of the slugged folder name.
    Vault folders are prefixed for manual sort order (e.g. "7_Books") -- strip that for display."""
    clean_title = NUMERIC_PREFIX_RE.sub("", title)
    (dst / ".pages").write_text(f"title: {clean_title}\n", encoding="utf-8")


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
            link = f"{item.name}/index.md" if child_index.exists() else None
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
            promote_readme_to_index(dst)
            write_pages_title(dst, Path(src_rel).name)
            ensure_section_index(dst, Path(src_rel).name)
            for md_file in dst.rglob("*.md"):
                name_to_relpath[md_file.stem.lower()] = f"learning/{slug}/{md_file.relative_to(dst).as_posix()}"

    for slug in [s for _, s in INCLUDE]:
        dst = DOCS_DIR / slug
        if dst.exists():
            convert_wikilinks(dst, DOCS_DIR.parent, name_to_relpath)
            fix_readme_links(dst)
            add_reading_time(dst)

    add_backlinks(DOCS_DIR)

    print("Done.")


if __name__ == "__main__":
    main()
