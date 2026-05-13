import { Table as AntdTable, TableProps as AntdTableProps } from 'antd';

import { TableEmpty } from './TableEmpty';

export type TableProps<T extends object> = AntdTableProps<T>;
export const Table = <T extends object>(props: TableProps<T>) => {
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
