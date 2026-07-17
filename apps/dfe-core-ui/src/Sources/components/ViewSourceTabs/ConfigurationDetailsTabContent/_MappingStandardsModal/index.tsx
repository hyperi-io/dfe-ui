import { IconEye } from '@repo/dfe-icons';
import { Modal } from 'antd';
import { useState } from 'react';
import { MappingStandardsDetail } from './MappingStandardsDetail';

export const MappingStandardsModal = ({
  mappingStandard,
}: {
  mappingStandard: string;
}) => {
  const [open, setOpen] = useState(false);

  const handleCancel = () => {
    setOpen(false);
  };
  return (
    <>
      <button
        className="flex items-center gap-x-1"
        onClick={() => setOpen(true)}
      >
        <IconEye /> {mappingStandard}
      </button>
      <Modal
        destroyOnHidden={true}
        open={open}
        onCancel={handleCancel}
        title="Field Map Details"
        footer={null}
      >
        <MappingStandardsDetail mappingStandard={mappingStandard} />
      </Modal>
    </>
  );
};
