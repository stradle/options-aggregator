import { useMemo } from "react";
import { chain, groupBy } from "lodash";
import { useRatesContext } from "../../exchanges/RatesProvider";
import { OptionsMap, ProviderType } from "../../types";

type TermStrikesOptions = {
  [term: string]: { [strike: string]: OptionsMap[] };
};

const sortedProviders = Object.values(ProviderType);

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
        .mapValues((strikeOptions) => {
          const termProviders = chain(strikeOptions).values().max().map("provider").value();

          return sortedProviders.filter((provider) => termProviders.includes(provider));
        })
        .value(),
    [allRates]
  );

  return { allRates, termProviders };
};
