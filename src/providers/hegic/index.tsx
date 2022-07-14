import { BigNumber, Contract } from "ethers";
import { useQuery } from "react-query";
import moment from "moment";
import { formatUnits } from "ethers/lib/utils";
import { useEthPrice, useExpirations } from "../../services/util";
import { arbitrumProvider } from "../providers";
import hegicAbi from "./abi.json";
import contracts from "./contracts";
import { OptionsMap, OptionType, ProviderType } from "../../types";

const getContractName = (offset: number, type: OptionType) => {
  let contractName = "HegicStrategy";

  contractName += `OTM_${type}_${offset}`;
  contractName += "_ETH";

  return contractName;
};

const getContractByStrike = (offset: number, type: OptionType) => {
  const contractName = getContractName(offset, type);
  const contractAddress = contracts[contractName];

  if (!contractAddress) debugger;
  return new Contract(contractAddress, hegicAbi, arbitrumProvider);
};

const currentDate = moment();

const reqOption = async (offset: number, strike: number, expiration: number, type: OptionType) => {
  const left = moment.duration(moment(expiration).diff(currentDate)).asSeconds().toFixed(0);
  const contract = getContractByStrike(offset, type);
  const res = await contract
    .calculatePremium(left, (1e18).toString(), strike * 1e8)
    // usdc 6 decimals
    .then(({ premium }: { premium: BigNumber }) => formatUnits(premium, "mwei"))
    .catch(console.error);

  return res;
};

const getRoundedStrikeByEth = (eth: number) => (offset: number) => {
  return [offset, Math.round(((offset / 100) * eth) / 50) * 50];
};

export const useHegicRates = (lyraRates?: OptionsMap[]): [OptionsMap[] | undefined] => {
  const { price } = useEthPrice();
  const [expirations] = useExpirations(lyraRates, 7, 2);
  const getRoundedStrike = getRoundedStrikeByEth(price);

  const callOffsets = [110, 120, 130].map(getRoundedStrike);
  const putOffsets = [90, 80, 70].map(getRoundedStrike);

  const fetchPrices = async () => {
    const requests = expirations.map(([term, exp]) => [
      ...callOffsets.map(async ([offset, strike]) => ({
        provider: ProviderType.HEGIC,
        expiration: exp,
        term,
        strike: strike.toString(),
        options: {
          [OptionType.CALL]: {
            type: OptionType.CALL,
            askPrice: await reqOption(offset, strike, exp, OptionType.CALL),
          },
        },
      })),
      ...putOffsets.map(async ([offset, strike]) => ({
        provider: ProviderType.HEGIC,
        expiration: exp,
        term,
        strike: strike.toString(),
        options: {
          [OptionType.PUT]: {
            type: OptionType.PUT,
            askPrice: await reqOption(offset, strike, exp, OptionType.PUT),
          },
        },
      })),
    ]);
    // @ts-ignore
    return Promise.all(requests.flat());
  };

  const { data } = useQuery(["hegic-prices", expirations.length], fetchPrices, {
    staleTime: 600 * 1000,
  });
  // @ts-ignore
  return [data];
};
