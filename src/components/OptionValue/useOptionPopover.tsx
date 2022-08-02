import { useState } from "react";
import { Card, Popover, styled, Typography, Link } from "@mui/material";
import moment from "moment";
// import { Link } from "react-router-dom";
import { capitalize } from "lodash";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { formatCurrency, useEthPrice } from "../../services/util";
import { getImpliedVolatility } from "../../services/util/implied-volatility";
import { ColoredOptionType, ProviderIcon } from "../index";
import { getUrlByProvider } from "../../services/util/constants";
import { BuySellModes, DealsFields, Instrument, OptionType } from "../../types";

const Row = styled("div")`
  display: flex;
  padding: 1px 0;
`;

const SpacedRow = styled(Row)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Cell = styled("div")({
  flex: 1,
  padding: "0 3px",
  whiteSpace: "nowrap",
});

const StyledCard = styled(Card)(({ theme }) => ({
  padding: "5px",
  display: "flex",
  flexDirection: "column",
  color: theme.palette.text.secondary,
}));

const getIV = (
  price: number,
  instrument: Instrument,
  dealMode: BuySellModes
) => {
  const momentExp = moment(instrument.expiration);
  const duration = moment.duration(momentExp.diff(moment())).asYears();
  const instrumentPrice = instrument?.[DealsFields[dealMode]];

  const iv =
    instrumentPrice &&
    getImpliedVolatility(
      instrumentPrice,
      price,
      instrument.strike,
      duration,
      instrument.type
    ) * 100;

  if (!iv) return null;

  return iv > 500 ? ">500" : iv.toFixed();
};

export const OptionPopover = ({
  anchorEl,
  handleClose,
  instrument,
}: {
  anchorEl: Element;
  handleClose: () => void;
  instrument: Instrument;
}) => {
  const { price } = useEthPrice();
  const buyIv = getIV(price, instrument, BuySellModes.BUY);
  const sellIv = getIV(price, instrument, BuySellModes.SELL);

  return (
    <Popover
      id={"select-el"}
      open
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
    >
      {
        <StyledCard>
          <SpacedRow>
            <Typography
              width={"100%"}
              fontWeight={500}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: ".2rem",
              }}
            >
              <ProviderIcon provider={instrument.provider} />
              {capitalize(instrument.provider)}
            </Typography>
            <Link href={getUrlByProvider(instrument.provider)} color="inherit">
              <OpenInNewIcon
                sx={{ height: "15px", width: "15px" }}
                color={"action"}
              />
            </Link>
          </SpacedRow>
          <SpacedRow>
            <Cell>
              {" "}
              <div>{formatCurrency(instrument.strike)}</div>
            </Cell>
            <Cell>
              {" "}
              <ColoredOptionType positive={instrument.type === OptionType.CALL}>
                {instrument.type}
              </ColoredOptionType>
            </Cell>
            <Cell>
              {" "}
              <div>{instrument.term}</div>
            </Cell>
          </SpacedRow>

          {instrument?.askPrice && (
            <Row>
              <Cell>
                <ColoredOptionType positive>BUY:</ColoredOptionType>
              </Cell>
              <Cell>{formatCurrency(instrument.askPrice, 2)}</Cell>
              <Cell>{buyIv}%</Cell>
            </Row>
          )}
          {instrument?.bidPrice && (
            <Row>
              <Cell>
                <ColoredOptionType>SELL:</ColoredOptionType>
              </Cell>
              <Cell>{formatCurrency(instrument.bidPrice, 2)}</Cell>
              <Cell>{sellIv}%</Cell>
            </Row>
          )}
        </StyledCard>
      }
    </Popover>
  );
};

const useOptionPopover = () => {
  const [selected, setSelected] = useState<{
    instrument: Instrument | null;
    anchorEl: Element | null;
  }>({ instrument: null, anchorEl: null });

  const handleOpen = (event: React.MouseEvent, instrument: Instrument) => {
    setSelected({ anchorEl: event.currentTarget, instrument });
  };
  const handleClose = () => {
    setSelected({ instrument: null, anchorEl: null });
  };

  const popover = selected.anchorEl && selected.instrument && (
    <OptionPopover
      anchorEl={selected.anchorEl}
      handleClose={handleClose}
      instrument={selected.instrument}
    />
  );

  return { handleOpen, popover };
};

export default useOptionPopover;
