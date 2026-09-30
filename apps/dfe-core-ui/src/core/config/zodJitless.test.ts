import { describe, expect, test } from 'vitest';
import { util } from 'zod/v4/core';
import './zodJitless';

describe('zod under the console CSP', () => {
  test('never probes for eval, so the policy has nothing to report', () => {
    // Without jitless this evaluates Function(''), which the CSP refuses and reports.
    expect(util.allowsEval.value).toBe(false);
  });
});
