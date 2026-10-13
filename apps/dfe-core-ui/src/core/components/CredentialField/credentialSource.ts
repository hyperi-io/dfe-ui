export type TCredentialSource = 'value' | 'env';

const isFilled = (value: unknown) => typeof value === 'string' && value !== '';

/** The source a credential opens on: Env Var only when an env var name is all it holds, so a stored secret or value shows as Value. */
export const initialCredentialSource = ({
  env,
  hasStoredSecret,
  value,
}: {
  env: unknown;
  hasStoredSecret: boolean;
  value: unknown;
}): TCredentialSource =>
  isFilled(env) && !isFilled(value) && !hasStoredSecret ? 'env' : 'value';

/** Whether a stored secret path is set. */
export const isStoredSecret = (path: unknown): boolean => isFilled(path);
