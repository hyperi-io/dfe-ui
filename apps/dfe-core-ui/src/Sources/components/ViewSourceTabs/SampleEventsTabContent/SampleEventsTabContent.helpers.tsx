import { SampleEvent } from '@/Sources/mocks/sampleEvents.mocks';

export const getSampleEventsTableColumns = (sampleEvents: SampleEvent[]) => {
  const objectKeys = Object.keys(sampleEvents[0] ?? {});

  return objectKeys.map((key) => ({
    title: key,
    dataIndex: key,
    key,
  }));
};
