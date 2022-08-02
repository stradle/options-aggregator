import { configureChains, chain } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import {getDefaultWallets} from "@rainbow-me/rainbowkit";

// API key for Ethereum node
// Two popular services are Infura (infura.io) and Alchemy (alchemy.com)
const infuraId = process.env.REACT_APP_INFURA_ID;

// Configure chains for connectors to support
export const { chains, provider } = configureChains(
  [chain.mainnet, chain.optimism, chain.arbitrum],
  [publicProvider()]
);

// Set up connectors
export const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains
});

