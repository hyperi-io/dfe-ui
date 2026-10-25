import {
  getAliasConflict,
  getRuleErrors,
  TAliasConflict,
  TRuleError,
} from '@/Sources/utils/ingestErrors';
import { createContext, useContext, useMemo } from 'react';

type SourceWriteErrors = {
  /** Why the receiver would refuse the match or expression, each with its span. */
  ruleErrors: TRuleError[];
  aliasConflict: TAliasConflict | null;
};

const SourceWriteErrorContext = createContext<SourceWriteErrors>({
  ruleErrors: [],
  aliasConflict: null,
});

/** The engine's refusal of the last save, for the fields it names to show beside themselves. */
export const SourceWriteErrorProvider = ({
  error,
  children,
}: {
  error: unknown;
  children: React.ReactNode;
}) => {
  const value = useMemo(
    () => ({
      ruleErrors: getRuleErrors(error),
      aliasConflict: getAliasConflict(error),
    }),
    [error],
  );
  return (
    <SourceWriteErrorContext.Provider value={value}>
      {children}
    </SourceWriteErrorContext.Provider>
  );
};

export const useSourceWriteErrors = () => useContext(SourceWriteErrorContext);
