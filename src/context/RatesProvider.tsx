import { createContext, ReactNode, useContext, useMemo } from "react";
import { useDeribitRates } from "../providers/deribit";
import { useLyraRates } from "../providers/lyra";
import { usePremiaRates } from "../providers/premia";
// import { useHegicRates } from "./hegic";
import { OptionsMap, ProviderType } from "../types";
import { CHAINS } from "../services/util/constants";

type RatesContextType = Record<ProviderType, OptionsMap[] | undefined>;

const RatesContext = createContext<RatesContextType>({
  DERIBIT: undefined,
  HEGIC: undefined,
  LYRA: undefined,
  PREMIA_ARB: undefined,
  PREMIA_OP: undefined,
});

// TODO: check if returns new reference which causes obsolete rerenders
export const useRatesContext = () => useContext(RatesContext);

export const RatesProvider = ({ children }: { children?: ReactNode }) => {
  const [deribit] = useDeribitRates();
  const [lyra, lyraLoading] = useLyraRates();
  const [premiaOp, opLoading] = usePremiaRates(CHAINS.OP, lyra);
  const [premiaArb, arbLoading] = usePremiaRates(CHAINS.ARB, lyra);
  // const [hegic] = useHegicRates(lyra);
  const isLoading = lyraLoading || opLoading || arbLoading;

  console.log(lyraLoading, opLoading, arbLoading);

  const context = useMemo(
    () => ({
      [ProviderType.DERIBIT]: deribit,
      [ProviderType.LYRA]: lyra,
      [ProviderType.PREMIA_ARB]: premiaArb,
      [ProviderType.PREMIA_OP]: premiaOp,
      [ProviderType.HEGIC]: [],
    }),
    [deribit, lyra, premiaArb, premiaOp, isLoading]
  );

  return (
    <RatesContext.Provider value={context}>{children}</RatesContext.Provider>
  );
};
