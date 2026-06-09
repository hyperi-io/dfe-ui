import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import { cn } from '@/core/utils/style';
import { SourceDetail } from '@/Sources/hooks/useFetchSourceDetail/types';
import { IconInfoCircle } from '@repo/dfe-icons';

const dataListTermStyle =
  'font-medium text-foreground/40 dark:text-dark-foreground/40';
const formCollapseTitleStyle =
  'font-medium text-foreground/60 dark:text-dark-foreground/60';
const EmptyData = () => (
  <span className="text-foreground/40 dark:text-dark-foreground/40">None</span>
);
export const ConfigurationDetailsTabContent = ({
  source,
  display_name,
  description,
  header,
  schema,
  transform,
  match,
  fetcher,
  sigma,
  mapping_standards,
}: SourceDetail) => {
  return (
    <div className="h-full min-h-0 relative">
      <dl className="grid grid-cols-[140px_1fr] gap-x-6 gap-y-1">
        <dt className={dataListTermStyle}>File pathname:</dt>
        <dd>{source}.yaml</dd>
        <dt className={dataListTermStyle}>Display Name:</dt>
        <dd>{display_name ? display_name : <EmptyData />}</dd>
        <dt className={dataListTermStyle}>Description:</dt>
        <dd>{description ? description : <EmptyData />}</dd>
      </dl>
      <SimpleCollapse
        classNames={{
          container: 'px-0',
          title: formCollapseTitleStyle,
        }}
        title="Schema"
        defaultOpen={true}
      >
        <dl className="grid grid-cols-[140px_1fr_140px_1fr] gap-x-6 gap-y-1">
          <dt className={dataListTermStyle}>Header Type:</dt>
          <dd>{header?.type}</dd>
          <dt className={dataListTermStyle}>Header Version:</dt>
          <dd>{header?.version}</dd>
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
          {schema && (
            <>
              {schema?.meta_schema ? (
                <>
                  <dt className={dataListTermStyle}>Meta Schema:</dt>
                  <dd>{schema?.meta_schema}</dd>
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
              {schema?.derived_schema ? (
                <>
                  <dt className={dataListTermStyle}>Derived Schema:</dt>
                  <dd>{schema?.derived_schema}</dd>
                </>
              ) : (
                <>
                  <dt className={dataListTermStyle}>Derived Schema:</dt>
                  <dd>
                    <EmptyData />
                  </dd>
                </>
              )}

              {schema?.additional_fields ? (
                <>
                  <dt className={dataListTermStyle}>Additional Fields:</dt>
                  <dd>{schema?.additional_fields}</dd>
                </>
              ) : (
                <>
                  <dt className={dataListTermStyle}>Additional Fields:</dt>
                  <dd>
                    <EmptyData />
                  </dd>
                </>
              )}
            </>
          )}
        </dl>
      </SimpleCollapse>
      {match && (
        <SimpleCollapse
          classNames={{
            container: 'px-0',
            title: '',
          }}
          title="Receiver"
          defaultOpen={true}
        >
          <dl className="grid grid-cols-[140px_1fr_140px_1fr] gap-x-6 gap-y-1">
            <dt className={dataListTermStyle}>Field:</dt>
            <dd>{match?.field ? match?.field : <EmptyData />}</dd>
            <dt className={dataListTermStyle}>Value:</dt>
            <dd>{match?.value ? match?.value : <EmptyData />}</dd>
          </dl>
        </SimpleCollapse>
      )}
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
          <dl className="grid grid-cols-[140px_1fr_140px_1fr] gap-x-6 gap-y-1">
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
          <dl className="grid grid-cols-[140px_1fr_140px_1fr] gap-x-6 gap-y-1">
            <dt className={dataListTermStyle}>Auth Type:</dt>
            <dd>{fetcher?.auth?.type ? fetcher?.auth?.type : <EmptyData />}</dd>
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
      {transform && (
        <SimpleCollapse
          classNames={{
            container: 'px-0',
            title: formCollapseTitleStyle,
          }}
          title="Transform"
          defaultOpen={true}
        >
          <dl className="grid grid-cols-[140px_1fr_140px_1fr] gap-x-6 gap-y-1">
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
      {mapping_standards && (
        <SimpleCollapse
          classNames={{
            container: 'px-0',
            title: formCollapseTitleStyle,
          }}
          title="Mapping"
          defaultOpen={true}
        >
          <dl className="grid grid-cols-[140px_1fr_140px_1fr] gap-x-6 gap-y-1">
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
      {sigma && (
        <SimpleCollapse
          classNames={{
            container: 'px-0',
            title: formCollapseTitleStyle,
          }}
          title="Sigma"
          defaultOpen={true}
        >
          <dl className="grid grid-cols-[140px_1fr] gap-x-6 gap-y-1">
            <dt className={dataListTermStyle}>Sigma Taxonomy:</dt>
            <dd>{sigma?.taxonomy ? sigma?.taxonomy : <EmptyData />}</dd>
            <dt className={dataListTermStyle}>Sigma Custom Mappings:</dt>
            <dd className="flex gap-1">
              {Object.keys(sigma?.custom_mappings ?? {}).map((key) => (
                <span
                  className="bg-background-muted dark:bg-dark-background-muted px-2 py-1 rounded-md"
                  key={key}
                >
                  {key}: {sigma?.custom_mappings?.[key]}
                </span>
              ))}
            </dd>
          </dl>
        </SimpleCollapse>
      )}
      <SimpleCollapse
        classNames={{
          container: 'px-0',
          title: formCollapseTitleStyle,
        }}
        title="Sigma"
        defaultOpen={true}
      >
        <span className={cn(dataListTermStyle, 'flex items-center gap-2')}>
          <IconInfoCircle />
          Coming soon
        </span>
      </SimpleCollapse>
    </div>
  );
};
