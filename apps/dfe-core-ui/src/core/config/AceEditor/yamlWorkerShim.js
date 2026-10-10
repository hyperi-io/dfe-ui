// js-yaml in Ace's YAML worker probes for buffer and esprima with importScripts, which 404s beside the bundled worker, so both are registered empty and the probe fails in-process as it did before.
importScripts(decodeURIComponent(self.location.hash.slice(1)));
self.require.modules.buffer = {};
self.require.modules.esprima = {};
