// Liveness alias. Contract + reasoning: @/core/health.
import { liveness } from '@/core/health';

// A probe must reflect the process now, never a build-time render.
export const dynamic = 'force-dynamic';

export const GET = liveness;
