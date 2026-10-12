// js-yaml in Ace's YAML worker probes for buffer and esprima with importScripts, which 404s beside the bundled worker, so both are registered empty and the probe fails in-process as it did before.
// Only a same-origin worker-yaml script is loaded, so the fragment cannot point the worker at any other script. The block keeps `target` out of the worker's global scope.
{
  const target = new URL(
    decodeURIComponent(self.location.hash.slice(1)),
    self.location.href,
  );
  if (
    target.origin !== self.location.origin ||
    !/\/worker-yaml[^/]*\.js$/.test(target.pathname)
  ) {
    throw new Error(
      'yamlWorkerShim: refusing a worker URL that is not a same-origin worker-yaml script',
    );
  }
  importScripts(target.href);
}
self.require.modules.buffer = {};
self.require.modules.esprima = {};
