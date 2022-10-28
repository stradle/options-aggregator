import { Outlet } from "react-router-dom";
import { Button, ButtonGroup, styled, Tooltip } from "@mui/material";
import { BasePriceWidget, Loader } from "../components";
import { useAppContext } from "../context/AppContext";
import { useRatesContext } from "../context/RatesProvider";
import { ConfigSection } from "./styled";
import { ProviderType, Underlying } from "../types";
import { useAccount } from "wagmi";
import { currencyProviders } from "../services/util/constants";

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
      {Object.values(Underlying).map((asset) =>
        asset === Underlying.SOL ? (
          <Tooltip key={asset} arrow title="Coming soon">
            <Button>{asset}</Button>
          </Tooltip>
        ) : (
          <Button
            key={asset}
            variant={asset === underlying ? "contained" : undefined}
            onClick={() => setUnderlying(asset)}
          >
            {asset}
          </Button>
        )
      )}
    </ButtonGroup>
  );
};

const Layout = () => {
  const rates = useRatesContext();
  const { underlying } = useAppContext();
  const showLoader = Object.entries(rates).some(
    ([provider, rates]) =>
      currencyProviders[underlying].includes(provider as ProviderType) && !rates
  );

  return (
    <LayoutBase>
      <ConfigSection>
        <BasePriceWidget />
        <AssetSelector />
      </ConfigSection>

      {showLoader ? <Loader /> : <Outlet />}
    </LayoutBase>
  );
};

export default Layout;
