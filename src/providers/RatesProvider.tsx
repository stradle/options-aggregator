import { createContext, ReactNode, useContext, useMemo } from "react";
import { useDeribitRates } from "./deribit";
import { useLyraRates } from "./lyra";
import { usePremiaRates } from "./premia";
import { useHegicRates } from "./hegic";
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
  const [premia] = usePremiaRates(deribit);
  const [hegic] = useHegicRates(deribit);
  const [lyra] = useLyraRates();

  const context = useMemo(
    () => ({
      [ProviderType.DERIBIT]: deribit,
      [ProviderType.LYRA]: lyra,
      [ProviderType.PREMIA]: premia,
      [ProviderType.HEGIC]: hegic,
    }),
    [deribit, lyra, premia, hegic]
  );

  return <RatesContext.Provider value={context}>{children}</RatesContext.Provider>;
};
