import { AdminLinkStatusTag } from '@/AdminTools/components/AdminLinkStatusTag';
import {
  TAdminLink,
  TAdminLinkStatus,
} from '@/AdminTools/hooks/useFetchAdminLinks/types';
import { Table, TableProps } from '@/core/components/Table';
import { IconExternalLink } from '@repo/dfe-icons';

const COLUMNS: TableProps<TAdminLink>['columns'] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (name: string, link: TAdminLink) => (
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 font-medium"
      >
        {name}
        <IconExternalLink aria-hidden className="size-4 shrink-0" />
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    ),
  },
  {
    title: 'Purpose',
    dataIndex: 'purpose',
    key: 'purpose',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: TAdminLinkStatus) => (
      <AdminLinkStatusTag status={status} />
    ),
  },
];

/** The admin UIs, one row each, in the order the deployer listed them. */
export const AdminLinksTable = ({ links }: { links: TAdminLink[] }) => (
  <Table
    rowKey={(link) => `${link.name} ${link.url}`}
    columns={COLUMNS}
    dataSource={links}
  />
);
