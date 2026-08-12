import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// RTL's auto-cleanup relies on the test framework's global `afterEach`,
// which isn't registered when Vitest's `test.globals` is off (kept off so
// eslint doesn't need a separate vitest-globals config). Wire it manually
// instead so each test starts from an empty DOM.
afterEach(() => {
  cleanup();
});
