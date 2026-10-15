import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { SimpleCollapse } from '.';

describe('SimpleCollapse', () => {
  it('names the toggle after a text title and says whether it is open', async () => {
    const user = userEvent.setup();
    render(<SimpleCollapse title="Schema">body</SimpleCollapse>);

    const toggle = screen.getByRole('button', { name: 'Expand Schema' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);

    expect(
      screen.getByRole('button', { name: 'Collapse Schema' }),
    ).toHaveAttribute('aria-expanded', 'true');
  });

  it('names the toggle by its text when the title is markup', () => {
    render(
      <SimpleCollapse
        title={
          <span>
            <p>Filters</p>
            <p>3 of 3 results</p>
          </span>
        }
      >
        body
      </SimpleCollapse>,
    );

    const toggle = screen.getByRole('button', { name: /^Filters/ });
    expect(toggle).toHaveAccessibleName(/^Filters\s*3 of 3 results$/);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});
