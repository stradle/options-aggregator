import moment  from "moment";
import premiaPoolAbi from "./premiaPoolAbi.json";
import { JsonRpcProvider } from "@ethersproject/providers";
import { BigNumber, Contract } from "ethers";
import { fetchEthPrice } from "../../util";
import { useQuery } from "react-query";
import { createContext, useContext, useMemo } from "react";
import { fixedFromFloat, fixedToNumber } from "../../util/fixedMath";
import { chain } from "lodash";
import { OptionsMap, OptionType, ProviderType } from "../../types";

// const getFriday = () => {
//   return moment().isoWeekday(5).utc().set("hour", 8).set("minutes", 0);
// };

const provider = new JsonRpcProvider(
  // { url: "https://rpc.ankr.com/arbitrum" },
  { url: "https://arb1.arbitrum.io/rpc " },
  42161
);
// function quote(
//     address feePayer,
//     uint64 maturity,
//     int128 strike64x64,
//     uint256 contractSize,
//     bool isCall
// ) :
// returns (
//     int128 baseCost64x64,
//     int128 feeCost64x64,
//     int128 cLevel64x64,
//     int128 slippageCoefficient64x64
// );

// const lastFriday = (moment: Moment) => {
//   const lastDay = moment.endOf("month");
//   let sub = lastDay.day() + 2;
//
//   if (lastDay.day() >= 5) sub = lastDay.day() - 5;
//
//   return lastDay.subtract(sub, "days");
// };

const convertTermToTimestamp = (term: string): [string, number] => [
  term,
  +moment(term, "DDMMMYY").set("hour", 8).set("minutes", 0),
];

const ethPoolContract = new Contract(
  "0xE5DbC4EDf467B609A063c7ea7fAb976C6b9BAa1a",
  premiaPoolAbi,
  provider
);

const convertPrice = ([price, fee]: [price: BigNumber, fee: BigNumber]) => {
  const fixed = fixedToNumber(price) + fixedToNumber(fee);

  console.log(
    fixedToNumber(price),
    fixedToNumber(fee),
    fixedToNumber(price) + fixedToNumber(fee)
  );

  return fixed;
};
const reqOption = (strike: number, expiration: number, call: boolean) => {
  const expSecs = Math.floor(expiration / 1000);

  return ethPoolContract
    .quote(
      "0x0000000000000000000000000000000000000000",
      BigNumber.from(expSecs),
      fixedFromFloat(strike),
      "1000000000000000000",
      call
    )
    .then(convertPrice)
    .catch(console.error);
};

const getPrices = async (deribitTerms: string[]): Promise<OptionsMap[]> => {
  const currentDate = moment(new Date());
  const expirations = deribitTerms
    .map(convertTermToTimestamp)
    .filter(([term, duration]) => {
      // moment.duration(end.diff(startTime));

      const monthsPathed = moment
        .duration(moment(duration).diff(currentDate))
        .asMonths();

      return monthsPathed <= 3;
    });

  const ethPrice = await fetchEthPrice();
  // Call : 0.8x spot -> 2x spot
  // Put : 0.5x spot -> 1.2x spot
  const roundedBase = Math.floor(ethPrice / 100) * 100;
  const callStart = Math.ceil((roundedBase * 0.8) / 100) * 100;
  const callEnd = roundedBase * 1.5;
  const putStart = roundedBase / 1.5;
  const putEnd = Math.floor((roundedBase * 1.2) / 100) * 100;

  const calls: number[] = [];
  const puts: number[] = [];
  const allStrikes: number[] = [];

  for (let i = callStart; i <= callEnd; i += 100) calls.push(i);
  for (let i = putStart; i <= putEnd; i += 100) puts.push(i);
  for (let i = putStart; i <= callEnd; i += 100) allStrikes.push(i);

  const toEth = (val: number) => ethPrice * val;

  const requests = expirations.map(([term, exp]) =>
    allStrikes.map(async (strike) => ({
      provider: ProviderType.PREMIA,
      expiration: exp,
      term,
      strike: strike.toString(),
      options: {
        [OptionType.CALL]: calls.includes(strike)
          ? {
              type: OptionType.CALL,
              bidPrice: await reqOption(strike, exp, true).then(toEth),
            }
          : undefined,
        [OptionType.PUT]: puts.includes(strike)
          ? {
              type: OptionType.PUT,
              bidPrice: await reqOption(strike, exp, false),
            }
          : undefined,
      },
    }))
  );

  // @ts-ignore
  const res = await Promise.all(requests.flat());

  console.log(res);
  // @ts-ignore

  return res;
};

const PremiaContext = createContext<OptionsMap[] | null>(null);
export const usePremiaContext = () => {
  return useContext(PremiaContext);
};

const fetchPrices = ({ queryKey }: { queryKey: (string | string[])[] }) =>
  queryKey[1]?.length ? getPrices(queryKey[1] as string[]) : undefined;

export const usePremiaRates = (deribitData: OptionsMap[]) => {
  const deribitTerms = useMemo(
    () =>
      chain(deribitData)
        .uniqBy("term")
        .sortBy("expiration")
        .map("term")
        .value(),
    [deribitData?.length]
  );

  const { data } = useQuery(["premia-prices", deribitTerms], fetchPrices, {
    staleTime: 60000,
  });

  return [data];
};
