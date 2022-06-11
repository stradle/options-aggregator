import styled from "styled-components";

import { OptionTypeColors } from "../services/util/constants";
import { OptionType } from "../types";

export const StyledTable = styled.table<{ alignRight?: boolean }>`
  border-collapse: collapse;
  border-radius: 5px;
  border-style: hidden; /* hide standard table (collapsed) border */
  box-shadow: 0px 3px 3px -2px rgb(0 0 0 / 20%), 0px 3px 4px 0px rgb(0 0 0 / 14%),
    0px 1px 8px 0px rgb(0 0 0 / 12%); /* this draws the table border  */
  background-image: linear-gradient(rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.09));
  cursor: default;

  th {
    font-weight: 600 !important;
    text-align: center;
  }

  td {
    font-weight: 400;
    text-align: ${({ alignRight }) => (alignRight ? "right" : "center")};
  }

  th,
  td {
    padding: 4px;
    border: 1px solid rgba(255, 255, 255, 0.12);
  }
`;

export const ColoredOptionType = styled.div<{ type?: OptionType }>`
  color: ${({ type }) => OptionTypeColors[type ?? OptionType.CALL]};
`;
