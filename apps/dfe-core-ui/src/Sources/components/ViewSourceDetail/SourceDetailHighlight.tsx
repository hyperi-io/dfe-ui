import { NotificationCard } from '@/core/components/NotificationCard';
import { cn } from '@/core/utils/style';
import { TSourceVersionDetail } from '@/Sources/hooks/useFetchSourceDetail/types';
import { IconCircleCheck, IconCircleX, IconLink } from '@repo/dfe-icons';
import Link from 'next/link';

export const SourceDetailHighlight = ({
  source,
}: {
  source: TSourceVersionDetail;
}) => {
  const {
    source: sourceName,
    deployed_version,
    selected,
    version: { schema, header },
  } = source;

  const isSelectedVersionDeployed = deployed_version === selected;
  return (
    schema?.meta_schema &&
    header?.type && (
      <NotificationCard
        type="info"
        classNames={{
          root: '@container w-full',
          container: 'w-full min-w-0',
        }}
        description={
          <ul
            className={cn(
              'grid grid-cols-1 @xl:grid-cols-2 gap-x-6 gap-y-1',
              '[&_li]:flex [&_li]:items-center [&_li]:gap-2',
            )}
          >
            <li>
              <span className="font-medium">Header:</span>
              <Link
                className="hover:underline text-foreground! dark:text-dark-foreground! flex items-center"
                href={`/schemas/other-schemas?schema_path=${header?.type}&schema_version=${header?.version}`}
              >
                <IconLink className="text-foreground/40 dark:text-dark-foreground/40 mr-0.5" />
                {header?.type}@{header?.version}
              </Link>
            </li>
            <li>
              <span className="font-medium">Schema:</span>
              <Link
                className="hover:underline text-foreground! dark:text-dark-foreground! flex items-center"
                href={
                  schema?.meta_schema_version
                    ? `/schemas/meta-schemas?schema_path=${schema?.meta_schema}&schema_version=${schema?.meta_schema_version}`
                    : `/schemas/meta-schemas?schema_path=${schema?.meta_schema}`
                }
              >
                <IconLink className="text-foreground/40 dark:text-dark-foreground/40 mr-0.5" />
                {/* A source may pin no meta-schema version; the separator is
                    part of the version, not decoration on the path. */}
                {schema?.meta_schema}
                {schema?.meta_schema_version
                  ? `@${schema.meta_schema_version}`
                  : ''}
              </Link>
            </li>
            <li className="@xl:col-span-2">
              <span className="font-medium">Deployed:</span>
              {isSelectedVersionDeployed ? (
                <>
                  <IconCircleCheck className="text-success h-4 w-4" /> Selected
                  version is deployed
                </>
              ) : (
                <>
                  <IconCircleX className="text-error h-4 w-4" /> Selected
                  version is not deployed{' '}
                  {deployed_version && (
                    <Link
                      className="hover:underline text-foreground/40! dark:text-dark-foreground/40! flex items-center"
                      href={`/sources?source_name=${sourceName}&source_version=${deployed_version}`}
                    >
                      <IconLink className="mr-0.5" />
                      View Deployed
                    </Link>
                  )}
                </>
              )}
            </li>
          </ul>
        }
      />
    )
  );
};
