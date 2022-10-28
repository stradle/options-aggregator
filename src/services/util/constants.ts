import { BigNumber } from "ethers";
import { ProviderType, Underlying } from "../../types";

// used as mixin to reset cache
export const APP_VERSION = '0.0.1'
export const STRIKE_CUTOFF = 1.4;

export const routes = {
  root: "/",
  arbitrageDeals: "arbitrage-deals",
  aggregatedRates: "aggregated-rates",
  portfolio: "portfolio",
};

export const currencyProviders = {
  [Underlying.ETH]: [
    ProviderType.DERIBIT,
    ProviderType.LYRA,
    ProviderType.PREMIA_ARB,
    ProviderType.PREMIA_OP,
  ],
  [Underlying.BTC]: [
    ProviderType.DERIBIT,
    ProviderType.LYRA,
    ProviderType.PREMIA_ARB,
  ],
  [Underlying.SOL]: [ProviderType.DERIBIT, ProviderType.LYRA],
};

export enum CHAINS {
  ARB = "ARB",
  OP = "OP",
}

export const getUrlByProvider = (provider: ProviderType) => {
  switch (provider) {
    case ProviderType.LYRA:
      return "https://app.lyra.finance/trade/eth";
    case ProviderType.DERIBIT:
      return "https://deribit.com/options/ETH";
    case ProviderType.PREMIA_OP:
    case ProviderType.PREMIA_ARB:
      return "https://app.premia.finance/options/WETH-DAI";
    case ProviderType.HEGIC:
      return "https://hegic.co/app.html#/arbitrum/options/buy-otm";
  }
};

export const MAX_BN = BigNumber.from(2).pow(256).sub(1);

// Risk Free Interest Rate
export const RFI_RATE = 0.05;

export const defaultProviders = Object.values(ProviderType).filter(
  (prov) => prov !== ProviderType.HEGIC
);
