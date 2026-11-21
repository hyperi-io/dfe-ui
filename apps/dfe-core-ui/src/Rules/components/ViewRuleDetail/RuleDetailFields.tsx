import type { TRuleDetail } from '@/Rules/hooks/useFetchRuleDetail/types';

const dataListTermStyle =
  'font-medium text-foreground/40 dark:text-dark-foreground/40';

/** A field the rule leaves out is a dash, never the word None. */
const EmptyData = () => (
  <span
    role="img"
    aria-label="No value"
    className="text-foreground/40 dark:text-dark-foreground/40"
  >
    &mdash;
  </span>
);

export const RuleDetailFields = ({ rule }: { rule: TRuleDetail }) => (
  <dl className="grid grid-cols-[140px_1fr_140px_1fr] gap-x-6 gap-y-1">
    <dt className={dataListTermStyle}>Name:</dt>
    <dd>{rule.name}</dd>
    <dt className={dataListTermStyle}>Severity:</dt>
    <dd>{rule.severity}</dd>
    <dt className={dataListTermStyle}>Source:</dt>
    <dd>{rule.source || <EmptyData />}</dd>
    <dt className={dataListTermStyle}>Source Table:</dt>
    <dd>{rule.source_table || <EmptyData />}</dd>
    <dt className={dataListTermStyle}>Source DB:</dt>
    <dd>{rule.source_db || <EmptyData />}</dd>
    <dt className={dataListTermStyle}>Hunt Name:</dt>
    <dd>{rule.hunt_name || <EmptyData />}</dd>
    <dt className={dataListTermStyle}>Where Clause:</dt>
    <dd>{rule.where_clause || <EmptyData />}</dd>
    <dt className={dataListTermStyle}>CEL Filter:</dt>
    <dd>{rule.cel_filter || <EmptyData />}</dd>
  </dl>
);
