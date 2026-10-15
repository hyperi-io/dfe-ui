'use client';

import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { IconPlus } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';
import { AddFromCatalogueContent } from './AddFromCatalogueContent';

const TITLE = 'Add from catalogue';

export const AddFromCatalogueDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.source_write}>
        <RbacProtected.Unrestricted>
          <Button
            type="default"
            className="border border-tertiary text-tertiary"
            icon={<IconPlus className="text-tertiary" />}
            onClick={() => setIsOpen(true)}
          >
            {TITLE}
          </Button>
        </RbacProtected.Unrestricted>
      </RbacProtected>

      <Drawer
        title={TITLE}
        open={isOpen}
        size="60%"
        onClose={() => setIsOpen(false)}
      >
        <AddFromCatalogueContent onSuccess={() => setIsOpen(false)} />
      </Drawer>
    </>
  );
};
