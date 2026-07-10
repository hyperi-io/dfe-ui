import { RbacProtected } from '@/core/components/RbacProtected';
import { useFetchOrganisations } from '@/core/hooks/useFetchOrganisations';
import { Select, SelectProps } from 'antd';
import { useMemo } from 'react';

export const OrganisationSelect = ({ ...props }: SelectProps) => {
  const { data: organisations, isLoading, error } = useFetchOrganisations();
  const options = useMemo(() => {
    return (
      organisations?.map((organisation) => ({
        label: organisation.display_name,
        value: organisation.name,
      })) ?? []
    );
  }, [organisations]);

  return (
    <RbacProtected action={RbacProtected.rbacActions.org_read}>
      <RbacProtected.Unrestricted>
        <Select
          {...props}
          options={options}
          loading={isLoading}
          disabled={isLoading || !!error}
        />
      </RbacProtected.Unrestricted>
      <RbacProtected.Restricted tooltip={{ show: true }}>
        <Select disabled {...props} />
      </RbacProtected.Restricted>
    </RbacProtected>
  );
};
