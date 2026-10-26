import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/**
 * Minimal vitest config: the repo's source uses the `@/` alias (tsconfig `paths`)
 * and vitest does not read tsconfig paths on its own, so the alias is resolved here.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
});
