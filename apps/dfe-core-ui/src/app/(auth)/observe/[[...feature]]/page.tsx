'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

import { NotificationCard } from '@/core/components/NotificationCard';
import { useTheme } from '@/core/contexts/ClientContext/ThemeContext';
import { useHyperdxUrl } from '@/core/contexts/HyperdxContext';

/**
 * DFE Observe - embeds the HyperDX fork as a seamless sibling inside the dfe-ui
 * shell (sidebar + content). HyperDX runs chromeless (?embed=1 -> no AppNav) so
 * there is a single nav (dfe-ui's). The optional catch-all maps the dfe-ui path to
 * the HyperDX route: /observe -> /search, /observe/search/list -> /search/list, etc.
 *
 * Our own query params are forwarded to that route, and OBSERVE_ALIASES adds
 * dfe-ui paths that map to a HyperDX route plus params. embed and theme are set
 * last and win, so a caller cannot spoof the chrome or the palette.
 *
 * Theme sync: dfe-ui owns light/dark; we postMessage the current colorMode to the
 * iframe on load and on every toggle so the embedded hyperdx matches (seamless).
 *
 * The embed target comes from useHyperdxUrl (runtime, deployment-provided) --
 * a build-inlined NEXT_PUBLIC_ read here would bake the container's empty
 * value into the bundle.
 */
/**
 * dfe-ui paths that are a HyperDX route plus fixed params.
 *
 * Hunt Results gets its own path rather than a query string on /observe/search
 * so the sidebar's pathname matching can tell the two entries apart, and so it
 * always opens on the detections rather than resuming the user's last source.
 * `source` is matched by NAME -- ids are per-deployment, and the fork seeds this
 * table as `hunts` (api/src/dfe/controllers/org-connection.ts).
 */
const OBSERVE_ALIASES: Record<
  string,
  { feature: string; params: Record<string, string> }
> = {
  'hunt-results': { feature: 'search', params: { source: 'hunts' } },
};

export default function ObservePage() {
  const params = useParams<{ feature?: string[] }>();
  const searchParams = useSearchParams();
  const { colorMode } = useTheme();
  const hyperdxUrl = useHyperdxUrl();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const path =
    params?.feature && params.feature.length > 0
      ? params.feature.join('/')
      : 'search';
  const alias = OBSERVE_ALIASES[path];
  const feature = alias?.feature ?? path;

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
      <div className="w-full h-full p-4 bg-background dark:bg-dark-background">
        <NotificationCard
          classNames={{
            title: 'dark:text-dark-background',
            description: 'dark:text-dark-background',
          }}
          title="HyperDX is not configured for this deployment."
          type="warning"
        />
      </div>
    );
  }

  // Initial theme in the URL so the first paint already matches (avoids a flash);
  // subsequent toggles go via postMessage above.
  const query = new URLSearchParams(searchParams?.toString() ?? '');
  for (const [key, value] of Object.entries(alias?.params ?? {})) {
    query.set(key, value);
  }
  query.set('embed', '1');
  query.set('theme', colorMode);
  const src = `${hyperdxUrl}/${feature}?${query.toString()}`;

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
