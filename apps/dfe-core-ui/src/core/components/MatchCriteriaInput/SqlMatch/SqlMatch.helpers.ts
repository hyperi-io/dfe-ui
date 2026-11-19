export const getNormalisedSql = (sql: string) => {
  const normalisedSql = sql.replace(
    'FROM {{source}}',
    'FROM dfe.\`hunt-results\`',
  );
  return normalisedSql;
};
