import { SectionCollapse } from '@/Services/components/SectionCollapse';
import { TDeploymentDetailResponse } from '@/Services/hooks/deployments/useFetchDeploymentDetail/types';
import { Tag } from 'antd';

export const ViewDeploymentDetail = ({ config }: TDeploymentDetailResponse) => {
  const {
    // Raw Fields
    size,
    replicas,
    image,
    // Grouped Objects
    resources,
    keda,
    hpa,
    pod,
    service,
    config_secret,
    extra_env,
  } = config;
  return (
    <div className="flex flex-col gap-2 h-[calc(100vh-215px)] css-custom-scrollbar">
      <span className="flex gap-2">
        <Tag color="blue" variant="solid">
          <span className="font-semibold">Size: </span>
          {JSON.parse(JSON.stringify(size))}
        </Tag>
        <Tag color="blue" variant="solid">
          <span className="font-semibold">Replicas: </span>
          {JSON.parse(JSON.stringify(replicas))}
        </Tag>
        <Tag color="blue" variant="solid">
          <span className="font-semibold">Image: </span>
          {JSON.parse(JSON.stringify(image))}
        </Tag>
      </span>

      <SectionCollapse
        title="Resources"
        data={resources as Record<string, unknown>}
      />
      <SectionCollapse title="KEDA" data={keda as Record<string, unknown>} />
      <SectionCollapse title="HPA" data={hpa as Record<string, unknown>} />
      <SectionCollapse title="Pod" data={pod as Record<string, unknown>} />
      <SectionCollapse
        title="Service"
        data={service as Record<string, unknown>}
      />
      <SectionCollapse
        title="Config Secret"
        data={config_secret as Record<string, unknown>}
      />
      <SectionCollapse
        title="Extra Env"
        data={extra_env as Record<string, unknown>}
      />
    </div>
  );
};
