import Lyra from "@lyrafinance/lyra-js";
import { createContext } from "react";
import { BigNumber } from "ethers";
import moment from "moment";
import { useQuery } from "react-query";
import { OptionsMap, OptionType, ProviderType } from "../../types";

const lyra = new Lyra(undefined, true);

const formatWei = (val: BigNumber) =>
  val.div(BigNumber.from(10).pow(18)).toString();

const getMarketData = async () => {
  const market = await lyra.market("eth");
  const options = await Promise.all(
    market.liveBoards().map(async (board) => {
      const expiration = board.expiryTimestamp * 1000;
      const term = moment(expiration).format("DDMMMYY").toUpperCase();

      return Promise.all(
        board.strikes().map<Promise<OptionsMap>>(async (strike) => {
          const strikePrice = formatWei(strike.strikePrice);
          const one = BigNumber.from(10).pow(18);

          const quotes = await Promise.all([
            strike.quote(true, true, one),
            strike.quote(true, false, one),
            strike.quote(false, true, one),
            strike.quote(false, false, one),
          ]);
          const [callBuyPrice, callSellPrice, putBuyPrice, putSellPrice] =
            quotes.map((quote) => parseFloat(formatWei(quote.pricePerOption)));

          return {
            strike: strikePrice,
            term,
            expiration,
            provider: ProviderType.LYRA,
            options: {
              [OptionType.CALL]: {
                type: OptionType.CALL,
                askPrice: callSellPrice,
                bidPrice: callBuyPrice,
                midPrice: (callBuyPrice + callSellPrice) / 2,
              },
              [OptionType.PUT]: {
                type: OptionType.PUT,
                askPrice: putSellPrice,
                bidPrice: putBuyPrice,
                midPrice: (putBuyPrice + putSellPrice) / 2,
              },
            },
          };
        })
      );
    })
  );

  return options.flat();
};

export const useLyraRates = () => {
  const { data } = useQuery("lyra", getMarketData, { refetchInterval: 30000 });

  return [data];
};
