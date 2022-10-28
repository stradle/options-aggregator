import { JsonRpcProvider } from "@ethersproject/providers";

export const arbitrumProvider = new JsonRpcProvider(
  // { url: "https://rpc.ankr.com/arbitrum" },
  // { url: "https://arb1.arbitrum.io/rpc " },
  {
    url: "https://arb-mainnet.g.alchemy.com/v2/uR9wZQclcOYvdYp7gan5MWaAVsQQp8Ck",
  },
  42161
);

export const optimismProvider = new JsonRpcProvider(
  {
    url: "https://opt-mainnet.g.alchemy.com/v2/4KSYCs7fy2VjJhOg6vf3arkaEcKQL_0B",
  },
  // { url: "https://mainnet.optimism.io" },
  10
);
