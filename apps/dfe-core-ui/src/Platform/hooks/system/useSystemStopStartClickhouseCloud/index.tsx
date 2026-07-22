import { useMutation } from '@tanstack/react-query';
import {
  systemStartClickhouseCloudApi,
  systemStopClickhouseCloudApi,
} from './api';
import { TSystemStartStopClickhouseCloudResponse } from './types';

export const useSystemStopStartClickhouseCloud = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (values: TSystemStartStopClickhouseCloudResponse) => void;
  onError?: (error: Error) => void;
} = {}) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (action: 'stop' | 'start') => {
      if (action === 'stop') {
        return systemStopClickhouseCloudApi();
      } else {
        return systemStartClickhouseCloudApi();
      }
    },
    onSuccess: (values) => {
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
