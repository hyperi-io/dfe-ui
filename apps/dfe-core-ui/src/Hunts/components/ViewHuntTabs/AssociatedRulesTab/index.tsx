import { THuntDetailResponse } from '@/Hunts/hooks/useFetchHuntDetail/types';
import { IconExternalLink } from '@repo/dfe-icons';
import { Card } from 'antd';

import Link from 'next/link';

export const AssociatedRulesTab = ({
  rules,
}: {
  rules: THuntDetailResponse['rules'];
}) => {
  return (
    <ul className="flex flex-col gap-2">
      {rules?.map((rule) => (
        <li key={rule.rule_name}>
          <Link
            href={`/rules/${rule.rule_name}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Card size="small" classNames={{ body: 'flex flex-col gap-2' }}>
              <div className="flex justify-between w-full">
                <p className="font-medium">{rule.rule_name}</p>
                <IconExternalLink />
              </div>

              <p className="text-sm text-foreground/60 dark:text-dark-foreground/60">
                {rule.description || 'No description'}
              </p>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  );
};
