import { configureChains, chain } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";

// API key for Ethereum node
// Two popular services are Infura (infura.io) and Alchemy (alchemy.com)
const infuraId = process.env.REACT_APP_INFURA_ID;

// Configure chains for connectors to support
export const { chains, provider } = configureChains(
  [chain.mainnet, chain.optimism, chain.arbitrum],
  [publicProvider()]
);

// Set up connectors
export const connectors = [
  new CoinbaseWalletConnector({
    chains,
    options: {
      appName: "stradle",
    },
  }),
  new WalletConnectConnector({
    chains,
    options: {
      infuraId,
      qrcode: true,
    },
  }),
  new MetaMaskConnector({
    chains,
  }),
];
