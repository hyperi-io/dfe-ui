import { engine } from '@e2e/config/engineApi.helpers';

/** The Elastic Agent envelope a beats source routes on. */
export const envelope = (dataset: string, message: string, run: string) => ({
  '@timestamp': new Date().toISOString(),
  agent: {
    id: 'journey',
    name: 'journey-agent',
    type: 'filebeat',
    version: '8.0.0',
  },
  data_stream: { dataset, namespace: 'ep', type: 'logs' },
  event: { dataset },
  input: { type: 'tcp' },
  message,
  tags: ['forwarded', `journey_run:${run}`],
});

export const deleteIfPresent = async (name: string) => {
  try {
    await engine('DELETE', `/api/v1/sources/${name}`);
  } catch {
    /* absent */
  }
};
