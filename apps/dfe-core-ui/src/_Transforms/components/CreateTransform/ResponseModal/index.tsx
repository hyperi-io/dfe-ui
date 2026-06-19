import { CompileTransformResponse } from '@/_Transforms/hooks/useCompileTransform/types';
import { Modal } from '@/core/components/Modal';
import { useState } from 'react';

interface ResponseModalProps {
  response?: CompileTransformResponse | null;
  onClose?: () => void;
}

export const ResponseModal = ({ response, onClose }: ResponseModalProps) => {
  const [open, setOpen] = useState(!!response);
  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  return (
    <Modal
      open={open}
      className="text-foreground-muted dark:text-dark-foreground-muted"
      onClose={handleClose}
      title={
        <span className="flex items-center gap-x-2">
          Transform compiled successfully
        </span>
      }
    >
      <dl className="w-full grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs [&_dt]:font-medium">
        <dt>Wasm Base64</dt>
        <dd>{response?.wasm_base64}</dd>

        <dt>Wasm Bytes</dt>
        <dd>{response?.wasm_bytes}</dd>
      </dl>
    </Modal>
  );
};
