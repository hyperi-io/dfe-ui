import { Form } from '@/core/components/Form';
import {
  GOOGLE_SERVICE_ACCOUNT_HINT,
  PROVIDERS_MAP,
} from '@/core/constants/oidcProviders.constants';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { defaultGroupResolution } from '@/core/validationSchemas/oidcProviders.schema';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { ConfigureOIDCForm } from './ConfigureOIDCForm';

const { wrapper } = buildTestWrapper().withTheme();

type TType = 'google' | 'entra_id' | 'okta' | 'generic';
type TMode = 'manual' | 'token_claim' | 'api';

const GOOGLE_SERVICE_ACCOUNT_FIELDS = [
  'Domain',
  'Service Account Env Var',
  'Service Account JSON',
];

const PROVIDER_GROUP_FIELDS: [TType, TMode, string[]][] = [
  ['google', 'api', GOOGLE_SERVICE_ACCOUNT_FIELDS],
  [
    'entra_id',
    'api',
    [
      'Tenant ID',
      'Tenant ID Env Var',
      'Directory Secret',
      'Directory Secret Env Var',
    ],
  ],
  ['okta', 'api', ['Okta Domain', 'API Token Env Var', 'API Token']],
  ['generic', 'token_claim', []],
];

const ALL_PROVIDER_GROUP_FIELDS = PROVIDER_GROUP_FIELDS.flatMap(
  ([, , fields]) => fields,
);

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
    await user.click(screen.getByLabelText('Mode'));
    await user.click(await screen.findByTitle('API'));

    await waitFor(() => {
      expect(screen.getByLabelText('Okta Domain')).toBeInTheDocument();
    });
    expectOnlyProviderFields(['Okta Domain', 'API Token Env Var', 'API Token']);
  });

  test.each([
    ['google', 'api', 'Service Account JSON'],
    ['google', 'api', 'Client Secret'],
    ['entra_id', 'api', 'Directory Secret'],
    ['okta', 'api', 'API Token'],
  ] as const)(
    'Type = %s in %s mode masks the %s value',
    (type, mode, label) => {
      render(<OidcForm type={type} mode={mode} />, { wrapper });

      const input = screen.getByLabelText(label);
      expect(input).toHaveAttribute('type', 'password');
      expect(input).toHaveAttribute('autocomplete', 'new-password');
    },
  );

  test.each([
    ['google', 'api', 'Client ID'],
    ['google', 'api', 'Client ID Env Var'],
    ['google', 'api', 'Client Secret Env Var'],
    ['google', 'api', 'Service Account Env Var'],
    ['entra_id', 'api', 'Tenant ID'],
    ['entra_id', 'api', 'Tenant ID Env Var'],
    ['entra_id', 'api', 'Directory Secret Env Var'],
    ['okta', 'api', 'API Token Env Var'],
  ] as const)(
    'Type = %s in %s mode keeps the %s as plain text',
    (type, mode, label) => {
      render(<OidcForm type={type} mode={mode} />, { wrapper });

      expect(screen.getByLabelText(label)).toHaveAttribute('type', 'text');
    },
  );

  test('Tenant ID and its variable are separate fields bound to separate settings', () => {
    render(<OidcForm type="entra_id" mode="api" />, { wrapper });

    expect(screen.getByLabelText('Tenant ID')).toHaveAttribute(
      'id',
      'groups_tenant_id',
    );
    expect(screen.getByLabelText('Tenant ID Env Var')).toHaveAttribute(
      'id',
      'groups_tenant_id_env',
    );
  });

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
      'Client ID Env Var',
    ]) {
      expect(screen.getByText(label, { selector: 'label' })).not.toHaveClass(
        'ant-form-item-required',
      );
    }
    expect(screen.getByText(GOOGLE_SERVICE_ACCOUNT_HINT)).toBeInTheDocument();
  });

  test('a new Google provider defaults to the api group mode the engine requires', () => {
    expect(PROVIDERS_MAP['google']?.initialValues.groups?.mode).toBe('api');
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

  test('a provider with no client id or variable is refused before it is sent', async () => {
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

    await user.click(screen.getByRole('button', { name: 'Add OIDC Provider' }));

    expect(
      await screen.findByText('Enter a Client ID or its environment variable'),
    ).toBeInTheDocument();
    expect(onFinish).not.toHaveBeenCalled();
  });
});
