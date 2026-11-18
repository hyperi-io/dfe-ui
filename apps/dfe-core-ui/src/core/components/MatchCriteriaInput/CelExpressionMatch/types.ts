export type TRuleError = {
  field: string;
  message: string;
  span?: { start: number; end: number } | null;
};

export type TSpan = NonNullable<TRuleError['span']>;
