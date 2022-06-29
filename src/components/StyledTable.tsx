import { OptionTypeColors } from "../services/util/constants";
import { OptionType } from "../types";
import { styled } from "@mui/material";

export const StyledTable = styled("table")(({ theme }) => ({
  borderCollapse: "collapse",
  borderRadius: "5px",
  borderStyle: "hidden",
  cursor: "default",
  fontWeight: 500,
  width: "100%",

  th: {
    textAlign: "center",
  },

  td: {
    textAlign: "right",
  },

  "th,td": {
    padding: "4px",
    border: "1px solid",
    borderColor: theme.palette.divider,
  },
}));

export const ColoredOptionType = styled("div")<{ type?: OptionType }>`
  color: ${({ type }) => OptionTypeColors[type ?? OptionType.CALL]};
`;
