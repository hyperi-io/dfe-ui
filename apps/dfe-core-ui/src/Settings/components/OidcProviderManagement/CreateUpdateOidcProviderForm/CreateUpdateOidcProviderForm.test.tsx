import { PROVIDERS_MAP } from '@/core/constants/oidcProviders.constants';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { CreateUpdateOidcProviderForm } from '.';

const { wrapper } = buildTestWrapper().withTheme();

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

  test('Okta names its API token variable as a variable', () => {
    renderForm('okta');

    expect(
      screen.getByLabelText('API Token Environment Variable'),
    ).toHaveAttribute('type', 'text');
    expect(screen.queryByLabelText('API Token')).not.toBeInTheDocument();
  });

  test('Entra ID names its directory client secret variable as a variable', () => {
    renderForm('entra_id');

    expect(screen.getByLabelText('Client Secret ENV')).toHaveAttribute(
      'type',
      'text',
    );
  });
});
