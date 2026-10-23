import { TSourceCatalogueIntake } from '@/Sources/hooks/useFetchInfiniteSourceCatalogues/types';

// Keyed by the engine's intake enum, so an intake it adds fails typecheck until it has a label.
const INTAKE_OPTIONS_MAP: Readonly<Record<TSourceCatalogueIntake, string>> =
  Object.freeze({
    beats: 'Beats',
    receiver: 'Pushed to the receiver',
    fetcher: 'Pulled by a fetcher',
  });

export const isKnownIntake = (
  intake: string,
): intake is TSourceCatalogueIntake =>
  Object.hasOwn(INTAKE_OPTIONS_MAP, intake);

/** An intake in words, or as the engine sent it when the console has no label for it. */
export const intakeLabel = (intake: string) =>
  isKnownIntake(intake) ? INTAKE_OPTIONS_MAP[intake] : intake;

/** The intakes an entry offers as select options, in the order it lists them. */
export const intakeOptionsFor = (intakes: readonly string[]) =>
  intakes.filter(isKnownIntake).map((value) => ({
    value,
    label: INTAKE_OPTIONS_MAP[value],
  }));

export const INTAKE_OPTIONS = intakeOptionsFor(Object.keys(INTAKE_OPTIONS_MAP));
