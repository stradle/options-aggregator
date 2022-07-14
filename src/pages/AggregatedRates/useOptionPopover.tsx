import { useState } from "react";
import { Card, Popover, styled, Typography } from "@mui/material";
import moment from "moment";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { formatCurrency, useEthPrice } from "../../services/util";
import { getImpliedVolatility } from "../../services/util/implied-volatility";
import { ColoredOptionType, ProviderIcon } from "../../components";
import { OptionsMap, OptionType } from "../../types";
import { getUrlByProvider } from "../../services/util/constants";
import { Link } from "react-router-dom";
import { capitalize } from "lodash";

const Row = styled("div")({
  display: "flex",
});

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

const useVolatility = (price: number, option?: OptionsMap) => {
  const momentExp = moment(option?.expiration);
  const duration = moment.duration(momentExp.diff(moment())).asYears();

  const callVolatility =
    option?.options.CALL?.askPrice &&
    getImpliedVolatility(
      option.options.CALL.askPrice as number,
      price,
      +(option.strike as string),
      duration,
      0.05,
      OptionType.CALL
    ) * 100;
  const putVolatility =
    option?.options.PUT?.askPrice &&
    getImpliedVolatility(
      option.options.PUT.askPrice as number,
      price,
      +(option.strike as string),
      duration,
      0.05,
      OptionType.PUT
    ) * 100;

  return [callVolatility, putVolatility].map((val = 0) => (val > 1000 ? ">999" : val?.toFixed()));
};

const useOptionPopover = () => {
  const [anchorEl, setAnchorEl] = useState<Element>();
  const [option, setOption] = useState<OptionsMap>();
  const { price } = useEthPrice();

  const [call, put] = useVolatility(price, option);

  const handleOpen = (event: React.MouseEvent, option: OptionsMap) => {
    setAnchorEl(event.currentTarget);
    setOption(option);
  };

  const handleClose = () => {
    setAnchorEl(undefined);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const OptionPopover = (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}>
      {option && (
        <StyledCard>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}>
            <Typography
              width={"100%"}
              fontWeight={500}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: ".2rem",
              }}>
              <ProviderIcon provider={option.provider} /> {capitalize(option.provider)}
            </Typography>
            <Link to={getUrlByProvider(option.provider)} color="inherit">
              <OpenInNewIcon sx={{ height: "15px", width: "15px" }} color={"action"} />
            </Link>
          </div>
          {call && (
            <Row>
              <Cell>
                <ColoredOptionType positive>CALL</ColoredOptionType>
              </Cell>
              <Cell>{formatCurrency(option.options.CALL?.askPrice ?? 0, 2)}</Cell>
              <Cell>
                IV:
                <Typography component="span" fontWeight={500}>
                  {call}%
                </Typography>
              </Cell>
            </Row>
          )}

          {put && (
            <Row>
              <Cell>
                <ColoredOptionType>PUT</ColoredOptionType>
              </Cell>
              <Cell>{formatCurrency(option.options.PUT?.askPrice ?? 0, 2)}</Cell>
              <Cell>
                IV:
                <Typography component="span" fontWeight={500}>
                  {put}%
                </Typography>
              </Cell>
            </Row>
          )}
        </StyledCard>
      )}
    </Popover>
  );

  return { handleOpen, OptionPopover };
};

export default useOptionPopover;
