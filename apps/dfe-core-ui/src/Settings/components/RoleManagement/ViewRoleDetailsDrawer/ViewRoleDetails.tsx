import { EmptyDetail } from '@/core/components/EmptyDetail';
import { RESOURCE_TYPES } from '@/core/components/CreateSchemaForm/fieldType.constants';
import { GenericErrorCard } from '@/core/components/GenericError';
import { Tooltip } from '@/core/components/Tooltip';
import { cn } from '@/core/utils/style';
import { TAG_CLASS } from '@/Settings/components/GroupManagement/GroupCard/TagList';
import {
  isOrgScoped,
  ORG_SCOPED_HELP,
} from '@/Settings/components/RoleManagement/roleScope';
import { useFetchRoleDetail } from '@/Settings/hooks/roles/useFetchRoleDetail';
import { Spin, Tag } from 'antd';

const dataListTermStyle =
  'font-medium text-foreground/40 dark:text-dark-foreground/40';
const EmptyData = () => (
  <span className="text-foreground/40 dark:text-dark-foreground/40">None</span>
);

export const ViewRoleDetails = ({ role_name }: { role_name: string }) => {
  const { data, isLoading, error } = useFetchRoleDetail({
    role_name,
  });

  if (isLoading) {
    return (
      <>
        <Spin /> <p className="sr-only">Loading {role_name} details</p>
      </>
    );
  }

  if (error) {
    return (
      <GenericErrorCard
        title={`Error fetching ${role_name} details`}
        description={error.message}
      />
    );
  }

  if (!data) {
    return (
      <EmptyDetail
        title="No role details found"
        description="Please try again later."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="flex items-center gap-2 text-lg font-semibold">
        {role_name}
        {data.resource_type === RESOURCE_TYPES.CORE && (
          <Tag className="m-0">Core</Tag>
        )}
      </h1>
      {/* Baselines line each label up with the first line of its value, tags included. */}
      <dl className="grid grid-cols-[160px_1fr] items-baseline gap-x-6 gap-y-3">
        <dt className={dataListTermStyle}>Description:</dt>
        <dd>{data.description || <EmptyData />}</dd>
        <dt className={dataListTermStyle}>Scope:</dt>
        <dd>
          <Tooltip
            destroyOnHidden
            title={isOrgScoped(data) ? ORG_SCOPED_HELP : undefined}
          >
            {isOrgScoped(data) ? 'Organisation scoped' : 'System wide'}
          </Tooltip>
        </dd>
        <dt className={dataListTermStyle}>Permissions:</dt>
        <dd>
          {data.permissions?.length > 0 ? (
            <ul className="flex flex-wrap items-center gap-2">
              {data.permissions.map((permission) => (
                <li
                  key={permission}
                  className={cn(TAG_CLASS, 'whitespace-normal break-all')}
                >
                  {permission}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyData />
          )}
        </dd>
      </dl>
    </div>
  );
};
