import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
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

  const { componentHeight } = useSetComponentHeight({
    offset: 100,
  });

  return (
    <CustomScrollbar height={componentHeight} className="flex flex-col gap-2">
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
    </CustomScrollbar>
  );
};
