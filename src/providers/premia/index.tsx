import { useQuery } from "react-query";
import { BigNumber, Contract } from "ethers";
import { useExpirations, useStrikes } from "../../services/util";
import { fixedFromFloat, fixedToNumber } from "../../services/util/fixedMath";
import premiaPoolAbi from "./premiaPoolAbi.json";
import { arbitrumProvider } from "../providers";
import { OptionsMap, OptionType, ProviderType } from "../../types";

// const getFriday = () => {
//   return moment().isoWeekday(5).utc().set("hour", 8).set("minutes", 0);
// };

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

const ethPoolContract = new Contract(
  "0xE5DbC4EDf467B609A063c7ea7fAb976C6b9BAa1a",
  premiaPoolAbi,
  arbitrumProvider
);

const convertPrice = ([price, fee]: [price: BigNumber, fee: BigNumber]) =>
  fixedToNumber(price) + fixedToNumber(fee);

const reqOption = async (strike: number, expiration: number, call: boolean) => {
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

export const usePremiaRates = (lyraRates?: OptionsMap[]): [OptionsMap[] | undefined] => {
  const [expirations] = useExpirations(lyraRates, 1);
  const { allStrikes = [], callStrikes = [], putStrikes = [], basePrice = 0 } = useStrikes();
  const toEth = (val: number) => basePrice * val;
  const fetchPrices = async () => {
    if (!(callStrikes && putStrikes && allStrikes)) return undefined;

    const requests = expirations.map(([term, exp]) =>
      allStrikes.map(async (strike) => ({
        provider: ProviderType.PREMIA,
        expiration: exp,
        term,
        strike: strike.toString(),
        options: {
          [OptionType.CALL]: callStrikes.includes(strike)
            ? {
                type: OptionType.CALL,
                askPrice: await reqOption(strike, exp, true).then(toEth),
              }
            : undefined,
          [OptionType.PUT]: putStrikes.includes(strike)
            ? {
                type: OptionType.PUT,
                askPrice: await reqOption(strike, exp, false),
              }
            : undefined,
        },
      }))
    );
    // @ts-ignore
    return Promise.all(requests.flat());
  };

  const { data } = useQuery(["premia-prices", expirations], fetchPrices, {
    staleTime: 600 * 1000,
  });
  // @ts-ignore
  return [data];
};
