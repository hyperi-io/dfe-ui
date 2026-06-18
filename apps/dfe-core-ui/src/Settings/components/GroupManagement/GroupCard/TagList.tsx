export const TAG_LIMIT = 4;

export const TagList = ({
  items,
  emptyLabel,
}: {
  items: string[];
  emptyLabel: string;
}) => {
  if (!items.length) {
    return (
      <li className="text-xs bg-foreground/10 dark:bg-dark-foreground/10 rounded-md px-2 py-0.5 mb-auto">
        {emptyLabel}
      </li>
    );
  }

  return (
    <>
      {items.slice(0, TAG_LIMIT).map((item) => (
        <li
          key={item}
          className="text-xs bg-foreground/10 dark:bg-dark-foreground/10 rounded-md px-2 py-0.5 whitespace-nowrap mb-auto"
        >
          {item}
        </li>
      ))}
    </>
  );
};
