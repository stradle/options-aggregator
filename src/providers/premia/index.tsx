import { useQuery } from "@tanstack/react-query";
import { BigNumber, Contract } from "ethers";
import { Strikes, useExpirations, useStrikes } from "../../services/util";
import { fixedFromFloat, fixedToNumber } from "../../services/util/fixedMath";
import premiaPoolAbi from "./premiaPoolAbi.json";
import { arbitrumProvider, optimismProvider } from "../providers";
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

const PREMIA_ARBITRUM = "0xE5DbC4EDf467B609A063c7ea7fAb976C6b9BAa1a";
const PREMIA_OPTIMISM = "0x9623BF820A0B9Db26aFF216fCfBc119c92D3Cd96";

const arbEthPoolContract = new Contract(
  PREMIA_ARBITRUM,
  premiaPoolAbi,
  arbitrumProvider
);
const opEthPoolContract = new Contract(
  PREMIA_OPTIMISM,
  premiaPoolAbi,
  optimismProvider
);

const convertPrice = ([price, fee]: [price: BigNumber, fee: BigNumber]) =>
  fixedToNumber(price) + fixedToNumber(fee);

const reqOption = async (strike: number, expiration: number, call: boolean) => {
  const expSecs = Math.floor(expiration / 1000);

  return opEthPoolContract
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

const fetchPrices = async (
  { callStrikes, putStrikes, allStrikes, basePrice }: Strikes,
  expirations: [string, number][]
) => {
  if (!(callStrikes && putStrikes && allStrikes && basePrice)) return undefined;
  const toEth = (val: number) => basePrice * val;

  const requests = expirations.map(([term, exp]) =>
    allStrikes.map(async (strike) => {
      const instrumentMeta = {
        provider: ProviderType.PREMIA,
        expiration: exp,
        term,
        strike: strike.toString(),
      };

      return {
        ...instrumentMeta,
        [OptionType.CALL]: callStrikes.includes(strike)
          ? {
              ...instrumentMeta,
              type: OptionType.CALL,
              askPrice: await reqOption(strike, exp, true).then(toEth),
            }
          : undefined,
        [OptionType.PUT]: putStrikes.includes(strike)
          ? {
              ...instrumentMeta,
              type: OptionType.PUT,
              askPrice: await reqOption(strike, exp, false),
            }
          : undefined,
      };
    })
  );
  // @ts-ignore
  return Promise.all(requests.flat());
};

export const usePremiaRates = (
  lyraRates?: OptionsMap[]
): [OptionsMap[] | undefined] => {
  const expirations = useExpirations(lyraRates, 1);
  const strikes = useStrikes();

  const { data } = useQuery(
    ["premia-prices", expirations.length, strikes.allStrikes?.length],
    () => fetchPrices(strikes, expirations),
    {
      staleTime: 600 * 1000,
      enabled: Boolean(
        strikes.allStrikes?.length && strikes.basePrice && expirations.length
      ),
    }
  );
  // @ts-ignore
  return [data];
};
