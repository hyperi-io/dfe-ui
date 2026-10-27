import { useFetchDeployment } from '@/core/hooks/useFetchDeployment';
import { SOURCE_TRANSPORT_LABELS } from '@/Sources/components/CreateUpdateSourceForm/sourceForm.schema';
import { Select, SelectProps } from 'antd';

export const TransportSelect = (props: SelectProps) => {
  const { data: { transports: { available = [] } = {} } = {} } =
    useFetchDeployment();
  return (
    <Select
      allowClear
      placeholder="Inherit the deployment default"
      {...props}
      options={available.map((transport) => ({
        value: transport,
        label:
          SOURCE_TRANSPORT_LABELS[
            transport as keyof typeof SOURCE_TRANSPORT_LABELS
          ] ?? transport,
      }))}
    />
  );
};
