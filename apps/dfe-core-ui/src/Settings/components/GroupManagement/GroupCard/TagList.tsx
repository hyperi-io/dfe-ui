import { LinkedMemberName } from '@/Settings/components/GroupManagement/LinkedMemberName';

export const TAG_LIMIT = 4;

/** Up to TAG_LIMIT tags: *items* first, then the *linked* members marked as holding the group through its identity provider. */
export const TagList = ({
  emptyLabel,
  items,
  linked = [],
}: {
  emptyLabel: string;
  items: string[];
  linked?: string[];
}) => {
  const tags = [
    ...items.map((item) => ({ item, throughLink: false })),
    ...linked.map((item) => ({ item, throughLink: true })),
  ];
  if (!tags.length) {
    return (
      <li className="text-xs bg-foreground/10 dark:bg-dark-foreground/10 rounded-md px-2 py-0.5 mb-auto">
        {emptyLabel}
      </li>
    );
  }

  return (
    <>
      {tags.slice(0, TAG_LIMIT).map(({ item, throughLink }) => (
        <li
          key={`${throughLink ? 'linked' : 'member'}-${item}`}
          className="text-xs bg-foreground/10 dark:bg-dark-foreground/10 rounded-md px-2 py-0.5 whitespace-nowrap mb-auto"
        >
          {throughLink ? <LinkedMemberName username={item} /> : item}
        </li>
      ))}
    </>
  );
};
