import { SourceDetail } from '@/Sources/hooks/useFetchSourceDetail/types';

export const transformSourceInitialValues = (source?: SourceDetail) => {
  if (!source) {
    return {};
  }
  return {
    ...source,
    fetcher:
      Object.keys(source.fetcher ?? {}).length > 0
        ? {
            ...source.fetcher,
            auth: {
              ...source.fetcher?.auth,
              type:
                source.fetcher?.auth === null
                  ? 'none'
                  : source.fetcher?.auth?.type,
            },
          }
        : null,
  };
};
