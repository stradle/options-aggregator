import { OptionType, ProviderType } from "../../types";

export const OptionTypeColors = {
  [OptionType.CALL]: "#32C47A",
  [OptionType.PUT]: "#EB5757",
};

export const STRIKE_CUTOFF = 1.5;

export const routes = {
  root: "/",
  arbitrageDeals: "arbitrage-deals",
  aggregatedRates: "aggregated-rates",
};

export const getUrlByProvider = (provider: ProviderType) => {
  switch (provider) {
    case ProviderType.LYRA:
      return "https://avalon.app.lyra.finance/trade/eth";
    case ProviderType.DERIBIT:
      return "https://deribit.com/options/ETH";
    case ProviderType.PREMIA:
      return "https://app.premia.finance/options/WETH-DAI";
    case ProviderType.HEGIC:
      return "https://hegic.co/app.html#/arbitrum/options/buy-otm";
  }
};
