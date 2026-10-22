import { EngineUnavailableScene } from '@/core/scenes/EngineUnavailableScene';

// Answered by the proxy's rewrite (src/proxy.ts), which carries the 503 and the
// per-request nonce: never prerendered.
export const dynamic = 'force-dynamic';

export default function EngineUnavailable() {
  return <EngineUnavailableScene />;
}
