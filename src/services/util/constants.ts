import { OptionType, ProviderType } from "../../types";

export const OptionTypeColors = {
  [OptionType.CALL]: "#32C47A",
  [OptionType.PUT]: "#EB5757",
};

export const STRIKE_CUTOFF = 1.6;

export const routes = {
  root: "/",
  dealsChart: "deals-chart",
  aggregatedRates: "aggregated-rates",
};

export const getUrlByProvider = (provider: ProviderType) => {
  switch (provider) {
    case ProviderType.LYRA:
      return "https://avalon.app.lyra.finance/trade/eth";
    case ProviderType.DERIBIT:
      return "https://www.deribit.com/options/ETH";
    case ProviderType.PREMIA:
      return "https://app.premia.finance/options/WETH-DAI";
  }
};
