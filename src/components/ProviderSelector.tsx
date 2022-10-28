import { useCallback } from "react";
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { useAppContext } from "../context/AppContext";
import { ProviderIcon } from "./ProviderIcon";
import { ProviderType } from "../types";
import { currencyProviders } from "../services/util/constants";

const ProviderSelector = () => {
  const { providers, setProviders, underlying } = useAppContext();

  const handleChange = useCallback(
    (event: SelectChangeEvent<ProviderType[]>) => {
      const {
        target: { value },
      } = event;
      setProviders(
        // On autofill we get a stringified value.
        (typeof value === "string" ? value.split(",") : value) as ProviderType[]
      );
    },
    [setProviders]
  );

  return (
    <FormControl>
      <InputLabel id="providers">Markets</InputLabel>
      <Select
        labelId="providers"
        id="providers"
        sx={{ width: "fit-content" }}
        multiple
        input={<OutlinedInput label="Markets" />}
        renderValue={(selected) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {selected.map((option) => (
              <Chip
                key={option}
                icon={<ProviderIcon marginLeft={5} provider={option} />}
                label={option}
                disabled={providers?.length === 2}
              />
            ))}
          </Box>
        )}
        onChange={handleChange}
        value={providers}
      >
        {currencyProviders[underlying].map((item) => (
          <MenuItem
            disabled={providers.includes(item) && providers.length <= 2}
            key={item}
            value={item}
          >
            <ProviderIcon marginLeft={5} provider={item} />
            <Typography pl={"5px"}>{item}</Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
export default ProviderSelector;
