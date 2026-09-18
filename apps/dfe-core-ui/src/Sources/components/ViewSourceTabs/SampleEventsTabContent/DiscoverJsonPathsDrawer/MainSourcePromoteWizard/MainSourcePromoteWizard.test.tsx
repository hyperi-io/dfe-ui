import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MainSourcePromoteWizard } from './index';

vi.mock('@/Sources/contexts/ListSourcesContext', () => ({
  useListSourcesContext: () => ({
    selectedSourceName: 'main',
    selectedSourceVersion: '1.0.0',
  }),
}));

vi.mock(
  '@/Sources/components/ViewSourceTabs/contexts/PromoteRows.context',
  () => ({
    usePromoteRowsContext: () => ({
      fieldsToPromote: new Set(['user.name']),
    }),
  }),
);

vi.mock('@/Sources/hooks/useFetchJsonPaths', () => ({
  useFetchJsonPaths: () => ({
    data: undefined,
    isLoading: false,
    error: null,
  }),
}));

vi.mock('./DiscoverPromoteStep', () => ({
  DiscoverPromoteStep: ({
    onSuccess,
  }: {
    onSuccess: (schema: { path: string }) => void;
  }) => (
    <button type="button" onClick={() => onSuccess({ path: 'meta/okta' })}>
      Finish schema
    </button>
  ),
}));

const { wrapper } = buildTestWrapper().withTheme();

describe('MainSourcePromoteWizard', () => {
  it('keeps the created schema path after moving to create source', async () => {
    const user = userEvent.setup();
    render(<MainSourcePromoteWizard onSuccess={() => undefined} />, {
      wrapper,
    });

    await user.click(screen.getByRole('button', { name: 'Finish schema' }));

    expect(screen.getByText('Schema Path: meta/okta')).toBeInTheDocument();
  });

  it('lets the user open later steps after a schema is created', async () => {
    const user = userEvent.setup();
    render(<MainSourcePromoteWizard onSuccess={() => undefined} />, {
      wrapper,
    });

    await user.click(screen.getByRole('button', { name: 'Finish schema' }));
    await user.click(screen.getByText('Build & Deploy Source (Optional)'));

    expect(screen.getByText('BuildSourceStep')).toBeInTheDocument();
  });

  it('links to the created schema without dropping query params', async () => {
    const user = userEvent.setup();
    render(<MainSourcePromoteWizard onSuccess={() => undefined} />, {
      wrapper,
    });

    await user.click(screen.getByRole('button', { name: 'Finish schema' }));
    await user.click(screen.getByText('Discover & Promote'));

    expect(screen.getByRole('link', { name: /meta\/okta/ })).toHaveAttribute(
      'href',
      `/schemas/meta-schemas?${new URLSearchParams({
        schema_path: 'meta/okta',
        schema_version: '1.0.0',
      }).toString()}`,
    );
  });
});
