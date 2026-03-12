import { Modal } from '@/core/components/Modal';
import { Button } from 'antd';
import { useState } from 'react';

export const ViewMappingsModal = ({
  name,
  standards,
  disabled,
}: {
  name: string;
  standards: string[];
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        disabled={disabled}
        type="default"
        aria-label={
          disabled ? `No Mappings for ${name}` : `View Mappings for ${name}`
        }
        onClick={() => setOpen(true)}
      >
        {disabled ? 'No Mappings' : 'View Mappings'}
      </Button>

      <Modal
        title={`Mapping Standards for ${name}`}
        open={open}
        onClose={() => setOpen(false)}
      >
        <ul>
          {standards.map((standard) => (
            <li key={standard}>{standard}</li>
          ))}
        </ul>
      </Modal>
    </>
  );
};
