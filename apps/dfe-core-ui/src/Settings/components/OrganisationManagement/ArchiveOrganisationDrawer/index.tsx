import { Drawer } from '@/core/components/Drawer';
import { IconTrash } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';

export const ArchiveOrganisationDrawer = ({
  disabled = false,
}: {
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        type="text"
        icon={<IconTrash />}
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        Archive Organisation
      </Button>
      <Drawer
        title="Archive Organisation"
        open={open}
        onClose={() => setOpen(false)}
      >
        <div className="text-error border border-error rounded-md p-4 bg-error/10">
          Implement ArchiveOrganisationDrawer
        </div>
      </Drawer>
    </>
  );
};
