/* eslint-disable @typescript-eslint/no-explicit-any */
// Initialize ACE global before any ACE imports
import ace from 'ace-builds/src-noconflict/ace';

// Make ace available globally
if (typeof window !== 'undefined') {
  (window as any).ace = ace;

  // The bundler emits the installed ace-builds workers as same-origin assets, so
  // they load straight from this origin under the CSP's worker-src 'self'.
  ace.config.set('loadWorkerFromBlob', false);
  ace.config.setModuleUrl(
    'ace/mode/json_worker',
    new URL('ace-builds/src-noconflict/worker-json.js', import.meta.url).href,
  );
  ace.config.setModuleUrl(
    'ace/mode/javascript_worker',
    new URL('ace-builds/src-noconflict/worker-javascript.js', import.meta.url)
      .href,
  );
  ace.config.setModuleUrl(
    'ace/mode/yaml_worker',
    new URL('ace-builds/src-noconflict/worker-yaml.js', import.meta.url).href,
  );
}

export default ace;
