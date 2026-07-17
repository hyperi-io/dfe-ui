import { getRegistry } from '@/core/metrics';

// Prometheus scrape endpoint. Path matches the rest of the stack (/metrics); the PORT
// does not, and cannot: the Rust services host metrics on their own 9090 server,
// while Next.js has exactly one listener. So this rides :3000 and the chart tells
// Prometheus so (dfe-ui values metricsPort). Same path, same names, same shape.
//
// nodejs runtime, not edge: prom-client reads process/GC/event-loop internals that do
// not exist in the edge runtime.
export const runtime = 'nodejs';

// Never cache a scrape -- it must be the numbers now.
export const dynamic = 'force-dynamic';

export async function GET() {
  const registry = getRegistry();
  return new Response(await registry.metrics(), {
    status: 200,
    headers: { 'Content-Type': registry.contentType },
  });
}
