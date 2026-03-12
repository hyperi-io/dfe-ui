import { Select } from 'antd';

interface SortActionsProps {
  sortByValue?: string;
  sortDirectionValue?: string;
  sortByOptions?: { label: string; value: string }[];
  sortDirectionOptions: { label: string; value: string }[];
  onChange: ({
    sortBy,
    sortDirection,
  }: {
    sortBy?: string;
    sortDirection?: string;
  }) => void;
}

export const SortActions = ({
  sortByValue,
  sortDirectionValue,
  sortByOptions,
  sortDirectionOptions,
  onChange,
}: SortActionsProps) => {
  return (
    <div className="flex gap-2 items-center">
      {sortByOptions && (
        <Select
          className="w-40"
          value={sortByValue}
          options={sortByOptions}
          onChange={(value) => onChange({ sortBy: value })}
          placeholder="Sort by"
          allowClear
        />
      )}
      <Select
        className="w-40"
        value={sortDirectionValue}
        options={sortDirectionOptions}
        onChange={(value) => onChange({ sortDirection: value })}
        placeholder="Sort direction"
        allowClear
      />
    </div>
  );
};
