import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/endpoints.generator.mocks';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, waitFor } from '@testing-library/react';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';
import {
  RbacError,
  RbacLoader,
  RbacProtected,
  Restricted,
  Unrestricted,
} from '.';
import { ADMIN_MOCKED_RESPONSE, server } from './hooks/hooks.mocks';
import { UI_DISPLAY_ACTIONS } from './hooks/rbac.constants';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

const TestRbacProtected = () => (
  <RbacProtected action={UI_DISPLAY_ACTIONS.SCHEMA_WRITE}>
    <RbacLoader>
      <p>Loading...</p>
    </RbacLoader>
    <RbacError>
      <p>Unexpected error</p>
    </RbacError>
    <Unrestricted>
      <p>Can view schemas upload</p>
    </Unrestricted>
    <Restricted>
      <p>Cannot view schemas upload</p>
    </Restricted>
  </RbacProtected>
);

describe('RbacProtected', () => {
  describe('when the user has the required permission', () => {
    it('should render the children if the user has the required permission', async () => {
      render(<TestRbacProtected />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Can view schemas upload')).toBeInTheDocument();
      });

      expect(
        screen.queryByText('Cannot view schemas upload'),
      ).not.toBeInTheDocument();
      expect(screen.queryByText('Unexpected error')).not.toBeInTheDocument();
    });

    it('should render the loading fallback if the user groups are loading', async () => {
      render(<TestRbacProtected />, { wrapper });

      expect(
        screen.queryByText('Can view schemas upload'),
      ).not.toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Can view schemas upload')).toBeInTheDocument();
    });
  });

  describe('when the user does not have the required permission', () => {
    beforeEach(() => {
      server.use(
        API_CONFIG_MOCKS.auth.me.get.success({
          mockedResponse: {
            ...ADMIN_MOCKED_RESPONSE,
            permissions: [],
          },
        }),
      );
    });

    it('should not render the children if the user does not have the required permission', async () => {
      render(<TestRbacProtected />, { wrapper });

      await waitFor(() => {
        expect(
          screen.getByText('Cannot view schemas upload'),
        ).toBeInTheDocument();
      });

      expect(
        screen.queryByText('Can view schemas upload'),
      ).not.toBeInTheDocument();

      expect(screen.queryByText('Unexpected error')).not.toBeInTheDocument();
    });

    it('should not render the loading fallback if the user does not have the required permission', async () => {
      render(<TestRbacProtected />, { wrapper });

      expect(screen.queryByText('Loading...')).toBeInTheDocument();

      await waitFor(() => {
        expect(
          screen.getByText('Cannot view schemas upload'),
        ).toBeInTheDocument();
      });

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  describe('when the user has an error', () => {
    beforeEach(() => {
      server.use(API_CONFIG_MOCKS.auth.me.get.error());
    });

    it('should render the error fallback if the user has an error', async () => {
      render(<TestRbacProtected />, { wrapper });

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.queryByText('Unexpected error')).toBeInTheDocument();
      });

      expect(
        screen.queryByText('Can view schemas upload'),
      ).not.toBeInTheDocument();

      expect(
        screen.queryByText('Cannot view schemas upload'),
      ).not.toBeInTheDocument();
    });
  });
});
