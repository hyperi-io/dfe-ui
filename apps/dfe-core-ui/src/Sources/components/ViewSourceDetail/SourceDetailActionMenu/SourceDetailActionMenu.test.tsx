import { TSourceVersionDetail } from '@/Sources/hooks/useFetchSourceDetail/types';
import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SourceDetailActionMenu } from '.';

// Each control reaches RBAC and the API; what is under test is whether the menu mounts it.
vi.mock('@/Sources/components/EditSourceDrawer', () => ({
  EditSourceDrawer: ({ trigger }: { trigger: ReactElement }) => trigger,
}));
vi.mock('@/Sources/components/CloneSourceDrawer', () => ({
  CloneSourceDrawer: ({ trigger }: { trigger: ReactElement }) => trigger,
}));
vi.mock('@/Sources/components/DeleteSourceModal', () => ({
  DeleteSourceModal: ({ trigger }: { trigger: ReactElement }) => trigger,
}));
vi.mock('@/Sources/contexts/ListSourcesContext', () => ({
  useListSourcesContext: () => ({
    refetch: vi.fn(),
    setSelectedSource: vi.fn(),
  }),
}));

const renderMenu = (source: string, resource_type: 'core' | 'custom') =>
  render(
    <SourceDetailActionMenu
      source={{ source, resource_type } as TSourceVersionDetail}
    />,
  );

describe('SourceDetailActionMenu', () => {
  it('offers edit, clone and delete on a custom source', () => {
    renderMenu('syslog', 'custom');

    expect(screen.getByLabelText('Edit Source')).toBeInTheDocument();
    expect(screen.getByLabelText('Clone Source')).toBeInTheDocument();
    expect(screen.getByLabelText('Delete Source')).toBeInTheDocument();
  });

  it('offers clone only on core source', () => {
    renderMenu('syslog', 'core');

    expect(screen.queryByLabelText('Edit Source')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Delete Source')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Clone Source')).toBeInTheDocument();
  });

  it('offers no actions on a main source', () => {
    renderMenu('main', 'core');

    expect(screen.queryByLabelText('Edit Source')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Delete Source')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Clone Source')).not.toBeInTheDocument();
  });
});
