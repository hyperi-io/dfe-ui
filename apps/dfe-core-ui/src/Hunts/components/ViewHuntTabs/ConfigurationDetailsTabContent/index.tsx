import { cn } from '@/core/utils/style';
import { HuntDetailResponse } from '@/Hunts/hooks/useFetchHuntDetail/types';
import { IconExternalLink } from '@repo/dfe-icons';
import Link from 'next/link';

const dataListTermStyle =
  'font-medium text-foreground/40 dark:text-dark-foreground/40';
const EmptyData = () => (
  <span className="text-foreground/40 dark:text-dark-foreground/40">None</span>
);

export const ConfigurationDetailsTabContent = ({
  name,
  display_name,
  cron,
  log_buffer,
  global_target_table_name,
  global_source_table_name,
  customers,
  rules,
}: HuntDetailResponse) => {
  const rulesList = rules?.map((rule) => rule.rule_name);
  return (
    <div className="relative h-full min-h-0">
      <dl className="grid grid-cols-[200px_1fr] gap-x-6 gap-y-1 mb-4">
        <dt className={dataListTermStyle}>File Pathname:</dt>
        <dd>{name}</dd>
        <dt className={dataListTermStyle}>Display Name:</dt>
        <dd>{display_name ? display_name : <EmptyData />}</dd>
        <dt className={dataListTermStyle}>Cron:</dt>
        <dd>{cron ? cron : <EmptyData />}</dd>
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
          {rulesList.length > 0 ? (
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
