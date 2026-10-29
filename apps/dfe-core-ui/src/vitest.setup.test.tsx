import { render, screen } from '@testing-library/react';
import { Button } from 'antd';
import { describe, expect, it } from 'vitest';

// vitest.setup.ts empties antd's cssinjs style tags so jsdom's getComputedStyle
// stays fast. An antd or cssinjs upgrade that bypasses that patch fails here
// rather than making every suite slow again.
describe('vitest setup', () => {
  it('keeps antd cssinjs style tags free of CSS rules', async () => {
    render(<Button type="primary">Go</Button>);
    await screen.findByRole('button', { name: 'Go' });

    const styles = Array.from(
      document.querySelectorAll<HTMLStyleElement>('style[data-css-hash]'),
    );

    expect(styles.length).toBeGreaterThan(0);
    for (const style of styles) {
      expect(style.textContent).toBe('');
      expect(style.sheet?.cssRules.length ?? 0).toBe(0);
    }
  });
});
