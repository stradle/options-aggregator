import Lyra, { Market } from "@lyrafinance/lyra-js";
import { useAccount } from "wagmi";
import { BigNumber } from "ethers";
import { useQuery } from "react-query";
import { useAppContext } from "../../context/AppContext";
import { getExpirationTerm } from "../../services/util";
import {
  ActivePosition,
  OptionsMap,
  OptionType,
  ProviderType,
} from "../../types";

const lyra = new Lyra();

const useLyraMarket = () => {
  const { underlying } = useAppContext();
  const { data: market } = useQuery(
    ["lyra-markets", underlying],
    () => lyra.market(underlying),
    { staleTime: Infinity }
  );

  return { market };
};

export const useLyraStrikeId = (strike: number, expiration: number) => {
  const { market } = useLyraMarket();
  const expirationDate = new Date(expiration).toDateString();
  const board = market
    ?.liveBoards()
    .find(
      (board) =>
        new Date(board.expiryTimestamp * 1000).toDateString() === expirationDate
    );

  return board?.strikes().find(({ strikePrice }) => {
    return strikePrice.div((1e18).toString()).toString() === strike.toString();
  });
};

const getMarketData = async (market: Market) => {
  // TODO: set global rate varibale for IV and greeks
  // const rate = market.__marketData.marketParameters.greekCacheParams.rateAndCarry ?? 5;
  const options = market.liveBoards().map((board) => {
    const expiration = board.expiryTimestamp * 1000;
    const term = getExpirationTerm(expiration);

    return board
      .strikes()
      .map<Promise<OptionsMap | undefined>>(async (strike) => {
        const strikePrice = parseFloat(strike.strikePrice.toString()) / 1e18;
        const one = BigNumber.from(10).pow(18);

        const quotes = await Promise.all([
          strike.quote(true, true, one),
          strike.quote(true, false, one),
          strike.quote(false, true, one),
          strike.quote(false, false, one),
        ]);
        const [callBuyPrice, callSellPrice, putBuyPrice, putSellPrice] =
          quotes.map(
            (quote) => parseFloat(quote.pricePerOption.toString()) / 1e18
          );
        if (
          [callBuyPrice, callSellPrice, putBuyPrice, putSellPrice].every(
            (val) => !val
          )
        )
          return;

        const instrumentMeta = {
          strike: strikePrice,
          term,
          expiration,
          provider: ProviderType.LYRA,
        };

        return {
          ...instrumentMeta,
          [OptionType.CALL]: {
            ...instrumentMeta,
            type: OptionType.CALL,
            askPrice: callBuyPrice,
            bidPrice: callSellPrice,
            midPrice: (callBuyPrice + callSellPrice) / 2,
          },
          [OptionType.PUT]: {
            ...instrumentMeta,
            type: OptionType.PUT,
            askPrice: putBuyPrice,
            bidPrice: putSellPrice,
            midPrice: (putBuyPrice + putSellPrice) / 2,
          },
        };
      });
  });
  return (await Promise.all(options?.flat()).catch(console.error))?.filter(
    Boolean
  ) as OptionsMap[];
};

export const useLyraRates: () => [undefined | OptionsMap[], boolean] = () => {
  const { market } = useLyraMarket();
  const { data, isLoading } = useQuery(
    ["lyra", market?.address],
    () => market && getMarketData(market),
    {
      refetchInterval: 30000,
    }
  );

  return [data, isLoading];
};

export const useLyraPositions = (
  isOpen = true
): [ActivePosition[], boolean] => {
  const { address } = useAccount();

  const { data = [], isLoading } = useQuery(
    ["lyra-positions", address],
    async () => {
      console.log("fetching lyra positions", address);
      if (!address) return [];
      const positions = isOpen
        ? await lyra.openPositions(address)
        : await lyra.positions(address);

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
    },
    { refetchInterval: 30000 }
  );

  return [data, isLoading];
};
