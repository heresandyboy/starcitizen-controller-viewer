# Agent Instructions

This project uses **bd** (beads) for issue tracking with a **sync-branch workflow**.

## Sync Branch Setup

Beads data is committed to the `beads-sync` branch (not main). This keeps the main branch clean of beads commits while allowing collaboration.

- `.beads/` is gitignored on main branch
- `bd sync` commits to `beads-sync` branch via worktree
- Run `bd onboard` to get started

## Quick Reference

```bash
bd ready              # Find available work (no blockers)
bd show <id>          # View issue details
bd update <id> --status=in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync beads to beads-sync branch
```

## Creating Issues

```bash
bd create --title="..." --type=task|bug|feature --priority=2
# Priority: 0-4 (0=critical, 2=medium, 4=backlog)

bd dep add <issue> <depends-on>  # Add dependency
```

## Landing the Plane (Session Completion)

**When ending a work session**, complete ALL steps below. Work is NOT complete until pushed.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **Sync and push**:
   ```bash
   # Sync beads to beads-sync branch
   bd sync

   # Commit and push code changes to main
   git add .
   git commit -m "Your message"
   git push

   # Verify
   git status  # Should show clean working tree
   ```

5. **Hand off** - Provide context for next session

**CRITICAL RULES:**

- Work is NOT complete until `git push` succeeds
- `bd sync` handles beads → beads-sync branch (separate from main)
- Code changes go to main branch via normal git workflow
- NEVER stop before pushing - that leaves work stranded locally
