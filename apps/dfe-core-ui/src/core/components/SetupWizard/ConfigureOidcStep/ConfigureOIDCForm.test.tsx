import { chooseCredentialSource } from '@/core/components/CredentialField/CredentialField.mocks';
import { Form } from '@/core/components/Form';
import { fillField } from '@/core/components/IssuerField/IssuerField.mocks';
import {
  GOOGLE_SERVICE_ACCOUNT_HINT,
  PROVIDERS_MAP,
} from '@/core/constants/oidcProviders.constants';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { expectFieldError } from '@/core/utils/test-utils/expectFieldError';
import { defaultGroupResolution } from '@/core/validationSchemas/oidcProviders.schema';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { ConfigureOIDCForm } from './ConfigureOIDCForm';

const { wrapper } = buildTestWrapper().withTheme();

type TType = 'google' | 'entra_id' | 'okta' | 'generic';
type TMode = 'manual' | 'token_claim' | 'api';

const GOOGLE_SERVICE_ACCOUNT_FIELDS = ['Domain', 'Service Account JSON'];

const PROVIDER_GROUP_FIELDS: [TType, TMode, string[]][] = [
  ['google', 'api', GOOGLE_SERVICE_ACCOUNT_FIELDS],
  ['entra_id', 'api', ['Directory Secret']],
  ['okta', 'api', ['Okta Domain', 'API Token']],
  ['generic', 'token_claim', []],
];

const ALL_PROVIDER_GROUP_FIELDS = [
  ...PROVIDER_GROUP_FIELDS.flatMap(([, , fields]) => fields),
  // The Entra ID groups tenant is read from the issuer and never shown.
  'Tenant ID',
];

const OidcForm = ({
  type,
  mode,
  initialValues,
  disabledFields,
  onFinish = vi.fn(),
}: {
  type: TType;
  mode?: TMode;
  initialValues?: Record<string, unknown>;
  disabledFields?: { name?: boolean; type?: boolean; issuer?: boolean };
  onFinish?: (values: unknown) => void;
}) => {
  const [form] = Form.useForm();

  return (
    <ConfigureOIDCForm
      form={form}
      error={null}
      isSubmitting={false}
      onFinish={onFinish}
      disabledFields={disabledFields}
      initialValues={{
        ...PROVIDERS_MAP[type]?.initialValues,
        groups: {
          ...defaultGroupResolution(type),
          ...(mode ? { mode } : {}),
        },
        ...initialValues,
      }}
    />
  );
};

const expectOnlyProviderFields = (own: string[]) => {
  for (const label of own) {
    expect(screen.getByLabelText(label)).toBeInTheDocument();
  }
  for (const label of ALL_PROVIDER_GROUP_FIELDS.filter(
    (field) => !own.includes(field),
  )) {
    expect(screen.queryByLabelText(label)).not.toBeInTheDocument();
  }
};

describe('ConfigureOIDCForm', () => {
  test.each(PROVIDER_GROUP_FIELDS)(
    'Type = %s in %s mode shows only its own group fields',
    (type, mode, own) => {
      render(<OidcForm type={type} mode={mode} />, { wrapper });

      expectOnlyProviderFields(own);
    },
  );

  test.each(PROVIDER_GROUP_FIELDS)(
    'Type = %s in %s mode gives every field its own label',
    (type, mode) => {
      const { container } = render(<OidcForm type={type} mode={mode} />, {
        wrapper,
      });

      const labels = Array.from(container.querySelectorAll('label')).map(
        (label) => label.textContent?.trim(),
      );

      expect(labels.length).toBeGreaterThan(0);
      expect(new Set(labels).size).toBe(labels.length);
    },
  );

  test('switching Type from Google to Okta swaps the group fields', async () => {
    const user = userEvent.setup();
    render(<OidcForm type="google" />, { wrapper });
    expectOnlyProviderFields(GOOGLE_SERVICE_ACCOUNT_FIELDS);

    await user.click(screen.getByLabelText('Type'));
    await user.click(await screen.findByTitle('Okta'));

    await waitFor(() => {
      expect(screen.getByLabelText('Okta Domain')).toBeInTheDocument();
    });
    expectOnlyProviderFields(['Okta Domain', 'API Token']);
  });

  test.each([
    ['google', 'api', 'Service Account JSON'],
    ['google', 'api', 'Client Secret'],
    ['entra_id', 'api', 'Directory Secret'],
    ['okta', 'api', 'API Token'],
  ] as const)(
    'Type = %s in %s mode masks the %s value',
    async (type, mode, label) => {
      const user = userEvent.setup();
      render(<OidcForm type={type} mode={mode} />, { wrapper });

      await chooseCredentialSource(user, label, 'Value');

      const input = screen.getByLabelText(label);
      expect(input).toHaveAttribute('type', 'password');
      expect(input).toHaveAttribute('autocomplete', 'new-password');
    },
  );

  test.each([
    ['google', 'api', 'Client ID'],
    ['google', 'api', 'Client Secret'],
    ['google', 'api', 'Service Account JSON'],
    ['entra_id', 'api', 'Directory Secret'],
    ['okta', 'api', 'API Token'],
  ] as const)(
    'Type = %s in %s mode takes the %s env var name as plain text',
    async (type, mode, label) => {
      const user = userEvent.setup();
      render(<OidcForm type={type} mode={mode} />, { wrapper });

      await chooseCredentialSource(user, label, 'Env Var');

      const input = screen.getByLabelText(label);
      expect(input).toHaveAttribute('type', 'text');
      expect(input).toHaveAttribute('placeholder', 'Environment variable name');
    },
  );

  test('Type = google asks for no admin email and requires only what the engine requires', () => {
    const { container } = render(<OidcForm type="google" />, { wrapper });

    expect(screen.queryByLabelText('Admin Email')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Claim Name')).not.toBeInTheDocument();
    expect(
      Array.from(
        container.querySelectorAll('label.ant-form-item-required'),
      ).map((label) => label.textContent?.trim()),
    ).toEqual(['Type', 'Name', 'Issuer', 'Mode']);
    for (const label of [
      ...GOOGLE_SERVICE_ACCOUNT_FIELDS,
      'Client ID',
      'Client Secret',
    ]) {
      expect(screen.getByText(label, { selector: 'label' })).not.toHaveClass(
        'ant-form-item-required',
      );
    }
    expect(screen.getByText(GOOGLE_SERVICE_ACCOUNT_HINT)).toBeInTheDocument();
  });

  test.each([
    ['google', 'api'],
    ['okta', 'api'],
    ['entra_id', 'api'],
    ['generic', 'token_claim'],
  ] as const)('a new %s provider starts in the %s group mode', (type, mode) => {
    expect(PROVIDERS_MAP[type]?.initialValues.groups?.mode).toBe(mode);
  });

  test('a new Okta provider builds its issuer and Okta Domain from the org domain', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(<OidcForm type="okta" onFinish={onFinish} />, { wrapper });

    await fillField(user, 'Okta Org Domain', 'dev-123.okta.com');

    expect(screen.getByLabelText('Okta Domain')).toHaveValue(
      'dev-123.okta.com',
    );
    expect(
      screen.getByText('Issuer: https://dev-123.okta.com'),
    ).toBeInTheDocument();
  });

  test('an existing provider locks the fields the engine update ignores', () => {
    render(
      <OidcForm
        type="okta"
        disabledFields={{ name: true, type: true, issuer: true }}
      />,
      { wrapper },
    );

    expect(screen.getByLabelText('Name')).toBeDisabled();
    expect(screen.getByLabelText('Type')).toBeDisabled();
    expect(screen.getByLabelText('Issuer')).toBeDisabled();
    expect(screen.queryByLabelText('Issuer mode')).not.toBeInTheDocument();
  });

  test('an existing Entra ID provider submits its stored tenant untouched', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(
      <OidcForm
        type="entra_id"
        initialValues={{
          issuer: 'https://login.microsoftonline.com/issuer-tenant/v2.0',
          groups: {
            ...defaultGroupResolution('entra_id'),
            tenant_id_env: 'ENTRA_TENANT_ID',
          },
        }}
        disabledFields={{ name: true, type: true, issuer: true }}
        onFinish={onFinish}
      />,
      { wrapper },
    );

    expect(screen.queryByLabelText('Tenant ID')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add OIDC Provider' }));

    await waitFor(() =>
      expect(onFinish).toHaveBeenCalledWith(
        expect.objectContaining({
          groups: expect.objectContaining({
            tenant_id: '',
            tenant_id_env: 'ENTRA_TENANT_ID',
          }),
        }),
      ),
    );
  });

  test('a new Entra ID provider whose guided issuer names no tenant says so on the Tenant ID input', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(<OidcForm type="entra_id" onFinish={onFinish} />, { wrapper });

    await fillField(user, 'Directory (Tenant) ID', 'organizations');
    await user.click(screen.getByRole('button', { name: 'Add OIDC Provider' }));

    expect(screen.getByLabelText('Issuer')).toBe(
      screen.getByLabelText('Directory (Tenant) ID'),
    );
    await expectFieldError(
      'Issuer',
      'The issuer must name a specific tenant, not common, organizations or consumers',
    );
    expect(onFinish).not.toHaveBeenCalled();
  });

  test('a provider name with a hyphen is accepted, as the engine accepts it', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(
      <OidcForm
        type="google"
        initialValues={{ name: 'google-workspace' }}
        disabledFields={{ name: true }}
        onFinish={onFinish}
      />,
      { wrapper },
    );

    await user.click(screen.getByRole('button', { name: 'Add OIDC Provider' }));

    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
    expect(onFinish).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'google-workspace' }),
    );
  });

  test('scopes are entered and submitted as a list', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(<OidcForm type="google" onFinish={onFinish} />, { wrapper });

    await user.type(screen.getByLabelText('Scopes'), 'openid email ');
    await user.click(screen.getByRole('button', { name: 'Add OIDC Provider' }));

    await waitFor(() => {
      expect(onFinish).toHaveBeenCalledTimes(1);
    });
    expect(onFinish).toHaveBeenCalledWith(
      expect.objectContaining({ scopes: ['openid', 'email'] }),
    );
  });

  test('scopes without openid are refused, as the engine refuses them', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(<OidcForm type="google" onFinish={onFinish} />, { wrapper });

    await user.type(screen.getByLabelText('Scopes'), 'email ');
    await user.click(screen.getByRole('button', { name: 'Add OIDC Provider' }));

    expect(
      await screen.findByText('Scopes must include openid, or be left empty'),
    ).toBeInTheDocument();
    expect(onFinish).not.toHaveBeenCalled();
  });

  test('submits with the other providers fields hidden', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(<OidcForm type="google" onFinish={onFinish} />, { wrapper });

    await user.click(screen.getByRole('button', { name: 'Add OIDC Provider' }));

    await waitFor(() => {
      expect(onFinish).toHaveBeenCalledTimes(1);
    });
    expect(onFinish).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'google', name: 'google' }),
    );
  });

  test.each(['Value', 'Env Var'] as const)(
    'a provider with no client id or variable is refused with %s shown',
    async (source) => {
      const user = userEvent.setup();
      const onFinish = vi.fn();
      render(
        <OidcForm
          type="google"
          initialValues={{ client_id_env: '' }}
          onFinish={onFinish}
        />,
        { wrapper },
      );

      await chooseCredentialSource(user, 'Client ID', source);
      await user.click(
        screen.getByRole('button', { name: 'Add OIDC Provider' }),
      );

      await expectFieldError(
        'Client ID',
        'Enter a Client ID or its environment variable',
      );
      expect(onFinish).not.toHaveBeenCalled();
    },
  );
});
