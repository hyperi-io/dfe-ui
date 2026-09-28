import { Form } from '@/core/components/Form';
import { PROVIDERS_MAP } from '@/core/constants/oidcProviders.constants';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { ConfigureOIDCForm } from './ConfigureOIDCForm';

const { wrapper } = buildTestWrapper().withTheme();

const PROVIDER_GROUP_FIELDS: Record<string, string[]> = {
  google: [
    'Admin Email',
    'Domain',
    'Service Account JSON ENV',
    'Service Account JSON',
  ],
  entra_id: ['Tenant ID', 'Client Secret ENV', 'Client Secret'],
  okta: ['Okta Domain', 'API Token Environment Variable', 'API Token'],
  generic: [],
};

const ALL_PROVIDER_GROUP_FIELDS = Object.values(PROVIDER_GROUP_FIELDS).flat();

const OidcForm = ({
  type,
  onFinish = vi.fn(),
}: {
  type: string;
  onFinish?: () => void;
}) => {
  const [form] = Form.useForm();

  return (
    <ConfigureOIDCForm
      form={form}
      error={null}
      isSubmitting={false}
      onFinish={onFinish}
      initialValues={PROVIDERS_MAP[type]?.initialValues}
    />
  );
};

const expectOnlyProviderFields = (type: string) => {
  const own = PROVIDER_GROUP_FIELDS[type] ?? [];

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
  test.each(Object.keys(PROVIDER_GROUP_FIELDS))(
    'Type = %s shows only its own group fields',
    (type) => {
      render(<OidcForm type={type} />, { wrapper });

      expectOnlyProviderFields(type);
    },
  );

  test.each(Object.keys(PROVIDER_GROUP_FIELDS))(
    'Type = %s gives every field its own label',
    (type) => {
      const { container } = render(<OidcForm type={type} />, { wrapper });

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
    expectOnlyProviderFields('google');

    await user.click(screen.getByLabelText('Type'));
    await user.click(await screen.findByTitle('Okta'));

    await waitFor(() => {
      expect(screen.getByLabelText('Okta Domain')).toBeInTheDocument();
    });
    expectOnlyProviderFields('okta');
  });

  test.each([
    ['google', 'Service Account JSON'],
    ['entra_id', 'Client Secret'],
    ['okta', 'API Token'],
  ])('Type = %s masks the %s value', (type, label) => {
    render(<OidcForm type={type} />, { wrapper });

    const input = screen.getByLabelText(label);
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveAttribute('autocomplete', 'new-password');
  });

  test.each([
    ['google', 'Client ID Environment Variable'],
    ['google', 'Client Secret Environment Variable'],
    ['google', 'Service Account JSON ENV'],
    ['entra_id', 'Tenant ID'],
    ['entra_id', 'Client Secret ENV'],
    ['okta', 'API Token Environment Variable'],
  ])('Type = %s keeps the %s name as plain text', (type, label) => {
    render(<OidcForm type={type} />, { wrapper });

    expect(screen.getByLabelText(label)).toHaveAttribute('type', 'text');
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
});
