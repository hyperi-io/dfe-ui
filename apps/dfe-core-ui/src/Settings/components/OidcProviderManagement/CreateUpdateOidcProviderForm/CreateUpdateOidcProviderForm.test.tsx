import {
  GOOGLE_SERVICE_ACCOUNT_HINT,
  MANUAL_MODE_HINT,
  PROVIDERS_MAP,
  SCOPES_PLACEHOLDER,
} from '@/core/constants/oidcProviders.constants';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { defaultGroupResolution } from '@/core/validationSchemas/oidcProviders.schema';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { CreateUpdateOidcProviderForm } from '.';

const { wrapper } = buildTestWrapper().withTheme();

type TType = 'google' | 'entra_id' | 'okta' | 'generic';
type TMode = 'manual' | 'token_claim' | 'api';

// Every group field label, by the type and mode that show it.
const GROUP_FIELDS: [TType, TMode, string[]][] = [
  [
    'google',
    'api',
    [
      'Sync Interval',
      'Service Account JSON',
      'Service Account Env Var',
      'Domain',
    ],
  ],
  [
    'entra_id',
    'api',
    [
      'Sync Interval',
      'Tenant ID',
      'Tenant ID Env Var',
      'Directory Secret',
      'Directory Secret Env Var',
    ],
  ],
  [
    'entra_id',
    'token_claim',
    [
      'Claim Name',
      'Tenant ID',
      'Tenant ID Env Var',
      'Directory Secret',
      'Directory Secret Env Var',
    ],
  ],
  ['entra_id', 'manual', []],
  [
    'okta',
    'api',
    [
      'Enrich on Login',
      'Okta Domain',
      'Sync Interval',
      'API Token',
      'API Token Env Var',
    ],
  ],
  ['okta', 'token_claim', ['Claim Name']],
  ['okta', 'manual', []],
  ['generic', 'token_claim', ['Claim Name']],
  ['generic', 'manual', []],
];

const ALL_GROUP_FIELDS = [
  ...new Set(GROUP_FIELDS.flatMap(([, , fields]) => fields)),
];

const initialValuesFor = (type: TType, mode?: TMode) => ({
  ...PROVIDERS_MAP[type]?.initialValues,
  groups: {
    ...defaultGroupResolution(type),
    ...(mode ? { mode } : {}),
  },
});

const renderForm = (
  type: TType,
  mode?: TMode,
  onFinish: (values: unknown) => void = vi.fn(),
) =>
  render(
    <CreateUpdateOidcProviderForm
      isPending={false}
      error={null}
      onFinish={onFinish}
      initialValues={initialValuesFor(type, mode)}
    />,
    { wrapper },
  );

const requiredLabels = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('label.ant-form-item-required')).map(
    (label) => label.textContent?.trim(),
  );

describe('CreateUpdateOidcProviderForm', () => {
  test.each(GROUP_FIELDS)(
    'Type = %s in %s mode gives every field its own label',
    (type, mode) => {
      const { container } = renderForm(type, mode);

      const labels = Array.from(container.querySelectorAll('label')).map(
        (label) => label.textContent?.trim(),
      );

      expect(labels.length).toBeGreaterThan(0);
      expect(new Set(labels).size).toBe(labels.length);
    },
  );

  test.each(GROUP_FIELDS)(
    'Type = %s in %s mode shows only the group fields the engine uses',
    async (type, mode, own) => {
      renderForm(type, mode);

      await screen.findByLabelText('Mode');
      for (const label of own) {
        expect(await screen.findByLabelText(label)).toBeInTheDocument();
      }
      for (const label of ALL_GROUP_FIELDS.filter(
        (field) => !own.includes(field),
      )) {
        expect(screen.queryByLabelText(label)).not.toBeInTheDocument();
      }
    },
  );

  test.each([
    ['google', ['API']],
    ['generic', ['Manual', 'Token Claim']],
    ['okta', ['Manual', 'Token Claim', 'API']],
    ['entra_id', ['Manual', 'Token Claim', 'API']],
  ] as const)(
    'Type = %s offers only the modes the engine accepts',
    async (type, modes) => {
      const user = userEvent.setup();
      renderForm(type);

      await user.click(screen.getByLabelText('Mode'));
      await waitFor(() =>
        expect(
          document.querySelectorAll('.ant-select-item-option').length,
        ).toBeGreaterThan(0),
      );

      expect(
        Array.from(document.querySelectorAll('.ant-select-item-option')).map(
          (option) => option.getAttribute('title'),
        ),
      ).toEqual(modes);
    },
  );

  test('the login fields hold a value and its variable side by side', () => {
    renderForm('google');

    expect(screen.getByLabelText('Client ID')).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Client ID Env Var')).toHaveAttribute(
      'type',
      'text',
    );
    expect(screen.getByLabelText('Client Secret Env Var')).toHaveAttribute(
      'type',
      'text',
    );
  });

  test.each([
    ['google', 'api', 'Client Secret'],
    ['google', 'api', 'Service Account JSON'],
    ['entra_id', 'api', 'Directory Secret'],
    ['okta', 'api', 'API Token'],
  ] as const)('Type = %s masks the %s value', (type, mode, label) => {
    renderForm(type, mode);

    const input = screen.getByLabelText(label);
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveAttribute('autocomplete', 'new-password');
  });

  test.each([
    ['google', 'api', ['Type', 'Name', 'Issuer', 'Mode']],
    ['okta', 'api', ['Type', 'Name', 'Issuer', 'Mode', 'Okta Domain']],
    ['entra_id', 'api', ['Type', 'Name', 'Issuer', 'Mode']],
    ['generic', 'token_claim', ['Type', 'Name', 'Issuer', 'Mode']],
  ] as const)(
    'Type = %s in %s mode marks only what the engine requires',
    async (type, mode, required) => {
      const { container } = renderForm(type, mode);

      await screen.findByLabelText('Mode');
      expect(requiredLabels(container)).toEqual(required);
    },
  );

  test('Google asks for no admin email and marks its service account optional', async () => {
    renderForm('google');

    expect(
      await screen.findByLabelText('Service Account Env Var'),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Admin Email')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Enrich on Login')).not.toBeInTheDocument();
    expect(screen.getByText(GOOGLE_SERVICE_ACCOUNT_HINT)).toBeInTheDocument();
  });

  test('manual mode says why it has no group settings', async () => {
    renderForm('entra_id', 'manual');

    expect(await screen.findByText(MANUAL_MODE_HINT)).toBeInTheDocument();
  });

  test('a new provider offers the provider type default scopes', () => {
    renderForm('google');

    expect(screen.getByLabelText('Scopes')).toBeInTheDocument();
    expect(screen.getByText(SCOPES_PLACEHOLDER)).toBeInTheDocument();
  });

  test('a provider name may hold the dots and hyphens the engine accepts', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    renderForm('google', undefined, onFinish);

    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'google-workspace.prod');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
    expect(onFinish).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'google-workspace.prod' }),
    );
  });

  test('a provider name the engine refuses is refused before it is sent', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    renderForm('google', undefined, onFinish);

    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), '-google');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(
      await screen.findByText(/must start with a letter or number/),
    ).toBeInTheDocument();
    expect(onFinish).not.toHaveBeenCalled();
  });

  test('Okta in API mode needs a domain and a token before it is sent', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    renderForm('okta', 'api', onFinish);

    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(
      await screen.findByText('Okta Domain is required in API mode'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Enter an API token or its environment variable'),
    ).toBeInTheDocument();
    expect(onFinish).not.toHaveBeenCalled();
  });

  test('a credential pasted where a variable name belongs is refused', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    renderForm('google', undefined, onFinish);

    await user.type(
      screen.getByLabelText('Client Secret Env Var'),
      'not a variable name',
    );
    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(
      await screen.findByText(/Enter an environment variable name/),
    ).toBeInTheDocument();
    expect(onFinish).not.toHaveBeenCalled();
  });
});
