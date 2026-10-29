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
// Stands in for the drawer: it shows what it was opened with and hands back the map the engine stored.
vi.mock('@/core/components/CreateFieldMapDrawer', () => ({
  CreateFieldMapDrawer: ({
    title,
    disabled,
    onSuccess,
    initialValues,
    disabledFields,
  }: {
    title: string;
    disabled?: boolean;
    onSuccess?: (fieldMap: { standard: string; source: string | null }) => void;
    initialValues?: { standard: string; source: string };
    disabledFields?: { standard?: boolean; source?: boolean };
  }) => (
    <>
      <button disabled={disabled}>{title}</button>
      <output aria-label="Drawer preset">
        {JSON.stringify({ initialValues, disabledFields })}
      </output>
      <button
        onClick={() => onSuccess?.({ standard: 'ecs', source: 'winlog' })}
      >
        Created for a source
      </button>
      <button onClick={() => onSuccess?.({ standard: 'ecs', source: null })}>
        Created as the default
      </button>
    </>
  ),
}));

const { wrapper } = buildTestWrapper().withTheme();

const preset = () =>
  JSON.parse(
    screen.getByRole('status', { name: 'Drawer preset' }).textContent ?? '{}',
  );

describe('FieldMapSelectCreate', () => {
  it.each([
    {
      source_name: 'winlog',
      button: 'Created for a source',
      pin: 'ecs/winlog',
    },
    { source_name: '', button: 'Created as the default', pin: 'ecs/_default' },
  ])(
    'pins a map it creates as $pin, the form the engine resolves',
    async ({ source_name, button, pin }) => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <FieldMapSelectCreate
          source_name={source_name}
          standard="ecs"
          onChange={onChange}
        />,
        { wrapper },
      );

      await user.click(screen.getByRole('button', { name: button }));

      expect(onChange).toHaveBeenCalledWith(pin);
    },
  );

  it.each([
    {
      source_name: 'winlog',
      expected: {
        initialValues: { standard: 'cim', source: 'winlog' },
        disabledFields: { standard: true, source: true },
      },
    },
    {
      source_name: '',
      expected: {
        initialValues: { standard: 'cim', source: '' },
        disabledFields: { standard: true, source: false },
      },
    },
  ])(
    'opens the drawer on the view standard, locked, for source "$source_name"',
    ({ source_name, expected }) => {
      render(
        <FieldMapSelectCreate source_name={source_name} standard="cim" />,
        { wrapper },
      );

      expect(
        screen.getByRole('button', { name: 'Create Field Map' }),
      ).toBeEnabled();
      expect(preset()).toEqual(expected);
    },
  );

  it.each([undefined, ''])(
    'offers no create until the view has a standard (%j)',
    (standard) => {
      render(
        <FieldMapSelectCreate source_name="winlog" standard={standard} />,
        {
          wrapper,
        },
      );

      expect(
        screen.getByRole('button', { name: 'Create Field Map' }),
      ).toBeDisabled();
      expect(preset()).toEqual({});
    },
  );
});
