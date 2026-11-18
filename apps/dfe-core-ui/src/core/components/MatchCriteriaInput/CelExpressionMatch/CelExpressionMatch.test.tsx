// The Ace mode and theme modules read the `ace` global, so it loads first.
import 'ace-builds/src-noconflict/ace';

import { CelExpressionMatch } from '@/core/components/MatchCriteriaInput/CelExpressionMatch';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render } from '@testing-library/react';
import type { Editor } from 'ace-builds';
import { describe, expect, test, vi } from 'vitest';

vi.mock('@/core/hooks/useCelCheck', () => ({
  useCheckCel: () => ({
    data: { valid: false, errors: ['unknown field host', 'not tier 1'] },
    mutate: vi.fn(),
    isPending: false,
    error: null,
    reset: vi.fn(),
  }),
}));

const { wrapper } = buildTestWrapper().withTheme();

const editorIn = (container: HTMLElement) => {
  const node = container.querySelector('.ace_editor');
  return (node as HTMLElement & { env?: { editor: Editor } }).env?.editor;
};

describe('CelExpressionMatch', () => {
  test('marks each check error in the editor', () => {
    const { container } = render(<CelExpressionMatch />, { wrapper });

    expect(editorIn(container)?.session.getAnnotations()).toEqual([
      { row: 0, column: 0, text: 'unknown field host', type: 'error' },
      { row: 0, column: 0, text: 'not tier 1', type: 'error' },
    ]);
  });
});
