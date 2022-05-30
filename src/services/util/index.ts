import { useQuery } from "react-query";
import { useMemo } from "react";
import moment from "moment";
import { chain } from "lodash";
import { OptionsMap } from "../../types";

export const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(val);
// new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(val);

export const fetchEthPrice = (): Promise<number> =>
  fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd")
    .then((response) => response.json())
    .then(({ ethereum }) => ethereum.usd);

export const useEthPrice = () => {
  const { data: ethPrice = 0 } = useQuery("eth-price", fetchEthPrice);

  return ethPrice;
};

type Strikes = {
  allStrikes?: number[];
  callStrikes?: number[];
  putStrikes?: number[];
  basePrice?: number;
};

export const useStrikes = (): Strikes => {
  const basePrice = useEthPrice();
  // Call : 0.8x spot -> 2x spot
  // Put : 0.5x spot -> 1.2x spot
  return useMemo(() => {
    if (!basePrice) return {};

    const roundedBase = Math.floor(basePrice / 100) * 100;
    const callStart = Math.ceil((roundedBase * 0.8) / 100) * 100;
    const callEnd = roundedBase * 2;
    const putStart = Math.ceil(roundedBase / 2 / 100) * 100;
    const putEnd = Math.floor((roundedBase * 1.2) / 100) * 100;

    const callStrikes: number[] = [];
    const putStrikes: number[] = [];
    const allStrikes: number[] = [];

    for (let i = callStart; i <= callEnd; i += 100) callStrikes.push(i);
    for (let i = putStart; i <= putEnd; i += 100) putStrikes.push(i);
    for (let i = putStart; i <= callEnd; i += 100) allStrikes.push(i);

    return { allStrikes, callStrikes, putStrikes, basePrice };
  }, [basePrice]);
};

export const useExpirations = (deribitRates?: OptionsMap[]) => {
  const currentDate = moment(new Date());

  const deribitTerms = useMemo<[string, number][]>(
    () =>
      chain(deribitRates)
        .uniqBy("term")
        .sortBy("expiration")
        .filter(({ term, expiration }) => {
          const momentExpiration = moment(expiration);
          const monthsPathed = moment.duration(momentExpiration.diff(currentDate)).asMonths();

          return monthsPathed <= 3;
        })
        .map(
          ({ term, expiration }) => [term, +moment(expiration).set("hour", 8)] as [string, number]
        )
        .value(),
    [deribitRates?.length]
  );

  return [deribitTerms];
};
