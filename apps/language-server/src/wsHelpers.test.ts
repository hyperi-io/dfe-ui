import { describe, it, expect, vi } from 'vitest';
import WebSocket from 'ws';
import { closeIfOpen, sendJsonIfOpen } from './wsHelpers.js';

describe('sendJsonIfOpen', () => {
  it('sends when socket is OPEN', () => {
    const send = vi.fn();
    const ws = { readyState: WebSocket.OPEN, send } as unknown as WebSocket;
    sendJsonIfOpen(ws, '{"x":1}');
    expect(send).toHaveBeenCalledWith('{"x":1}');
  });

  it('no-ops when socket is not OPEN', () => {
    const send = vi.fn();
    const ws = { readyState: WebSocket.CLOSING, send } as unknown as WebSocket;
    sendJsonIfOpen(ws, '{}');
    expect(send).not.toHaveBeenCalled();
  });
});

describe('closeIfOpen', () => {
  it('closes when OPEN', () => {
    const close = vi.fn();
    const ws = { readyState: WebSocket.OPEN, close } as unknown as WebSocket;
    closeIfOpen(ws, 1011, 'bye');
    expect(close).toHaveBeenCalledWith(1011, 'bye');
  });

  it('no-ops when not OPEN', () => {
    const close = vi.fn();
    const ws = { readyState: WebSocket.CLOSED, close } as unknown as WebSocket;
    closeIfOpen(ws, 1011, 'bye');
    expect(close).not.toHaveBeenCalled();
  });
});
