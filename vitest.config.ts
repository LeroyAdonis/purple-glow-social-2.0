import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/**
 * Two problems this config exists to fix, both discovered 2026-10-26 when the full suite reported
 * 127 failures and nobody could tell whether a change had caused them:
 *
 * 1. `e2e-tests/*.spec.ts` are Playwright specs (`import { test } from '@playwright/test'`) with a
 *    real `playwright.config.ts` beside them. Vitest was sweeping them up and failing every file.
 *    They are excluded here; that is not lost coverage, it is them running under the runner they
 *    were written for.
 * 2. `tests/components/*.test.tsx` failed with `ReferenceError: document is not defined` — component
 *    tests with no DOM. jsdom is already a dependency, so it is the default environment here.
 *
 * Without this, `npx vitest run` could never be green, and a real regression would hide among the
 * noise. A test suite that cannot be trusted is worse than no suite.
 *
 * 3. `tests/integration/*.test.ts` open a real Postgres connection at module load. With no
 *    DATABASE_URL they throw during COLLECTION, so the file reports as a failure and makes the whole
 *    suite red for a reason that has nothing to do with the code. They are excluded unless a database
 *    is configured, and the exclusion is announced loudly rather than passing silently — a skip that
 *    nobody sees is how integration coverage quietly disappears.
 */
const hasDatabase = Boolean(process.env.DATABASE_URL);
if (!hasDatabase) {
  console.warn(
    '[vitest] SKIPPING tests/integration/** — no DATABASE_URL. Those assertions need a real database; ' +
      'they are NOT passing, they are not run. Set DATABASE_URL to include them.',
  );
}
export default defineConfig({
  resolve: {
    // The source uses the `@/` alias (tsconfig `paths`); vitest does not read tsconfig paths itself.
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    // Needed so @testing-library/react registers its automatic afterEach cleanup. Without it each
    // render leaks into the next test and the DOM fills up, which is why assertions failed with
    // "Found multiple elements with the text: ..." instead of a real defect.
    globals: true,
    exclude: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      // Playwright owns these; see the note above.
      'e2e-tests/**',
      // A real database is required at import time; see note 3.
      ...(hasDatabase ? [] : ['tests/integration/**']),
    ],
    setupFiles: ['./vitest.setup.ts'],
  },
});
