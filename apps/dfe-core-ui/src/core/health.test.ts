import { describe, expect, it, beforeEach } from 'vitest';

import { liveness, readiness, startup, setReady, markStarted } from './health';

/*
 * The probe contract is a CONTRACT: the charts and kubelet read these exact status
 * codes and bodies (scalo-rs docs/core-pillars/HEALTH.md). Asserting the literal
 * body is the point -- dfe-ui shipped for months with the chart probing routes that
 * did not exist, every probe 404ing, the pod restarting forever, and nothing caught
 * it because nothing asserted the contract.
 */
describe('health probe trinity', () => {
  beforeEach(() => {
    setReady(true);
    markStarted();
  });

  it('liveness is 200 alive', async () => {
    const res = liveness();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ status: 'alive' });
  });

  it('startup is 200 started', async () => {
    const res = startup();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ status: 'started' });
  });

  it('readiness is 200 ready', async () => {
    const res = readiness();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ status: 'ready' });
  });

  it('readiness goes 503 not_ready once the flag is cleared', async () => {
    // The drain path: K8s must pull the pod from the Service BEFORE it stops
    // serving, so a cleared flag has to surface as 503 rather than a 200.
    setReady(false);
    const res = readiness();
    expect(res.status).toBe(503);
    await expect(res.json()).resolves.toEqual({ status: 'not_ready' });
  });

  it('liveness stays 200 even when readiness is failing', async () => {
    // Liveness must NEVER track dependencies or readiness -- if a cleared ready flag
    // could kill liveness, one degraded backend would restart every replica and turn
    // a partial outage into a total one.
    setReady(false);
    expect(liveness().status).toBe(200);
  });
});
