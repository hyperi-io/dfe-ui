import { Select, SelectProps } from 'antd';

export const SourceEngineSelect = (props: SelectProps) => {
  const options = [
    {
      label: 'MergeTree',
      value: 'MergeTree',
    },
  ];
  return <Select options={options} {...props} />;
};
