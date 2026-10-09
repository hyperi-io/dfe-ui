import { chooseCredentialSource } from '@/core/components/CredentialField/CredentialField.mocks';
import { PROVIDERS_MAP } from '@/core/constants/oidcProviders.constants';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { CreateUpdateOidcProviderForm } from '.';
import { chooseOption, fillField } from './IssuerField.mocks';

const { wrapper } = buildTestWrapper().withTheme();

const SECRET_CREDENTIALS = [
  'Client Secret',
  'Directory Client Secret',
  'API Token',
  'Service Account JSON',
];

const renderForm = (type: string) =>
  render(
    <CreateUpdateOidcProviderForm
      isPending={false}
      error={null}
      onFinish={vi.fn()}
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
    async (label) => {
      const user = userEvent.setup();
      renderForm('google');

      await chooseCredentialSource(user, label, 'Value');

      const input = screen.getByLabelText(label);
      expect(input).toHaveAttribute('type', 'password');
      expect(input).toHaveAttribute('autocomplete', 'new-password');
    },
  );

  test.each([...SECRET_CREDENTIALS, 'Client ID', 'Tenant ID'])(
    'the %s env var name is a plain text input',
    async (label) => {
      const user = userEvent.setup();
      renderForm('google');

      await chooseCredentialSource(user, label, 'Env Var');

      const input = screen.getByLabelText(label);
      expect(input).toHaveAttribute('type', 'text');
      expect(input).toHaveAttribute('placeholder', 'Environment variable name');
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
    ).toHaveTextContent('Org Domain');
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
