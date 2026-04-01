import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('index', () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.PORT;
  });

  it('calls createLanguageServer with default port 3001', async () => {
    const createLanguageServer = vi.fn();
    vi.doMock('./server.js', () => ({ createLanguageServer }));
    await import('./index.js');
    expect(createLanguageServer).toHaveBeenCalledWith(3001);
  });

  it('calls createLanguageServer with PORT from environment', async () => {
    vi.resetModules();
    delete process.env.PORT;
    process.env.PORT = '7777';
    const createLanguageServer = vi.fn();
    vi.doMock('./server.js', () => ({ createLanguageServer }));
    await import('./index.js');
    expect(createLanguageServer).toHaveBeenCalledWith(7777);
  });
});
