// Canonical startup path -- what the charts probe. Contract: @/core/health.
import { startup } from '@/core/health';

// A probe must reflect the process now, never a build-time render.
export const dynamic = 'force-dynamic';

export const GET = startup;
