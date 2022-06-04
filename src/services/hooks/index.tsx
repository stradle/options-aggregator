import { useMemo } from "react";
import { chain, groupBy } from "lodash";
import { useRatesContext } from "../../exchanges/RatesProvider";
import { OptionsMap } from "../../types";

type TermStrikesOptions = {
  [term: string]: { [strike: string]: OptionsMap[] };
};

export const useRatesData = () => {
  const rates = useRatesContext();
  const allRates = useMemo(
    () =>
      chain(rates)
        .values()
        .flatten()
        .groupBy("term")
        .mapValues((optionsMap: OptionsMap) => groupBy(optionsMap, "strike"))
        .value() as unknown as TermStrikesOptions,
    [rates]
  );
  const termProviders = useMemo(
    () =>
      chain(allRates)
        .mapValues((strikeOptions) =>
          chain(strikeOptions).values().max().map("provider").sort().value()
        )
        .value(),
    [allRates]
  );

  return { allRates, termProviders };
};
