import { Paper, Typography } from "@mui/material";
import { formatCurrency, useTokenPrice } from "../services/util";
import EthIcon from "../assets/ethereum-logo.png";
import BtcIcon from "../assets/bitcoin-logo.png";
import SolIcon from "../assets/solana-logo.png";
import { ColoredOptionType } from "./StyledTable";
import { useAppContext } from "../context/AppContext";
import { Underlying } from "../types";

const CurrencyIcon = {
  [Underlying.BTC]: BtcIcon,
  [Underlying.ETH]: EthIcon,
};

const BasePriceWidget = () => {
  const { underlying } = useAppContext();
  const { price, change } = useTokenPrice(underlying);

  return (
    <Paper
      elevation={3}
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "0.5rem",
        width: "fit-content",
        cursor: "default",
        padding: "6px",
      }}
    >
      <img
        width={"32px"}
        src={CurrencyIcon[underlying]}
        alt={"Currency icon"}
      />
      <Typography>{formatCurrency(price)}</Typography>
      <ColoredOptionType positive={change > 0}>
        {change.toFixed(1)}%
      </ColoredOptionType>
    </Paper>
  );
};

export default BasePriceWidget;
