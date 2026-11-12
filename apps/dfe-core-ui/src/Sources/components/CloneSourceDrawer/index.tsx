import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { Tooltip } from '@/core/components/Tooltip';
import { useListSourcesContext } from '@/Sources/contexts/ListSourcesContext';
import {
  announceAwaitingReview,
  awaitsReview,
} from '@/Sources/utils/sourceReview';
import { IconCopy } from '@repo/dfe-icons';
import { Button, ButtonProps, notification } from 'antd';
import { cloneElement, useState } from 'react';
import { CloneSourceContent } from './CloneSourceContent';

export const CloneSourceDrawer = ({
  open,
  onClose,
  sourceName,
  sourceVersion,
  trigger,
}: {
  open?: boolean;
  onClose?: () => void;
  sourceName: string;
  sourceVersion: string;
  trigger?: React.ReactElement<ButtonProps>;
}) => {
  const title = 'Clone Source';
  const [api, contextHolder] = notification.useNotification();
  const [isDrawerVisible, setIsDrawerVisible] = useState(open);

  const handleOpen = () => {
    setIsDrawerVisible(true);
  };

  const handleClose = () => {
    setIsDrawerVisible(false);
    onClose?.();
  };

  const { setSelectedSource } = useListSourcesContext();

  return (
    <>
      {contextHolder}
      <RbacProtected action={RbacProtected.rbacActions.source_write}>
        <RbacProtected.Unrestricted>
          {trigger ? (
            cloneElement(trigger, {
              ...trigger.props,
              onClick: (event: React.MouseEvent<HTMLElement>) => {
                handleOpen();
                trigger.props.onClick?.(event);
              },
            })
          ) : (
            <Tooltip destroyOnHidden title={`Clone ${sourceName}`}>
              <Button
                type="default"
                shape="circle"
                size="small"
                aria-label={`Clone ${sourceName}`}
                icon={<IconCopy />}
                onClick={handleOpen}
              />
            </Tooltip>
          )}
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted
          className="justify-start opacity-100"
          tooltip={{ show: true, placement: 'left' }}
        >
          {trigger ? (
            cloneElement(trigger, {
              ...trigger.props,
              disabled: true,
              onClick: (event: React.MouseEvent<HTMLElement>) => {
                handleOpen();
                trigger.props.onClick?.(event);
              },
            })
          ) : (
            <span className="bg-white rounded-full">
              <Button
                type="default"
                shape="circle"
                disabled
                size="small"
                aria-label={`Clone ${sourceName}`}
                icon={<IconCopy />}
                onClick={handleOpen}
              />
            </span>
          )}
        </RbacProtected.Restricted>
      </RbacProtected>

      <Drawer
        title={title}
        open={isDrawerVisible}
        size="60%"
        onClose={handleClose}
        classNames={{ body: 'pt-0' }}
      >
        <CloneSourceContent
          sourceName={sourceName}
          sourceVersion={sourceVersion}
          onSuccess={(response) => {
            if (awaitsReview(response)) {
              setIsDrawerVisible(false);
              announceAwaitingReview(
                api,
                `${response.source} awaiting review`,
                {
                  detail: `The clone ${response.source} is saved on a review branch. It is added once the review is merged.`,
                  review: response,
                },
              );
              return;
            }
            setSelectedSource({
              source_name: response.source,
              source_version: response.current,
            });
            setIsDrawerVisible(false);
            api.success({
              title: 'Source cloned successfully',
              placement: 'bottomLeft',
            });
          }}
        />
      </Drawer>
    </>
  );
};
