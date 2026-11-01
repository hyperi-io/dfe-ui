import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { act, render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useHandleIncomingSearchMessage } from '.';

const { add } = vi.hoisted(() => ({ add: vi.fn() }));

// jsdom has no IndexedDB, so the Dexie wrapper is the storage boundary.
vi.mock('@/Rules/config/indexedDB', () => ({ RuleFromSearchDb: { add } }));

const ORIGIN = 'http://localhost:8090';
const FROM = { tableName: 'logs', databaseName: 'default' };
const PAYLOAD = {
  savedSearchName: 'Failed logins',
  sql: 'SELECT 1',
  rawSql: 'SELECT 1 FROM logs',
  config: { select: 'Body' },
  source: { name: 'logs', kind: 'log', from: FROM, connection: 'local' },
};

const { wrapper } = buildTestWrapper().withHyperdxPort('8090');

const Probe = () => (
  <>{useHandleIncomingSearchMessage().notificationContextHolder}</>
);

const send = (payload: unknown, origin = ORIGIN) =>
  act(async () => {
    const data = { type: 'CREATE_RULE_FROM_SEARCH', payload };
    window.dispatchEvent(
      new MessageEvent('message', { origin, source: window, data }),
    );
  });

describe('useHandleIncomingSearchMessage', () => {
  const replace = vi.fn();
  const postMessage = vi.spyOn(window, 'postMessage');
  let finishWrite: () => void = () => undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    postMessage.mockImplementation(() => undefined);
    vi.mocked(useRouter).mockReturnValue({ replace } as never);
    add.mockReturnValue(new Promise<void>((done) => (finishWrite = done)));
    render(<Probe />, { wrapper });
  });

  it('acknowledges and navigates only after the search is stored', async () => {
    await send(PAYLOAD);
    expect(postMessage).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();

    await act(async () => finishWrite());

    const ack = { type: 'CREATE_RULE_ACK' };
    expect(postMessage).toHaveBeenCalledWith(ack, { targetOrigin: ORIGIN });
    const { id } = add.mock.calls[0][0] as { id: string };
    expect(replace).toHaveBeenCalledWith(`/rules/create?searchId=${id}`);
  });

  it('stores a retry of the same search once while the write runs', async () => {
    await send(PAYLOAD);
    await send(PAYLOAD);
    await act(async () => finishWrite());

    expect(add).toHaveBeenCalledOnce();
    expect(replace).toHaveBeenCalledOnce();
  });

  it('keeps the sender retrying, says so, and stores the retry', async () => {
    add.mockReset();
    add.mockRejectedValueOnce(new Error('QuotaExceededError'));
    add.mockResolvedValue(undefined);

    await send(PAYLOAD);
    expect(postMessage).not.toHaveBeenCalled();
    expect(await screen.findByText(/could not be saved/i)).toBeInTheDocument();

    await send(PAYLOAD);
    expect(add).toHaveBeenCalledTimes(2);
    expect(postMessage).toHaveBeenCalledOnce();
    expect(replace).toHaveBeenCalledOnce();
  });

  it('acknowledges a retry just after storing, and stores a repeat later', async () => {
    add.mockResolvedValue(undefined);
    await send(PAYLOAD);
    await send(PAYLOAD);
    expect(add).toHaveBeenCalledOnce();
    expect(postMessage).toHaveBeenCalledTimes(2);

    const later = vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 10_000);
    await send(PAYLOAD);
    later.mockRestore();
    expect(add).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['no payload', undefined],
    ['a payload that is not an object', 'SELECT 1'],
    ['no sql', { ...PAYLOAD, sql: undefined }],
    ['a source that is not an object', { ...PAYLOAD, source: 'logs' }],
  ])('neither stores nor acknowledges %s', async (_label, payload) => {
    await send(payload);
    expect(add).not.toHaveBeenCalled();
    expect(postMessage).not.toHaveBeenCalled();
  });

  it('ignores a message from another origin', async () => {
    await send(PAYLOAD, 'http://evil.example');
    expect(add).not.toHaveBeenCalled();
  });
});
