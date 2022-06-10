import { Paper } from "@mui/material";
import { formatCurrency, useEthPrice } from "../services/util";
import EthIcon from "../assets/ethereum-logo.png";
import { ColoredOptionType } from "./StyledTable";
import { OptionType } from "../types";

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
      <div style={{ fontWeight: 600 }}>{formatCurrency(price)}</div>
      <ColoredOptionType
        style={{ fontSize: "14px" }}
        type={change < 0 ? OptionType.PUT : OptionType.CALL}>
        {change.toFixed(2)}%
      </ColoredOptionType>
    </Paper>
  );
};

export default BasePriceWidget;
