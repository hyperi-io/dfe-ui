import { redirect } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SchemasPage from './page';

describe('SchemasPage', () => {
  beforeEach(() => {
    vi.mocked(redirect).mockClear();
  });

  it('forwards schema query params onto meta-schemas', async () => {
    await SchemasPage({
      searchParams: Promise.resolve({
        schema_path: 'meta/okta',
        schema_version: '1.0.0',
      }),
    });

    expect(redirect).toHaveBeenCalledWith(
      `/schemas/meta-schemas?${new URLSearchParams({
        schema_path: 'meta/okta',
        schema_version: '1.0.0',
      }).toString()}`,
    );
  });

  it('redirects to meta-schemas when there is no query', async () => {
    await SchemasPage({ searchParams: Promise.resolve({}) });

    expect(redirect).toHaveBeenCalledWith('/schemas/meta-schemas');
  });
});
