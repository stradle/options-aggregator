import { useQuery } from "react-query";

export const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "USD" }).format(
    val
  );
// new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(val);

export const fetchEthPrice = () =>
  fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
  )
    .then((response) => response.json())
    .then(({ ethereum }) => ethereum.usd);

export const useEthPrice = () => {
  const { data: ethPrice = 0 } = useQuery("eth-price", fetchEthPrice);

  return ethPrice;
};
