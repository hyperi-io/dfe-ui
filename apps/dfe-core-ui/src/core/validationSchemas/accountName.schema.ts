import z from 'zod';

/** An account's display name: required on a new account, and on one that has a name already, since the engine refuses to clear it. */
export const accountNameSchema = (required: boolean) =>
  required
    ? z.string().trim().min(1, { message: 'Name is required' })
    : z.string().optional().nullable();
