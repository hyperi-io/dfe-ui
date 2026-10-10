import {
  GOOGLE_SERVICE_ACCOUNT_HINT,
  PROVIDERS_MAP,
  SCOPES_PLACEHOLDER,
} from '@/core/constants/oidcProviders.constants';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { CreateUpdateOidcProviderForm } from '.';

const { wrapper } = buildTestWrapper().withTheme();

const PROVIDER_GROUP_FIELDS: Record<string, string[]> = {
  google: ['Domain', 'Service Account JSON ENV'],
  entra_id: [
    'Tenant ID',
    'Tenant ID Environment Variable',
    'Client Secret ENV',
  ],
  okta: ['Okta Domain', 'API Token Environment Variable'],
  generic: [],
};

const ALL_PROVIDER_GROUP_FIELDS = Object.values(PROVIDER_GROUP_FIELDS).flat();

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

  test('the client secret variable name is a plain text input', () => {
    renderForm('google');

    expect(
      screen.getByLabelText('Client Secret Environment Variable'),
    ).toHaveAttribute('type', 'text');
  });

  test('the client secret value is masked and never autofilled', () => {
    renderForm('google');

    const input = screen.getByLabelText('Client Secret');
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveAttribute('autocomplete', 'new-password');
  });

  test('Okta names its API token variable as a variable', async () => {
    renderForm('okta');

    expect(
      await screen.findByLabelText('API Token Environment Variable'),
    ).toHaveAttribute('type', 'text');
    expect(screen.queryByLabelText('API Token')).not.toBeInTheDocument();
  });

  test('Entra ID names its directory client secret variable as a variable', async () => {
    renderForm('entra_id');

    expect(await screen.findByLabelText('Client Secret ENV')).toHaveAttribute(
      'type',
      'text',
    );
  });

  test.each(Object.keys(PROVIDER_GROUP_FIELDS))(
    'Type = %s shows only its own group fields',
    async (type) => {
      renderForm(type);
      const own = PROVIDER_GROUP_FIELDS[type] ?? [];

      await screen.findByLabelText('Sync Interval');
      for (const label of own) {
        expect(await screen.findByLabelText(label)).toBeInTheDocument();
      }
      for (const label of ALL_PROVIDER_GROUP_FIELDS.filter(
        (field) => !own.includes(field),
      )) {
        expect(screen.queryByLabelText(label)).not.toBeInTheDocument();
      }
    },
  );

  test('Google asks for no admin email and marks its service account optional', async () => {
    renderForm('google');

    expect(
      await screen.findByLabelText('Service Account JSON ENV'),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Admin Email')).not.toBeInTheDocument();
    expect(screen.getByText(GOOGLE_SERVICE_ACCOUNT_HINT)).toBeInTheDocument();
  });

  test('a new provider offers the provider type default scopes', () => {
    renderForm('google');

    expect(screen.getByLabelText('Scopes')).toBeInTheDocument();
    expect(screen.getByText(SCOPES_PLACEHOLDER)).toBeInTheDocument();
  });
});
