'use client';

import { createContext, useContext, useSyncExternalStore } from 'react';

interface HyperdxLocation {
  url?: string;
  port?: string;
}

const HyperdxLocationContext = createContext<HyperdxLocation>({});

const subscribeToLocation = (): (() => void) => {
  return () => {};
};

const getLocationOrigin = (): string | undefined => {
  const { hostname, protocol } = window.location;
  return `${protocol}//${hostname}`;
};

const getServerLocationOrigin = (): undefined => undefined;

export const HyperdxPortProvider = ({
  children,
  url,
  port,
}: {
  children: React.ReactNode;
  url?: string;
  port?: string;
}) => {
  return (
    <HyperdxLocationContext.Provider value={{ url, port }}>
      {children}
    </HyperdxLocationContext.Provider>
  );
};

/**
 * The browser-reachable HyperDX base URL for this deployment, or undefined when
 * HyperDX is not configured.
 *
 * Two deployment shapes, in precedence order:
 * - HYPERDX_URL: a full base URL for deployments where HyperDX lives on its
 *   own hostname (k8s gateway: https://hyperdx.{domain}).
 * - HYPERDX_PORT: same-host-different-port (docker compose). The host comes
 *   from window.location so the link resolves to whatever host the user
 *   reached the UI on - correct for localhost and remote/LAN access alike -
 *   with nothing baked into the client bundle.
 *
 * Returns undefined during SSR and the first client render (window is not
 * available then), then the resolved URL after mount, to avoid a hydration
 * mismatch.
 */
export const useHyperdxUrl = (): string | undefined => {
  const { url, port } = useContext(HyperdxLocationContext);
  const origin = useSyncExternalStore(
    subscribeToLocation,
    getLocationOrigin,
    getServerLocationOrigin,
  );

  if (!origin) {
    return undefined;
  }
  if (url) {
    return url;
  }
  if (!port) {
    return undefined;
  }
  return `${origin}:${port}`;
};
