import { Paper } from "@mui/material";
import { formatCurrency, useEthPrice } from "../services/util";
import EthIcon from "../assets/ethereum-logo.png";

const BasePriceWidget = () => {
  const ethPrice = useEthPrice();

  return (
    <Paper
      elevation={3}
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: "0 0.5rem",
        gap: "0.5rem",
        width: "fit-content",
        cursor: "default",
      }}>
      <img width={"48px"} height={"48px"} src={EthIcon} alt={"ETH icon"} />
      <h4>{formatCurrency(ethPrice)}</h4>
    </Paper>
  );
};

export default BasePriceWidget;
