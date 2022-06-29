export enum ProviderType {
  LYRA = "LYRA",
  DERIBIT = "DERIBIT",
  PREMIA = "PREMIA",
  HEGIC = "HEGIC",
}

export enum OptionType {
  CALL = "CALL",
  PUT = "PUT",
}

export interface Option {
  type: OptionType;
  askPrice?: number;
  bidPrice?: number;
  midPrice?: number;
}

export type CallOption = Option & { type: OptionType.CALL };
export type PutOption = Option & { type: OptionType.PUT };

export type OptionCouple = {
  [OptionType.CALL]?: CallOption | undefined;
  [OptionType.PUT]?: PutOption | undefined;
};

export type OptionsMap = {
  provider: ProviderType;
  expiration: number;
  term: string;
  strike: string;
  options: OptionCouple;
};

export enum Underlying {
  ETH = "ETH",
  BTC = "BTC",
}

export type DealPart = { price: number; provider: ProviderType };
export type Deal = Pick<OptionsMap, "term" | "strike"> & {
  amount: number;
  expiration: number;
  type: OptionType;
  buy: DealPart;
  sell: DealPart;
};
