import { Tabs } from 'antd';

export const SigmaTabContent = () => {
  return (
    <Tabs
      classNames={{
        item: 'm-0 p-0 pb-2 mr-4',
        indicator: 'bg-tertiary/40',
      }}
      items={[
        {
          key: 'sigma-mappings',
          label: 'Sigma Mappings',
          children: <>SigmaMappings </>,
        },
        {
          key: 'sigma-ddl',
          label: 'Sigma DDL',
          children: <>SigmaDDL </>,
        },
        {
          key: 'logsources',
          label: 'Log Sources',
          children: <>LogSources </>,
        },
      ]}
    />
  );
};
