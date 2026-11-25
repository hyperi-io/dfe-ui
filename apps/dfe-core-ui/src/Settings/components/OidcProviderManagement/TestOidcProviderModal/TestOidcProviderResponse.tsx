import { GenericErrorCard } from '@/core/components/GenericError';
import { useTestOidcProvider } from '@/core/hooks/useTestOidcProvider';
import { useVerifyOidcLogin } from '@/core/hooks/useVerifyOidcLogin';
import {
  dataListGridStyle,
  dataListTermStyle,
} from '@/Settings/components/OidcProviderManagement/ViewOidcProviderDrawer/ViewOidcProviderDetail';
import {
  IconCircleCheck,
  IconCircleCheckFilled,
  IconCircleX,
  IconCircleXFilled,
  IconRefresh,
} from '@repo/dfe-icons';
import { Button, Spin, Tag } from 'antd';
import { Fragment, type ReactNode } from 'react';

const ICON_CLASS = 'inline size-3';

// The sign-in checks the engine runs, by the field each one reads.
const CHECK_LABELS: Record<string, string> = {
  client_id: 'Client ID:',
  client_secret: 'Client Secret:',
  discovery: 'Discovery:',
};

/** Passed or Failed, styled as the sync status tags are. */
const ResultTag = ({ ok }: { ok: boolean }) =>
  ok ? (
    <Tag
      className="m-0"
      color="green"
      icon={<IconCircleCheckFilled aria-hidden className={ICON_CLASS} />}
    >
      Passed
    </Tag>
  ) : (
    <Tag
      className="m-0"
      color="red"
      icon={<IconCircleXFilled aria-hidden className={ICON_CLASS} />}
    >
      Failed
    </Tag>
  );

/** One check's mark and what the engine found. */
const CheckOutcome = ({ detail, ok }: { detail: string; ok: boolean }) => (
  <span className="flex items-center gap-2">
    {ok ? (
      <IconCircleCheck
        aria-label="Passed"
        className="shrink-0 text-green-500"
      />
    ) : (
      <IconCircleX aria-label="Failed" className="shrink-0 text-red-500" />
    )}
    {detail}
  </span>
);

const TestSection = ({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) => (
  <section aria-label={title} className="flex flex-col gap-3">
    <div>
      <h2 className="font-medium">{title}</h2>
      <p className="text-sm text-foreground/50 dark:text-dark-foreground/50">
        {description}
      </p>
    </div>
    {children}
  </section>
);

const Checking = ({ label }: { label: string }) => (
  <span>
    <Spin /> <span className="sr-only">{label}</span>
  </span>
);

/** The provider's two checks, each on its own: whether users can sign in through it, and whether DFE can read its group directory. */
export const TestOidcProviderResponse = ({
  oidcProviderName,
}: {
  oidcProviderName: string;
}) => {
  const login = useVerifyOidcLogin({ name: oidcProviderName });
  const directory = useTestOidcProvider({ name: oidcProviderName });
  const isRunning =
    login.isLoading ||
    directory.isLoading ||
    login.isRefetching ||
    directory.isRefetching;

  return (
    <div className="flex flex-col gap-6 mt-2">
      <TestSection
        title="Sign In"
        description="Whether users can sign in through this provider."
      >
        {login.isLoading && <Checking label="Checking sign in" />}
        {login.error && (
          <GenericErrorCard
            title="Error checking sign in"
            description={login.error.message}
          />
        )}
        {login.data && (
          <dl className={dataListGridStyle}>
            <dt className={dataListTermStyle}>Result:</dt>
            <dd>
              <ResultTag ok={login.data.ok} />
            </dd>
            {login.data.checks.map((check) => (
              <Fragment key={check.name}>
                <dt className={dataListTermStyle}>
                  {CHECK_LABELS[check.name] ?? `${check.name}:`}
                </dt>
                <dd>
                  <CheckOutcome detail={check.detail} ok={check.ok} />
                </dd>
              </Fragment>
            ))}
          </dl>
        )}
      </TestSection>

      <TestSection
        title="Group Directory"
        description="Whether DFE can read this provider's groups."
      >
        {directory.isLoading && <Checking label="Checking group directory" />}
        {directory.error && (
          <GenericErrorCard
            title="Error checking the group directory"
            description={directory.error.message}
          />
        )}
        {directory.data && (
          <dl className={dataListGridStyle}>
            <dt className={dataListTermStyle}>Result:</dt>
            <dd>
              <ResultTag ok={directory.data.success} />
            </dd>
            <dt className={dataListTermStyle}>Message:</dt>
            <dd>{directory.data.message}</dd>
          </dl>
        )}
      </TestSection>

      <div className="flex justify-end">
        <Button
          icon={<IconRefresh />}
          loading={isRunning}
          onClick={() => {
            void login.refetch();
            void directory.refetch();
          }}
        >
          Test Again
        </Button>
      </div>
    </div>
  );
};
