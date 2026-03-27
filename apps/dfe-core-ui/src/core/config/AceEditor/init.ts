/* eslint-disable @typescript-eslint/no-explicit-any */
// Initialize ACE global before any ACE imports
import ace from 'ace-builds/src-noconflict/ace';

// Keep in sync with apps/dfe-core-ui/package.json "ace-builds" version.
const ACE_BUILDS_CDN_BASE =
  'https://cdn.jsdelivr.net/npm/ace-builds@1.43.6/src-noconflict';

// Make ace available globally
if (typeof window !== 'undefined') {
  (window as any).ace = ace;

  // Workers must be absolute URLs; otherwise Ace resolves worker-*.js relative to the page
  // (e.g. /settings/worker-javascript.js) and the request fails.
  ace.config.setModuleUrl(
    'ace/mode/json_worker',
    `${ACE_BUILDS_CDN_BASE}/worker-json.js`,
  );
  ace.config.setModuleUrl(
    'ace/mode/javascript_worker',
    `${ACE_BUILDS_CDN_BASE}/worker-javascript.js`,
  );
  ace.config.setModuleUrl(
    'ace/mode/yaml_worker',
    `${ACE_BUILDS_CDN_BASE}/worker-yaml.js`,
  );
}

export default ace;
