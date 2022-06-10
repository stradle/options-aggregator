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
        gap: "0.5rem",
        width: "fit-content",
        cursor: "default",
        padding: "6px",
        fontWeight: 600,
      }}>
      <img width={"32px"} src={EthIcon} alt={"ETH icon"} />
      {formatCurrency(ethPrice)}
    </Paper>
  );
};

export default BasePriceWidget;
