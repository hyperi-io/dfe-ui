import { App, ModalFuncProps } from 'antd';
import { ReactNode, useCallback, useEffect } from 'react';

export type UsePreventNavigateOptions = {
  /** When true, warns on tab close/refresh and gates in-app leave via confirmLeave */
  enabled: boolean;
  /** Trap the browser back button while enabled */
  blockBrowserBack?: boolean;
  modal: {
    title?: ReactNode;
    message?: ReactNode;
    okText?: string;
    cancelText?: string;
    okButtonProps?: ModalFuncProps['okButtonProps'];
  };
};

export const usePreventNavigate = ({
  enabled,
  blockBrowserBack = true,
  modal: {
    title = 'Uncommitted changes',
    message = 'You have unsaved changes. Leave anyway?',
    okText = 'Discard',
    cancelText = 'Keep editing',
    okButtonProps = { danger: true },
  },
}: UsePreventNavigateOptions) => {
  const { modal } = App.useApp();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', onBeforeUnload);

    let removePopState: (() => void) | undefined;
    if (blockBrowserBack) {
      window.history.pushState(null, '', window.location.href);

      const onPopState = () => {
        window.history.pushState(null, '', window.location.href);
      };

      window.addEventListener('popstate', onPopState);
      removePopState = () => window.removeEventListener('popstate', onPopState);
    }

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      removePopState?.();
    };
  }, [blockBrowserBack, enabled]);

  const confirmLeave = useCallback(
    (onLeave: () => void) => {
      if (!enabled) {
        onLeave();
        return;
      }

      modal.confirm({
        title,
        content: message,
        okText,
        okButtonProps,
        cancelText,
        icon: null,
        onOk: onLeave,
      });
    },
    [cancelText, enabled, message, modal, okButtonProps, okText, title],
  );

  return { confirmLeave };
};
