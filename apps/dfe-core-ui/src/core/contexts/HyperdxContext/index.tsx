'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const HyperdxPortContext = createContext<string | undefined>(undefined);

export const HyperdxPortProvider = ({
  children,
  port,
}: {
  children: React.ReactNode;
  port?: string;
}) => {
  return (
    <HyperdxPortContext.Provider value={port}>
      {children}
    </HyperdxPortContext.Provider>
  );
};

/**
 * The browser-reachable HyperDX base URL for this deployment, or undefined when
 * HyperDX is not configured.
 *
 * Built client-side from the current window location's protocol + host and the
 * configured HyperDX port (HYPERDX_PORT, injected via context from the (auth)
 * layout). Deriving the host from window.location means the link resolves to
 * whatever host the user reached the UI on - correct for localhost and
 * remote/LAN access alike - with nothing baked into the client bundle.
 *
 * Returns undefined during SSR and the first client render (window is not
 * available then), then the derived URL after mount, to avoid a hydration
 * mismatch.
 */
export const useHyperdxUrl = (): string | undefined => {
  const port = useContext(HyperdxPortContext);
  const [url, setUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!port) {
      setUrl(undefined);
      return;
    }
    const { hostname, protocol } = window.location;
    setUrl(`${protocol}//${hostname}:${port}`);
  }, [port]);

  return url;
};
