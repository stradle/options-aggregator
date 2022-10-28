import {
  Card,
  CardContent,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Position } from "@lyrafinance/lyra-js";
import { useAccount } from "wagmi";
import { useMemo } from "react";
import moment from "moment/moment";
import { useLyraPositions, useLyraRates } from "../../providers/lyra";
import {
  formatCurrency,
  getExpirationTerm,
  useTokenPrice,
} from "../../services/util";
import { ColoredOptionType, ProviderIcon } from "../../components";
import { getGreeks } from "../../services/util/black-scholes";
import {
  ActivePosition,
  BuySellModes,
  Instrument,
  OptionsMap,
  OptionType,
  ProviderType,
  Underlying,
} from "../../types";
import { useAppContext } from "../../context/AppContext";

interface HeadCell {
  disablePadding: boolean;
  id: keyof Position;
  label: string;
  numeric: boolean;
}

const dealColumns: readonly HeadCell[] = [
  { numeric: true, disablePadding: false, id: "strike", label: "Strike" },
  {
    numeric: false,
    disablePadding: false,
    id: "expiryTimestamp",
    label: "Term",
  },
  { numeric: false, disablePadding: false, id: "isCall", label: "Type" },
  { numeric: false, disablePadding: false, id: "isLong", label: "Direction" },
  { numeric: true, disablePadding: false, id: "size", label: "Size" },
  {
    numeric: true,
    disablePadding: false,
    id: "avgCostPerOption",
    label: "Delta, Gamma",
  },
  {
    numeric: true,
    disablePadding: false,
    id: "pricePerOption",
    label: "Cur price",
  },
  {
    numeric: true,
    disablePadding: false,
    id: "unrealizedPnl",
    label: "Unrealized PnL",
  },
  {
    numeric: true,
    disablePadding: false,
    id: "collateral",
    label: "Collateral",
  },
  {
    numeric: true,
    disablePadding: false,
    id: "isInTheMoney",
    label: "APR (init, cur)",
  },
];

type Greeks = { delta: number; gamma: number; iv: number };
type PositionWithGreeks = ActivePosition & {
  greeks: Greeks;
  instrument: OptionsMap;
};

const SqueethCalcs = ({
  positionsWithGreeks,
}: {
  positionsWithGreeks: PositionWithGreeks[];
}) => {
  const { price: osqthPrice } = useTokenPrice("OSQTH");
  const { price: ethPrice } = useTokenPrice(Underlying.ETH);

  const totalGreeks = useMemo(() => {
    const totalGamma = positionsWithGreeks.reduce(
      (acc, { greeks, size }) => acc + ((greeks?.gamma ?? 0) * size) / 1e18,
      0
    );
    const totalDelta = positionsWithGreeks.reduce(
      (acc, { greeks, size }) => acc + ((greeks?.delta ?? 0) * size) / 1e18,
      0
    );

    return { totalGamma, totalDelta };
  }, [positionsWithGreeks]);

  const squeethToHedge = useMemo(() => {
    const sqEth = Math.pow(ethPrice, 2);
    const sqth = osqthPrice / sqEth;
    const deltaPerOsqth = 2 * ethPrice * sqth;
    const gammaPerOsqth = (2 * osqthPrice) / sqEth;
    const osqthToHedgeGamma = totalGreeks.totalGamma / gammaPerOsqth;
    const osqthDelta = osqthToHedgeGamma * deltaPerOsqth;
    const totalDelta = totalGreeks.totalDelta + osqthDelta;

    return {
      deltaPerOsqth,
      gammaPerOsqth,
      osqthToHedgeGamma,
      osqthDelta,
      totalDelta,
    };
  }, [osqthPrice, ethPrice, totalGreeks]);
  return (
    <div>
      <Typography>Squeeth stats</Typography>
      <Stack flexDirection={"row"} gap={"0.5rem"}>
        <Card>
          <CardContent sx={{ flexDirection: "column" }}>
            <div>Delta per OSQTH</div>
            <div>{squeethToHedge.deltaPerOsqth.toFixed(6)}</div>
          </CardContent>
        </Card>
        <Card>
          <div>Gamma per OSQTH</div>
          <div>{squeethToHedge.gammaPerOsqth.toFixed(6)}</div>
        </Card>
        <Card>
          <div>OSQTH amount to hedge option's gamma</div>
          <div>{squeethToHedge.osqthToHedgeGamma.toFixed(6)}</div>
        </Card>
        <Card>
          <div>Delta from OSQTH</div>
          <div>{squeethToHedge.osqthDelta.toFixed(6)}</div>
        </Card>
        <Card>
          <div>Total delta to hedge</div>
          <div>{squeethToHedge.totalDelta.toFixed(6)}</div>
        </Card>
      </Stack>
    </div>
  );
};

const Portfolio = () => {
  const [lyraPositions, loading] = useLyraPositions();
  const [lyraInstruments] = useLyraRates();
  const { connector: activeConnector } = useAccount();
  const { underlying } = useAppContext();
  const { price: basePrice } = useTokenPrice(underlying);

  const positionsWithGreeks = useMemo(() => {
    if (lyraPositions.length && lyraInstruments?.length && basePrice)
      return lyraPositions.map((position) => {
        const optionType = position.isCall ? OptionType.CALL : OptionType.PUT;
        const instrument = lyraInstruments.find(
          (instrument) =>
            position.strike / 1e18 === instrument.strike &&
            getExpirationTerm(position.expiration * 1000) === instrument.term
        )?.[optionType] as Instrument;

        const greeks = getGreeks(basePrice, instrument, BuySellModes.BUY);

        return { ...position, greeks, instrument };
      });
  }, [lyraPositions, lyraInstruments, basePrice]);

  if (!activeConnector)
    return (
      <Typography variant={"h6"}>
        Connect wallet to see your positions
      </Typography>
    );

  if (loading) return <CircularProgress />;

  return (
    <>
      {positionsWithGreeks?.length ? (
        <>
          <Paper sx={{ width: "100%", mb: 2 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {dealColumns.map((col) => {
                      return (
                        <TableCell
                          key={col.id}
                          align={col.numeric ? "right" : "center"}
                        >
                          {col.label}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {positionsWithGreeks.map((position) => {
                    let collateral = "";
                    if (!position.isLong) {
                      collateral += (
                        (position.collateral as number) / 1e18
                      ).toFixed(2);
                      collateral += " ";
                      // TODO: make callateral dynamic  after adding BTC
                      collateral += position.isBaseCollateral ? "ETH" : "sUSD";
                    }

                    return (
                      <TableRow>
                        <TableCell align={"center"}>
                          {position.strike / 1e18}
                        </TableCell>
                        <TableCell align={"center"}>
                          {getExpirationTerm(position.expiration * 1000)}
                        </TableCell>
                        <TableCell align={"center"}>
                          <ColoredOptionType positive={position.isCall}>
                            {position.isCall ? "CALL" : "PUT"}
                          </ColoredOptionType>
                        </TableCell>
                        <TableCell align={"center"}>
                          <ColoredOptionType positive={position.isLong}>
                            {position.isLong ? "LONG" : "SHORT"}
                          </ColoredOptionType>
                        </TableCell>
                        <TableCell align="right">
                          {position.size / 1e18}
                        </TableCell>
                        <TableCell align="right">
                          {position.greeks?.delta}, {position.greeks?.gamma}
                        </TableCell>

                        <TableCell align="right">
                          {formatCurrency(position.pricePerOption / 1e18, 2)}
                        </TableCell>
                        <TableCell align="right">
                          <ColoredOptionType
                            positive={position.unrealizedPnl > 0}
                          >
                            {formatCurrency(position.unrealizedPnl / 1e18, 2)}
                            <Typography fontSize={"12px"}>
                              {(
                                (position.unrealizedPnlPercent / 1e18) *
                                100
                              ).toFixed(1)}
                              %
                            </Typography>
                          </ColoredOptionType>
                        </TableCell>
                        <TableCell align="right">{collateral}</TableCell>
                        <TableCell align="right">
                          {(
                            ((position.avgCostPerOption / 1e18 / basePrice) *
                              100) /
                            moment
                              .duration(
                                moment(position.expiration * 1000).diff(
                                  moment()
                                )
                              )
                              .asYears()
                          ).toFixed(1)}
                          %
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {positionsWithGreeks && (
            <SqueethCalcs positionsWithGreeks={positionsWithGreeks} />
          )}
        </>
      ) : (
        `Currently you don't have active positions`
      )}
      <div>
        Temporary displays only <ProviderIcon provider={ProviderType.LYRA} />{" "}
        <Typography component={"span"} fontWeight={500}>
          Lyra
        </Typography>{" "}
        positions
      </div>
    </>
  );
};

export default Portfolio;
