import { fetchMockSampleEvents } from '@/Sources/mocks/sampleEvents.mocks';
import { useQuery } from '@tanstack/react-query';

const SAMPLE_EVENTS_COUNT = 20;
const SAMPLE_EVENTS_DATE_RANGE = {
  start: '2026-06-01T00:00:00.000Z',
  end: '2026-06-08T23:59:59.999Z',
} as const;

export const SAMPLE_EVENTS_QUERY_KEY = (source_name: string | null) =>
  ['sample-events', source_name] as const;

/**
 * Mock hook to get sample events for a source.
 * // TODO: Replace with call to POST /api/v1/queries/raw
 *
 * @param source_name - The name of the source to get sample events for.
 * @param enabled - Whether to enable the query.
 * @returns
 */
export const useFetchSampleEvents = ({
  source_name,
  enabled = true,
}: {
  source_name: string | null;
  enabled?: boolean;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: SAMPLE_EVENTS_QUERY_KEY(source_name),
    queryFn: ({ signal }) =>
      fetchMockSampleEvents(
        {
          source_name: source_name ?? '',
          date_range: SAMPLE_EVENTS_DATE_RANGE,
          count: SAMPLE_EVENTS_COUNT,
        },
        signal,
      ),
    enabled: !!source_name && enabled,
  });

  return { data, isLoading, error };
};
