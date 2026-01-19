# Code Style & Conventions

## TypeScript
- Strict mode enabled
- Use explicit type annotations for function parameters
- Prefer `type` over `interface` for object types
- Use `Record<K, V>` for dictionaries
- Import types with `import type { ... }`

## Naming
- Files: camelCase (e.g., `chainResolver.ts`, `dikKeys.ts`)
- Components: PascalCase (e.g., `ConfigUploader.tsx`)
- Functions: camelCase (e.g., `parseRewasdConfig`)
- Constants: SCREAMING_SNAKE_CASE (e.g., `DIK_CODES`)
- Types/Interfaces: PascalCase (e.g., `UnifiedMapping`)

## Testing
- Test files: `__tests__/path/to/module.test.ts` (mirrors src structure)
- Use `describe` blocks to group related tests
- Use `it` for individual test cases
- Import from `vitest`: `{ describe, it, expect, beforeEach }`
- Use `@/` alias for imports from src root
- Test utilities in `src/test/`: fixtures, mocks, matchers, setup

## React Components
- Functional components with hooks
- Props types defined inline or with separate type
- Use Tailwind CSS for styling
- No CSS modules

## Exports
- Named exports preferred over default exports
- Re-export from index files for public API
