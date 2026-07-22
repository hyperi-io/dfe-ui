import { NotificationCard } from '@/core/components/NotificationCard';
import { DeleteVariableModal } from '@/Platform/components/Helm/DeleteVariableModal';
import { useFetchHelmFileVariables } from '@/Platform/hooks/helm/useFetchHelmFileVariables';
import { Spin } from 'antd';
import { Fragment } from 'react/jsx-runtime';

const dataListTermStyle = 'text-foreground/50 dark:text-foreground/50';

export const ViewHelmFileDetail = ({ name }: { name: string }) => {
  const { data, isLoading, error } = useFetchHelmFileVariables({ name });

  return (
    <>
      {isLoading && (
        <>
          <Spin />
          Loading...
        </>
      )}
      {error && (
        <NotificationCard
          title="Error"
          description={error.message}
          type="error"
        />
      )}
      {!isLoading && !error && data && data.length === 0 && (
        <NotificationCard title="This Helm file has no variables" />
      )}
      {!isLoading && !error && data && data.length > 0 && (
        <div className="flex flex-col gap-2">
          <p>Variables</p>
          <ul className="flex flex-col gap-2">
            {data.map((object: Record<string, unknown>, index: number) => (
              <li
                className="relative border rounded-md p-2 border-foreground/10 dark:border-foreground/10"
                key={`object-${index}`}
              >
                <DeleteVariableModal
                  className="absolute top-1 right-1"
                  name={name}
                  path={object.path as string}
                />

                <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
                  {Object.entries(object).map(([key, value]) => (
                    <Fragment key={key}>
                      <dt className={dataListTermStyle}>{key}</dt>
                      <dd>
                        {typeof value === 'string' ? (
                          value
                        ) : (
                          <pre>{JSON.stringify(value, null, 2)}</pre>
                        )}
                      </dd>
                    </Fragment>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};
