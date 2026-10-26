/**
 * jest-dom matchers (`toBeInTheDocument`, `toHaveAttribute`, …) are not built into vitest.
 * Without this import every component assertion fails for the wrong reason, which is exactly the
 * noise that made 127 failures unreadable.
 */
import '@testing-library/jest-dom/vitest';
