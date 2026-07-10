'use client';

import { useParams } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

import { useTheme } from '@/core/contexts/ClientContext/ThemeContext';

/**
 * DFE Observe - embeds the HyperDX fork as a seamless sibling inside the dfe-ui
 * shell (sidebar + content). HyperDX runs chromeless (?embed=1 -> no AppNav) so
 * there is a single nav (dfe-ui's). The optional catch-all maps the dfe-ui path to
 * the HyperDX route: /observe -> /search, /observe/search/list -> /search/list, etc.
 *
 * Theme sync: dfe-ui owns light/dark; we postMessage the current colorMode to the
 * iframe on load and on every toggle so the embedded hyperdx matches (seamless).
 */
const HYPERDX_URL = process.env.NEXT_PUBLIC_HYPERDX_URL;

export default function ObservePage() {
  const params = useParams<{ feature?: string[] }>();
  const { colorMode } = useTheme();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const feature =
    params?.feature && params.feature.length > 0
      ? params.feature.join('/')
      : 'search';

  const sendTheme = useCallback(() => {
    if (!HYPERDX_URL) return;
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'DFE_SET_THEME', theme: colorMode },
      HYPERDX_URL,
    );
  }, [colorMode]);

  // Re-sync on every dfe-ui theme toggle (no iframe reload).
  useEffect(() => {
    sendTheme();
  }, [sendTheme]);

  if (!HYPERDX_URL) {
    return (
      <div className="p-6 text-md">
        HyperDX is not configured for this deployment (NEXT_PUBLIC_HYPERDX_URL
        is unset).
      </div>
    );
  }

  // Initial theme in the URL so the first paint already matches (avoids a flash);
  // subsequent toggles go via postMessage above.
  const src = `${HYPERDX_URL}/${feature}?embed=1&theme=${colorMode}`;

  return (
    <iframe
      ref={iframeRef}
      src={src}
      title="DFE Observe"
      onLoad={sendTheme}
      allow="clipboard-read; clipboard-write"
      style={{
        display: 'block',
        width: '100%',
        height: '100vh',
        border: 'none',
      }}
    />
  );
}
