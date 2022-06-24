import Lyra from "@lyrafinance/lyra-js";
import { BigNumber } from "ethers";
import moment from "moment";
import { useQuery } from "react-query";
import { useAppContext } from "../../context/AppContext";
import { OptionsMap, OptionType, ProviderType, Underlying } from "../../types";

type QueryArgs = [string, Underlying];

const lyra = new Lyra();
const formatWei = (val: BigNumber) => val.div(BigNumber.from(10).pow(18)).toString();

const getMarketData = async ({ queryKey }: { queryKey: QueryArgs }) => {
  const [, underlying] = queryKey;
  const market = await lyra.market(underlying.toLowerCase());
  // const rate = market.__marketData.marketParameters.greekCacheParams.rateAndCarry ?? 5;
  const options = market.liveBoards().map((board) => {
    const expiration = board.expiryTimestamp * 1000;
    const momentExp = moment(expiration);
    const term = momentExp.format("DDMMMYY").toUpperCase();

    return board.strikes().map<Promise<OptionsMap | undefined>>(async (strike) => {
      const strikePrice = formatWei(strike.strikePrice);
      const one = BigNumber.from(10).pow(18);

      const quotes = await Promise.all([
        strike.quote(true, true, one),
        strike.quote(true, false, one),
        strike.quote(false, true, one),
        strike.quote(false, false, one),
      ]);
      const [callBuyPrice, callSellPrice, putBuyPrice, putSellPrice] = quotes.map((quote) =>
        parseFloat(formatWei(quote.pricePerOption))
      );

      if ([callBuyPrice, callSellPrice, putBuyPrice, putSellPrice].every((val) => !val)) return;

      return {
        strike: strikePrice,
        term,
        expiration,
        provider: ProviderType.LYRA,
        options: {
          [OptionType.CALL]: {
            type: OptionType.CALL,
            askPrice: callBuyPrice,
            bidPrice: callSellPrice,
            midPrice: (callBuyPrice + callSellPrice) / 2,
          },
          [OptionType.PUT]: {
            type: OptionType.PUT,
            askPrice: putBuyPrice,
            bidPrice: putSellPrice,
            midPrice: (putBuyPrice + putSellPrice) / 2,
          },
        },
      };
    });
  });
  return (await Promise.all(options?.flat()).catch(console.error))?.filter(Boolean) as OptionsMap[];
};

export const useLyraRates = () => {
  const { underlying } = useAppContext();
  const { data } = useQuery(["lyra", underlying] as QueryArgs, getMarketData, {
    refetchInterval: 30000,
  });

  return [data];
};
