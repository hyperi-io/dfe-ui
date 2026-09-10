/**
 * The console's own version, as stamped into this build.
 *
 * Next inlines `NEXT_PUBLIC_APP_VERSION` at build time from `appVersionEnv`, so
 * this is the one runtime reader of it: the sidebar and the version panes all
 * name the same build rather than each reaching for the env var.
 *
 * The engine reports `ui` as null unless the deploy repo pins a UI version off
 * the certified stack, so this is what fills that gap.
 */
export const uiBuildVersion = (): string | undefined =>
  process.env.NEXT_PUBLIC_APP_VERSION || undefined;
