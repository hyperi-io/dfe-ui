import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SectionCard } from '.';

describe('SectionCard', () => {
  // The five Settings screens all pass both, and every one of them lost its
  // description to the `title || description` short-circuit.
  it('renders the description alongside the title', () => {
    render(
      <SectionCard
        title="OIDC providers"
        description="Manage OIDC providers and their configurations."
      />,
    );

    expect(screen.getByText('OIDC providers')).toBeInTheDocument();
    expect(
      screen.getByText('Manage OIDC providers and their configurations.'),
    ).toBeInTheDocument();
  });

  it('renders a description on its own', () => {
    render(<SectionCard description="No heading, just the explanation." />);

    expect(
      screen.getByText('No heading, just the explanation.'),
    ).toBeInTheDocument();
  });

  // Callers supply their own heading element, so the card must not wrap it.
  it('renders a node title as supplied', () => {
    render(
      <SectionCard
        title={<h2>dfe-transform-vrl</h2>}
        description="One per source."
      />,
    );

    expect(
      screen.getByRole('heading', { level: 2, name: 'dfe-transform-vrl' }),
    ).toBeInTheDocument();
    expect(screen.getByText('One per source.')).toBeInTheDocument();
  });

  it('renders the right-hand slot with neither a title nor a description', () => {
    render(<SectionCard rightTitleSlot={<button>Add</button>} />);

    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });
});
