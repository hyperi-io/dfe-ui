import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import { server } from './CreateUpdateOrganisationForm.mocks';
import {
  CreateUpdateOrganisationForm,
  CreateUpdateOrganisationFormData,
} from './index';

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const updateInitialValues: CreateUpdateOrganisationFormData = {
  name: 'test-org',
  display_name: 'Test Org',
  org_ids: [],
  dedicated_database: true,
  confirm_merge: false,
};

describe('CreateUpdateOrganisationForm', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  test('renders core fields and submits on create without confirm merge gate', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();

    render(
      <CreateUpdateOrganisationForm
        initialValues={{
          name: '',
          display_name: '',
          org_ids: [],
          dedicated_database: false,
        }}
        onFinish={onFinish}
        buttonLabel="Create"
      />,
      { wrapper },
    );

    await user.type(screen.getByPlaceholderText('Enter name'), 'NewOrg');
    await user.type(
      screen.getByPlaceholderText('Enter display name'),
      'New Org',
    );
    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(onFinish).toHaveBeenCalledTimes(1);
    });
    expect(onFinish).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'neworg',
        display_name: 'New Org',
        dedicated_database: false,
      }),
    );
  });

  describe('confirm merge on update', () => {
    test('when dedicated DB is turned off, shows confirm step and defers onFinish until confirmed', async () => {
      const user = userEvent.setup();
      const onFinish = vi.fn();

      render(
        <CreateUpdateOrganisationForm
          showConfirmMergeField
          initialValues={updateInitialValues}
          onFinish={onFinish}
          buttonLabel="Update"
          disabledFields={{ name: true }}
        />,
        { wrapper },
      );

      const dedicatedDbSwitch = screen.getByRole('switch', {
        name: 'Dedicated DB',
      });
      expect(dedicatedDbSwitch).toBeChecked();

      await user.click(dedicatedDbSwitch);
      expect(dedicatedDbSwitch).not.toBeChecked();

      await user.click(screen.getByRole('button', { name: 'Update' }));

      await waitFor(() => {
        expect(
          screen.getByText(/turn off the dedicated ClickHouse database/i),
        ).toBeInTheDocument();
      });
      expect(onFinish).not.toHaveBeenCalled();
      expect(
        screen.queryByRole('button', { name: 'Update' }),
      ).not.toBeInTheDocument();

      const confirmButton = screen.getByRole('button', {
        name: 'Confirm Merge',
      });
      expect(confirmButton).toBeDisabled();

      await user.click(
        screen.getByRole('checkbox', {
          name: /acknowledge that this is intentional/i,
        }),
      );
      expect(confirmButton).toBeEnabled();

      await user.click(confirmButton);

      await waitFor(() => {
        expect(onFinish).toHaveBeenCalledTimes(1);
      });
      expect(onFinish).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'test-org',
          dedicated_database: false,
          confirm_merge: true,
        }),
      );
    });

    test('when dedicated DB stays enabled, submits without confirm merge step', async () => {
      const user = userEvent.setup();
      const onFinish = vi.fn();

      render(
        <CreateUpdateOrganisationForm
          showConfirmMergeField
          initialValues={updateInitialValues}
          onFinish={onFinish}
          buttonLabel="Update"
        />,
        { wrapper },
      );

      await user.click(screen.getByRole('button', { name: 'Update' }));

      await waitFor(() => {
        expect(onFinish).toHaveBeenCalledTimes(1);
      });
      expect(onFinish).toHaveBeenCalledWith(
        expect.objectContaining({
          dedicated_database: true,
        }),
      );
      expect(
        screen.queryByText(/turn off the dedicated ClickHouse database/i),
      ).not.toBeInTheDocument();
    });
  });
});
