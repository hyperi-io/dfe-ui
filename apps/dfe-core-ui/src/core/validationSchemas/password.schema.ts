import z from 'zod';

/** The engine refuses any password it stores that is shorter than this, in code points. */
const MIN_PASSWORD_LENGTH = 12;

const PASSWORD_FLOOR_MESSAGE = `Password must contain at least ${MIN_PASSWORD_LENGTH} characters`;

/** The engine refuses a password longer than this in UTF-8, the most bcrypt hashes. */
const MAX_PASSWORD_BYTES = 72;

const PASSWORD_CEILING_MESSAGE = `Use at most ${MAX_PASSWORD_BYTES} bytes. Most characters count as 1, but accented letters, other scripts and emoji count as 2 to 4.`;

const encoder = new TextEncoder();

/** A password's length as the engine measures its ceiling, in UTF-8 bytes. */
const passwordBytes = (value: string) => encoder.encode(value).length;

/** A password's length as the engine measures its floor, in code points, where `.length` counts an emoji twice. */
const passwordCodePoints = (value: string) => Array.from(value).length;

/** A password the console sends to the engine to set, never one it signs in with. */
export const newPasswordSchema = z
  .string()
  .refine(
    (value) => passwordCodePoints(value) >= MIN_PASSWORD_LENGTH,
    PASSWORD_FLOOR_MESSAGE,
  )
  .refine(
    (value) => passwordBytes(value) <= MAX_PASSWORD_BYTES,
    PASSWORD_CEILING_MESSAGE,
  );
