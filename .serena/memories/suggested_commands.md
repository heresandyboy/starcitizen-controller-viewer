# Suggested Commands

## Development
```bash
cd apps/viewer
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Run ESLint
```

## Testing
```bash
cd apps/viewer
npm run test         # Run unit tests (vitest run)
npm run test:watch   # Watch mode
npm run test:coverage # With coverage report
npm run test:ui      # Vitest UI
npm run test:e2e     # Playwright E2E tests
npm run test:e2e:ui  # Playwright with UI
```

## Issue Tracking (beads)
```bash
bd ready             # Find available work
bd show <id>         # View issue details
bd update <id> --status=in_progress  # Claim work
bd close <id>        # Complete work
bd sync              # Sync beads (handled by daemon)
```

## Git
```bash
git status           # Check status
git add <files>      # Stage changes
git commit -m "msg"  # Commit
git push             # Push to remote
```

## Windows-specific
- Use forward slashes in paths or escape backslashes
- PowerShell or Git Bash recommended
- `find` equivalent: `Get-ChildItem -Recurse` or use Serena tools
