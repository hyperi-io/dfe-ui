/* eslint-disable @typescript-eslint/no-explicit-any */
// Initialize ACE global before any ACE imports
import ace from 'ace-builds/src-noconflict/ace';

// Make ace available globally
if (typeof window !== 'undefined') {
  (window as any).ace = ace;

  // Configure worker path for Vite
  ace.config.setModuleUrl(
    'ace/mode/json_worker',
    'https://cdn.jsdelivr.net/npm/ace-builds@1.41.0/src-noconflict/worker-json.js',
  );
}

export default ace;
