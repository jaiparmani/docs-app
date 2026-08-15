---
tags: [reads, tech, git, internals]
---

# What Git Actually Does When You Commit

<small>6 min read</small>

Most people use Git for years with a mental model that goes something like: it saves a snapshot of my changes, remembers what I changed, and lets me go back. That model gets you through daily work fine. But it's wrong in an interesting way, and the actual answer is simpler and stranger than what most people assume.

Git doesn't store changes. It stores complete snapshots of every file, every time, and gets away with it through one clever trick.

## Everything is a file named after its own contents

Git's entire storage layer rests on one idea: take some content, run it through a hash function (SHA-1, historically), and use the resulting 40-character string as the filename. That's it. That's the whole trick, and everything else follows from it.

So when you commit a file, Git takes its contents, hashes them, and stores a compressed copy in `.git/objects/` under a directory and filename derived from that hash. This is called a **blob** — it holds the file's contents and nothing else. Not the filename, not the path, not any metadata. Just bytes.

The immediate, non-obvious consequence: **if two files anywhere in your repository have identical contents, Git stores that content exactly once.** Not because Git has clever deduplication logic, but because both files hash to the same value, so both point at the same object. Deduplication isn't a feature Git implements — it's an unavoidable side effect of naming things after their contents. Copy a file, commit both copies, and Git stores one blob with two references to it.

The same consequence explains why committing an unchanged file across a hundred commits costs almost nothing. The content is identical, so the hash is identical, so it's the same object every time. Git isn't computing a diff and deciding to skip it; it's simply arriving at a filename that already exists on disk.

One caveat is worth knowing, because it's the thing people correctly object to when they hear "Git stores full snapshots." Git does eventually repack its object store into *packfiles*, and inside a packfile an object may be stored as a delta against a similar object rather than in full. But that's a compression layer underneath the model, applied opportunistically and invisibly. At the level Git actually reasons about — identity, history, what a commit means — every object is still a complete, independently addressable snapshot.

If blobs hold contents but not filenames, something has to remember that a particular blob is `src/main.js`. That's a **tree** object — essentially a directory listing, mapping names to the blobs (files) or other trees (subdirectories) they contain. A tree for a folder with two files and one subfolder is a small file listing three entries and their hashes. And because a tree's own contents are just that list of names and hashes, the tree gets hashed and stored the same way. Change one file, and its blob hash changes, which changes the containing tree's contents, which changes that tree's hash, which changes its parent tree's hash, all the way up to the root.

Finally, a **commit** object points to one root tree (the complete state of your project at that moment), plus the hash of its parent commit, plus the author, timestamp, and message. Hash all that, and you get the commit ID you see in `git log`.

So the full picture is: commit → tree → subtrees → blobs. Every layer named by the hash of its own contents, every layer pointing at the layer below by hash.

## Why this makes history tamper-evident

Here's where it gets genuinely elegant. A commit's hash is computed from its content, which includes its parent's hash. Which was computed from *its* content, including *its* parent's hash. And so on back to the first commit.

That means you cannot quietly change anything in the past. Alter a single character in a file from three months ago, and that blob's hash changes → its tree's hash changes → the commit's hash changes → and now every commit after it, which recorded the old hash as their parent, is pointing at a commit ID that no longer exists. The chain visibly breaks.

This is exactly the property that makes a blockchain a blockchain, and Git had it years before anyone was using that word in this context. Git isn't a blockchain in the distributed-consensus sense — there's no mining, no network agreement protocol, no attempt to solve who-decides-what among mutually distrustful parties. But the underlying data structure, a chain of content-addressed blocks each committing to its predecessor's hash, is the same idea, and it's the reason `git log` is trustworthy: not because Git guards the history, but because the history's structure makes silent edits mathematically impossible to hide.

It also explains something that confuses people about rebase. When you rebase, you're not "moving" commits. You genuinely cannot move a commit — its identity is its content, and its content includes its parent. Rebasing creates *brand new commits* with the same changes and messages but different parents, and therefore different hashes. The old commits still exist, unreferenced, until Git eventually garbage-collects them. That's why rebasing shared branches causes such trouble: everyone else is still pointing at commit objects that you've effectively abandoned in favor of newly-created near-identical ones.

## Branches are almost embarrassingly simple

Given all this machinery, you'd expect branches to be substantial. They're not. A branch in Git is a file containing a single 40-character hash.

Go look: `.git/refs/heads/main` is a text file whose entire contents are the hash of the commit that branch currently points at. Creating a branch writes one small file. Deleting a branch deletes one small file. Switching branches updates `HEAD` to say which ref you're on and rearranges your working directory to match that commit's tree.

This is why branching in Git is instant and free, and why it felt like such a dramatic improvement over older version control systems where creating a branch meant copying the entire codebase server-side. Git branches feel lightweight because they are, structurally, almost nothing — a pointer into a graph of objects that already exists. All the actual content lives in the object store, shared across every branch that references it.

## The part worth carrying around

The interesting thing about Git internals isn't the trivia — it's that a whole set of Git's user-facing behaviors that seem arbitrary or confusing turn out to be direct, unavoidable consequences of one design decision. Content-addressed storage gives you deduplication, cheap branching, tamper-evident history, and the reason rebase rewrites rather than moves, all for free, without any of those being separately designed features.

That's a fairly rare thing in software. Most systems get their properties by implementing them deliberately, one at a time. Git got a surprising number of its best properties by picking the right way to name things and letting the rest follow.


## Linked from

- [1_Tech & Engineering](index.md)
