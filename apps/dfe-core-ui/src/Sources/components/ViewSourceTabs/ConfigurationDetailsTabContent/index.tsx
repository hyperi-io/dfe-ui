import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import { cn } from '@/core/utils/style';
import { SourceVersionDetail } from '@/Sources/hooks/useFetchSourceDetail/types';
import { IconCircleCheck, IconCircleX, IconLink } from '@repo/dfe-icons';
import Link from 'next/link';

const dataListTermStyle =
  'font-medium text-foreground/40 dark:text-dark-foreground/40';
const formCollapseTitleStyle =
  'font-medium text-foreground/60 dark:text-dark-foreground/60';
const EmptyData = () => (
  <span className="text-foreground/40 dark:text-dark-foreground/40">None</span>
);

const formatDeployedDescription = ({
  sourceName,
  deployed_version,
  selected_version,
}: {
  sourceName: string;
  deployed_version?: string | null;
  selected_version: string;
}) => {
  if (!deployed_version) {
    return (
      <span className="text-foreground/40 dark:text-dark-foreground/40">
        No version deployed
      </span>
    );
  }

  if (deployed_version === selected_version) {
    return (
      <span className="flex items-center gap-2 text-foreground dark:text-dark-foreground">
        <IconCircleCheck className="text-success h-4 w-4" /> Selected version is
        deployed
      </span>
    );
  }

  return (
    <span className="flex items-center gap-2 text-foreground dark:text-dark-foreground">
      <IconCircleX className="text-error h-4 w-4" /> Selected version is not
      deployed{' '}
      {deployed_version && (
        <Link
          className="hover:underline text-foreground/40! dark:text-dark-foreground/40! flex items-center"
          href={`/sources?source_name=${sourceName}&source_version=${deployed_version}`}
        >
          <IconLink className="mr-0.5" />
          View Deployed
        </Link>
      )}
    </span>
  );
};
export const ConfigurationDetailsTabContent = ({
  source: sourceName,
  display_name,
  description,
  deployed_version,

  selected: selected_version,
  version: {
    header,
    schema,
    transform,
    match,
    fetcher,
    mapping_standards,
    source_build,
  },
}: SourceVersionDetail) => {
  const hasSchema = schema?.meta_schema || header?.type;
  const hasOrigin = match?.field || Object.keys(fetcher ?? {}).length > 0;
  const hasMappingStandards =
    mapping_standards && mapping_standards?.length > 0;
  return (
    <div className="relative h-full min-h-0">
      <dl className="grid grid-cols-[155px_1fr] gap-x-6 gap-y-1 mb-4">
        <dt className={dataListTermStyle}>File Pathname:</dt>
        <dd>{sourceName}</dd>

        <dt className={dataListTermStyle}>Display Name:</dt>
        <dd>{display_name ? display_name : <EmptyData />}</dd>

        <dt className={dataListTermStyle}>Description:</dt>
        <dd>{description ? description : <EmptyData />}</dd>

        <dt className={dataListTermStyle}>Deployed Version:</dt>
        <dd>
          {formatDeployedDescription({
            sourceName,
            deployed_version,
            selected_version,
          })}
        </dd>

        <dt className={dataListTermStyle}>Build Status:</dt>
        <dd>{source_build ? 'Build Executed' : <EmptyData />}</dd>
      </dl>
      {hasSchema && (
        <SimpleCollapse
          classNames={{
            container: 'px-0',
            title: formCollapseTitleStyle,
          }}
          title="Schema"
          defaultOpen={true}
        >
          <dl className="grid grid-cols-[155px_1fr_155px_1fr] gap-x-6 gap-y-1">
            <dt className={dataListTermStyle}>Header Type:</dt>
            <dd>
              <span className="text-foreground/40 dark:text-dark-foreground/40">
                {header?.type?.split('/').slice(0, -1).join('/')}/
              </span>
              {/* Header type name */}
              {header?.type?.split('/').pop()}.yaml
            </dd>
            <dt className={dataListTermStyle}>Header Version:</dt>
            <dd>{header?.version}</dd>
            {schema?.meta_schema ? (
              <>
                <dt className={dataListTermStyle}>Meta Schema:</dt>
                <dd>
                  <Link
                    className="hover:underline text-foreground! dark:text-dark-foreground! flex items-center"
                    href={`/schemas/meta-schemas?schema_path=${schema?.meta_schema}&schema_version=${schema?.meta_schema_version}`}
                  >
                    <IconLink className="text-foreground/40 dark:text-dark-foreground/40 mr-0.5" />
                    <span className="text-foreground/40 dark:text-dark-foreground/40">
                      {/* Meta schema path */}
                      {schema?.meta_schema?.split('/').slice(0, -1).join('/')}/
                    </span>
                    {/* Meta schema name */}
                    {schema?.meta_schema?.split('/').pop()}.yaml
                  </Link>
                </dd>
                <dt className={dataListTermStyle}>Meta Schema Version:</dt>
                <dd>{schema?.meta_schema_version}</dd>
              </>
            ) : (
              <>
                <dt className={dataListTermStyle}>Meta Schema:</dt>
                <dd>
                  <EmptyData />
                </dd>
              </>
            )}
            {schema?.engine ? (
              <>
                <dt className={dataListTermStyle}>Engine:</dt>
                <dd>{schema?.engine}</dd>
              </>
            ) : (
              <>
                <dt className={dataListTermStyle}>Engine:</dt>
                <dd>
                  <EmptyData />
                </dd>
              </>
            )}
            {schema?.ttl_days ? (
              <>
                <dt className={dataListTermStyle}>TTL Days:</dt>
                <dd>{schema?.ttl_days}</dd>
              </>
            ) : (
              <>
                <dt className={dataListTermStyle}>TTL Days:</dt>
                <dd>
                  <EmptyData />
                </dd>
              </>
            )}
          </dl>
        </SimpleCollapse>
      )}

      {hasOrigin && (
        <SimpleCollapse
          classNames={{
            container: 'px-0',
            title: formCollapseTitleStyle,
          }}
          title="Origin"
          defaultOpen={true}
        >
          <dl className="grid grid-cols-[155px_1fr_155px_1fr] gap-x-6 gap-y-1">
            <dt className={dataListTermStyle}>Field:</dt>
            <dd>{match?.field ? match?.field : <EmptyData />}</dd>
            <dt className={dataListTermStyle}>Value:</dt>
            <dd>{match?.value ? match?.value : <EmptyData />}</dd>
          </dl>

          {fetcher && (
            <SimpleCollapse
              classNames={{
                container: 'px-0',
                content: 'flex flex-col gap-2',
                title: formCollapseTitleStyle,
              }}
              title="Fetcher"
              defaultOpen={true}
            >
              <dl className="grid grid-cols-[155px_1fr_155px_1fr] gap-x-6 gap-y-1">
                <dt className={dataListTermStyle}>Source Type:</dt>
                <dd>
                  {fetcher?.source_type ? fetcher?.source_type : <EmptyData />}
                </dd>
                <dt className={dataListTermStyle}>Base URL:</dt>
                <dd>{fetcher?.base_url ? fetcher?.base_url : <EmptyData />}</dd>
                <dt className={dataListTermStyle}>Poll Interval Secs:</dt>
                <dd>
                  {fetcher?.poll_interval_secs ? (
                    fetcher?.poll_interval_secs
                  ) : (
                    <EmptyData />
                  )}
                </dd>
              </dl>
              <p className={cn(dataListTermStyle, 'mt-2')}>Auth Details</p>
              <dl className="grid grid-cols-[155px_1fr_155px_1fr] gap-x-6 gap-y-1">
                <dt className={dataListTermStyle}>Auth Type:</dt>
                <dd>
                  {fetcher?.auth?.type ? fetcher?.auth?.type : <EmptyData />}
                </dd>
                {fetcher?.auth?.type === 'oauth2' && (
                  <>
                    <dt className={dataListTermStyle}>Token URL:</dt>
                    <dd>
                      {fetcher?.auth?.token_url ? (
                        fetcher?.auth?.token_url
                      ) : (
                        <EmptyData />
                      )}
                    </dd>
                    <dt className={dataListTermStyle}>Client ID:</dt>
                    <dd>
                      {fetcher?.auth?.client_id ? (
                        fetcher?.auth?.client_id
                      ) : (
                        <EmptyData />
                      )}
                    </dd>
                    <dt className={dataListTermStyle}>Client Secret:</dt>
                    <dd>
                      {fetcher?.auth?.client_secret ? (
                        fetcher?.auth?.client_secret
                      ) : (
                        <EmptyData />
                      )}
                    </dd>
                  </>
                )}
                {fetcher?.auth?.type === 'api_key' && (
                  <>
                    <dt className={dataListTermStyle}>API Key:</dt>
                    <dd>
                      {fetcher?.auth?.api_key ? (
                        fetcher?.auth?.api_key
                      ) : (
                        <EmptyData />
                      )}
                    </dd>
                  </>
                )}
              </dl>
            </SimpleCollapse>
          )}
        </SimpleCollapse>
      )}

      {transform && (
        <SimpleCollapse
          classNames={{
            container: 'px-0',
            title: formCollapseTitleStyle,
          }}
          title="Transform"
          defaultOpen={true}
        >
          <dl className="grid grid-cols-[155px_1fr_155px_1fr] gap-x-6 gap-y-1">
            <dt className={dataListTermStyle}>Engine:</dt>
            <dd>{transform?.engine ? transform?.engine : <EmptyData />}</dd>
            <dt className={dataListTermStyle}>Config File:</dt>
            <dd>
              {transform?.config_file ? transform?.config_file : <EmptyData />}
            </dd>
            <dt className={dataListTermStyle}>Env:</dt>
            <dd>
              {transform?.env && Object.entries(transform?.env).length > 0 ? (
                Object.entries(transform?.env).map(([key, value]) => (
                  <div key={key}>
                    {key}: {value}
                  </div>
                ))
              ) : (
                <EmptyData />
              )}
            </dd>
            <dt className={dataListTermStyle}>Files:</dt>
            <dd>
              {transform?.files?.join(', ') ? (
                transform?.files?.join(', ')
              ) : (
                <EmptyData />
              )}
            </dd>
          </dl>
        </SimpleCollapse>
      )}
      {hasMappingStandards && (
        <SimpleCollapse
          classNames={{
            container: 'px-0',
            title: formCollapseTitleStyle,
          }}
          title="Mapping"
          defaultOpen={true}
        >
          <dl className="grid grid-cols-[155px_1fr_155px_1fr] gap-x-6 gap-y-1">
            <dt className={dataListTermStyle}>Mapping Standards:</dt>
            <dd>
              {mapping_standards?.join(', ') ? (
                mapping_standards?.join(', ')
              ) : (
                <EmptyData />
              )}
            </dd>
          </dl>
        </SimpleCollapse>
      )}
    </div>
  );
};
