import { alpha, Button, styled } from "@mui/material";
import useOptionPopover from "./useOptionPopover";
import { ColoredOptionType } from "../StyledTable";
import { formatCurrency } from "../../services/util";
import { ProviderIcon } from "../ProviderIcon";
import { BuySellModes, DealsFields, Instrument, OptionType } from "../../types";
import {MouseEventHandler} from "react";

const StyledOptionValue = styled(Button)<{
  highlight?: boolean;
  type?: OptionType;
}>(({ highlight, theme }) => ({
  padding: "2px 5px",
  minWidth: 0,
  border: highlight ? "1px solid" : "",
  borderColor: theme.palette.divider,
  backgroundColor: highlight
    ? alpha(theme.palette.text.primary, theme.palette.action.focusOpacity)
    : "",
}));

const OptionValue = ({
  dealMode,
  instrument,
  highlight,
  detailed,
}: {
  dealMode: BuySellModes;
  instrument?: Instrument;
  highlight?: boolean;
  detailed?: boolean;
}) => {
  const { popover, handleOpen } = useOptionPopover();
  const instrumentPrice = instrument?.[DealsFields[dealMode]];

  if (!instrumentPrice) return <div style={{ flex: 1 }} />;

  const price = formatCurrency(instrumentPrice, detailed ? 2 : 0);

  return (
    <>
      {popover}
      <StyledOptionValue
        highlight={highlight}
        onClick={(e) => handleOpen(e, instrument)}
      >
        {detailed ? (
          price
        ) : (
          <ColoredOptionType positive={instrument.type === OptionType.CALL}>
            {price}
          </ColoredOptionType>
        )}
        {detailed && (
          <ProviderIcon marginLeft={5} provider={instrument.provider} />
        )}
      </StyledOptionValue>
    </>
  );
};

export default OptionValue;
