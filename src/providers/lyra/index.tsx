import Lyra from "@lyrafinance/lyra-js";
import { useAccount } from "wagmi";
import { BigNumber } from "ethers";
import { useQuery } from "react-query";
import { useAppContext } from "../../context/AppContext";
import { getExpirationTerm } from "../../services/util";
import { ActivePosition, OptionsMap, OptionType, ProviderType, Underlying } from "../../types";

type QueryArgs = [string, Underlying];

const lyra = new Lyra();
const formatWei = (val: BigNumber) => val.div(BigNumber.from(10).pow(18)).toString();

const getMarketData = async ({ queryKey }: { queryKey: QueryArgs }) => {
  const [, underlying] = queryKey;
  const market = await lyra.market(underlying.toLowerCase());
  // const rate = market.__marketData.marketParameters.greekCacheParams.rateAndCarry ?? 5;
  const options = market.liveBoards().map((board) => {
    const expiration = board.expiryTimestamp * 1000;
    const term = getExpirationTerm(expiration);

    return board.strikes().map<Promise<OptionsMap | undefined>>(async (strike) => {
      const strikePrice = parseFloat(strike.strikePrice.toString()) / 1e18;
      const one = BigNumber.from(10).pow(18);

      const quotes = await Promise.all([
        strike.quote(true, true, one),
        strike.quote(true, false, one),
        strike.quote(false, true, one),
        strike.quote(false, false, one),
      ]);
      const [callBuyPrice, callSellPrice, putBuyPrice, putSellPrice] = quotes.map(
        (quote) => parseFloat(quote.pricePerOption.toString()) / 1e18
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

export const useLyraRates: () => [undefined | OptionsMap[], boolean] = () => {
  const { underlying } = useAppContext();
  const { data, isLoading } = useQuery(["lyra", underlying] as QueryArgs, getMarketData, {
    refetchInterval: 30000,
  });

  return [data, isLoading];
};

export const useLyraPositions = (isOpen = true): [ActivePosition[], boolean] => {
  const { address } = useAccount();

  const { data = [], isLoading } = useQuery(["lyra-positions", address], async () => {
    if (!address) return [];
    const positions = isOpen ? await lyra.openPositions(address) : await lyra.positions(address);

    console.log("refetching positions");

    return positions.map((pos) => ({
      __source: pos.__source,
      id: pos.id,
      strike: +pos.strikePrice,
      size: +pos.size,
      expiration: pos.expiryTimestamp,
      collateral: pos.collateral && +pos.collateral?.amount,
      isOpen: pos.isOpen,
      isCall: pos.isCall,
      isLong: pos.isLong,
      isSettled: pos.isSettled,
      isBaseCollateral: pos.collateral?.isBase,
      numTrades: pos.trades().length,
      avgCostPerOption: +pos.avgCostPerOption(),
      pricePerOption: +pos.pricePerOption,
      realizedPnl: +pos.realizedPnl(),
      realizedPnlPercent: +pos.realizedPnlPercent(),
      unrealizedPnl: +pos.unrealizedPnl(),
      unrealizedPnlPercent: +pos.unrealizedPnlPercent(),
    }));
  });

  return [data, isLoading];
};
