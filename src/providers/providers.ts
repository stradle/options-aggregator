import { JsonRpcProvider } from "@ethersproject/providers";

export const arbitrumProvider = new JsonRpcProvider(
  { url: "https://rpc.ankr.com/arbitrum" },
  // { url: "https://arb1.arbitrum.io/rpc " },
  42161
);

export const optimismProvider = new JsonRpcProvider(
  { url: "https://mainnet.optimism.io" },
  10
);
