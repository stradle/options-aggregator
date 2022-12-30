import { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { pick } from "lodash";
import { useTokenPrice } from "../../services/util";
import {
  Instrument,
  OptionsMap,
  OptionType,
  ProviderType,
  Underlying,
} from "../../types";
import { useAppContext } from "../../context/AppContext";

// const authRequest = {
//   jsonrpc: "2.0",
//   id: 9929,
//   method: "public/auth",
//   params: {
//     grant_type: "client_credentials",
//     client_id: "jZKxPoOp",
//     client_secret: "yKmqxNMCdCkPzeKVTNeWSPhAyg9dL8zOjMYXGwqcM1c",
//   },
// };

// DOCS: https://docs.deribit.com/?javascript#private-get_settlement_history_by_currency

const getRequestMeta = (currency: Underlying) => ({
  jsonrpc: "2.0",
  id: 1,
  method: "public/get_book_summary_by_currency",
  params: {
    currency,
    kind: "option",
  },
});
//     @ response data
//     ask_price: null,
//     base_currency: "ETH",
//     bid_price: 0.001,
//     creation_timestamp: 1652457190958,
//     estimated_delivery_price: 2090.99,
//     high: null,
//     instrument_name: "ETH-27MAY22-2400-C",
//     interest_rate: 0,
//     last: 0.1855,
//     low: null,
//     mark_price: 0.006397,
//     mid_price: null,
//     open_interest: 0,
//     price_change: null,
//     quote_currency: "ETH",
//     underlying_index: "SYN.ETH-27MAY22",
//     underlying_price: 2093.2846136477665,
//     volume: 0,
export type DeribitItem = {
  ask_price: null | number;
  bid_price: null | number;
  mid_price: null | number;
  mark_price: number;
  base_currency: string;
  creation_timestamp: number;
  estimated_delivery_price: number;
  high: null;
  instrument_name: string;
  interest_rate: number;
  last: number;
  low: number;
  open_interest: number;
  price_change: null;
  quote_currency: string;
  underlying_index: string;
  underlying_price: number;
  volume: number;
};

const parseDeribitOption = (
  { instrument_name, ask_price, bid_price, mid_price }: DeribitItem,
  ethPrice: number
): Instrument & Pick<OptionsMap, "term" | "strike" | "expiration"> => {
  // 'ETH-27MAY22-2400-C'
  const [, term, strike, callOrPut] = instrument_name.split("-");

  return {
    provider: ProviderType.DERIBIT,
    term,
    strike: parseFloat(strike),
    type: callOrPut === "P" ? OptionType.PUT : OptionType.CALL,
    expiration: +moment(term, "DDMMMYY"),
    askPrice: (ask_price ?? 0) * ethPrice,
    midPrice: (mid_price ?? 0) * ethPrice,
    bidPrice: (bid_price ?? 0) * ethPrice,
  };
};

const connect = () => new WebSocket("wss://www.deribit.com/ws/api/v2");
const useDeribitSocket = () => {
  const [ws, setWs] = useState<WebSocket>();

  useEffect(() => {
    if (ws) return;
    const connection = connect();

    setWs(connection);
    connection.onclose = () => setWs(undefined);
  }, [ws]);

  return ws;
};

const useDeribitData = (currency: Underlying) => {
  const [rates, setRates] = useState<Record<Underlying, DeribitItem[]>>({
    BTC: [],
    ETH: [],
  });
  const ws = useDeribitSocket();

  useEffect(() => {
    if (!ws) return;
    let interval: NodeJS.Timer;
    const triggerUpdate = () => {
      ws.send(JSON.stringify(getRequestMeta(Underlying.ETH)));
      ws.send(JSON.stringify(getRequestMeta(Underlying.BTC)));
    };
    console.log("sub again");
    ws.onopen = () => {
      triggerUpdate();
      interval = setInterval(triggerUpdate, 10000);
    };
    ws.onmessage = (e) => {
      const { result } = JSON.parse(e.data);
      setRates((rates) => ({
        ...rates,
        [result[0].base_currency]: result,
      }));
    };

    return () => {
      clearInterval(interval);
      ws.close();
    };
  }, [ws]);

  return useMemo(() => rates[currency], [currency, rates]);
};

export const useDeribitRates = () => {
  const { underlying } = useAppContext();
  const data = useDeribitData(underlying);
  const { price } = useTokenPrice(underlying);
  const optionsMap = useMemo(
    () =>
      data
        .filter(({ mid_price, ask_price, bid_price }) => ask_price && bid_price)
        .map((item) => parseDeribitOption(item, price))
        .reduce<OptionsMap[]>((acc, option) => {
          const found = acc.find(
            ({ term, strike }) =>
              option.term === term && option.strike === strike
          );

          if (found) {
            // @ts-ignore
            found[option.type] = option;
          } else {
            acc.push({
              ...pick(option, ["term", "strike", "expiration", "provider"]),
              [option.type]: option,
            });
          }

          return acc;
        }, []),
    [data, price]
  );

  return [optionsMap];
};
