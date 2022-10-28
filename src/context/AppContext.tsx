import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { useLocalStorage } from "react-use";
import { currencyProviders } from "../services/util/constants";
import { ProviderType, Underlying } from "../types";

type AppContextType = {
  underlying: Underlying;
  setUnderlying: (val: Underlying) => void;
  providers: ProviderType[];
  setProviders: (val: ProviderType[]) => void;
  interestRate: number;
  setInterestRate: (val: number) => void;
};

const AppContext = createContext<AppContextType>({
  underlying: Underlying.ETH,
  setUnderlying: () => {},
  providers: [],
  setProviders: () => {},
  interestRate: 0,
  setInterestRate: () => {},
});

export const useAppContext = () => {
  return useContext(AppContext);
};

const AppContextProvider = ({ children }: { children?: ReactNode }) => {
  const [interestRate, setInterestRate] = useState(0.05);
  const [underlying = Underlying.ETH, setUnderlying] =
    useLocalStorage<Underlying>("underlying", Underlying.ETH);
  const [ethProviders = [], setEthProviders] = useLocalStorage(
    `${underlying}-providers`,
    currencyProviders[Underlying.ETH]
  );
  const [btcProviders = [], setBtcProviders] = useLocalStorage(
    `${Underlying.BTC}-providers`,
    currencyProviders[Underlying.BTC]
  );

  const providers = underlying === Underlying.ETH ? ethProviders : btcProviders;
  const setProviders =
    underlying === Underlying.ETH ? setEthProviders : setBtcProviders;

  const context = useMemo(
    () => ({
      underlying,
      setUnderlying,
      providers,
      setProviders,
      interestRate,
      setInterestRate,
    }),
    [underlying, providers]
  );

  return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
