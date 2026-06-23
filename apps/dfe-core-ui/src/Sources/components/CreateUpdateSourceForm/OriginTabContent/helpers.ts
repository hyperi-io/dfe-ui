import { components } from '@repo/dfe-engine-types';

export const getInitialSourceType = ({
  match,
  fetcher,
}: {
  match: components['schemas']['SourceMatch'] | null;
  fetcher: components['schemas']['SourceFetcher'] | null;
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

export const OPERATORS = ['equals', 'exists'];
