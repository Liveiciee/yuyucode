# yugit

`yugit.cjs` is YuyuCode's git workflow helper. It wraps conventional commits, auto version bumping, and common git operations into single commands optimised for a phone keyboard.

## Basic Usage

```bash
node yugit.cjs "feat: add dark mode toggle"
```

Stages all changes, commits with the message, and pushes to origin.

## Commit Types

YuyuCode follows [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Meaning | Version bump |
|--------|---------|-------------|
| `feat:` | New feature | patch |
| `fix:` | Bug fix | patch |
| `docs:` | Documentation | patch |
| `chore:` | Maintenance | patch |
| `test:` | Tests | patch |
| `perf:` | Performance | patch |
| `refactor:` | Refactoring | patch |
| `ci:` | CI changes | patch |
| `feat!:` | Breaking change | major |
| `release:` | Release | **set from message** |

### Scopes

```bash
node yugit.cjs "feat(api): add retry logic"
node yugit.cjs "fix(editor): ghost text not clearing"
```

### Breaking changes

```bash
node yugit.cjs "feat!: overhaul agent loop API"
```

`!` after type → major version bump.

---

## Flags

### `--no-push`
Commit without pushing:
```bash
node yugit.cjs "wip: in progress" --no-push
```

### `--amend`
Amend the last commit:
```bash
node yugit.cjs "fix: typo in prev commit" --amend
```

### `--push`
Push existing local commits without a new commit:
```bash
node yugit.cjs --push
```

### `--status`
Show branch, uncommitted changes, and last 3 commits:
```bash
node yugit.cjs --status
```

### `--hash=<hash>`
Revert a specific commit:
```bash
node yugit.cjs "revert: bad deploy" --hash=abc1234
```

### `--squash <n>`
Squash last N commits into one:
```bash
node yugit.cjs "feat: combined" --squash 3
```

---

## Release Flow

```bash
node yugit.cjs "release: v4.3 — agent swarm improvements"
```

When a commit message starts with `release:`:

1. Extracts version from message (`v4.3` → `4.3.0`)
2. Writes new version to `package.json`
3. Commits + pushes
4. CI detects `release:` prefix → creates GitHub Release with signed APK

Version can be explicit (`release: v4.3.1`) or yugit will bump patch by default.

---

## Multi-line Commits

```bash
node yugit.cjs "feat: new feature" "Detailed body text here" "BREAKING CHANGE: removed old API"
```

Three arguments: message, body, footer.

---

## What it does internally

```
node yugit.cjs "feat: ..."
    │
    ▼
git status --short          (sanity check — must be in git repo)
    │
    ▼
release: prefix?
  yes → bumpVersion() → write package.json → stage package.json
    │
    ▼
git add -A                  (stage all)
    │
    ▼
git diff --cached --stat    (show diff summary)
    │
    ▼
git commit -m "..."
    │
    ▼
--no-push? → done
    │
    ▼
git push                    (push to origin)
    │
    ▼
push rejected?
  → "💡 Fix: git pull --rebase && node yugit.cjs ... --push"
```

---

## Common Patterns

```bash
# Daily work
node yugit.cjs "feat: add /search command"
node yugit.cjs "fix: patch_file failing on whitespace"
node yugit.cjs "docs: update getting started"

# Release
node yugit.cjs "release: v4.3 — new features"

# After rebase/merge conflict
git pull --rebase
node yugit.cjs --push

# Check before committing
node yugit.cjs --status

# Undo last commit (keep changes)
git reset HEAD~1
# Edit, then:
node yugit.cjs "fix: corrected approach"
```
