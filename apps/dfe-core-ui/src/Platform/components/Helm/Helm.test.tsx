import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Helm } from '.';
import { server } from './Helm.mocks';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const refuse = (status: number, body: string | Record<string, string>) =>
  http.get(API_CONFIG_MOCKS.helm.listFiles.mockedUrl, () =>
    typeof body === 'string'
      ? new HttpResponse(body, { status, statusText: 'Service Unavailable' })
      : HttpResponse.json(body, { status }),
  );

describe('Helm', () => {
  it('lists the helm files the engine returns', async () => {
    render(<Helm />, { wrapper });

    expect(await screen.findByText('dfe-receiver')).toBeInTheDocument();
    expect(screen.getByText('dfe-loader')).toBeInTheDocument();
    expect(
      screen.queryByText('Could not list the helm files'),
    ).not.toBeInTheDocument();
  });

  it.each<{
    case: string;
    status: number;
    body: string | Record<string, string>;
    reason: string;
  }>([
    {
      case: 'gitops off',
      status: 503,
      body: { code: 'not_configured', message: 'gitops is not enabled' },
      reason: 'gitops is not enabled',
    },
    {
      case: 'a FastAPI detail string',
      status: 500,
      body: { detail: 'overlay repo unreadable' },
      reason: 'overlay repo unreadable',
    },
    {
      case: 'a proxy answering with no body',
      status: 503,
      body: '',
      reason: 'Service Unavailable',
    },
  ])('shows the engine reason on $case', async ({ status, body, reason }) => {
    server.use(refuse(status, body));
    render(<Helm />, { wrapper });

    expect(
      await screen.findByText('Could not list the helm files'),
    ).toBeInTheDocument();
    expect(screen.getByText(reason)).toBeInTheDocument();
    expect(screen.queryByText('dfe-receiver')).not.toBeInTheDocument();
  });
});
