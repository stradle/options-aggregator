import { configureChains, chain } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";

const apiKey = process.env.REACT_APP_ALCHEMY_KEY;

export const { chains, provider } = configureChains(
  [chain.optimism, chain.arbitrum, chain.mainnet],
  [alchemyProvider({ apiKey })]
);
