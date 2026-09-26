import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';
import { CopyCodeBlock } from '.';

const COMMAND =
  'git fetch && git switch main && git merge --no-ff dfe/governance/admin/abcd1234 && git push';

describe('CopyCodeBlock', () => {
  test('shows the code exactly, whitespace included, for anyone selecting it by hand', () => {
    const code = 'first  line\n\tsecond --no-ff ';

    const { container } = render(<CopyCodeBlock code={code} />);

    expect(container.querySelector('code')?.textContent).toBe(code);
  });

  test('copies the command as given', async () => {
    const user = userEvent.setup();
    render(<CopyCodeBlock code={COMMAND} />);

    await user.click(screen.getByRole('button', { name: 'Copy to clipboard' }));

    await expect(navigator.clipboard.readText()).resolves.toBe(COMMAND);
  });
});
