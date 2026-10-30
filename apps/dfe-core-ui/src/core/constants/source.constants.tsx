/** Which of a deployment's two transports carries this source's records. */
export const SOURCE_TRANSPORTS = ['bus', 'direct'] as const;

export const SOURCE_TRANSPORT_LABELS: Record<
  (typeof SOURCE_TRANSPORTS)[number],
  string
> = {
  bus: 'Bus - a broker holds records between stages',
  direct: 'Direct - point to point, nothing stored between stages',
};
