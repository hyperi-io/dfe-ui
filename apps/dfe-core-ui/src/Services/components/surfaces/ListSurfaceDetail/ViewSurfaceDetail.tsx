import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import { formatDateToString } from '@/core/helpers/date.helpers';
import { SectionCollapse } from '@/Services/components/SectionCollapse';
import { TServiceSurfaceDetailResponse } from '@/Services/hooks/serviceSurfaces/useFetchServiceSurfaceDetail/types';

const dataListTermStyle = 'text-foreground/50 dark:text-dark-foreground/50';
const EmptyData = () => (
  <span className="text-sm text-foreground/50 dark:text-dark-foreground/50">
    None
  </span>
);
export const ViewSurfaceDetail = (surface: TServiceSurfaceDetailResponse) => {
  const {
    // Raw Fields
    service,
    description,
    manifest_url,
    discovered_at,
    // Complex Fields
    config_surface,
    metrics_surface,
  } = surface;
  return (
    <div className="flex flex-col gap-2 h-[calc(100vh-155px)] css-custom-scrollbar">
      <dl className="grid grid-cols-[auto_1fr_auto_1fr] gap-x-6 gap-y-1">
        <dt className={dataListTermStyle}> Service Name:</dt>
        <dd>{service || <EmptyData />}</dd>
        <dt className={dataListTermStyle}>Discovered At:</dt>
        <dd>
          {discovered_at ? formatDateToString(discovered_at) : <EmptyData />}
        </dd>
        <dt className={dataListTermStyle}>Description:</dt>
        <dd className="col-span-3">{description || <EmptyData />}</dd>
        <dt className={dataListTermStyle}>Manifest URL:</dt>
        <dd className="col-span-3">{manifest_url || <EmptyData />}</dd>
      </dl>
      <SimpleCollapse title={<p className="font-medium">Metrics Surface</p>}>
        {metrics_surface?.map((metric, index) => (
          <SectionCollapse
            key={index}
            title={metric.name}
            data={metric as Record<string, unknown>}
          />
        ))}
      </SimpleCollapse>

      <SimpleCollapse
        title={<p className="font-medium">Configuration Surface</p>}
      >
        {Object.entries(config_surface ?? {}).map(([key, value]) => (
          <SectionCollapse
            key={key}
            title={key}
            data={value as Record<string, unknown>}
          />
        ))}
      </SimpleCollapse>
    </div>
  );
};
