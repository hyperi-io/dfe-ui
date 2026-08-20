// The bootstrap-seeded break-glass admin username -- one SSoT for the wizard's
// auto-login and password-reset call. Mirrors the engine's
// `os.environ.get("DFE_AUTH_LOCAL_ADMIN_NAME") or "admin"` (auth/bootstrap.py).
// The NEXT_PUBLIC_* var is inlined at build time and is unset in the container
// image, so it is empty in deployed builds; an empty username would 405 the
// reset (collapses to /accounts/reset-password, a GET/PUT/DELETE route). `||`
// (not `??`) so an empty string also falls through to the 'admin' default.
export const BREAK_GLASS_ADMIN_USERNAME =
  process.env.NEXT_PUBLIC_DFE_AUTH_LOCAL_ADMIN_NAME || 'admin';
