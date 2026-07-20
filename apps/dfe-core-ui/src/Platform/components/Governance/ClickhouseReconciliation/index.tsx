import { SectionCard } from '@/core/components/SectionCard';
import { ReconcileChRbacDrawer } from './ReconcileChRbacDrawer';
export const ClickhouseReconciliation = () => {
  return (
    <SectionCard
      rightTitleSlot={<ReconcileChRbacDrawer />}
      title="Reconcile quota tiers, service roles and per-org row policies into
      ClickHouse"
    />
  );
};
