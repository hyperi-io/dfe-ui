import { useMutation } from '@tanstack/react-query';
import { createOrganisation } from './api';
import {
  TOrganisationCreateRequestBody,
  TOrganisationCreateResponse,
} from './types';

interface UseCreateOrganisationProps {
  onSuccess?: (data: TOrganisationCreateResponse) => void;
  onError?: (error: Error) => void;
}

export const useCreateOrganisation = ({
  onSuccess,
  onError,
}: UseCreateOrganisationProps = {}) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (organisation: TOrganisationCreateRequestBody) =>
      createOrganisation({
        body: organisation,
      }),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return {
    data,
    mutate,
    isPending,
    error,
  };
};
