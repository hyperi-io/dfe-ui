import { AUDIT_LOGS_DATA } from '@/Settings/mocks/auditLogs.data';
import { Button, DatePicker, Input, type GetProps } from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';

type RangePickerValue = GetProps<typeof DatePicker.RangePicker>['value'];

export const AuditLogs = () => {
  const [dates, setDates] = useState<RangePickerValue>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'asc' | 'desc'>('desc');

  const sortedAuditLogs = useMemo(() => {
    return AUDIT_LOGS_DATA.sort((a, b) => {
      return sort === 'asc'
        ? a.timestamp.localeCompare(b.timestamp)
        : b.timestamp.localeCompare(a.timestamp);
    });
  }, [sort]);

  const filteredAuditLogs = sortedAuditLogs.filter((auditLog) => {
    const q = search.toLowerCase();
    const matchesSearch =
      (auditLog.user?.toLowerCase().includes(q) ?? false) ||
      (auditLog.action?.toLowerCase().includes(q) ?? false);

    const ts = dayjs(auditLog.timestamp);
    const [start, end] = dates ?? [null, null];
    const inDateRange =
      dates == null ||
      start == null ||
      end == null ||
      (ts.valueOf() >= start.valueOf() && ts.valueOf() <= end.valueOf());

    return matchesSearch && inDateRange;
  });
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 ml-auto">
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
          placeholder="Search audit logs"
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
        {filteredAuditLogs.map((auditLog) => (
          <li className="border-b border-foreground/20 pb-2" key={auditLog.id}>
            <div className="flex justify-between items-center ">
              <div className="flex flex-col gap-y-1">
                <span className="text-sm font-medium">{auditLog.action}</span>
                <span className="text-sm text-foreground/50">
                  {auditLog.user}
                </span>
              </div>
              <span>
                {dayjs(auditLog.timestamp).format('YYYY-MM-DD HH:mm:ss')}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
