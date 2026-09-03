import { TAppCatalogueEntry } from '@/core/hooks/apps/instances/useFetchApps/types';
import { Tag } from 'antd';

/**
 * Names a pre-release app's level beside its name, and renders nothing for a
 * release-grade app.
 *
 * The engine withholds every app below the deployment's maturity gate, so
 * there is no filtering to do here: whatever arrives is meant to be shown,
 * and the tag only says how far along it is.
 */
export const AppMaturityTag = ({
  maturity,
}: {
  maturity: TAppCatalogueEntry['maturity'];
}) => (maturity === 'release' ? null : <Tag>{maturity}</Tag>);
