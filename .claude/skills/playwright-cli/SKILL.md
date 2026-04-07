---
name: playwright-cli
description: >
  Browser automation and Playwright test execution via CLI. Use when the user
  asks to test a web page, automate browser interactions, take screenshots,
  fill forms, run E2E tests, debug test failures, or verify UI visually.
  Triggers on: "test the page", "take a screenshot", "run e2e", "open browser",
  "check the UI", "playwright", "browser test", "visual check".
allowed-tools: Bash(npx:*) Bash(playwright-cli:*) Bash(npm:*) Read Write Edit Glob Grep
---

# Browser Automation & Testing with Playwright CLI

Two tools, one skill:

| Tool | Purpose | Install |
|------|---------|---------|
| `playwright-cli` | Interactive browser automation for AI agents (snapshots, refs, sessions) | `npm install -g @playwright/cli@latest` |
| `npx playwright test` | Run Playwright test suites | Already available via `@playwright/test` |

## First-Time Setup

Check if tools are available, install if missing:

```bash
# Check playwright-cli (AI agent CLI)
npx --no-install playwright-cli --version 2>/dev/null || npm install -g @playwright/cli@latest

# Ensure browsers are installed
npx playwright install chromium
```

---

## Part 1: Browser Automation (playwright-cli)

Interactive, stateful browser control via snapshot-based element refs.

### Core Workflow

Every automation follows: **Navigate -> Snapshot -> Interact -> Re-snapshot**

```bash
playwright-cli open https://localhost:3000
playwright-cli snapshot                    # Get element refs (e1, e2, ...)
playwright-cli click e5                    # Interact using refs
playwright-cli snapshot                    # Re-snapshot after DOM changes
playwright-cli close
```

### Essential Commands

```bash
# Navigation
playwright-cli open <url>
playwright-cli open                        # Open blank browser
playwright-cli goto <url>                  # Navigate existing browser
playwright-cli go-back
playwright-cli go-forward
playwright-cli reload
playwright-cli close

# Snapshot (get element refs)
playwright-cli snapshot                    # Full page snapshot
playwright-cli snapshot "#selector"        # Scoped snapshot
playwright-cli snapshot --depth=4          # Limit depth for large pages

# Interaction (use refs from snapshot)
playwright-cli click e3
playwright-cli fill e5 "user@example.com" --submit   # --submit presses Enter after
playwright-cli type "search query"         # Type into focused element
playwright-cli select e9 "option-value"
playwright-cli check e12
playwright-cli uncheck e12
playwright-cli hover e4
playwright-cli drag e2 e8
playwright-cli upload ./file.pdf

# Keyboard
playwright-cli press Enter
playwright-cli press ArrowDown
playwright-cli keydown Shift
playwright-cli keyup Shift

# Mouse
playwright-cli mousemove 150 300
playwright-cli mousewheel 0 100
playwright-cli scroll down 500

# Get information
playwright-cli eval "document.title"
playwright-cli eval "el => el.textContent" e5
playwright-cli eval "el => el.getAttribute('data-testid')" e5

# Capture
playwright-cli screenshot
playwright-cli screenshot e5              # Element screenshot
playwright-cli screenshot --filename=page.png
playwright-cli pdf --filename=page.pdf

# Wait
playwright-cli wait e1                    # Wait for element
playwright-cli wait --load networkidle    # Wait for network idle
playwright-cli wait --url "**/dashboard"  # Wait for URL pattern

# Tabs
playwright-cli tab-list
playwright-cli tab-new https://example.com
playwright-cli tab-select 0
playwright-cli tab-close

# Dialogs
playwright-cli dialog-accept
playwright-cli dialog-dismiss

# Resize
playwright-cli resize 1920 1080
```

### Element Targeting

Prefer refs from snapshots. Alternatives when needed:

```bash
playwright-cli click e15                                        # Ref (preferred)
playwright-cli click "#main > button.submit"                    # CSS selector
playwright-cli click "getByRole('button', { name: 'Submit' })"  # Playwright locator
playwright-cli click "getByTestId('submit-button')"             # Test ID
```

### Raw Output (for piping)

```bash
playwright-cli --raw eval "document.title"
playwright-cli --raw snapshot > page.yml
playwright-cli --raw eval "JSON.stringify([...document.querySelectorAll('a')].map(a => a.href))" > links.json
```

### Sessions

```bash
playwright-cli -s=session1 open https://site-a.com
playwright-cli -s=session2 open https://site-b.com
playwright-cli list                        # List sessions
playwright-cli -s=session1 close
playwright-cli close-all

# Persistent profile (survives close)
playwright-cli open --persistent
playwright-cli open --browser=firefox
playwright-cli open --browser=webkit
```

### Storage & State

```bash
# Save/load full state (cookies + localStorage)
playwright-cli state-save auth.json
playwright-cli state-load auth.json

# Cookies
playwright-cli cookie-list
playwright-cli cookie-get session_id
playwright-cli cookie-set session_id abc123 --domain=example.com --httpOnly --secure
playwright-cli cookie-delete session_id

# LocalStorage
playwright-cli localstorage-get theme
playwright-cli localstorage-set theme dark
playwright-cli localstorage-clear
```

### Network Mocking

```bash
playwright-cli route "**/*.jpg" --status=404
playwright-cli route "https://api.example.com/**" --body='{"mock": true}'
playwright-cli route-list
playwright-cli unroute "**/*.jpg"
```

### DevTools & Debugging

```bash
playwright-cli console                     # Show console messages
playwright-cli console warning             # Filter by level
playwright-cli network                     # Show network requests
playwright-cli tracing-start
playwright-cli tracing-stop
playwright-cli video-start demo.webm
playwright-cli video-stop
```

### Ref Lifecycle (Important)

Refs are invalidated when the page changes. **Always re-snapshot after:**
- Clicking links/buttons that navigate
- Form submissions
- Dynamic content loading (dropdowns, modals, SPAs)

---

## Part 2: Running Playwright Tests

This project's config: [apps/viewer/playwright.config.ts](../../apps/viewer/playwright.config.ts)
- Test dir: `apps/viewer/e2e/`
- Base URL: `http://localhost:3000`
- Browsers: chromium, firefox, webkit, mobile-chrome, mobile-safari

### Run Tests

```bash
# Run from the viewer app directory
cd apps/viewer

# All tests
npx playwright test

# Specific file
npx playwright test e2e/my-test.spec.ts

# Specific line
npx playwright test e2e/my-test.spec.ts:42

# By name pattern
npx playwright test -g "login"

# Single browser
npx playwright test --project=chromium

# Headed (visible browser)
npx playwright test --headed

# Stop on first failure
npx playwright test -x

# Serial execution (easier to debug)
npx playwright test --workers=1

# Rerun only failures
npx playwright test --last-failed

# Only files changed in git
npx playwright test --only-changed

# Machine-readable output (best for AI parsing)
npx playwright test --reporter=json

# With trace capture
npx playwright test --trace=on
```

### View Reports & Traces

```bash
npx playwright show-report
npx playwright show-trace trace.zip
```

### Update Visual Snapshots

```bash
npx playwright test --update-snapshots
```

### Debug Mode

```bash
npx playwright test --debug    # Opens Playwright Inspector, sets timeout=0
```

---

## Writing Tests: Key Patterns

### Selector Priority (use in order)

1. `getByRole('button', { name: 'Submit' })` -- accessible, resilient
2. `getByLabel('Email')` -- form fields
3. `getByPlaceholder('Enter email')` -- when label missing
4. `getByText('Welcome')` -- visible text
5. `getByTestId('submit-btn')` -- last resort

### Assertions: Always Web-First

```typescript
// Good: auto-retries until timeout
await expect(page.getByRole('heading')).toBeVisible();
await expect(page.getByRole('alert')).toHaveText('Saved');
await expect(page).toHaveURL('/dashboard');

// Bad: no auto-retry, races with DOM
const text = await page.textContent('.msg');
expect(text).toBe('Saved');
```

### Anti-Patterns

| Don't | Do | Why |
|-------|-----|-----|
| `page.waitForTimeout(3000)` | `await expect(locator).toBeVisible()` | Hard waits are flaky |
| `page.$('.btn')` | `page.getByRole('button')` | Fragile selector |
| `try/catch` around assertions | Let Playwright handle retries | Swallows real failures |
| Shared state between tests | `test.beforeEach` for setup | Tests must be independent |

### Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    await page.getByRole('button', { name: 'Start' }).click();
    await expect(page.getByRole('heading')).toHaveText('Started');
  });
});
```

### Screenshots & Visual Regression

```typescript
await expect(page).toHaveScreenshot('homepage.png', {
  maxDiffPixelRatio: 0.01,
  animations: 'disabled',
  mask: [page.locator('.dynamic-content')],
});
```

### Network Mocking in Tests

```typescript
await page.route('**/api/users', (route) =>
  route.fulfill({ json: [{ id: 1, name: 'Mock User' }] })
);
```

### Auth State Reuse

```typescript
// Save once in global setup
await page.context().storageState({ path: 'auth.json' });
// Reuse in config: use: { storageState: 'auth.json' }
```
