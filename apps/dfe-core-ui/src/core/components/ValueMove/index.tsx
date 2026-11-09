import { IconArrowNarrowRight } from '@repo/dfe-icons';

/** Two values with an arrow between them. Screen readers get `label` in place of the arrow. */
export const ValueMove = ({
  from,
  to,
  label,
}: {
  from: string;
  to: string;
  label: string;
}) => (
  <span className="inline-flex items-center">
    <span
      aria-hidden="true"
      className="inline-flex items-center gap-1 whitespace-nowrap"
    >
      {from}
      <IconArrowNarrowRight className="shrink-0 text-foreground/50 dark:text-dark-foreground/50" />
      {to}
    </span>
    <span className="sr-only">{label}</span>
  </span>
);
