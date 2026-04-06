import { IconMenu2 } from '@repo/dfe-icons';
import { Button, Popover } from 'antd';
import { DeleteUserDrawer } from '../DeleteUserDrawer';
import { EditUserDrawer } from '../EditUserDrawer';
import { ViewUserDrawer } from '../ViewUserDrawer';

export const RowActions = ({ name }: { name: string | undefined }) => {
  return (
    <Popover
      destroyOnHidden
      trigger="click"
      content={
        <div className="flex gap-2 items-center">
          <ViewUserDrawer title={`View ${name}`} />
          <EditUserDrawer title={`Edit ${name}`} />
          <DeleteUserDrawer title={`Delete ${name}`} />
        </div>
      }
    >
      <Button type="default" icon={<IconMenu2 />} shape="circle" />
    </Popover>
  );
};
