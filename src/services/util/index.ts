import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import moment from "moment";
import { chain } from "lodash";
import { getAddress } from "@ethersproject/address";
import { APP_VERSION, STRIKE_CUTOFF } from "./constants";
import { useAppContext } from "../../context/AppContext";
import { OptionsMap, Underlying } from "../../types";

export const formatCurrency = (val: number, maximumFractionDigits = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits,
  }).format(val);

type UnderlyingResult = { price: number; change: number };

const fetchTokenPrice = (tokenId: string): Promise<UnderlyingResult> =>
  fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd&include_24hr_change=true`
  )
    .then((response) => response.json())
    .then((res) => {
      const { usd: price, usd_24h_change: change } = res[tokenId];

      return {
        price,
        change,
      };
    });

const TokenSymbolToId = {
  [Underlying.BTC]: "bitcoin",
  [Underlying.ETH]: "ethereum",
  ["OSQTH"]: "opyn-squeeth",
};
export const useTokenPrice = (tokenSymbol: Underlying | "OSQTH") => {
  const tokenId = TokenSymbolToId[tokenSymbol];
  const { data = { price: 0, change: 0 } } = useQuery(
    [`${tokenId}-price`],
    () => fetchTokenPrice(tokenId)
  );

  return data;
};

export type Strikes = {
  allStrikes?: number[];
  callStrikes?: number[];
  putStrikes?: number[];
  basePrice?: number;
};

const strikeRoundings = {
  [Underlying.BTC]: 1000,
  [Underlying.ETH]: 100,
};
export const useStrikes = (): Strikes => {
  const { underlying } = useAppContext();
  const { price: basePrice } = useTokenPrice(underlying);
  const rounding = strikeRoundings[underlying];
  // Call : 0.8x spot -> 2x spot
  // Put : 0.5x spot -> 1.2x spot
  return useMemo(() => {
    if (!basePrice) return {};

    const roundedBase = Math.floor(basePrice / rounding) * rounding;
    const callStart = Math.ceil((roundedBase * 0.9) / rounding) * rounding;
    const callEnd = roundedBase * STRIKE_CUTOFF;
    const putStart =
      Math.ceil(roundedBase / STRIKE_CUTOFF / rounding) * rounding;
    const putEnd = Math.floor((roundedBase * 1.1) / rounding) * rounding;

    const callStrikes: number[] = [];
    const putStrikes: number[] = [];
    const allStrikes: number[] = [];

    for (let i = callStart; i <= callEnd; i += rounding) callStrikes.push(i);
    for (let i = putStart; i <= putEnd; i += rounding) putStrikes.push(i);
    for (let i = putStart; i <= callEnd; i += rounding) allStrikes.push(i);

    return { allStrikes, callStrikes, putStrikes, basePrice };
  }, [basePrice]);
};

export const useExpirations = (
  baseRates?: OptionsMap[],
  minDays = 0,
  maxMonths = 3
) => {
  const currentDate = moment(new Date());

  return useMemo<[string, number][]>(
    () =>
      chain(baseRates)
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
          ({ term, expiration }) =>
            [term, +moment(expiration).set("hour", 8)] as [string, number]
        )
        .value(),
    [baseRates?.length]
  );
};

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
  try {
    return getAddress(value);
  } catch {
    return false;
  }
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address);
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`;
}

export const getExpirationTerm = (expiration: number) => {
  const term = moment(expiration).format("DDMMMYY").toUpperCase();

  return term.startsWith("0") ? term.slice(1) : term;
};

export const useCheckStorage = () => {
  const cacheKey = "cache-ver";

  useEffect(() => {
    const cur = localStorage.getItem(cacheKey);

    if (cur !== APP_VERSION) {
      localStorage.clear();
      localStorage.setItem(cacheKey, APP_VERSION);
    }
  }, []);
};
