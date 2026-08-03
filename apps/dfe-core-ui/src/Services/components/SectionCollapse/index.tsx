import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import { IconCheck, IconX } from '@repo/dfe-icons';
import isArray from 'lodash/isArray';
import { Fragment } from 'react/jsx-runtime';

const dataListTermStyle = 'text-foreground/50 dark:text-dark-foreground/50';
const EmptyData = () => (
  <span className="text-foreground/50 dark:text-dark-foreground/50">None</span>
);

const booleanRender = (value: boolean) => {
  return (
    <span className="flex items-center gap-1">
      {!!value ? (
        <>
          <IconCheck /> Yes
        </>
      ) : (
        <>
          <IconX /> No
        </>
      )}
    </span>
  );
};

const objectRender = (value: object | null) => {
  if (!value) return <EmptyData />;
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
      {Object.entries(value ?? {}).map(([key, value]) => (
        <Fragment key={key}>
          <dt className={dataListTermStyle}>{handleKeyRender(key)}:</dt>
          <dd>{handleValueRender(value)}</dd>
        </Fragment>
      ))}
    </dl>
  );
};

const arrayRender = (value: unknown[]) => {
  if (!value) return <EmptyData />;
  if (value.length === 0) return <EmptyData />;
  return (
    <span className="flex items-center gap-1">
      {value.map((item) => (
        <span
          className="bg-foreground/10 dark:bg-dark-foreground/10 px-2 py-0.5 rounded-md"
          key={JSON.stringify(item)}
        >
          {JSON.stringify(item)}
        </span>
      ))}
    </span>
  );
};

const handleValueRender = (value: unknown) => {
  if (typeof value === 'boolean') return booleanRender(value);
  if (typeof value === 'string') return value || <EmptyData />;
  if (isArray(value)) return arrayRender(value as unknown[]);
  if (typeof value === 'object') return objectRender(value);
  if (typeof value === 'number') return value.toString() || <EmptyData />;
  if (!value) return <EmptyData />;

  return JSON.stringify(value);
};

const handleKeyRender = (key: string) => {
  const splitKey = key.split('_');
  return splitKey
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const SectionCollapse = ({
  title,
  data,
  defaultOpen = true,
}: {
  title: string;
  data: Record<string, unknown>;
  defaultOpen?: boolean;
}) => {
  if (!data || Object.keys(data).length === 0) return <></>;
  return (
    <SimpleCollapse title={title} defaultOpen={defaultOpen}>
      <dl className="grid grid-cols-[auto_1fr_auto_1fr] gap-x-6 gap-y-1">
        {Object.entries(data ?? {}).map(([key, value]) => (
          <Fragment key={key}>
            <dt className={dataListTermStyle}>{handleKeyRender(key)}:</dt>
            <dd>{handleValueRender(value)}</dd>
          </Fragment>
        ))}
      </dl>
    </SimpleCollapse>
  );
};
