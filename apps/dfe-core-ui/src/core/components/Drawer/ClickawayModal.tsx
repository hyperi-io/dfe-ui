import { Button, Card } from 'antd';

export const ClickawayModal = ({
  onOk,
  onCancel,
  title = 'Potential data loss warning',
  message = 'Closing this drawer may discard unsaved data.',
}: {
  onOk: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
}) => {
  return (
    <div className="cursor-not-allowed pointer-events-none bg-black/30 dark:bg-black/60 fixed h-full w-full top-0 left-0 right-0 bottom-0 z-10000 flex items-center justify-center">
      <Card
        data-clickaway-card
        className="pointer-events-auto"
        classNames={{ body: 'flex flex-col gap-2 p-4' }}
        onClick={(event) => event.stopPropagation()}
      >
        <span className="text-lg font-bold">{title}</span>
        <p>{message}</p>

        <div className="flex gap-2 justify-end mt-4">
          <Button htmlType="button" onClick={onCancel}>
            Keep editing
          </Button>
          <Button danger type="primary" htmlType="button" onClick={onOk}>
            Discard
          </Button>
        </div>
      </Card>
    </div>
  );
};
