import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AddFromCatalogueResponse } from './AddFromCatalogueResponse';

const { wrapper } = buildTestWrapper().withTheme();

describe('AddFromCatalogueResponse', () => {
  it('shows the created and failed rows', () => {
    const { container } = render(
      <AddFromCatalogueResponse
        data={{
          created: [
            {
              entry: 'okta',
              source: 'okta',
              current: '1.0.0',
              versions: ['1.0.0'],
              deployed_version: '1.0.0',
            },
          ],
          failed: [
            {
              entry: 'not_okta',
              source: 'not_okta',
              code: 'source_error',
              message: 'source error',
            },
          ],
        }}
      />,
      { wrapper },
    );

    expect(screen.getAllByRole('table')).toHaveLength(2);
    expect(screen.getByText('source error')).toBeInTheDocument();
    expect(screen.getByText('View Source')).toBeInTheDocument();
    // The shared table's vertical scroll of max-content collapses this body to nothing.
    expect(container.querySelector('.ant-table-body')).toBeNull();
  });
});
