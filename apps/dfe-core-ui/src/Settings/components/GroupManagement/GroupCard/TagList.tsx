import { cn } from '@/core/utils/style';
import { LinkedMemberName } from '@/Settings/components/GroupManagement/LinkedMemberName';

export const TAG_LIMIT = 4;

export const TAG_CLASS =
  'text-xs bg-foreground/10 dark:bg-dark-foreground/10 rounded-md px-2 py-0.5 whitespace-nowrap';

/** The "+ N more" count for the tags past *limit*, or nothing when *count* fits. */
export const TagOverflow = ({
  className,
  count,
  limit = TAG_LIMIT,
}: {
  className?: string;
  count: number;
  limit?: number;
}) =>
  count > limit ? (
    <span
      className={cn(
        'text-xs shrink-0 whitespace-nowrap',
        'bg-background dark:bg-dark-background',
        'rounded-md px-2 py-0.5 border border-foreground/10 dark:border-dark-foreground/10',
        className,
      )}
    >
      {`+ ${count - limit} more`}
    </span>
  ) : null;

/** Up to *limit* tags: *items* first, then the *linked* members marked as holding the group through its identity provider. */
export const TagList = ({
  emptyLabel,
  items,
  limit = TAG_LIMIT,
  linked = [],
  tagClassName,
}: {
  emptyLabel: string;
  items: string[];
  limit?: number;
  linked?: string[];
  /** Classes for each tag, such as a tighter max width. */
  tagClassName?: string;
}) => {
  const tags = [
    ...items.map((item) => ({ item, throughLink: false })),
    ...linked.map((item) => ({ item, throughLink: true })),
  ];
  if (!tags.length) {
    return <li className={cn(TAG_CLASS, 'mb-auto')}>{emptyLabel}</li>;
  }

  return (
    <>
      {tags.slice(0, limit).map(({ item, throughLink }) => (
        <li
          key={`${throughLink ? 'linked' : 'member'}-${item}`}
          // min-w-0 lets a tag shrink to its ellipsis in a row that does not wrap.
          className={cn(
            TAG_CLASS,
            'mb-auto min-w-0 max-w-48 truncate',
            tagClassName,
          )}
          // A linked member's name carries its own tooltip.
          title={throughLink ? undefined : item}
        >
          {throughLink ? <LinkedMemberName username={item} /> : item}
        </li>
      ))}
    </>
  );
};
