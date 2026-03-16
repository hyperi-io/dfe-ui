import { Table as AntdTable, TableProps as AntdTableProps } from 'antd';

import { TableEmpty } from './TableEmpty';

export const Table = <T extends object>(props: AntdTableProps<T>) => {
  return (
    <AntdTable
      size="small"
      bordered
      scroll={{ y: 'max-content', x: 'max-content' }}
      locale={{
        emptyText: <TableEmpty />,
      }}
      rowKey="id"
      pagination={false}
      {...props}
    />
  );
};
