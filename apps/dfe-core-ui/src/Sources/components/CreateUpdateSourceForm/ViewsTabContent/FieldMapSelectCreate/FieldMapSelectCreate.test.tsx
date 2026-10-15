import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { FieldMapSelectCreate } from '.';

// Access checks and the map list read the engine; the pin the form receives needs neither.
vi.mock('@/core/components/RbacProtected', () => {
  const Pass = ({ children }: { children?: ReactNode }) => <>{children}</>;
  const RbacProtected = Object.assign(Pass, {
    Unrestricted: Pass,
    Restricted: () => null,
    rbacActions: { fieldmap_read: 'fieldmap:read' },
  });
  return { RbacProtected };
});
vi.mock('@/core/components/FieldMapSelect', async (importOriginal) => ({
  ...(await importOriginal<
    typeof import('@/core/components/FieldMapSelect')
  >()),
  FieldMapSelect: () => null,
}));
// Stands in for a successful create: the drawer hands back the map the engine stored.
vi.mock('@/core/components/CreateFieldMapDrawer', () => ({
  CreateFieldMapDrawer: ({
    onSuccess,
  }: {
    onSuccess: (fieldMap: { standard: string; source: string | null }) => void;
  }) => (
    <>
      <button onClick={() => onSuccess({ standard: 'ecs', source: 'winlog' })}>
        Created for a source
      </button>
      <button onClick={() => onSuccess({ standard: 'ecs', source: null })}>
        Created as the default
      </button>
    </>
  ),
}));

const { wrapper } = buildTestWrapper().withTheme();

describe('FieldMapSelectCreate', () => {
  it('pins a map it creates as standard/source, the form the engine resolves', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FieldMapSelectCreate source_name="winlog" onChange={onChange} />, {
      wrapper,
    });

    await user.click(
      screen.getByRole('button', { name: 'Created for a source' }),
    );

    expect(onChange).toHaveBeenCalledWith('ecs/winlog');
  });

  it('pins a default map as standard/_default', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FieldMapSelectCreate source_name="" onChange={onChange} />, {
      wrapper,
    });

    await user.click(
      screen.getByRole('button', { name: 'Created as the default' }),
    );

    expect(onChange).toHaveBeenCalledWith('ecs/_default');
  });
});
