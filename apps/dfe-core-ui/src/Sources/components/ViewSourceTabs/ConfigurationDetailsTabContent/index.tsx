import { AceEditor } from '@/core/components/AceEditor';
import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import { useFetchSetupStatus } from '@/core/hooks/useFetchSetupStatus';
import { cn } from '@/core/utils/style';
import { FETCHER_TOPIC_LABELS } from '@/Sources/components/CreateUpdateSourceForm/sourceForm.schema';
import {
  DefaultOrOverride,
  ttlDaysText,
} from '@/Sources/components/DefaultOverride';
import { TSourceVersionDetail } from '@/Sources/hooks/useFetchSourceDetail/types';
import { stringifyFetcherConfig } from '@/Sources/utils/transformSourceData/helpers';
import { IconCircleCheck, IconCircleX, IconLink } from '@repo/dfe-icons';
import Link from 'next/link';
import { ViewDetailsModal } from './ViewDetailsModal';

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
  version: { header, schema, transform, match, fetcher, source_build, views },
}: TSourceVersionDetail) => {
  const hasSchema = schema?.meta_schema || header?.type;
  const isFetcherOrigin = Object.keys(fetcher ?? {}).length > 0;
  const hasOrigin = match?.field || isFetcherOrigin;
  // A core source such as main has neither, and the engine reports no origin for it.
  const receiverOrNone = match?.field ? 'Receiver' : null;
  const originLabel = isFetcherOrigin ? 'Fetcher' : receiverOrNone;
  const hasViews = views && views.length > 0;
  const fetcherConfig = stringifyFetcherConfig(fetcher?.config);
  const { data: setupStatus } = useFetchSetupStatus();

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

        <dt className={dataListTermStyle}>Origin:</dt>
        <dd>{originLabel ?? <EmptyData />}</dd>
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
              <Link
                className="hover:underline text-foreground! dark:text-dark-foreground! flex items-center"
                href={`/schemas/other-schemas?schema_path=${header?.type}&schema_version=${header?.version}`}
              >
                <IconLink className="text-foreground/40 dark:text-dark-foreground/40 mr-0.5" />
                <span className="text-foreground/40 dark:text-dark-foreground/40">
                  {header?.type?.split('/').slice(0, -1).join('/')}/
                </span>
                {/* Header type name */}
                {header?.type?.split('/').pop()}.yaml
              </Link>
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
            <dt className={dataListTermStyle}>Engine:</dt>
            <dd>
              <DefaultOrOverride
                defaultValue={setupStatus?.default_engine}
                value={schema?.engine}
              />
            </dd>
            <dt className={dataListTermStyle}>TTL Days:</dt>
            <dd>
              <DefaultOrOverride
                defaultValue={ttlDaysText(setupStatus?.default_ttl_days)}
                value={ttlDaysText(schema?.ttl_days)}
              />
            </dd>
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
          {isFetcherOrigin ? (
            <div className="flex flex-col gap-2">
              <dl className="grid grid-cols-[155px_1fr_155px_1fr] gap-x-6 gap-y-1">
                <dt className={dataListTermStyle}>Source Type:</dt>
                <dd>
                  {fetcher?.source_type ? fetcher?.source_type : <EmptyData />}
                </dd>
                <dt className={dataListTermStyle}>Topic:</dt>
                <dd>
                  {fetcher?.topic
                    ? FETCHER_TOPIC_LABELS[fetcher.topic]
                    : FETCHER_TOPIC_LABELS.own}
                </dd>
              </dl>
              <p className={cn(dataListTermStyle, 'mt-2')}>Config</p>
              {fetcherConfig ? (
                <AceEditor
                  name="fetcher_config_detail"
                  mode="yaml"
                  height="240px"
                  readOnly
                  value={fetcherConfig}
                />
              ) : (
                <EmptyData />
              )}
            </div>
          ) : (
            <dl className="grid grid-cols-[155px_1fr_155px_1fr] gap-x-6 gap-y-1">
              <dt className={dataListTermStyle}>Field:</dt>
              <dd>{match?.field ? match?.field : <EmptyData />}</dd>
              <dt className={dataListTermStyle}>Value:</dt>
              <dd>{match?.value ? match?.value : <EmptyData />}</dd>
            </dl>
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
      {hasViews && (
        <SimpleCollapse
          classNames={{
            container: 'px-0',
            title: formCollapseTitleStyle,
          }}
          title="Views"
        >
          <ul className="flex gap-2">
            {views?.map((view) => (
              <li
                key={view.standard}
                className={cn(
                  'flex items-center gap-2 grow-0',
                  'bg-foreground/10 dark:bg-dark-foreground/10 rounded-md pl-4 pr-2 py-1',
                )}
              >
                {view.standard} <ViewDetailsModal view={view} />
              </li>
            ))}
          </ul>
        </SimpleCollapse>
      )}
    </div>
  );
};
