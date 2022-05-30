import styled from "styled-components";

import { OptionTypeColors } from "../services/util/constants";
import { OptionType } from "../types";

export const StyledTable = styled.table<{ alignRight?: boolean }>`
  border-collapse: collapse;
  border-radius: 5px;
  border-style: hidden; /* hide standard table (collapsed) border */
  box-shadow: 0 0 0 1px #e8edf3; /* this draws the table border  */

  thead {
    tr {
      background-color: #ffffff !important;
    }
  }
  tr:nth-child(even) {
    background-color: #ffffff;
  }
  tr:nth-child(odd) {
    background-color: #f2f6fb;
  }

  th {
    font-weight: 600 !important;
    text-align: center;
    padding: 3px;
  }

  th,
  td {
    ${({ alignRight }) => alignRight && "text-align: right;"}
    border: 1px solid #E8EDF3;
    padding: 3px;
    font-weight: 500;
  }
`;

export const ColoredOptionType = styled.div<{ type?: OptionType }>`
  color: ${({ type }) => OptionTypeColors[type ?? OptionType.CALL]};
`;
