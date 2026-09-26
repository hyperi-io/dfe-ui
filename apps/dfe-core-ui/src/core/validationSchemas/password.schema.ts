import z from 'zod';

/** The engine refuses any password it stores that is shorter than this. */
export const MIN_PASSWORD_LENGTH = 12;

export const PASSWORD_FLOOR_MESSAGE = `Password must contain at least ${MIN_PASSWORD_LENGTH} characters`;

/** A password the console sends to the engine to set, never one it signs in with. */
export const newPasswordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, PASSWORD_FLOOR_MESSAGE);
