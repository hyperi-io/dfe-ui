/** @vitest-environment node */

import { describe, expect, test } from 'vitest';

import { GET } from './route';

describe('GET /metrics', () => {
  test('serves the process and nodejs families and the info gauge as Prometheus text', async () => {
    const response = await GET();
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toMatch(/^text\/plain/);
    expect(body).toMatch(/^process_cpu_seconds_total \d/m);
    expect(body).toMatch(/^process_resident_memory_bytes \d/m);
    expect(body).toMatch(/^nodejs_eventloop_lag_seconds /m);
    expect(body).toMatch(/^info\{version="[^"]+",commit="[^"]+"\} 1$/m);
  });

  test('a second scrape reuses the registry rather than registering the collectors again', async () => {
    await GET();
    const response = await GET();

    expect(response.status).toBe(200);
  });
});
