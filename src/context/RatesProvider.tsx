import { createContext, ReactNode, useContext, useMemo } from "react";
import { useDeribitRates } from "../providers/deribit";
import { useLyraRates } from "../providers/lyra";
import { usePremiaRates } from "../providers/premia";
// import { useHegicRates } from "./hegic";
import { OptionsMap, ProviderType } from "../types";

type RatesContextType = Record<ProviderType, OptionsMap[] | undefined>;

const RatesContext = createContext<RatesContextType>({
  DERIBIT: undefined,
  LYRA: undefined,
  PREMIA: undefined,
  HEGIC: undefined,
});

// TODO: check if returns new reference which causes obsolete rerenders
export const useRatesContext = () => useContext(RatesContext);

export const RatesProvider = ({ children }: { children?: ReactNode }) => {
  const [deribit] = useDeribitRates();
    const [lyra] = useLyraRates();
    const [premia] = usePremiaRates(lyra);
    // const [hegic] = useHegicRates(lyra);

  const context = useMemo(
    () => ({
      [ProviderType.DERIBIT]: deribit,
      [ProviderType.LYRA]: lyra,
      [ProviderType.PREMIA]: premia,
      [ProviderType.HEGIC]: [],
    }),
    [deribit, lyra, premia]
  );

  return <RatesContext.Provider value={context}>{children}</RatesContext.Provider>;
};
