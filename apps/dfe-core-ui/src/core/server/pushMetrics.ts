import { metrics, type Meter } from '@opentelemetry/api';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { getRegistry } from '@/core/metrics';

// Pushed as gauges, because the engine reads process_cpu_seconds_total from the gauge table as it does for scalo-rs.
const PUSHED_METRICS = [
  'container_memory_limit_bytes',
  'container_memory_usage_bytes',
  'info',
  'process_cpu_seconds_total',
  'process_open_fds',
  'process_resident_memory_bytes',
  'start_time_seconds',
];

export const createPushReader = () =>
  new PeriodicExportingMetricReader({ exporter: new OTLPMetricExporter() });

/** Reports the registry's readings through `meter`, so /metrics and the push carry the same numbers. */
export const observeRegistry = (meter: Meter) => {
  const gauges = new Map(
    PUSHED_METRICS.map((name) => [name, meter.createObservableGauge(name)]),
  );

  meter.addBatchObservableCallback(
    async (result) => {
      const readings = await getRegistry().getMetricsAsJSON();
      for (const { name, values } of readings) {
        const gauge = gauges.get(name);
        if (!gauge) continue;
        for (const { labels, value } of values) {
          result.observe(gauge, value, labels);
        }
      }
    },
    [...gauges.values()],
  );
};

export const startPushingMetrics = (serviceName: string) => {
  observeRegistry(metrics.getMeter(serviceName));
};
