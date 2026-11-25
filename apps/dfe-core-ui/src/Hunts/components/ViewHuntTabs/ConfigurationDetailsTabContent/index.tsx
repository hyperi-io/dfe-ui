import {
  formatEpochSecondsAgo,
  formatEpochSecondsLocal,
} from '@/core/helpers/date.helpers';
import { cn } from '@/core/utils/style';
import { THuntDetailResponse } from '@/Hunts/hooks/useFetchHuntDetail/types';
import { useFetchHuntRunState } from '@/Hunts/hooks/useFetchHuntRunState';
import { IconExternalLink } from '@repo/dfe-icons';
import Link from 'next/link';

const dataListTermStyle =
  'font-medium text-foreground/40 dark:text-dark-foreground/40';
const EmptyData = ({ text = 'None' }: { text?: string }) => (
  <span className="text-foreground/40 dark:text-dark-foreground/40">
    {text}
  </span>
);

/** When the hunt last ran and what it wrote, and whether a run is on its way. */
const HuntRunRows = ({ name }: { name: string }) => {
  const { run, isLoading, error } = useFetchHuntRunState({ name });
  const lastRun = run?.last_run;
  const rows = run?.last_run_rows;
  const pending = run?.running
    ? 'Running now'
    : run?.run_requested
      ? 'Run queued'
      : null;

  if (isLoading || error || !run) {
    const text = isLoading ? 'Loading' : 'Not available';
    return (
      <>
        <dt className={dataListTermStyle}>Last Run:</dt>
        <dd>
          <EmptyData text={text} />
        </dd>
        <dt className={dataListTermStyle}>Rows Written:</dt>
        <dd>
          <EmptyData text={text} />
        </dd>
      </>
    );
  }

  return (
    <>
      <dt className={dataListTermStyle}>Last Run:</dt>
      <dd className="flex flex-wrap items-baseline gap-x-3">
        {lastRun == null ? (
          <EmptyData text="Never run" />
        ) : (
          <>
            <span>{formatEpochSecondsLocal(lastRun)}</span>
            <span className="text-foreground/60 dark:text-dark-foreground/60">
              {formatEpochSecondsAgo(lastRun)}
            </span>
          </>
        )}
        {pending && <span className="font-medium">{pending}</span>}
      </dd>
      <dt className={dataListTermStyle}>Rows Written:</dt>
      <dd>{rows == null ? <EmptyData /> : rows.toLocaleString()}</dd>
    </>
  );
};

export const ConfigurationDetailsTabContent = ({
  name,
  display_name,
  cron,
  log_buffer,
  global_target_table_name,
  global_source_table_name,
  customers,
  rules,
}: THuntDetailResponse) => {
  const rulesList = rules?.map((rule) => rule.rule_name);
  const cronText = Array.isArray(cron) ? cron.join(', ') : cron;
  return (
    <div className="relative h-full min-h-0">
      <dl className="grid grid-cols-[200px_1fr] gap-x-6 gap-y-1 mb-4">
        <dt className={dataListTermStyle}>File Pathname:</dt>
        <dd>{name}</dd>
        <dt className={dataListTermStyle}>Display Name:</dt>
        <dd>{display_name ? display_name : <EmptyData />}</dd>
        <dt className={dataListTermStyle}>Cron:</dt>
        <dd>{cronText ? cronText : <EmptyData />}</dd>
        <HuntRunRows name={name} />
        <dt className={dataListTermStyle}>Log Buffer:</dt>
        <dd>{log_buffer ? log_buffer : <EmptyData />}</dd>
        <dt className={dataListTermStyle}>Global Target Table Name:</dt>
        <dd>
          {global_target_table_name ? global_target_table_name : <EmptyData />}
        </dd>
        <dt className={dataListTermStyle}>Global Source Table Name:</dt>
        <dd>
          {global_source_table_name ? global_source_table_name : <EmptyData />}
        </dd>
        <dt className={dataListTermStyle}>Customers:</dt>
        <dd>{customers ? customers.join(', ') : <EmptyData />}</dd>
        <dt className={dataListTermStyle}>Rules:</dt>
        <dd>
          {rulesList && rulesList.length > 0 ? (
            <>
              <ul className="flex flex-wrap items-center gap-1">
                {rulesList.map((rule) => (
                  <li
                    className={cn(
                      //Chip
                      'bg-foreground/10 dark:bg-dark-foreground/10 rounded-md hover:bg-foreground/20 dark:hover:bg-dark-foreground/20',
                      // Text
                      'text-sm whitespace-nowrap',
                    )}
                    key={rule}
                  >
                    <Link
                      className={cn(
                        'text-foreground dark:text-dark-foreground h-full w-full px-2 py-0.5 flex gap-2 items-center',
                      )}
                      href={`/rules?name=${rule}`}
                      key={rule}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                    >
                      {rule} <IconExternalLink />
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <EmptyData />
          )}
        </dd>
      </dl>
    </div>
  );
};
