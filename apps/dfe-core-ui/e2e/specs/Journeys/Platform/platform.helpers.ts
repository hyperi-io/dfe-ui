import {
  JOURNEY_USER,
  callAsJourneyUser,
  shot,
} from '@e2e/config/journey.helpers';

export { shot };

/** The console account the platform journeys sign in as. */
export const ADMIN = JOURNEY_USER;

/** A call to the engine API that returns the status as well as the body. */
export const api = async <T = unknown>(
  method: string,
  path: string,
  body?: unknown,
): Promise<{ status: number; body: T }> => {
  const reply = await callAsJourneyUser<T>(method, path, body);
  return { status: reply.status, body: reply.json };
};
