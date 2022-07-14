import { Autocomplete, Box, Chip, TextField } from "@mui/material";
import { useAppContext } from "../context/AppContext";
import { ProviderIcon } from "./ProviderIcon";
import { ProviderType } from "../types";

const ProviderSelector = () => {
  const { providers, setProviders } = useAppContext();

  return (
    <Autocomplete
      sx={{ width: "fit-content" }}
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
export default ProviderSelector;
