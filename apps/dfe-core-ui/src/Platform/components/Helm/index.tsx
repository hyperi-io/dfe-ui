import { NotificationCard } from '@/core/components/NotificationCard';
import { PopoverMenu } from '@/core/components/PopoverMenu';
import { RbacProtected } from '@/core/components/RbacProtected';
import { SectionCard } from '@/core/components/SectionCard';
import { cn } from '@/core/utils/style';
import { useFetchHelmFiles } from '@/Platform/hooks/helm/useFetchHelmFiles';
import { Spin } from 'antd';
import { ViewHelmFileDrawer } from './ViewHelmFileDrawer';

export const Helm = () => {
  const {
    data: helmFiles,
    isLoading: isLoadingHelmFiles,
    error: errorHelmFiles,
  } = useFetchHelmFiles();
  return (
    <SectionCard title="Helm Files">
      <RbacProtected action={RbacProtected.rbacActions.helmvars_read}>
        <RbacProtected.Unrestricted>
          {isLoadingHelmFiles && (
            <>
              <Spin />
              Loading helm files...
            </>
          )}
          {errorHelmFiles && (
            <NotificationCard type="error" title="Error fetching helm files" />
          )}
          {!isLoadingHelmFiles &&
            !errorHelmFiles &&
            helmFiles &&
            helmFiles.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {helmFiles.map((helmFile: string) => (
                  <li
                    className={cn(
                      'flex items-center justify-between gap-2',
                      'bg-foreground/10 dark:bg-foreground/10 rounded-md px-3 py-1',
                    )}
                    key={helmFile}
                  >
                    {helmFile}

                    <PopoverMenu
                      className="ml-4"
                      options={[
                        <ViewHelmFileDrawer
                          key={`view-${helmFile}`}
                          name={helmFile}
                        />,
                      ]}
                    />
                  </li>
                ))}
              </ul>
            )}
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted>
          <RbacProtected.RestrictedRoute />
        </RbacProtected.Restricted>
      </RbacProtected>
    </SectionCard>
  );
};
