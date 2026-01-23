# Agent Instructions

This document contains instructions for AI coding agents. Generic tooling sections are at the top (shareable), project-specific sections at the bottom.

---

## Beads Issue Tracking

This project uses **bd** (beads) for issue tracking. Beads provides lightweight, git-native issue tracking with first-class dependency support.

### Session Start

When starting a new session or after context compaction:

1. **Prime context** - The `bd prime` hook runs automatically, but review the output
2. **Find work** - `bd ready` shows issues ready to work on (no blockers)
3. **Check active work** - `bd list --status=in_progress` shows work in progress
4. **Pick up where left off** - Review issue details with `bd show <id>`

### Quick Reference

```bash
bd ready              # Find available work (no blockers)
bd show <id>          # View issue details
bd update <id> --status=in_progress  # Claim work
bd close <id>         # Complete work
bd close <id1> <id2>  # Close multiple issues at once
```

### Creating Issues

```bash
bd create --title="..." --type=task|bug|feature --priority=2
# Priority: 0-4 or P0-P4 (0=critical, 2=medium, 4=backlog)
# Do NOT use "high"/"medium"/"low" - use numbers only

bd dep add <issue> <depends-on>  # Add dependency (issue depends on depends-on)
bd blocked                       # Show all blocked issues
```

### Git Branching Model

**Always commit to your current working branch** (usually a feature branch). Never commit directly to protected branches.

See the project-specific section below for branch names and workflow details.

### Protected Branch Workflow (Beads)

Beads uses a **sync-branch workflow** to keep issue tracking data separate from code branches.

**How it works:**

- Beads data is committed to a separate `beads-sync` branch (not your working branches)
- The daemon auto-commits changes to the sync branch via a git worktree
- All code branches stay clean of beads commits
- Sync branch can be merged to `next` via PR when needed

**Setup for new projects:**

```bash
# Option 1: Initialize with sync branch
bd init --branch beads-sync

# Option 2: Configure existing project
bd config set sync.branch beads-sync

# Start daemon with auto-commit and auto-push
bd daemon start --auto-commit --auto-push
```

**Commit the configuration to your branch:**

```bash
git add .beads/.gitignore .gitattributes
git commit -m "Initialize beads issue tracker"
git push
```

**Files by location:**

| Location      | Files                                                                 |
| ------------- | --------------------------------------------------------------------- |
| Code branches | `.beads/.gitignore`, `.gitattributes`                                 |
| Sync branch   | `.beads/issues.jsonl`, `.beads/metadata.json`, `.beads/config.yaml`   |
| Not tracked   | `.beads/beads.db`, `.beads/daemon.*` (runtime files)                  |

**Daily workflow:**

- Create, update, close issues normally - daemon handles sync automatically
- Check sync status: `bd sync --status`
- Manual sync if needed: `bd sync`

**Merging beads-sync to your base branch (when needed):**

```bash
# Via PR (recommended)
git push origin beads-sync
# Create PR: base=<your-base-branch>, compare=beads-sync
# After merge: git checkout <base-branch> && git pull && bd import

# Direct merge (if allowed)
bd sync --merge --dry-run  # Preview
bd sync --merge            # Execute
```

**Troubleshooting:**

```bash
bd daemon status              # Check daemon health
bd config get sync.branch     # Verify sync branch configured
bd sync --status              # Check sync state
```

### Session Completion (Landing the Plane)

**When ending a work session**, complete ALL steps. Work is NOT complete until pushed.

1. **File issues for remaining work** - Create issues for anything needing follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **Commit and push code to your current branch**:

   ```bash
   git add .
   git commit -m "Your message"
   git push
   ```

5. **Verify** - `git status` should show clean working tree
6. **Hand off** - Provide context for next session

**Critical rules:**

- Work is NOT complete until `git push` succeeds
- Commit to your **current working branch** (feature branch) - never directly to protected branches
- Beads daemon auto-syncs to the `beads-sync` branch (no manual `bd sync` needed)
- NEVER stop before pushing - that leaves work stranded locally

---

## Serena Integration

This project uses Serena for semantic code understanding.

### Serena Session Start

**Activate Serena** at session start:

- Call `mcp__plugin_serena_serena__activate_project` with the project name
- This enables semantic code navigation and project memories
- Memories contain important context about code style and structure

### Serena Project Structure

The `.serena/` directory contains:

- `project.yml` - Serena configuration (language server settings)
- `memories/` - Project knowledge (code_style, project_overview, suggested_commands)

After activating, read relevant memories for context on code patterns and architecture.

### Using Serena Tools

Prefer symbolic operations over text-based file reading:

- `get_symbols_overview` - Understand file structure
- `find_symbol` - Locate specific classes, functions, methods
- `find_referencing_symbols` - Find usages of a symbol
- `replace_symbol_body` - Edit entire symbol definitions
- `replace_content` - Regex-based edits for smaller changes

---

## Project-Specific Configuration

*The sections below are specific to this project.*

### Git Branch Structure

- **`main`** - Protected, production-ready code. Receives PRs from `next` only. Never commit directly.
- **`next`** - Integration branch. Feature branches merge here via PR. Accumulates changes before promoting to `main`.
- **Feature branches** - Where daily work happens. Branch from `next`, PR back to `next`.
- **`beads-sync`** - Beads issue tracking data (auto-managed by daemon).

### Project Overview

This is a React + TypeScript monorepo for visualizing Star Citizen controller mappings.

See `.serena/memories/project_overview.md` for detailed architecture.

### Serena Project Name

```text
starcitizen-controller-viewer
```

### Development Commands

```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run test   # Run tests
npm run lint   # Run ESLint
```
