import { useFetchEngineStatus } from '@/Hunts/hooks/useFetchEngineStatus';
import { IconGizmo, IconTopologyRing2 } from '@repo/dfe-icons';
import { Button, Tooltip } from 'antd';

export const EngineStatus = () => {
  const { data } = useFetchEngineStatus();
  return (
    <Tooltip
      destroyOnHidden
      title={
        <dl className="grid grid-cols-[auto_1fr] gap-x-4">
          <dt>Engine Status:</dt>
          <dd>{data?.running ? 'Running' : 'Not Running'}</dd>
          <dt>Hunt Count:</dt>
          <dd>{data?.hunt_count}</dd>
          <dt>Scheduling Mode:</dt>
          <dd>{data?.scheduling_mode}</dd>
        </dl>
      }
    >
      <Button
        icon={data?.running ? <IconTopologyRing2 /> : <IconGizmo />}
        onClick={() => {}}
        danger={!data?.running}
      >
        Engine {data?.running ? 'Running' : 'Not Running'}
      </Button>
    </Tooltip>
  );
};
