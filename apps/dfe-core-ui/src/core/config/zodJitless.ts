import { z } from 'zod';

// zod probes for JIT support with Function(''), which the CSP refuses; parse without it.
z.config({ jitless: true });
