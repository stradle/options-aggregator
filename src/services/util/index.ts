import { useQuery } from "react-query";
import { useMemo } from "react";
import moment from "moment";
import { chain } from "lodash";
import { STRIKE_CUTOFF } from "./constants";
import { OptionsMap } from "../../types";

export const formatCurrency = (val: number, maximumFractionDigits = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits,
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
    const callEnd = roundedBase * STRIKE_CUTOFF;
    const putStart = Math.ceil(roundedBase / STRIKE_CUTOFF / 100) * 100;
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

export const useExpirations = (deribitRates?: OptionsMap[], minDays = 0, maxMonths = 3) => {
  const currentDate = moment(new Date());

  const deribitTerms = useMemo<[string, number][]>(
    () =>
      chain(deribitRates)
        .uniqBy("term")
        .sortBy("expiration")
        .filter(({ term, expiration }) => {
          const momentExpiration = moment(expiration);
          const duration = moment.duration(momentExpiration.diff(currentDate));
          const monthsPassed = duration.asMonths();
          const daysPassed = duration.asDays();

          return monthsPassed <= maxMonths && daysPassed > minDays;
        })
        .map(
          ({ term, expiration }) => [term, +moment(expiration).set("hour", 8)] as [string, number]
        )
        .value(),
    [deribitRates?.length]
  );

  return [deribitTerms];
};
