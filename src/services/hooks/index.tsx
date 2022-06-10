import { useMemo } from "react";
import { chain, groupBy } from "lodash";
import { useRatesContext } from "../../providers/RatesProvider";
import { OptionsMap } from "../../types";
import { useAppContext } from "../../context/AppContext";

type TermStrikesOptions = {
  [term: string]: { [strike: string]: OptionsMap[] };
};

export const useRatesData = () => {
  const { providers } = useAppContext();
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

          return providers.filter((provider) => termProviders.includes(provider));
        })
        .value(),
    [allRates, providers]
  );

  return { allRates, termProviders };
};
