import { registerOTel } from '@vercel/otel';

// Next's instrumentation hook: runs ONCE per server process, before anything serves.
//
// This is dfe-ui joining the stack's ONE telemetry seam. dfe-infra resolves the
// destination from telemetry.mode (dfe-common.otelEndpoint) and hands it to every
// container as OTEL_EXPORTER_OTLP_ENDPOINT -- HyperDX by default (the otel collector
// dfe-infra deploys), or the receiver pipeline, or a deployer's own OTLP backend.
// Until now dfe-ui was handed that env and ignored it.
//
// OPT-IN, on purpose: telemetry.mode=prometheus resolves the endpoint to "" and the
// chart then omits the env entirely. No endpoint means no exporter -- we do NOT fall
// back to an OTel default (which would quietly dial localhost:4318 and log connection
// errors forever on a deploy that chose scrape-only). Metrics are still exported in
// that mode; Prometheus comes and gets them from /metrics.

export function register(): void {
  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  if (!endpoint) return;

  registerOTel({
    serviceName: process.env.OTEL_SERVICE_NAME ?? 'dfe-ui',
  });
}
