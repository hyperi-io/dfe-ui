import { EmptyDetail } from '@/core/components/EmptyDetail';
import { GenericErrorCard } from '@/core/components/GenericError';
import { useFetchRoleDetail } from '@/Settings/hooks/useFetchRoleDetail';
import { IconCheck, IconX } from '@repo/dfe-icons';
import { Spin } from 'antd';

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
    <div>
      <dl className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
        <dt className={dataListTermStyle}>Role Name:</dt>
        <dd>{role_name}</dd>
        <dt className={dataListTermStyle}>Description:</dt>
        <dd>{data.description}</dd>
        <dt className={dataListTermStyle}>Scoped:</dt>
        <dd className="flex items-center text-lg">
          {data.scoped ? <IconCheck /> : <IconX />}
        </dd>
        <dt className={dataListTermStyle}>Permissions:</dt>
        <dd>
          {data.permissions?.length > 0 ? (
            <ul className="flex items-center gap-1">
              {data.permissions.map((permission) => (
                <li
                  key={permission}
                  className="text-xs bg-foreground/10 dark:bg-dark-foreground/10 rounded-md px-2 py-0.5 whitespace-nowrap"
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
