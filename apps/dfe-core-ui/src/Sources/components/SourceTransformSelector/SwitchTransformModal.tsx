'use client';

import { Form } from '@/core/components/Form';
import { Modal } from '@/core/components/Modal';
import { NotificationCard } from '@/core/components/NotificationCard';
import {
  TransformVariantFormItem,
  useEngineOffersVariants,
} from '@/Sources/components/CreateUpdateSourceForm/TransformTabContent/TransformVariantSelect';
import { IconArrowNarrowRight } from '@repo/dfe-icons';
import { Button } from 'antd';

/**
 * The name of one side of the switch, sized to sit level with the arrow.
 *
 * `break-all` because a service name is one unbroken token and the modal is
 * narrow on a phone: without it the name leaves the dialog.
 */
const SwitchEnd = ({ service }: { service: string }) => (
  <span className="min-w-0 break-all font-medium">{service}</span>
);

/**
 * What a transform switch costs, before it is made.
 *
 * The source, not the operator, decides which transform app runs, so this names
 * the app that goes as plainly as the one that arrives - undeploying the working
 * one by hand was how the previous surface asked for the same change.
 *
 * Mount it only while a switch is pending: it reads the source catalogue to
 * learn whether the incoming engine needs a variant.
 */
export const SwitchTransformModal = ({
  source,
  from,
  to,
  engine,
  storedVariant,
  isPending,
  refused,
  error,
  onConfirm,
  onCancel,
}: {
  source: string;
  from: string | null;
  to: string;
  /** The incoming engine, which decides whether a variant is asked for. */
  engine: string;
  /** The variant the source names now, offered back rather than cleared. */
  storedVariant: string | null;
  isPending: boolean;
  /** The deployment has already refused this engine for this source. */
  refused?: boolean;
  error?: string | null;
  onConfirm: (variant: string | null) => void;
  onCancel: () => void;
}) => {
  const [form] = Form.useForm<{ variant?: string | null }>();
  const { offersVariants, isUnknown, catalogueError } =
    useEngineOffersVariants(engine);
  const catalogueLoading = isUnknown && !catalogueError;

  const confirm = () => {
    if (catalogueLoading) return;
    // Without the catalogue there is no telling, so the stored variant rides along unchanged.
    if (isUnknown) {
      onConfirm(storedVariant);
      return;
    }
    // A variant names a program of one app, so an engine with none takes none.
    if (!offersVariants) {
      onConfirm(null);
      return;
    }
    form
      .validateFields()
      .then(({ variant }) => onConfirm(variant ?? null))
      // The refusal is shown on the field itself.
      .catch(() => undefined);
  };

  return (
    <Modal
      title={
        from
          ? `Switch the transform for ${source}`
          : `Set the transform for ${source}`
      }
      open
      onCancel={onCancel}
      // Without this the closed dialog keeps its text in the DOM, where the
      // refusal reads as a second copy of the one on the option.
      destroyOnHidden
      footer={
        <>
          <Button
            type="primary"
            loading={isPending || catalogueLoading}
            disabled={isPending || refused}
            onClick={confirm}
          >
            {from ? 'Switch transform' : 'Set transform'}
          </Button>
          <Button type="default" disabled={isPending} onClick={onCancel}>
            Cancel
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {from && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <SwitchEnd service={from} />
            <IconArrowNarrowRight
              aria-hidden="true"
              className="shrink-0 text-foreground/50 dark:text-dark-foreground/50"
            />
            <SwitchEnd service={to} />
          </div>
        )}
        <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
          <li>
            {from
              ? `${to} takes over from ${from}, and ${from} stops running for this source.`
              : `${to} starts running for this source.`}
          </li>
          <li>
            A source has one transform, so nothing else changes on the path.
          </li>
          <li>
            Transform files stay in the library. Each engine runs its own, so
            the new one starts with the files it already has.
          </li>
          <li>
            A source that is already deployed records this as a new version.
            Records move through the new transform once that version is
            deployed.
          </li>
        </ul>
        {!isUnknown && offersVariants && (
          <Form
            form={form}
            initialValues={{ variant: storedVariant ?? undefined }}
            onFinish={confirm}
          >
            <TransformVariantFormItem name="variant" engine={engine} />
          </Form>
        )}
        {catalogueError && (
          <NotificationCard
            type="warning"
            variant="subtle"
            title="Could not read the source catalogue, so the variant stays as it is"
            description={catalogueError.message}
          />
        )}
        {error && <NotificationCard type="error" title={error} />}
      </div>
    </Modal>
  );
};
