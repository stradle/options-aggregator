import {
  Contract,
  ContractCall,
  Provider,
  setMulticallAddress,
} from "ethers-multicall";
import { useQuery } from "@tanstack/react-query";
import { BigNumber } from "ethers";
import { Strikes, useExpirations, useStrikes } from "../../services/util";
import { fixedFromFloat, fixedToNumber } from "../../services/util/fixedMath";
import premiaPoolAbi from "./premiaPoolAbi.json";
import { arbitrumProvider, optimismProvider } from "../providers";
import { useAppContext } from "../../context/AppContext";
import { CHAINS } from "../../services/util/constants";
import { OptionsMap, OptionType, ProviderType, Underlying } from "../../types";

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

const OP_MULTICALL = "0x7cbc68dc836e05833cf88b6676715db805b5c0a2";
// lib has no integrated OP support
setMulticallAddress(10, OP_MULTICALL);

const chainPremiaProvider = {
  [CHAINS.OP]: ProviderType.PREMIA_OP,
  [CHAINS.ARB]: ProviderType.PREMIA_ARB,
};

const currencyChainAddress = {
  [`${Underlying.ETH}_${CHAINS.ARB}`]:
    "0xE5DbC4EDf467B609A063c7ea7fAb976C6b9BAa1a",
  [`${Underlying.BTC}_${CHAINS.ARB}`]:
    "0xb5fE3bc2eF4c34cC233922dfF2Fcb1B1BF89A38E",
  [`${Underlying.ETH}_${CHAINS.OP}`]:
    "0x9623BF820A0B9Db26aFF216fCfBc119c92D3Cd96",
};
const chainsProviders = {
  [CHAINS.ARB]: new Provider(arbitrumProvider, 42161),
  [CHAINS.OP]: new Provider(optimismProvider, 10),
};
const currenciesAmount = {
  [Underlying.ETH]: (1e18).toString(), // 1 ETH
  [Underlying.BTC]: 1e7, // 0.1 BTC
};

const getContract = (currency: Underlying, chain: CHAINS) => {
  return new Contract(
    currencyChainAddress[`${currency}_${chain}`],
    premiaPoolAbi
  );
};

const convertPrice = ([price, fee]: [price: BigNumber, fee: BigNumber]) =>
  fixedToNumber(price) + fixedToNumber(fee);

const getRequester = (currency: Underlying, chain: CHAINS) => {
  const contract = getContract(currency, chain);
  const amount = currenciesAmount[currency];

  return (strike: number, expiration: number, call: boolean) => {
    const expSecs = Math.floor(expiration / 1000);

    return contract.quote(
      "0x0000000000000000000000000000000000000000",
      BigNumber.from(expSecs),
      fixedFromFloat(strike),
      amount,
      call
    );
    // .then(convertPrice)
    // .then((val: number) => (currency === Underlying.BTC ? val * 10 : val))
    // .catch(console.error);
  };
};

const fetchPrices = async (
  { callStrikes, putStrikes, allStrikes, basePrice }: Strikes,
  expirations: [string, number][],
  currency: Underlying,
  chain: CHAINS
) => {
  if (!(callStrikes && putStrikes && allStrikes && basePrice)) return undefined;
  const toUsd = (val: number) => basePrice * val;
  const request = getRequester(currency, chain);
  const multicallProvider = chainsProviders[chain];

  const calls: ContractCall[] = [];
  const puts: ContractCall[] = [];

  expirations.forEach(([term, exp]) => {
    callStrikes.forEach((strike) => calls.push(request(strike, exp, true)));
    putStrikes.forEach((strike) => puts.push(request(strike, exp, false)));
  });

  const [callsRes, putsRes] = await Promise.all([
    multicallProvider.all(calls),
    multicallProvider.all(puts),
  ]).catch((e) => {
    console.log(e);
    return [];
  });

  const getRate = (strike: number, index: number, isCall = false) => {
    const strikes = isCall ? callStrikes : putStrikes;
    const found = strikes.indexOf(strike);

    if (found === -1) return;

    // @ts-ignore
    const price = (isCall ? callsRes : putsRes)[index * strikes.length + found];
    let converted = convertPrice(price);

    // multiply since we request 0.1 btc price
    if (currency === Underlying.BTC) converted *= 10;

    return converted;
  };

  return expirations.reduce<OptionsMap[]>((acc, [term, expiration], index) => {
    allStrikes.forEach((strike) => {
      const callRate = getRate(strike, index, true);
      const putRate = getRate(strike, index);
      if (!callRate && !putRate) return;

      const instrumentMeta = {
        provider: chainPremiaProvider[chain],
        expiration,
        term,
        strike,
      };

      acc.push({
        ...instrumentMeta,
        [OptionType.CALL]:
          typeof callRate === "number"
            ? {
                ...instrumentMeta,
                type: OptionType.CALL,
                askPrice: toUsd(callRate),
              }
            : undefined,
        [OptionType.PUT]: putStrikes.includes(strike)
          ? {
              ...instrumentMeta,
              type: OptionType.PUT,
              askPrice: putRate,
            }
          : undefined,
      });
    });

    return acc;
  }, []);
};

const isAssetSupported = (chain: CHAINS, currency: Underlying) => {
  if (chain === CHAINS.ARB) return true;
  return chain === CHAINS.OP && currency === Underlying.ETH;
};

export const usePremiaRates = (
  chain: CHAINS,
  lyraRates?: OptionsMap[]
): [undefined | OptionsMap[], boolean] => {
  const expirations = useExpirations(lyraRates, 1);
  const strikes = useStrikes();
  const { underlying } = useAppContext();
  const { data, isFetching } = useQuery(
    [
      "premia-prices",
      expirations.length,
      strikes.allStrikes?.length,
      underlying,
      chain,
    ],
    () => fetchPrices(strikes, expirations, underlying, chain),
    {
      staleTime: 600 * 1000,
      enabled: Boolean(
        strikes.allStrikes?.length &&
          strikes.basePrice &&
          expirations.length &&
          isAssetSupported(chain, underlying)
      ),
    }
  );

  return [data, isFetching];
};
