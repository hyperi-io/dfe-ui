import { useSearchParams } from 'next/navigation';

export const useSourceType = () => {
  const searchParams = useSearchParams();
  const searchId = searchParams.get('searchId');
  const isHyperdx = !!searchId;

  return {
    sourceType: isHyperdx ? 'hyperdx' : 'raw',
  } satisfies {
    sourceType: 'raw' | 'hyperdx';
  };
};
