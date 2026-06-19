import { Spin } from 'antd';

export const RbacLoading = () => {
  return (
    <div className="flex items-center justify-center h-full w-full min-w-48 min-h-8">
      <Spin />
    </div>
  );
};
