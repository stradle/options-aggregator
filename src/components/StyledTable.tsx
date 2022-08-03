import { styled, Typography } from "@mui/material";
import { ReactNode } from "react";

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

export const ColoredOptionType = ({
  children,
  positive,
  enlarged,
}: {
  children: ReactNode;
  enlarged?: boolean;
  positive?: boolean;
}) => (
  <Typography
    color={positive ? "primary.positiveText" : "primary.negativeText"}
    component={"span"}
    variant={enlarged ? "body1" : "body2"}
  >
    {children}
  </Typography>
);
