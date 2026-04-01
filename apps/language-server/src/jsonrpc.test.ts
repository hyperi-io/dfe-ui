import { describe, it, expect } from 'vitest';
import { encode, MessageParser } from './jsonrpc.js';

describe('encode', () => {
  it('prefixes JSON body with Content-Length header', () => {
    const msg = { jsonrpc: '2.0' as const, id: 1, result: { ok: true } };
    const buf = encode(msg);
    const s = buf.toString('utf-8');
    expect(s).toMatch(/^Content-Length: \d+\r\n\r\n/);
    expect(s).toContain('{"jsonrpc":"2.0","id":1,"result":{"ok":true}}');
  });
});

describe('MessageParser', () => {
  it('parses a single framed message', () => {
    const body = JSON.stringify({ jsonrpc: '2.0', id: 1, result: null });
    const frame = `Content-Length: ${Buffer.byteLength(body, 'utf-8')}\r\n\r\n${body}`;
    const p = new MessageParser();
    const msgs = p.parse(Buffer.from(frame, 'utf-8'));
    expect(msgs).toHaveLength(1);
    expect(msgs[0]).toEqual({ jsonrpc: '2.0', id: 1, result: null });
  });

  it('buffers until header and body are complete', () => {
    const body = JSON.stringify({ jsonrpc: '2.0', method: 'x' });
    const frame = `Content-Length: ${Buffer.byteLength(body, 'utf-8')}\r\n\r\n${body}`;
    const p = new MessageParser();
    expect(p.parse(Buffer.from(frame.slice(0, 10), 'utf-8'))).toEqual([]);
    expect(p.parse(Buffer.from(frame.slice(10), 'utf-8'))).toHaveLength(1);
  });

  it('waits for more bytes when body is shorter than Content-Length', () => {
    const body = JSON.stringify({ jsonrpc: '2.0', id: 3 });
    const header = `Content-Length: ${Buffer.byteLength(body, 'utf-8')}\r\n\r\n`;
    const p = new MessageParser();
    expect(p.parse(Buffer.from(header + body.slice(0, 3), 'utf-8'))).toEqual([]);
    expect(p.parse(Buffer.from(body.slice(3), 'utf-8'))).toHaveLength(1);
  });

  it('skips header block without Content-Length', () => {
    const p = new MessageParser();
    const chunk = Buffer.from('foo\r\n\r\n', 'utf-8');
    expect(p.parse(chunk)).toEqual([]);
  });

  it('parses multiple messages in one chunk', () => {
    const b1 = JSON.stringify({ jsonrpc: '2.0', id: 1 });
    const b2 = JSON.stringify({ jsonrpc: '2.0', id: 2 });
    const frame =
      `Content-Length: ${Buffer.byteLength(b1, 'utf-8')}\r\n\r\n${b1}` +
      `Content-Length: ${Buffer.byteLength(b2, 'utf-8')}\r\n\r\n${b2}`;
    const p = new MessageParser();
    const msgs = p.parse(Buffer.from(frame, 'utf-8'));
    expect(msgs).toHaveLength(2);
  });

  it('ignores malformed JSON in body', () => {
    const body = '{ not json';
    const frame = `Content-Length: ${Buffer.byteLength(body, 'utf-8')}\r\n\r\n${body}`;
    const p = new MessageParser();
    expect(p.parse(Buffer.from(frame, 'utf-8'))).toEqual([]);
  });
});
