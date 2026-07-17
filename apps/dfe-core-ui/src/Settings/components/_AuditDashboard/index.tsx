'use client';

import { NavigationTabLabel } from '@/core/components/NavigationTabLabel';
import { Tabs } from 'antd';
import { AuditLogs } from './AuditLogs';
import { SecurityEvents } from './SecurityEvents';
import { UsageMetrics } from './UsageMetrics';

export const AuditDashboard = () => {
  return (
    <Tabs
      className="[&_.ant-tabs-nav-list]:w-full [&_.ant-tabs-tab]:w-full"
      items={[
        {
          key: 'audit-logs',
          label: (
            <NavigationTabLabel
              className="max-w-full"
              label="Audit Logs"
              description="View audit logs and their details."
            />
          ),
          children: <AuditLogs />,
        },
        {
          key: 'security-events',
          label: (
            <NavigationTabLabel
              className="max-w-full"
              label="Security Events"
              description="View security events and their details."
            />
          ),
          children: <SecurityEvents />,
        },
        {
          key: 'usage-metrics',
          label: (
            <NavigationTabLabel
              className="max-w-full"
              label="Usage Metrics"
              description="View user and organisation usage trends."
            />
          ),
          children: <UsageMetrics />,
        },
      ]}
    />
  );
};
