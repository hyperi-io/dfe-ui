import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AddFromCatalogueForm } from './AddFromCatalogueForm';

const { wrapper } = buildTestWrapper().withTheme();

describe('AddFromCatalogueForm', () => {
  it('shows the catalogue entry, its intake, and its transform', () => {
    render(
      <AddFromCatalogueForm
        initialValues={[
          {
            entry: 'okta',
            name: 'okta-logs',
            intake: 'beats',
            transform: 'parse-okta',
            transport: 'bus',
            intakeOptions: ['beats', 'fetcher'],
            archive: false,
          },
        ]}
      />,
      { wrapper },
    );

    expect(screen.getByText('okta')).toBeInTheDocument();
    expect(screen.getByText('beats')).toBeInTheDocument();
    expect(screen.getByText('parse-okta')).toBeInTheDocument();
  });
});
