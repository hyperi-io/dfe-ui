import { TAdminLinkStatus } from '@/AdminTools/hooks/useFetchAdminLinks/types';
import { Tooltip } from '@/core/components/Tooltip';
import {
  IconCircleCheckFilled,
  IconCircleDashed,
  IconCircleXFilled,
} from '@repo/dfe-icons';
import { Tag } from 'antd';

const STATUS_TAGS: Record<
  TAdminLinkStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  up: {
    label: 'up',
    color: 'green',
    icon: <IconCircleCheckFilled className="inline size-3" />,
  },
  down: {
    label: 'down',
    color: 'red',
    icon: <IconCircleXFilled className="inline size-3" />,
  },
  unknown: {
    label: 'not checked',
    color: 'default',
    icon: <IconCircleDashed className="inline size-3" />,
  },
};

/** Whether an admin UI answered the engine's last probe of it. */
export const AdminLinkStatusTag = ({
  status,
}: {
  status: TAdminLinkStatus;
}) => {
  const { label, color, icon } = STATUS_TAGS[status];
  const tag = (
    <Tag className="m-0" color={color} icon={icon}>
      {label}
    </Tag>
  );

  return status === 'unknown' ? (
    <Tooltip title="The deployer gave the engine no address to check.">
      {tag}
    </Tooltip>
  ) : (
    tag
  );
};
