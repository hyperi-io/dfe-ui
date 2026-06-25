import { useFetchOrganisations } from '@/core/hooks/useFetchOrganisations';
import { Select, SelectProps } from 'antd';
import { useMemo } from 'react';

interface OrganisationSelectProps extends SelectProps {
  currentOrganisation?: string;
}

export const OrganisationSelect = ({
  currentOrganisation,
  ...props
}: OrganisationSelectProps) => {
  const { data: organisations, isLoading, error } = useFetchOrganisations();

  const options = useMemo(() => {
    return organisations
      ?.filter((organisation) => organisation.name !== currentOrganisation)
      .map((organisation) => ({
        label: organisation.display_name,
        value: organisation.name,
      }));
  }, [organisations, currentOrganisation]);
  return (
    <div className="flex flex-col gap-2">
      <Select
        loading={isLoading}
        disabled={isLoading || !!error}
        options={options}
        placeholder="Select organisation"
        {...props}
      />
      {error && <div className="text-error text-sm">{error.message}</div>}
    </div>
  );
};
