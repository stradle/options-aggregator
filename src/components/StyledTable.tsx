import { OptionTypeColors } from "../services/util/constants";
import { OptionType } from "../types";
import { styled } from "@mui/material";

export const StyledTable = styled("table")(({ theme }) => ({
  borderCollapse: "collapse",
  borderRadius: "5px",
  borderStyle: "hidden",
  boxShadow: theme.shadows[3],
  transition: theme.transitions.create("box-shadow"),
  backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.09))",
  cursor: "default",
  fontWeight: 500,

  th: {
    textAlign: "center",
  },

  "th,td": {
    padding: "4px",
    border: "1px solid",
    borderColor: theme.palette.divider,
  },

  td: {
    textAlign: "right",
  },
}));

export const ColoredOptionType = styled("div")<{ type?: OptionType }>`
  color: ${({ type }) => OptionTypeColors[type ?? OptionType.CALL]};
`;
