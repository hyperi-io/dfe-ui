// Readiness alias. Contract + reasoning: @/core/health.
import { readiness } from '@/core/health';

// A probe must reflect the process now, never a build-time render.
export const dynamic = 'force-dynamic';

export const GET = readiness;
