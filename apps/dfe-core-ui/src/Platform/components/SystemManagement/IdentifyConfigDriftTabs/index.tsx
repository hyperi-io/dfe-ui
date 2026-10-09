import { Tabs } from 'antd';
import { ConfigDriftTab } from './ConfigDriftTab';

export const IdentifyConfigDriftTabs = () => {
  return (
    <Tabs
      items={[
        {
          label: 'Config Drift',
          key: 'config-drift',
          children: <ConfigDriftTab />,
        },
      ]}
    />
  );
};
