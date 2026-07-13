import { TSourceCreateRequestBody } from '@/Sources/hooks/useCreateSource/types';

export const getInitialSourceType = ({
  match,
  fetcher,
}: {
  match: TSourceCreateRequestBody['match'] | null;
  fetcher: TSourceCreateRequestBody['fetcher'] | null;
}) => {
  const matchKeys = Object.keys(match ?? {});
  const fetcherKeys = Object.keys(fetcher ?? {});

  // If both match and fetcher are provided, return null
  // This is an invalid state
  if (matchKeys.length > 0 && fetcherKeys.length > 0) {
    return null;
  }

  if (matchKeys.length > 0) {
    return 'receiver';
  }

  if (fetcherKeys.length > 0) {
    return 'fetcher';
  }
  return null;
};
