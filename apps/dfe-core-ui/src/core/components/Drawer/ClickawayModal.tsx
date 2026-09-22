import { Button, Card } from 'antd';

export const ClickawayModal = ({
  onOk,
  onCancel,
}: {
  onOk: () => void;
  onCancel: () => void;
}) => {
  return (
    <div className="cursor-not-allowed pointer-events-none bg-black/30 dark:bg-black/60 absolute inset-0 z-10000 flex items-center justify-center">
      <Card
        data-clickaway-card
        className="pointer-events-auto"
        classNames={{ body: 'flex flex-col gap-2 p-4' }}
        onClick={(event) => event.stopPropagation()}
      >
        <span className="text-lg font-bold">Unsaved changes</span>
        <p>Closing this drawer may discard unsaved data.</p>

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
