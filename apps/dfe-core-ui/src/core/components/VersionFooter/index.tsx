import { useFetchSystemVersion } from '@/core/hooks/useFetchSystemVersion';
import { cn } from '@/core/utils/style';

interface VersionFooterProps {
  className?: string;
}

// A component pin is a container ref (`v1.20.0@sha256:...`), the engine version a
// bare number, so trim to the tag and let one `v` do the work for both.
const componentLabel = (name: string, version: string) =>
  `${name} v${version.split('@')[0].replace(/^v/, '')}`;

// The stack version is what an operator quotes in a support conversation, so it
// wins the one visible line; the parts it resolves to are on hover.
export const VersionFooter = ({ className }: VersionFooterProps) => {
  const { data } = useFetchSystemVersion();

  if (!data) {
    return null;
  }

  const engine = componentLabel('engine', data.engine);
  const parts = [
    data.stack,
    engine,
    data.ui ? componentLabel('ui', data.ui) : null,
  ].filter(Boolean);

  return (
    <footer
      title={parts.join(' | ')}
      className={cn(
        'fixed bottom-2 right-3 z-10 text-xs text-foreground/50 dark:text-dark-foreground/50',
        className,
      )}
    >
      {data.stack ?? engine}
    </footer>
  );
};
