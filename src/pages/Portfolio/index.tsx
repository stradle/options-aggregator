import {
  CircularProgress,
  Paper,
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
import { useLyraPositions } from "../../providers/lyra";
import { formatCurrency, getExpirationTerm } from "../../services/util";
import { ColoredOptionType, ProviderIcon } from "../../components";
import { ProviderType } from "../../types";

interface HeadCell {
  disablePadding: boolean;
  id: keyof Position;
  label: string;
  numeric: boolean;
}

const dealColumns: readonly HeadCell[] = [
  { numeric: true, disablePadding: false, id: "strike", label: "Strike" },
  { numeric: false, disablePadding: false, id: "expiryTimestamp", label: "Term" },
  { numeric: false, disablePadding: false, id: "isCall", label: "Type" },
  { numeric: false, disablePadding: false, id: "isLong", label: "Direction" },
  { numeric: true, disablePadding: false, id: "size", label: "Size" },
  { numeric: true, disablePadding: false, id: "avgCostPerOption", label: "Avg price" },
  { numeric: true, disablePadding: false, id: "pricePerOption", label: "Cur price" },
  { numeric: true, disablePadding: false, id: "unrealizedPnl", label: "Unrealized PnL" },
];
const Portfolio = () => {
  const [lyraPositions, loading] = useLyraPositions();
  const { connector: activeConnector } = useAccount();

  if (!activeConnector) return <Typography>Connect your to see positions</Typography>;

  return (
    <>
      <div>Displaying only <ProviderIcon provider={ProviderType.LYRA} /> Lyra positions at the moment</div>
      <Paper sx={{ width: "100%", mb: 2 }}>
        {loading ? (
          <CircularProgress />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {dealColumns.map((col) => {
                    return (
                      <TableCell key={col.id} align={col.numeric ? "right" : "center"}>
                        {col.label}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {lyraPositions.map((position) => {
                  return (
                    <TableRow>
                      <TableCell align={"center"}>{position.strike / 1e18}</TableCell>
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
                      <TableCell align="right">{position.size / 1e18}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(position.avgCostPerOption / 1e18, 2)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(position.pricePerOption / 1e18, 2)}
                      </TableCell>
                      <TableCell align="right">
                        <ColoredOptionType positive={position.unrealizedPnl > 0}>
                          {formatCurrency(position.unrealizedPnl / 1e18, 2)}
                          <Typography fontSize={"12px"}>
                            {((position.unrealizedPnlPercent / 1e18) * 100).toFixed(1)}%
                          </Typography>
                        </ColoredOptionType>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </>
  );
};

export default Portfolio;
