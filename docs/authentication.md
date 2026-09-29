# Authentication

Two ways to sign in, both wired through NextAuth. The UI never runs its own identity provider handshake - identity always comes from the engine.

## Sign-in paths

```mermaid
flowchart TB
    subgraph creds["local account"]
        L1[login form] --> E1[engine /auth/login] --> S1[NextAuth session]
    end
    subgraph oidc["external IdP (OIDC)"]
        O1[login page stores a nonce<br/>in sessionStorage] --> O2[engine /auth/oidc/.../login<br/>return_to carries the nonce] --> O3[IdP] --> O4[engine callback<br/>303 to /login/oidc#token] --> O5[nonce checked,<br/>oidc-token provider] --> S2[NextAuth session]
    end
```

- **Local account:** the login form posts to the engine's local auth. The console forwards the browser's `X-Forwarded-For` so the engine's audit trail can name the client.
- **OIDC:** the engine is the relying party and re-mints its own token. It returns the browser to `/login/oidc` with the token in the URL fragment. The console accepts that token only when the `login_nonce` on the return URL matches the one the same tab stored when it started the login, so a crafted link carrying someone else's token cannot sign a browser in.

## Session renewal

The browser asks for a renewal by posting to `/api/auth/session` with no token data. The server refreshes the session's engine token against the engine, reads the roles from `/auth/me`, and takes the expiry and the password-change flag from the engine's answer. Nothing the browser sends can set the token, roles, lifetime or flag.

## The dfe_token cookie

`src/proxy.ts` mirrors the session's engine token into a `dfe_token` cookie scoped to `DFE_COOKIE_DOMAIN`, so the embedded HyperDX signs in as the same user. Signing out expires it with the same Domain and Path, along with the host-only copy the engine's OIDC callback sets.

## Redirects

Every post-login redirect goes through `safeRedirectPath` (`src/core/config/loginCallback.ts`), including NextAuth's own `redirect` callback. A target that resolves off the console's origin - `//host`, `/\host`, another scheme - becomes `/`.

Key files: `src/proxy.ts`, `src/core/config/auth.ts`, `src/core/auth/renewEngineSession.ts`, `src/core/auth/oidcLoginNonce.ts`, the `(no-auth)` login scene.

The suite-wide auth model (one PDP = dfe-engine, `X-Oidc-*` edge seam) is documented engine-side: `docs/control-plane/` in dfe-engine.
