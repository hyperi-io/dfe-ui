import { Actions } from './Actions';
import { ClickhouseReconciliation } from './ClickhouseReconciliation';
import { Policies } from './Policies';

export const Governance = () => {
  return (
    <>
      <ClickhouseReconciliation />
      <Actions />
      <Policies />
    </>
  );
};
