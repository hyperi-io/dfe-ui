import { scopes } from '@repo/dfe-engine-types/scopes';

export const UI_DISPLAY_ACTIONS = scopes;

export type UI_DISPLAY_ACTIONS_TYPE =
  (typeof UI_DISPLAY_ACTIONS)[keyof typeof UI_DISPLAY_ACTIONS];

/** A rule run returns source rows, so the engine checks both grants. Pass with `requireAll`. */
export const RULE_RUN_ACTIONS: UI_DISPLAY_ACTIONS_TYPE[] = [
  UI_DISPLAY_ACTIONS.rule_validate,
  UI_DISPLAY_ACTIONS.schema_read,
];
