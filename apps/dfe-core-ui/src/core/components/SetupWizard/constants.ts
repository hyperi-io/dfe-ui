// The engine's recovery account (dfe_engine.auth.breakglass.USERNAME), separate
// from the everyday `admin`.
//
// A reset here holds only until the next engine restart: breakglass.seed() runs
// on every boot and reconciles the account back to the hash committed on first
// boot, so DFE_AUTH_BREAKGLASS_PASSWORD is the durable path, not this form.
//
// No password constant lives here. The deployment mints its own and the operator
// types it on the login page; a literal in this bundle would only ever be wrong.
export const BREAK_GLASS_USERNAME = 'breakglass';

/** The deployment variable that does survive a restart, named in the wizard copy. */
export const BREAK_GLASS_PASSWORD_ENV = 'DFE_AUTH_BREAKGLASS_PASSWORD';
