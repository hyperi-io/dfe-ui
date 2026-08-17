'use client';

import { useParams } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

import { useTheme } from '@/core/contexts/ClientContext/ThemeContext';
import { useHyperdxUrl } from '@/core/contexts/HyperdxContext';

/**
 * DFE Observe - embeds the HyperDX fork as a seamless sibling inside the dfe-ui
 * shell (sidebar + content). HyperDX runs chromeless (?embed=1 -> no AppNav) so
 * there is a single nav (dfe-ui's). The optional catch-all maps the dfe-ui path to
 * the HyperDX route: /observe -> /search, /observe/search/list -> /search/list, etc.
 *
 * Theme sync: dfe-ui owns light/dark; we postMessage the current colorMode to the
 * iframe on load and on every toggle so the embedded hyperdx matches (seamless).
 *
 * The embed target comes from useHyperdxUrl (runtime, deployment-provided) --
 * a build-inlined NEXT_PUBLIC_ read here would bake the container's empty
 * value into the bundle.
 */
export default function ObservePage() {
  const params = useParams<{ feature?: string[] }>();
  const { colorMode } = useTheme();
  const hyperdxUrl = useHyperdxUrl();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const feature =
    params?.feature && params.feature.length > 0
      ? params.feature.join('/')
      : 'search';

  const sendTheme = useCallback(() => {
    if (!hyperdxUrl) return;
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'DFE_SET_THEME', theme: colorMode },
      hyperdxUrl,
    );
  }, [colorMode, hyperdxUrl]);

  // Re-sync on every dfe-ui theme toggle (no iframe reload).
  useEffect(() => {
    sendTheme();
  }, [sendTheme]);

  // undefined covers both "not mounted yet" and "deployment has no HyperDX";
  // the message only matters in the second case and the first lasts one frame.
  if (!hyperdxUrl) {
    return (
      <div className="p-6 text-md">
        HyperDX is not configured for this deployment.
      </div>
    );
  }

  // Initial theme in the URL so the first paint already matches (avoids a flash);
  // subsequent toggles go via postMessage above.
  const src = `${hyperdxUrl}/${feature}?embed=1&theme=${colorMode}`;

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
