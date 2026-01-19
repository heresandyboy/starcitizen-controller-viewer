# Claude Code Project Instructions

## Session Start / Context Recovery

When starting a new session or after a compact:

1. **Activate Serena** - Call `mcp__plugin_serena_serena__activate_project` with project "starcitizen-controller-viewer"
   - This enables semantic code understanding and project memories
   - The memories contain important context about code style and project structure

2. **Check Beads for Context** - The `bd prime` hook runs automatically, but review the output:
   - `bd ready` shows issues ready to work on
   - `bd list --status=in_progress` shows active work
   - Pick up where the previous session left off

## Project Overview

This is a React + TypeScript monorepo for visualizing Star Citizen controller mappings.
See `.serena/memories/project_overview.md` for detailed architecture.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

## Issue Tracking (Beads)

See [AGENTS.md](AGENTS.md) for full beads workflow. Quick reference:

- `bd ready` - Find available work
- `bd show <id>` - View issue details
- `bd update <id> --status=in_progress` - Claim work
- `bd close <id>` - Complete work

## Session End Protocol

Before ending a session:

1. Close completed beads issues
2. Commit and push code changes
3. The beads daemon auto-syncs beads changes

## Serena Integration

This project uses Serena for semantic code understanding. The `.serena/` directory contains:

- `project.yml` - Serena configuration (TypeScript language server)
- `memories/` - Project knowledge (code_style, project_overview, suggested_commands, task_completion)

After activating the project, read relevant memories for context on code patterns and project structure.
