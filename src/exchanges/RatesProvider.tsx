import { createContext, ReactNode, useContext, useMemo } from "react";
import { useDeribitRates } from "./deribit";
import { useLyraRates } from "./lyra";
import { usePremiaRates } from "./premia";
import { OptionsMap, ProviderType } from "../types";

type RatesContextType = Record<ProviderType, OptionsMap[] | undefined>;

const RatesContext = createContext<RatesContextType>({
  DERIBIT: undefined,
  LYRA: undefined,
  PREMIA: undefined,
});

export const useRatesContext = () => useContext(RatesContext);

export const RatesProvider = ({ children }: { children?: ReactNode }) => {
  const [deribit] = useDeribitRates();
  const [premia] = usePremiaRates(deribit);
  const [lyra] = useLyraRates();

  const context = useMemo(
    () => ({
      [ProviderType.DERIBIT]: deribit,
      [ProviderType.LYRA]: lyra,
      [ProviderType.PREMIA]: premia,
    }),
    [deribit, lyra, premia]
  );

  return (
    <RatesContext.Provider value={context}>{children}</RatesContext.Provider>
  );
};
