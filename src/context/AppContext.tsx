import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { useLocalStorage } from "react-use";
import { Underlying, ProviderType } from "../types";

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
  providers: Object.values(ProviderType),
  setProviders: () => {},
  interestRate: 0,
  setInterestRate: () => {},
});

export const useAppContext = () => {
  return useContext(AppContext);
};

const AppContextProvider = ({ children }: { children?: ReactNode }) => {
  const [interestRate, setInterestRate] = useState(0.05);
  const [underlying = Underlying.ETH, setUnderlying] = useLocalStorage<Underlying>(
    "underlying",
    Underlying.ETH
  );
  const [providers = Object.values(ProviderType), setProviders] = useLocalStorage(
    "providers",
    Object.values(ProviderType)
  );

  const context = useMemo(
    () => ({ underlying, setUnderlying, providers, setProviders, interestRate, setInterestRate }),
    [underlying, providers]
  );

  return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
