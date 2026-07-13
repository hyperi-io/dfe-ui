import { useQuery } from '@tanstack/react-query';
import { fetchAccountDetail } from './api';

export const ACCOUNT_DETAIL_QUERY_KEY = (username?: string | null) => [
  'account',
  ...(username ? [username] : []),
];
export const useFetchAccountDetail = ({
  username,
}: {
  username?: string | null;
}) => {
  const isQueryEnabled = !!username;
  const { data, isLoading, error } = useQuery({
    queryKey: ACCOUNT_DETAIL_QUERY_KEY(username),
    queryFn: () =>
      fetchAccountDetail({
        pathParams: { username: username ?? '' },
      }),
    enabled: isQueryEnabled,
  });

  return { data, isLoading, error };
};
