# Task Completion Checklist

## After Writing Code
1. **Run tests** (if code changed):
   ```bash
   cd apps/viewer && npm run test
   ```

2. **Run lint** (if TypeScript changed):
   ```bash
   cd apps/viewer && npm run lint
   ```

3. **Run build** (for significant changes):
   ```bash
   cd apps/viewer && npm run build
   ```

## Session Completion (Landing the Plane)

1. **File issues** for remaining work:
   ```bash
   bd create --title="..." --type=task --priority=2
   ```

2. **Update issue status**:
   ```bash
   bd close <id>  # For completed work
   ```

3. **Commit and push code**:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```

4. **Verify clean state**:
   ```bash
   git status  # Should show clean working tree
   ```

## Important Notes
- Work is NOT complete until `git push` succeeds
- beads daemon handles auto-sync of beads data
- Never stop before pushing - that leaves work stranded
