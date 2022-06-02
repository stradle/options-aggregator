import { OptionType } from "../../types";

export const OptionTypeColors = {
  [OptionType.CALL]: "#32C47A",
  [OptionType.PUT]: "#EB5757",
};

export const STRIKE_CUTOFF = 1.6;

export const routes = {
  root: "/",
  deals: "deals-chart",
  aggregatedRates: "aggregated-rates",
};
