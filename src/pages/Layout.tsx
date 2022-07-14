import styled from "styled-components";
import { Outlet } from "react-router-dom";
import { Autocomplete, Box, Button, ButtonGroup, Chip, TextField, Tooltip } from "@mui/material";
import { BasePriceWidget, Loader, ProviderIcon } from "../components";
import { useAppContext } from "../context/AppContext";
import { useRatesContext } from "../providers/RatesProvider";
import { ConfigSection } from "./styled";
import { Underlying, ProviderType } from "../types";

const LayoutBase = styled.div`
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
        asset === Underlying.BTC ? (
          <Tooltip key={asset} arrow title="Coming soon">
            <Button>{asset}</Button>
          </Tooltip>
        ) : (
          <Button
            key={asset}
            variant={asset === underlying ? "contained" : undefined}
            onClick={() => setUnderlying(asset)}>
            {asset}
          </Button>
        )
      )}
    </ButtonGroup>
  );
};

const ProviderSelector = () => {
  const { providers, setProviders } = useAppContext();

  return (
    <Autocomplete
      multiple
      disableClearable
      filterSelectedOptions
      options={Object.values(ProviderType).filter((prov) => prov !== ProviderType.HEGIC)}
      getOptionLabel={(option) => option}
      renderOption={(props, option) => (
        <Box component="li" sx={{ "& > svg": { mr: 2, flexShrink: 0 } }} {...props}>
          <ProviderIcon marginLeft={5} provider={option} />
          {option}
        </Box>
      )}
      renderInput={(params) => <TextField {...params} label="Markets" />}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            icon={<ProviderIcon marginLeft={5} provider={option} />}
            label={option}
            {...getTagProps({ index })}
            disabled={providers?.length === 2}
          />
        ))
      }
      onChange={(e, value) => setProviders(value)}
      value={providers}
    />
  );
};

const Layout = () => {
  const rates = useRatesContext();
  const showLoader = Object.values(rates).some((rates) => !rates);

  return (
    <LayoutBase>
      <ConfigSection>
        <BasePriceWidget />
        <AssetSelector />
        <ProviderSelector />
      </ConfigSection>

      {showLoader ? <Loader /> : <Outlet />}
    </LayoutBase>
  );
};

export default Layout;
