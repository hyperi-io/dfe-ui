import { chooseCredentialSource } from '@/core/components/CredentialField/CredentialField.mocks';
import { PROVIDERS_MAP } from '@/core/constants/oidcProviders.constants';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { CreateUpdateOidcProviderForm } from '.';
import { chooseOption, fillField } from './IssuerField.mocks';

const { wrapper } = buildTestWrapper().withTheme();

// Each secret credential label with a provider type that shows it.
const SECRET_CREDENTIALS = [
  ['Client Secret', 'google'],
  ['Directory Client Secret', 'entra_id'],
  ['API Token', 'okta'],
  ['Service Account JSON', 'google'],
];

const GOOGLE_HIDDEN_GROUP_FIELDS = [
  'Okta Domain',
  'API Token',
  'Tenant ID',
  'Directory Client Secret',
  'Claim Name',
];

// Every type-specific or mode-specific group field.
const GROUP_FIELDS = [
  'Okta Domain',
  'API Token',
  'Admin Email',
  'Domain',
  'Service Account JSON',
  'Tenant ID',
  'Directory Client Secret',
  'Claim Name',
  'Sync Interval',
];

const expectGroupFieldsShown = (shown: string[]) => {
  for (const label of GROUP_FIELDS) {
    expect(Boolean(screen.queryByLabelText(label)), label).toBe(
      shown.includes(label),
    );
  }
};

const renderForm = (type: string, onFinish = vi.fn()) =>
  render(
    <CreateUpdateOidcProviderForm
      isPending={false}
      error={null}
      onFinish={onFinish}
      initialValues={PROVIDERS_MAP[type]?.initialValues}
    />,
    { wrapper },
  );

describe('CreateUpdateOidcProviderForm', () => {
  test.each(['google', 'entra_id', 'okta', 'generic'])(
    'Type = %s gives every field its own label',
    (type) => {
      const { container } = renderForm(type);

      const labels = Array.from(container.querySelectorAll('label')).map(
        (label) => label.textContent?.trim(),
      );

      expect(labels.length).toBeGreaterThan(0);
      expect(new Set(labels).size).toBe(labels.length);
    },
  );

  test.each(['google', 'entra_id', 'okta', 'generic'])(
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

      await user.click(screen.getByLabelText('Type'));
      await user.click(await screen.findByTitle(typeLabel));

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

    await user.clear(screen.getByLabelText('Client ID'));
    await user.type(screen.getByLabelText('Client ID'), 'MY_CLIENT_ID');
    await user.click(screen.getByLabelText('Type'));
    await user.click(await screen.findByTitle('Okta'));

    expect(screen.getByLabelText('Client ID')).toHaveValue('MY_CLIENT_ID');
    expect(screen.getByLabelText('Client Secret')).toHaveValue(
      'DFE_OIDC_OKTA_CLIENT_SECRET',
    );
  });

  test.each(SECRET_CREDENTIALS)(
    'the %s value is masked and never autofilled',
    async (label, type) => {
      const user = userEvent.setup();
      renderForm(type);

      await chooseCredentialSource(user, label, 'Value');

      const input = screen.getByLabelText(label);
      expect(input).toHaveAttribute('type', 'password');
      expect(input).toHaveAttribute('autocomplete', 'new-password');
    },
  );

  test.each([...SECRET_CREDENTIALS, ['Client ID', 'google']])(
    'the %s env var name is a plain text input',
    async (label, type) => {
      const user = userEvent.setup();
      renderForm(type);

      await chooseCredentialSource(user, label, 'Env Var');

      const input = screen.getByLabelText(label);
      expect(input).toHaveAttribute('type', 'text');
      expect(input).toHaveAttribute('placeholder', 'Environment variable name');
    },
  );

  test.each([
    ['google', 'API', true],
    ['okta', 'API', false],
    ['entra_id', 'API', false],
    ['generic', 'Token Claim', false],
  ])('Type = %s starts the group mode on %s', (type, modeLabel, locked) => {
    renderForm(type);

    const mode = screen.getByLabelText('Mode');
    expect(mode.closest('.ant-select')).toHaveTextContent(modeLabel);
    expect(mode.hasAttribute('disabled')).toBe(locked);
  });

  test('a custom provider offers no API group mode', async () => {
    const user = userEvent.setup();
    renderForm('generic');

    await user.click(screen.getByLabelText('Mode'));

    expect(await screen.findByTitle('Manual')).toBeInTheDocument();
    expect(screen.queryByTitle('API')).not.toBeInTheDocument();
  });

  test('changing Type keeps a chosen mode the new type accepts', async () => {
    const user = userEvent.setup();
    renderForm('okta');

    await user.click(screen.getByLabelText('Mode'));
    await user.click(await screen.findByTitle('Manual'));
    await user.click(screen.getByLabelText('Type'));
    await user.click(await screen.findByTitle('Entra ID'));

    expect(
      screen.getByLabelText('Mode').closest('.ant-select'),
    ).toHaveTextContent('Manual');
  });

  test('changing Type moves a default mode to the new default', async () => {
    const user = userEvent.setup();
    renderForm('okta');

    await user.click(screen.getByLabelText('Type'));
    await user.click(await screen.findByTitle('Custom OIDC Provider'));

    expect(
      screen.getByLabelText('Mode').closest('.ant-select'),
    ).toHaveTextContent('Token Claim');
  });

  test.each([
    ['google', true, true],
    ['okta', false, true],
    ['entra_id', true, false],
    ['generic', true, false],
  ])(
    'Type = %s shows Enrich on Login (locked: %s, on: %s)',
    async (type, locked, on) => {
      renderForm(type);

      const enrich = screen.getByRole('switch', { name: 'Enrich on Login' });
      await waitFor(() =>
        expect(enrich).toHaveAttribute('aria-checked', String(on)),
      );
      expect(enrich.hasAttribute('disabled')).toBe(locked);
    },
  );

  test('Okta in Token Claim mode turns Enrich on Login off and locks it', async () => {
    const user = userEvent.setup();
    renderForm('okta');

    await user.click(screen.getByLabelText('Mode'));
    await user.click(await screen.findByTitle('Token Claim'));

    const enrich = screen.getByRole('switch', { name: 'Enrich on Login' });
    await waitFor(() =>
      expect(enrich).toHaveAttribute('aria-checked', 'false'),
    );
    expect(enrich).toBeDisabled();
  });

  test('Google shows only the group fields it uses', () => {
    renderForm('google');

    for (const label of GOOGLE_HIDDEN_GROUP_FIELDS) {
      expect(screen.queryByLabelText(label)).not.toBeInTheDocument();
    }
    for (const label of [
      'Admin Email',
      'Domain',
      'Service Account JSON',
      'Sync Interval',
    ]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
  });

  test('Okta in API mode shows its domain, token and sync interval', async () => {
    renderForm('okta');

    await waitFor(() =>
      expectGroupFieldsShown(['Okta Domain', 'API Token', 'Sync Interval']),
    );
  });

  test.each([
    ['Token Claim', ['Claim Name']],
    ['Manual', []],
  ])('Okta in %s mode shows only %j', async (modeLabel, shown) => {
    const user = userEvent.setup();
    renderForm('okta');

    await user.click(screen.getByLabelText('Mode'));
    await user.click(await screen.findByTitle(modeLabel));

    await waitFor(() => expectGroupFieldsShown(shown));
  });

  test.each([
    [
      'okta',
      'Okta Org Domain',
      'dev-123.okta.com',
      { okta_domain: 'dev-123.okta.com' },
    ],
    [
      'entra_id',
      'Directory (Tenant) ID',
      'tenant-guid',
      { tenant_id: 'tenant-guid' },
    ],
  ])(
    '%s sends the group setting read from the Issuer row',
    async (type, label, typed, expected) => {
      const user = userEvent.setup();
      const onFinish = vi.fn();
      renderForm(type, onFinish);

      await fillField(user, label, typed);
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

  test('Claim Name says the groups claim is used when left blank', async () => {
    const user = userEvent.setup();
    renderForm('okta');

    await user.click(screen.getByLabelText('Mode'));
    await user.click(await screen.findByTitle('Token Claim'));

    expect(await screen.findByLabelText('Claim Name')).toHaveAttribute(
      'placeholder',
      'groups',
    );
  });

  test('Entra ID in API mode shows its tenant, secret and sync interval', async () => {
    renderForm('entra_id');

    await waitFor(() =>
      expectGroupFieldsShown(['Directory Client Secret', 'Sync Interval']),
    );
  });

  test.each([
    ['entra_id', 'Token Claim', ['Claim Name', 'Directory Client Secret']],
    ['entra_id', 'Manual', []],
    ['generic', 'Manual', []],
  ])('%s in %s mode shows only %j', async (type, modeLabel, shown) => {
    const user = userEvent.setup();
    renderForm(type);

    await user.click(screen.getByLabelText('Mode'));
    await user.click(await screen.findByTitle(modeLabel));

    await waitFor(() => expectGroupFieldsShown(shown));
  });

  test('a custom provider in Token Claim mode shows only Claim Name', async () => {
    renderForm('generic');

    await waitFor(() => expectGroupFieldsShown(['Claim Name']));
  });

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
    expect(screen.getByLabelText('Directory (Tenant) ID')).toHaveAttribute(
      'placeholder',
      '00000000-0000-0000-0000-000000000000',
    );
    await fillField(user, 'Directory (Tenant) ID', 'tenant-guid');

    expect(
      screen.getByText(
        'Issuer: https://login.microsoftonline.com/tenant-guid/v2.0',
      ),
    ).toBeInTheDocument();
  });

  test('switching Okta to Full URL pre-fills the built issuer for editing', async () => {
    const user = userEvent.setup();
    renderForm('okta');

    expect(
      screen.getByLabelText('Issuer mode').closest('.ant-select'),
    ).toHaveTextContent('Domain');
    expect(screen.getByLabelText('Okta Org Domain')).toHaveAttribute(
      'placeholder',
      'your-org.okta.com',
    );
    await fillField(user, 'Okta Org Domain', 'dev-123.okta.com');
    expect(
      screen.queryByLabelText('Authorization Server'),
    ).not.toBeInTheDocument();
    await chooseOption(user, 'Issuer mode', 'Full URL');

    const issuer = screen.getByLabelText('Issuer');
    expect(issuer).toBeEnabled();
    expect(issuer).toHaveValue('https://dev-123.okta.com');
    expect(screen.queryByLabelText('Okta Org Domain')).not.toBeInTheDocument();
  });

  test('editing shows the stored issuer read-only without the guided fields', () => {
    render(
      <CreateUpdateOidcProviderForm
        isPending={false}
        error={null}
        onFinish={vi.fn()}
        initialValues={{
          ...PROVIDERS_MAP['okta']?.initialValues,
          issuer: 'https://example.okta.com',
        }}
        disabledFields={{ name: true, type: true, issuer: true }}
      />,
      { wrapper },
    );

    const issuer = screen.getByLabelText('Issuer');
    expect(issuer).toBeDisabled();
    expect(issuer).toHaveValue('https://example.okta.com');
    expect(screen.queryByLabelText('Issuer mode')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Okta Org Domain')).not.toBeInTheDocument();
  });
});
