import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';
import { SignInProviders } from '.';

const { wrapper } = buildTestWrapper().withTheme();

describe('SignInProviders', () => {
  test('names the provider alone on hover', async () => {
    const user = userEvent.setup();
    render(
      <SignInProviders
        account={{
          external: true,
          identities: [],
          oidc_id: 'okta',
          oidc_type: 'okta',
        }}
      />,
      { wrapper },
    );

    await user.hover(
      screen.getByRole('img', { name: 'Signs in through okta' }),
    );

    expect(await screen.findByRole('tooltip')).toHaveTextContent(/^okta$/);
  });
});
