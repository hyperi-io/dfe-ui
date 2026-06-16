import { SECURITY_LOGS_DATA } from '@/Settings/mocks/securityLogs.data';
import { IconAlertCircle, IconInfoCircle } from '@repo/dfe-icons';
import { Button, DatePicker, Input, Select } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useMemo, useState } from 'react';

/** RangePicker with `allowEmpty` — each bound may be null while selecting. */
type DateRange = [Dayjs | null, Dayjs | null];

export const SecurityEvents = () => {
  const [severity, setSeverity] = useState<string | undefined>(undefined);
  const [dates, setDates] = useState<DateRange | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'asc' | 'desc'>('desc');

  const sortedSecurityLogs = useMemo(() => {
    return SECURITY_LOGS_DATA.sort((a, b) => {
      return sort === 'asc'
        ? a.timestamp.localeCompare(b.timestamp)
        : b.timestamp.localeCompare(a.timestamp);
    });
  }, [sort]);

  const filteredSecurityLogs = sortedSecurityLogs.filter((securityLog) => {
    const q = search.toLowerCase();
    const matchesSearch =
      (securityLog.user?.toLowerCase().includes(q) ?? false) ||
      (securityLog.detail?.toLowerCase().includes(q) ?? false);

    const ts = dayjs(securityLog.timestamp);
    const [start, end] = dates ?? [null, null];
    const inDateRange =
      dates == null ||
      start == null ||
      end == null ||
      (ts.valueOf() >= start.valueOf() && ts.valueOf() <= end.valueOf());

    const matchesSeverity =
      severity == null || securityLog.severity === severity;

    return matchesSearch && inDateRange && matchesSeverity;
  });
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 ml-auto">
        <Select
          className="w-60"
          placeholder="Severity"
          options={[
            { label: 'Info', value: 'info' },
            { label: 'Warning', value: 'warning' },
            { label: 'Error', value: 'error' },
          ]}
          onChange={(value) => setSeverity(value)}
          value={severity}
          allowClear
        />
        <DatePicker.RangePicker
          placeholder={['Start date', 'End date'] as [string, string]}
          presets={[
            {
              label: 'Today',
              value: [dayjs(), dayjs()],
            },
            {
              label: 'Yesterday',
              value: [dayjs().subtract(1, 'day'), dayjs().subtract(1, 'day')],
            },
            {
              label: 'Last 7 days',
              value: [dayjs().subtract(7, 'day'), dayjs()],
            },
            {
              label: 'Last 30 days',
              value: [dayjs().subtract(30, 'day'), dayjs()],
            },
            {
              label: 'Last 90 days',
              value: [dayjs().subtract(90, 'day'), dayjs()],
            },
          ]}
          onChange={(next) => setDates(next)}
          value={dates}
          format="YYYY-MM-DD"
          allowEmpty
          showTime
        />
        <Input.Search
          className="w-60"
          placeholder="Search security events"
          onChange={(e) => setSearch(e.target.value)}
          value={search}
        />
        <Button
          type="default"
          onClick={() => setSort(sort === 'asc' ? 'desc' : 'asc')}
        >
          {sort === 'asc' ? 'Newest first' : 'Oldest first'}
        </Button>
      </div>
      <ul className="flex flex-col gap-y-2 h-[calc(100vh-250px)] css-custom-scrollbar">
        {filteredSecurityLogs.map((securityLog) => (
          <li
            className="border-b border-foreground/20 pb-2"
            key={securityLog.id}
          >
            <div className="flex justify-between items-center ">
              <div className="flex flex-col gap-y-1">
                <span className="text-sm font-medium flex items-center gap-x-1">
                  <span className="inline-flex items-center gap-x-1">
                    {securityLog.severity === 'info' && (
                      <IconInfoCircle className="hover:text-info" />
                    )}
                    {securityLog.severity === 'warning' && (
                      <IconAlertCircle className="hover:text-warning" />
                    )}
                    {securityLog.severity === 'error' && (
                      <IconAlertCircle className="hover:text-error" />
                    )}
                    [{securityLog.severity}]
                  </span>
                  - {securityLog.user}
                </span>
                <span className="text-sm text-foreground/50">
                  {securityLog.detail}
                </span>
              </div>
              <span>
                {dayjs(securityLog.timestamp).format('YYYY-MM-DD HH:mm:ss')}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
