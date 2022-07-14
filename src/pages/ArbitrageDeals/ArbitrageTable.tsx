import { useState } from "react";
import { visuallyHidden } from "@mui/utils";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from "@mui/material";
import { formatCurrency } from "../../services/util";
import { ColoredOptionType, ProviderIcon } from "../../components";
import { StyledDealBuySellItem } from "./styled";
import { Deal, DealPart, OptionType } from "../../types";

const DealBuySellItem = ({ item }: { item: DealPart }) => (
  <StyledDealBuySellItem>
    <div>{formatCurrency(item.price, 2)}</div>
    <ProviderIcon provider={item.provider} />
  </StyledDealBuySellItem>
);

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = "asc" | "desc";
type DealsTableItem = Deal & { apy: number; discount: number };
type DealsSorting = keyof Omit<DealsTableItem, "buy" | "sell">;

const notSortableKeys: readonly string[] = ["buy", "sell"];

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// This method is created for cross-browser compatibility, if you don't
// need to support IE11, you can use Array.prototype.sort() directly
function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof DealsTableItem;
  label: string;
  numeric: boolean;
}

const dealColumns: readonly HeadCell[] = [
  { numeric: true, disablePadding: false, id: "strike", label: "Strike" },
  { numeric: false, disablePadding: false, id: "expiration", label: "Term" },
  { numeric: false, disablePadding: false, id: "type", label: "Type" },
  { numeric: true, disablePadding: false, id: "buy", label: "Buy" },
  { numeric: true, disablePadding: false, id: "sell", label: "Sell" },
  { numeric: true, disablePadding: false, id: "amount", label: "Difference" },
  { numeric: true, disablePadding: false, id: "discount", label: "Discount" },
  { numeric: true, disablePadding: false, id: "apy", label: "APY" },
];

const EnhancedTableHead = (props: {
  onRequestSort: (event: React.MouseEvent<unknown>, property: DealsSorting) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}) => {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property: DealsSorting) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {dealColumns.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "center"}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}>
            <TableSortLabel
              disabled={notSortableKeys.includes(headCell.id)}
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={
                notSortableKeys.includes(headCell.id)
                  ? undefined
                  : createSortHandler(headCell.id as DealsSorting)
              }>
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

// type Sorting = "apy";

const formatPercent = (amount: number) => amount.toFixed(2) + "%";

const ArbitrageTable = ({ data }: { data: DealsTableItem[] }) => {
  const [order, setOrder] = useState<Order>("desc");
  const [orderBy, setOrderBy] = useState<DealsSorting>("apy");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: DealsSorting) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ width: "100%", mb: 2 }}>
        <TableContainer>
          <Table sx={{ minWidth: 750 }} size="medium">
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={data.length}
            />
            <TableBody>
              {/* if you don't need to support IE11, you can replace the `stableSort` call with:
              data.slice().sort(getComparator(order, orderBy)) */}
              {stableSort(data, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((deal, index) => {
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow hover tabIndex={-1} key={deal.strike + deal.term + deal.type}>
                      <TableCell
                        align="right"
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="none">
                        {formatCurrency(+deal.strike)}
                      </TableCell>
                      <TableCell align="center" component="th">
                        {deal.term}
                      </TableCell>
                      <TableCell align="center">
                        {
                          <ColoredOptionType positive={deal.type === OptionType.CALL}>
                            {deal.type}
                          </ColoredOptionType>
                        }
                      </TableCell>
                      <TableCell align="right">
                        <DealBuySellItem item={deal.buy} />
                      </TableCell>
                      <TableCell align="right">
                        <DealBuySellItem item={deal.sell} />
                      </TableCell>
                      <TableCell align="right">{formatCurrency(deal.amount, 2)}</TableCell>
                      <TableCell align="right">{formatPercent(deal.discount)}</TableCell>
                      <TableCell align="right">{formatPercent(deal.apy)}</TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 53 * emptyRows,
                  }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 20, 30]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default ArbitrageTable;
