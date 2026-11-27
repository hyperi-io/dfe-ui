import { expect } from '@playwright/test';

import { ENGINE_API_URL } from './e2e.client';
import { engineToken } from './engineApi.helpers';
import { adminPassword } from './login.helpers';

// The receiver re-reads its bearer tokens every 60 seconds.
const TOKEN_WAIT_MS = 150_000;

const minted = new Map<string, Promise<string>>();

/** An ingest credential per worker, so one worker's rotation never revokes another's token. */
const credentialId = () => `dfe-e2e-${process.env.TEST_PARALLEL_INDEX ?? '0'}`;

const accepts = async (receiverUrl: string, token: string) =>
  (
    await fetch(`${receiverUrl}/ingest`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: '',
    })
  ).status !== 401;

/**
 * The grant an engine asks for before it changes a credential. An engine that
 * asks for none refuses the call, and the change goes ahead without one.
 */
const reauthHeader = async (
  headers: Record<string, string>,
  target: string,
): Promise<Record<string, string>> => {
  const earned = await fetch(`${ENGINE_API_URL}/api/v1/auth/reauth`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      kind: 'credential',
      target,
      password: adminPassword(),
    }),
  });
  return earned.ok
    ? { 'X-DFE-Reauth': (await earned.json()).grant as string }
    : {};
};

const mint = async (receiverUrl: string): Promise<string> => {
  const headers = { Authorization: `Bearer ${await engineToken()}` };
  const primary = await (
    await fetch(`${ENGINE_API_URL}/api/v1/system/organisation`, { headers })
  ).json();
  expect(primary.name, 'no organisation is named as yours').toBeTruthy();
  const url = `${ENGINE_API_URL}/api/v1/orgs/${primary.name}/ingest-credentials/${credentialId()}`;
  const held = await fetch(url, { headers });
  const grant = await reauthHeader(headers, credentialId());
  const response =
    held.status === 404
      ? await fetch(url, {
          method: 'PUT',
          headers: {
            ...headers,
            ...grant,
            'Content-Type': 'application/json',
            'If-None-Match': '*',
          },
          body: JSON.stringify({
            default_org: primary.name,
            listeners: ['http'],
            orgs: [primary.name],
          }),
        })
      : await fetch(`${url}/rotate`, {
          method: 'POST',
          headers: { ...headers, ...grant },
        });
  expect(response.ok, await response.clone().text()).toBeTruthy();
  const { token } = await response.json();
  await expect
    .poll(
      async () =>
        !(await accepts(receiverUrl, 'not-a-token')) &&
        (await accepts(receiverUrl, token)),
      { timeout: TOKEN_WAIT_MS, intervals: [3_000] },
    )
    .toBe(true);
  return token;
};

/**
 * The bearer token this worker posts to the receiver with: its own ingest
 * credential for the primary organisation, minted or rotated once and taken by
 * the receiver, so the records land in that organisation.
 */
export const ingestToken = (receiverUrl: string): Promise<string> => {
  const held = minted.get(receiverUrl) ?? mint(receiverUrl);
  minted.set(receiverUrl, held);
  return held;
};
