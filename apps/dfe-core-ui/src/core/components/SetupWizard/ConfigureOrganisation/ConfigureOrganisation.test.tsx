import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import { ConfigureOrganisationStep } from '.';
import { server } from './ConfigureOrganisation.mocks';

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const submitAnOrganisation = async (goNext: () => void) => {
  const user = userEvent.setup();

  render(
    <ConfigureOrganisationStep
      goNext={goNext}
      goPrevious={vi.fn()}
      organisation={null}
    />,
    { wrapper },
  );

  await user.type(screen.getByPlaceholderText('Enter name'), 'acme');
  await user.type(screen.getByPlaceholderText('Enter display name'), 'Acme');
  await user.click(screen.getByRole('button', { name: 'Save' }));
};

describe('ConfigureOrganisationStep', () => {
  // The proxy bounces an engine call on the UI host to the login page, and the
  // step used to read that page as an organisation the engine had created.
  test('the login page does not advance the wizard', async () => {
    server.use(
      http.post('/api/v1/orgs', () => HttpResponse.html('<html>Sign in')),
    );
    const goNext = vi.fn();

    await submitAnOrganisation(goNext);

    expect(
      await screen.findByText(/never reached the engine/),
    ).toBeInTheDocument();
    expect(goNext).not.toHaveBeenCalled();
  });

  test('a created organisation advances the wizard', async () => {
    const goNext = vi.fn();

    await submitAnOrganisation(goNext);

    await waitFor(() => {
      expect(goNext).toHaveBeenCalledTimes(1);
    });
  });
});
