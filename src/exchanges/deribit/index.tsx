import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import moment from "moment";
import { pick } from "lodash";
import { Option, OptionsMap, OptionType, ProviderType } from "../../types";

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

const ethOptions = {
  jsonrpc: "2.0",
  id: 1,
  method: "public/get_book_summary_by_currency",
  params: {
    currency: "ETH",
    kind: "option",
  },
};

const WebSocketContext = createContext<OptionsMap[] | null>(null);

export const useDeribitContext = () => {
  return useContext(WebSocketContext);
};
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
const ws = new WebSocket("wss://www.deribit.com/ws/api/v2");

// TODO: fetch price from coingecko
const ETH_PRICE = 1967;

const parseDeribitOption = ({
  instrument_name,
  ask_price,
  bid_price,
  mid_price,
}: DeribitItem): Option &
  Pick<OptionsMap, "term" | "strike" | "expiration"> => {
  // 'ETH-27MAY22-2400-C'
  const [, term, strike, callOrPut] = instrument_name.split("-");

  return {
    term,
    strike: strike,
    type: callOrPut === "P" ? OptionType.PUT : OptionType.CALL,
    expiration: +moment(term, "DDMMMYY"),
    askPrice: (ask_price ?? 0) * ETH_PRICE,
    midPrice: (mid_price ?? 0) * ETH_PRICE,
    bidPrice: (bid_price ?? 0) * ETH_PRICE,
  };
};

const useDeribitData = () => {
  const [ethData, setEthData] = useState<DeribitItem[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timer;
    const triggerUpdate = () => ws.send(JSON.stringify(ethOptions));

    ws.onopen = () => {
      triggerUpdate();
      interval = setInterval(triggerUpdate, 10000);
    };
    ws.onmessage = (e) => {
      setEthData(JSON.parse(e.data).result);
    };

    return () => {
      clearInterval(interval);
      ws.close();
    };
  }, []);

  return [ethData];
};

export const DeribitProvider = ({ children }: { children?: ReactNode }) => {
  const [data] = useDeribitData();

  const optionsMap = data
    .filter(({ mid_price, ask_price, bid_price }) => ask_price && bid_price)
    .map((item) => parseDeribitOption(item))
    .reduce<OptionsMap[]>((acc, option) => {
      const found = acc.find(
        ({ term, strike }) => option.term === term && option.strike === strike
      );

      if (found) {
        // @ts-ignore
        found.options[option.type] = option;
      } else {
        acc.push({
          ...pick(option, ["term", "strike", "expiration"]),
          provider: ProviderType.DERIBIT,
          options: {
            [option.type]: pick(option, [
              "askPrice",
              "bidPrice",
              "midPrice",
              "type",
            ]),
          },
        });
      }

      return acc;
    }, []);

  return (
    <WebSocketContext.Provider value={optionsMap}>
      {children}
    </WebSocketContext.Provider>
  );
};
