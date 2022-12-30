import { Outlet } from "react-router-dom";
import {
  Button,
  ButtonGroup,
  Paper,
  styled,
  Tooltip,
  Typography,
} from "@mui/material";
import { useAppContext } from "../context/AppContext";
import { useRatesContext } from "../context/RatesProvider";
import { currencyProviders } from "../services/util/constants";
import { BasePriceWidget, Loader, ProviderIcon } from "../components";
import { ConfigSection } from "./styled";
import { ProviderType, Underlying } from "../types";

const LayoutBase = styled("div")`
  max-width: 1120px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
`;

const AssetSelector = () => {
  const { underlying, setUnderlying } = useAppContext();

  return (
    <ButtonGroup variant="outlined">
      {Object.values(Underlying).map((asset) => (
        <Button
          key={asset}
          variant={asset === underlying ? "contained" : undefined}
          onClick={() => setUnderlying(asset)}
        >
          {asset}
        </Button>
      ))}
    </ButtonGroup>
  );
};
const DeribitRef = () => (
  <Paper
    component={"a"}
    href={"https://www.deribit.com/?reg=16926.1697"}
    style={{
      padding: "6px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      textDecoration: "none",
    }}
  >
    <ProviderIcon height={32} provider={ProviderType.DERIBIT} />
    <div>
      <span style={{ whiteSpace: "nowrap" }}>
        Sign Up To{" "}
        <Typography
          component={"span"}
          fontWeight={600}
          color={"rgb(45, 174, 154)"}
        >
          DERIBIT
        </Typography>
      </span>
      <Typography>
        and get{" "}
        <Typography component={"span"} fontWeight={600}>
          10%
        </Typography>{" "}
        discount on fees
      </Typography>
    </div>
  </Paper>
);

const Layout = () => {
  const rates = useRatesContext();
  const { underlying } = useAppContext();
  const showLoader = Object.entries(rates).some(
    ([provider, rates]) =>
      currencyProviders[underlying].includes(provider as ProviderType) && !rates
  );

  return (
    <LayoutBase>
      <ConfigSection style={{ justifyContent: "space-between" }}>
        <ConfigSection>
          <BasePriceWidget />
          <AssetSelector />
        </ConfigSection>
        <DeribitRef />
      </ConfigSection>

      {showLoader ? <Loader /> : <Outlet />}
    </LayoutBase>
  );
};

export default Layout;
