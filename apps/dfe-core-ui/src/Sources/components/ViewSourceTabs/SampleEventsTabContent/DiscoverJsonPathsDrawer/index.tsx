import { Drawer } from '@/core/components/Drawer';
import { Button } from 'antd';
import { useState } from 'react';
import { DiscoverJsonPathsDetails } from './DiscoverJsonPathsDetails';

export const DiscoverJsonPathsDrawer = ({
  selectedSourceName,
  selectedSourceVersion,
  fieldsToPromote,
}: {
  selectedSourceName: string;
  selectedSourceVersion: string;
  fieldsToPromote: Set<string>;
}) => {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  return (
    <>
      <Button type="primary" onClick={() => setIsDrawerVisible(true)}>
        Promote Fields
      </Button>
      <Drawer
        title="Discover JSON Paths"
        open={isDrawerVisible}
        onClose={() => setIsDrawerVisible(false)}
      >
        <DiscoverJsonPathsDetails
          selectedSourceName={selectedSourceName}
          selectedSourceVersion={selectedSourceVersion}
          fieldsToPromote={Array.from(fieldsToPromote)}
        />
      </Drawer>
    </>
  );
};
