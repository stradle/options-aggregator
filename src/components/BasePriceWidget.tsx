import { Paper, Typography } from "@mui/material";
import { formatCurrency, useEthPrice } from "../services/util";
import EthIcon from "../assets/ethereum-logo.png";
import { ColoredOptionType } from "./StyledTable";

const BasePriceWidget = () => {
  const { price, change } = useEthPrice();

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
      }}>
      <img width={"32px"} src={EthIcon} alt={"ETH icon"} />
      <Typography>{formatCurrency(price)}</Typography>
      <ColoredOptionType positive={change > 0}>{change.toFixed(1)}%</ColoredOptionType>
    </Paper>
  );
};

export default BasePriceWidget;
