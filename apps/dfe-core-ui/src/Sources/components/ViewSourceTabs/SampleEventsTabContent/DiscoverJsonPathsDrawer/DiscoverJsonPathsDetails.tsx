import { NotificationCard } from '@/core/components/NotificationCard';
import { useFetchJsonPaths } from '@/Sources/hooks/useFetchJsonPaths';
import { Spin } from 'antd';

export const DiscoverJsonPathsDetails = ({
  selectedSourceName,
  selectedSourceVersion,
  fieldsToPromote,
}: {
  selectedSourceName: string;
  selectedSourceVersion: string;
  fieldsToPromote: string[];
}) => {
  const {
    data: jsonPaths,
    isLoading: isLoadingJsonPaths,
    error: errorJsonPaths,
  } = useFetchJsonPaths({
    source_name: selectedSourceName,
    version: selectedSourceVersion,
    paths: fieldsToPromote.join(','),
  });

  if (isLoadingJsonPaths) {
    return (
      <>
        <Spin /> <p className="sr-only">Loading JSON paths</p>
      </>
    );
  }

  if (errorJsonPaths) {
    return (
      <NotificationCard description={errorJsonPaths.message} type="error" />
    );
  }

  return (
    <div>
      <pre>{JSON.stringify(jsonPaths, null, 2)}</pre>
    </div>
  );
};
