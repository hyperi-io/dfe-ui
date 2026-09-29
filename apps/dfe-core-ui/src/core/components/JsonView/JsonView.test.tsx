import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';
import { JsonView, type JsonViewPath } from '.';

const EVENT = {
  user: { name: 'ada', address: { city: 'Perth' } },
  tags: ['red', 'blue'],
  count: 3,
};

// A collapsible node's toggle is named by its line: the quoted key, then the bracket.
const toggleFor = (key: string) =>
  screen.getByRole('button', {
    name: (name) => name.startsWith(`"${key}"`),
  });

describe('JsonView', () => {
  test('opens only to the initial depth, so nested objects start collapsed', () => {
    render(<JsonView data={EVENT} initialDepth={1} />);

    expect(toggleFor('user')).toHaveAttribute('aria-expanded', 'false');
    expect(toggleFor('user')).toHaveTextContent('2 keys');
    expect(screen.queryByText('"name"')).not.toBeInTheDocument();
    expect(screen.getByText('"count"')).toBeInTheDocument();
  });

  test('expands a nested object on click and collapses it again', async () => {
    const user = userEvent.setup();
    render(<JsonView data={EVENT} initialDepth={1} />);

    await user.click(toggleFor('user'));

    expect(toggleFor('user')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('"name"')).toBeInTheDocument();
    expect(toggleFor('address')).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('"city"')).not.toBeInTheDocument();

    await user.click(toggleFor('address'));
    expect(screen.getByText('"Perth"')).toBeInTheDocument();

    await user.click(toggleFor('user'));
    expect(screen.queryByText('"name"')).not.toBeInTheDocument();
    expect(screen.queryByText('"Perth"')).not.toBeInTheDocument();
  });

  test('expands an array to show its items', async () => {
    const user = userEvent.setup();
    render(<JsonView data={EVENT} initialDepth={1} />);

    expect(toggleFor('tags')).toHaveTextContent('2 items');
    expect(screen.queryByText('"red"')).not.toBeInTheDocument();

    await user.click(toggleFor('tags'));

    expect(screen.getByText('"red"')).toBeInTheDocument();
    expect(screen.getByText('"blue"')).toBeInTheDocument();
  });

  test('renders an empty object and array inline, with nothing to expand', () => {
    render(<JsonView data={{ none: {}, empty: [] }} />);

    expect(
      screen.queryByRole('button', { name: /^"none"/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('{}')).toBeInTheDocument();
    expect(screen.getByText('[]')).toBeInTheDocument();
  });

  test('hands every node its key path, with array positions as numbers', () => {
    const seen: JsonViewPath[] = [];
    render(
      <JsonView
        data={EVENT}
        renderActions={(node) => {
          seen.push(node.path);
          return null;
        }}
      />,
    );

    expect(seen).toContainEqual(['user', 'address', 'city']);
    expect(seen).toContainEqual(['tags', 1]);
    expect(seen).toContainEqual(['count']);
  });

  test('renders what a caller hangs on a node beside its value', () => {
    render(
      <JsonView
        data={EVENT}
        renderActions={({ path }) =>
          path.join('.') === 'user.name' ? (
            <button type="button">Act on user.name</button>
          ) : null
        }
      />,
    );

    expect(
      screen.getAllByRole('button', { name: 'Act on user.name' }),
    ).toHaveLength(1);
  });

  test('copies a node as formatted JSON', async () => {
    const user = userEvent.setup();
    render(<JsonView data={{ tags: ['red'] }} />);

    const rootCopy = screen
      .getAllByRole('button', { name: 'Copy value' })
      .at(0);
    if (!rootCopy) throw new Error('the root line has no copy button');
    await user.click(rootCopy);

    await expect(navigator.clipboard.readText()).resolves.toBe(
      JSON.stringify({ tags: ['red'] }, null, 2),
    );
  });
});
