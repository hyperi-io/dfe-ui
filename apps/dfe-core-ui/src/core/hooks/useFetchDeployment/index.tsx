import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useSystemDeploymentStore } from '@/core/stores/system/systemDeploymentStore';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { fetchSystemDeploymentApi } from './api';

export const useFetchDeployment = () => {
  const deployment = useSystemDeploymentStore((state) => state.deployment);
  const setDeployment = useSystemDeploymentStore(
    (state) => state.setDeployment,
  );
  const queryEnabled = deployment == null;

  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.system.deployment(),
    queryFn: () => fetchSystemDeploymentApi(),
    enabled: queryEnabled,
  });

  useEffect(() => {
    if (!queryEnabled || !data) {
      return;
    }
    setDeployment(data);
  }, [data, queryEnabled, setDeployment]);

  return { data: deployment ?? undefined, isLoading, error };
};
