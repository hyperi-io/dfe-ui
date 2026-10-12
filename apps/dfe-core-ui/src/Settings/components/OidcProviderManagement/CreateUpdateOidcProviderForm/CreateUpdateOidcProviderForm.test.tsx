import {
  chooseCredentialSource,
  SOURCE_SWITCH_TEST_TIMEOUT_MS,
} from '@/core/components/CredentialField/CredentialField.mocks';
import {
  chooseOption,
  fillField,
} from '@/core/components/IssuerField/IssuerField.mocks';
import {
  GOOGLE_SERVICE_ACCOUNT_HINT,
  MANUAL_MODE_HINT,
  PROVIDERS_MAP,
  SCOPES_PLACEHOLDER,
} from '@/core/constants/oidcProviders.constants';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { expectFieldError } from '@/core/utils/test-utils/expectFieldError';
import { ENV_VAR_NAME_VALIDATOR } from '@/core/validationSchemas/utils';
import { defaultGroupResolution } from '@/core/validationSchemas/oidcProviders.schema';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { CreateUpdateOidcProviderForm } from '.';

const { wrapper } = buildTestWrapper().withTheme();

type TType = 'google' | 'entra_id' | 'okta' | 'generic';
type TMode = 'manual' | 'token_claim' | 'api';

// Every type- or mode-specific group field label, by the type and mode that show it.
const GROUP_FIELDS: [TType, TMode, string[]][] = [
  ['google', 'api', ['Sync Interval', 'Service Account JSON', 'Domain']],
  ['entra_id', 'api', ['Sync Interval', 'Directory Secret']],
  ['entra_id', 'token_claim', ['Claim Name', 'Directory Secret']],
  ['entra_id', 'manual', []],
  ['okta', 'api', ['Okta Domain', 'Sync Interval', 'API Token']],
  ['okta', 'token_claim', ['Claim Name']],
  ['okta', 'manual', []],
  ['generic', 'token_claim', ['Claim Name']],
  ['generic', 'manual', []],
];

const ALL_GROUP_FIELDS = [
  ...new Set(GROUP_FIELDS.flatMap(([, , fields]) => fields)),
  // The Entra ID groups tenant is read from the issuer and never shown.
  'Tenant ID',
];

const TENANT_FROM_ISSUER =
  'The issuer must name a specific tenant, not common, organizations or consumers';

const ENTRA_ISSUER = 'https://login.microsoftonline.com/issuer-tenant/v2.0';

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

const renderEdit = (
  initialValues: Record<string, unknown>,
  onFinish: (values: unknown) => void = vi.fn(),
) =>
  render(
    <CreateUpdateOidcProviderForm
      isPending={false}
      error={null}
      onFinish={onFinish}
      initialValues={initialValues}
      disabledFields={{ name: true, type: true, issuer: true }}
      buttonLabel="Update"
    />,
    { wrapper },
  );

const requiredLabels = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('label.ant-form-item-required')).map(
    (label) => label.textContent?.trim(),
  );

const chooseType = async (user: UserEvent, label: string) => {
  await user.click(screen.getByLabelText('Type'));
  await user.click(await screen.findByTitle(label));
};

const chooseMode = async (user: UserEvent, label: string) => {
  await user.click(screen.getByLabelText('Mode'));
  await user.click(await screen.findByTitle(label));
};

const modeShown = () => screen.getByLabelText('Mode').closest('.ant-select');

describe(
  'CreateUpdateOidcProviderForm',
  { timeout: SOURCE_SWITCH_TEST_TIMEOUT_MS },
  () => {
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

    test.each([
      ['google', 'API', true],
      ['okta', 'API', false],
      ['entra_id', 'API', false],
      ['generic', 'Token Claim', false],
    ] as const)(
      'a new %s provider starts in %s mode (locked: %s)',
      (type, modeLabel, locked) => {
        renderForm(type);

        expect(modeShown()).toHaveTextContent(modeLabel);
        expect(screen.getByLabelText('Mode').hasAttribute('disabled')).toBe(
          locked,
        );
      },
    );

    test.each(['google', 'entra_id', 'okta', 'generic'] as const)(
      "Type = %s starts the client ID and secret on the preset's env vars",
      (type) => {
        renderForm(type);

        const preset = PROVIDERS_MAP[type]?.initialValues;
        expect(screen.getByLabelText('Client ID')).toHaveValue(
          preset?.client_id_env,
        );
        expect(screen.getByLabelText('Client Secret')).toHaveValue(
          preset?.client_secret_env,
        );
      },
    );

    test.each([
      ['Okta', 'OKTA'],
      ['Entra ID', 'ENTRA'],
      ['Custom OIDC Provider', 'CUSTOM'],
    ])(
      'choosing Type = %s re-applies both client env var presets',
      async (typeLabel, envKey) => {
        const user = userEvent.setup();
        renderForm('google');

        await chooseType(user, typeLabel);

        expect(screen.getByLabelText('Client ID')).toHaveValue(
          `DFE_OIDC_${envKey}_CLIENT_ID`,
        );
        expect(screen.getByLabelText('Client Secret')).toHaveValue(
          `DFE_OIDC_${envKey}_CLIENT_SECRET`,
        );
      },
    );

    test('changing Type keeps an env var name the user typed', async () => {
      const user = userEvent.setup();
      renderForm('google');

      await fillField(user, 'Client ID', 'MY_CLIENT_ID');
      await chooseType(user, 'Okta');

      expect(screen.getByLabelText('Client ID')).toHaveValue('MY_CLIENT_ID');
      expect(screen.getByLabelText('Client Secret')).toHaveValue(
        'DFE_OIDC_OKTA_CLIENT_SECRET',
      );
    });

    test('changing Type keeps a chosen mode the new type accepts', async () => {
      const user = userEvent.setup();
      renderForm('okta');

      await chooseMode(user, 'Manual');
      await chooseType(user, 'Entra ID');

      expect(modeShown()).toHaveTextContent('Manual');
    });

    test('changing Type moves a default mode to the new default', async () => {
      const user = userEvent.setup();
      renderForm('okta');

      await chooseType(user, 'Custom OIDC Provider');

      expect(modeShown()).toHaveTextContent('Token Claim');
    });

    test('the credentials switch between a value and an env var under one label', async () => {
      const user = userEvent.setup();
      renderForm('google');

      await chooseCredentialSource(user, 'Client ID', 'Value');
      expect(screen.getByLabelText('Client ID')).toHaveValue('');
      expect(
        screen.queryByLabelText('Client ID Env Var'),
      ).not.toBeInTheDocument();

      await chooseCredentialSource(user, 'Client ID', 'Env Var');
      expect(screen.getByLabelText('Client ID')).toHaveValue(
        'DFE_OIDC_GOOGLE_CLIENT_ID',
      );
    });

    test.each([
      ['google', 'api', 'Client Secret'],
      ['google', 'api', 'Service Account JSON'],
      ['entra_id', 'api', 'Directory Secret'],
      ['okta', 'api', 'API Token'],
    ] as const)('Type = %s masks the %s value', async (type, mode, label) => {
      const user = userEvent.setup();
      renderForm(type, mode);

      await chooseCredentialSource(user, label, 'Value');

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

    test.each([
      ['google', 'api', true, true],
      ['okta', 'api', false, false],
      ['okta', 'token_claim', true, false],
      ['entra_id', 'api', true, false],
      ['generic', 'token_claim', true, false],
    ] as const)(
      'Type = %s in %s mode shows Enrich on Login (locked: %s, on: %s)',
      async (type, mode, locked, on) => {
        renderForm(type, mode);

        const enrich = screen.getByRole('switch', { name: 'Enrich on Login' });
        await waitFor(() =>
          expect(enrich).toHaveAttribute('aria-checked', String(on)),
        );
        expect(enrich.hasAttribute('disabled')).toBe(locked);
      },
    );

    test('Okta leaving API mode turns Enrich on Login off and locks it', async () => {
      const user = userEvent.setup();
      renderForm('okta');

      await user.click(screen.getByRole('switch', { name: 'Enrich on Login' }));
      await chooseMode(user, 'Token Claim');

      const enrich = screen.getByRole('switch', { name: 'Enrich on Login' });
      await waitFor(() =>
        expect(enrich).toHaveAttribute('aria-checked', 'false'),
      );
      expect(enrich).toBeDisabled();
    });

    test('Google asks for no admin email and marks its service account optional', async () => {
      renderForm('google');

      expect(
        await screen.findByLabelText('Service Account JSON'),
      ).toBeInTheDocument();
      expect(screen.queryByLabelText('Admin Email')).not.toBeInTheDocument();
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

    test('an empty guided issuer says Issuer is required on the Issuer row', async () => {
      const user = userEvent.setup();
      const onFinish = vi.fn();
      renderForm('okta', 'api', onFinish);

      await user.click(screen.getByRole('button', { name: 'Create' }));

      expect(screen.getByLabelText('Issuer')).toBe(
        screen.getByLabelText('Okta Org Domain'),
      );
      await expectFieldError('Issuer', 'Issuer is required');
      expect(onFinish).not.toHaveBeenCalled();
    });

    test('a guided Entra ID issuer that names no tenant says so on the Tenant ID input', async () => {
      const user = userEvent.setup();
      const onFinish = vi.fn();
      renderForm('entra_id', 'api', onFinish);

      await fillField(user, 'Directory (Tenant) ID', 'common');
      await user.click(screen.getByRole('button', { name: 'Create' }));

      expect(screen.getByLabelText('Issuer')).toBe(
        screen.getByLabelText('Directory (Tenant) ID'),
      );
      await expectFieldError('Issuer', TENANT_FROM_ISSUER);
      expect(onFinish).not.toHaveBeenCalled();
    });

    test.each(['common', 'organizations', 'consumers'])(
      'a full Entra ID issuer URL for %s fills in no tenant and says so on the URL input',
      async (alias) => {
        const user = userEvent.setup();
        const onFinish = vi.fn();
        renderForm('entra_id', 'api', onFinish);

        await chooseOption(user, 'Issuer mode', 'Full URL');
        await fillField(
          user,
          'Issuer',
          `https://login.microsoftonline.com/${alias}/v2.0`,
        );
        await user.click(screen.getByRole('button', { name: 'Create' }));

        expect(screen.getByLabelText('Issuer')).toHaveValue(
          `https://login.microsoftonline.com/${alias}/v2.0`,
        );
        await expectFieldError('Issuer', TENANT_FROM_ISSUER);
        expect(onFinish).not.toHaveBeenCalled();
      },
    );

    test.each<{
      label: string;
      message: string;
      setUp: (user: UserEvent) => Promise<void>;
      type: TType;
    }>([
      {
        label: 'Client ID',
        type: 'google',
        message: 'Enter a Client ID or its environment variable',
        setUp: async (user) => {
          await user.clear(screen.getByLabelText('Client ID'));
        },
      },
      {
        label: 'Client Secret',
        type: 'google',
        message: ENV_VAR_NAME_VALIDATOR.message,
        setUp: (user) =>
          fillField(user, 'Client Secret', 'not a variable name'),
      },
      {
        label: 'Service Account JSON',
        type: 'google',
        message: ENV_VAR_NAME_VALIDATOR.message,
        setUp: async (user) => {
          await chooseCredentialSource(user, 'Service Account JSON', 'Env Var');
          await fillField(user, 'Service Account JSON', 'not a variable name');
        },
      },
      {
        label: 'Directory Secret',
        type: 'entra_id',
        message:
          'Enter a directory secret or its environment variable, or a login client secret',
        setUp: async (user) => {
          await user.clear(screen.getByLabelText('Client Secret'));
          await chooseCredentialSource(user, 'Directory Secret', 'Env Var');
        },
      },
      {
        label: 'API Token',
        type: 'okta',
        message: 'Enter an API token or its environment variable',
        setUp: (user) => chooseCredentialSource(user, 'API Token', 'Env Var'),
      },
    ])(
      'the $label error shows with its Env Var selected',
      async ({ label, message, setUp, type }) => {
        const user = userEvent.setup();
        const onFinish = vi.fn();
        renderForm(type, undefined, onFinish);

        await setUp(user);
        expect(screen.getByLabelText(label)).toHaveAttribute(
          'placeholder',
          'Environment variable name',
        );
        await user.click(screen.getByRole('button', { name: 'Create' }));

        await expectFieldError(label, message);
        expect(onFinish).not.toHaveBeenCalled();
      },
    );

    test('the Okta Domain follows the domain typed in the Issuer row', async () => {
      const user = userEvent.setup();
      renderForm('okta');

      await fillField(user, 'Okta Org Domain', 'dev-123.okta.com');

      expect(screen.getByLabelText('Okta Domain')).toHaveValue(
        'dev-123.okta.com',
      );
    });

    test('an Okta Domain the user typed is kept when the issuer changes', async () => {
      const user = userEvent.setup();
      renderForm('okta');

      await fillField(user, 'Okta Org Domain', 'dev-123.okta.com');
      await fillField(user, 'Okta Domain', 'login.example.com');
      await fillField(user, 'Okta Org Domain', 'dev-456.okta.com');

      expect(screen.getByLabelText('Okta Domain')).toHaveValue(
        'login.example.com',
      );
    });

    test.each<{
      expected: Record<string, string>;
      fill: (user: UserEvent) => Promise<void>;
      type: TType;
    }>([
      {
        type: 'okta',
        fill: async (user) => {
          await fillField(user, 'Okta Org Domain', 'dev-123.okta.com');
          await fillField(user, 'API Token', 'okta-token');
        },
        expected: { okta_domain: 'dev-123.okta.com' },
      },
      {
        type: 'entra_id',
        fill: (user) => fillField(user, 'Directory (Tenant) ID', 'tenant-guid'),
        expected: { tenant_id: 'tenant-guid' },
      },
    ])(
      'a new $type provider sends the group setting read from the Issuer row',
      async ({ expected, fill, type }) => {
        const user = userEvent.setup();
        const onFinish = vi.fn();
        renderForm(type, undefined, onFinish);

        await fill(user);
        await user.click(screen.getByRole('button', { name: 'Create' }));

        await waitFor(() =>
          expect(onFinish).toHaveBeenCalledWith(
            expect.objectContaining({
              groups: expect.objectContaining(expected),
            }),
          ),
        );
      },
    );

    test('Google shows its fixed issuer read-only', () => {
      renderForm('google');

      const issuer = screen.getByLabelText('Issuer');
      expect(issuer).toBeDisabled();
      expect(issuer).toHaveValue('https://accounts.google.com');
      expect(screen.queryByLabelText('Issuer mode')).not.toBeInTheDocument();
    });

    test('the Entra ID tenant ID sits in the Issuer row and shows the issuer it builds', async () => {
      const user = userEvent.setup();
      renderForm('entra_id');

      expect(screen.getByLabelText('Issuer')).toBe(
        screen.getByLabelText('Directory (Tenant) ID'),
      );
      expect(
        screen.getByLabelText('Issuer mode').closest('.ant-select'),
      ).toHaveTextContent('Tenant ID');
      await fillField(user, 'Directory (Tenant) ID', 'tenant-guid');

      expect(
        screen.getByText(
          'Issuer: https://login.microsoftonline.com/tenant-guid/v2.0',
        ),
      ).toBeInTheDocument();
      expect(screen.queryByLabelText('Tenant ID')).not.toBeInTheDocument();
    });

    test('switching Okta to Full URL pre-fills the built issuer for editing', async () => {
      const user = userEvent.setup();
      renderForm('okta');

      expect(
        screen.getByLabelText('Issuer mode').closest('.ant-select'),
      ).toHaveTextContent('Domain');
      await fillField(user, 'Okta Org Domain', 'dev-123.okta.com');
      await chooseOption(user, 'Issuer mode', 'Full URL');

      const issuer = screen.getByLabelText('Issuer');
      expect(issuer).toBeEnabled();
      expect(issuer).toHaveValue('https://dev-123.okta.com');
      expect(
        screen.queryByLabelText('Okta Org Domain'),
      ).not.toBeInTheDocument();
    });

    test('editing shows the stored issuer read-only without the guided fields', () => {
      renderEdit({
        ...PROVIDERS_MAP['okta']?.initialValues,
        issuer: 'https://example.okta.com',
      });

      const issuer = screen.getByLabelText('Issuer');
      expect(issuer).toBeDisabled();
      expect(issuer).toHaveValue('https://example.okta.com');
      expect(screen.queryByLabelText('Issuer mode')).not.toBeInTheDocument();
      expect(
        screen.queryByLabelText('Okta Org Domain'),
      ).not.toBeInTheDocument();
    });

    test.each([
      [
        'an env var',
        { tenant_id: '', tenant_id_env: 'ENTRA_TENANT_ID' },
        { tenant_id: '', tenant_id_env: 'ENTRA_TENANT_ID' },
      ],
      [
        'a value',
        { tenant_id: 'stored-tenant', tenant_id_env: '' },
        { tenant_id: 'stored-tenant', tenant_id_env: '' },
      ],
      [
        'nothing',
        { tenant_id: '', tenant_id_env: '' },
        { tenant_id: 'issuer-tenant', tenant_id_env: '' },
      ],
    ])(
      'editing an Entra ID provider with %s stored as its tenant submits the right tenant',
      async (_stored, tenant, expected) => {
        const user = userEvent.setup();
        const onFinish = vi.fn();
        renderEdit(
          {
            ...PROVIDERS_MAP['entra_id']?.initialValues,
            issuer: ENTRA_ISSUER,
            groups: { ...defaultGroupResolution('entra_id'), ...tenant },
          },
          onFinish,
        );

        await user.click(screen.getByRole('button', { name: 'Update' }));

        await waitFor(() =>
          expect(onFinish).toHaveBeenCalledWith(
            expect.objectContaining({
              groups: expect.objectContaining(expected),
            }),
          ),
        );
      },
    );

    test('editing an Entra ID provider whose issuer names no tenant says so on the Issuer row', async () => {
      const user = userEvent.setup();
      const onFinish = vi.fn();
      renderEdit(
        {
          ...PROVIDERS_MAP['entra_id']?.initialValues,
          issuer: 'https://login.microsoftonline.com/common/v2.0',
          groups: defaultGroupResolution('entra_id'),
        },
        onFinish,
      );

      await user.click(screen.getByRole('button', { name: 'Update' }));

      await expectFieldError('Issuer', TENANT_FROM_ISSUER);
      expect(onFinish).not.toHaveBeenCalled();
    });

    test('editing an Okta provider leaves an empty Okta Domain empty', async () => {
      renderEdit({
        ...PROVIDERS_MAP['okta']?.initialValues,
        issuer: 'https://example.okta.com',
        groups: { ...defaultGroupResolution('okta'), okta_domain: '' },
      });

      await screen.findByLabelText('Mode');
      expect(screen.getByLabelText('Okta Domain')).toHaveValue('');
    });
  },
);
