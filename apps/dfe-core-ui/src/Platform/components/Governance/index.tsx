import { Actions } from './Actions';
import { ClickhouseReconciliation } from './ClickhouseReconciliation';

export const Governance = () => {
  return (
    <>
      <ClickhouseReconciliation />
      <Actions />
    </>
  );
};
