import { SectionCollapse } from '@/Services/components/SectionCollapse';
import { TFetchServiceConfigDetailResponse } from '@/Services/hooks/serviceConfigs/useFetchServiceConfigDetail/types';

export const ViewServiceConfigDetail = ({
  config,
}: TFetchServiceConfigDetailResponse) => {
  const {
    metrics,
    logging,
    kafka,
    archive,
    buffer,
    memory,
    routing,
    compression,
  } = config;
  return (
    <div className="flex flex-col gap-2 h-[calc(100vh-215px)] css-custom-scrollbar">
      <SectionCollapse
        title="Metrics"
        data={metrics as Record<string, unknown>}
      />

      <SectionCollapse
        title="Logging"
        data={logging as Record<string, unknown>}
      />

      <SectionCollapse title="Kafka" data={kafka as Record<string, unknown>} />

      <SectionCollapse
        title="Archive"
        data={archive as Record<string, unknown>}
      />

      <SectionCollapse
        title="Buffer"
        data={buffer as Record<string, unknown>}
      />

      <SectionCollapse
        title="Memory"
        data={memory as Record<string, unknown>}
      />

      <SectionCollapse
        title="Routing"
        data={routing as Record<string, unknown>}
      />

      <SectionCollapse
        title="Compression"
        data={compression as Record<string, unknown>}
      />
    </div>
  );
};
