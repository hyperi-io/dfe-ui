import { scopes } from '@repo/dfe-engine-types/scopes';

export const UI_DISPLAY_ACTIONS = scopes;

export type UI_DISPLAY_ACTIONS_TYPE =
  (typeof UI_DISPLAY_ACTIONS)[keyof typeof UI_DISPLAY_ACTIONS];
