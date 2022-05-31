import styled from "styled-components";

import { OptionTypeColors } from "../services/util/constants";
import { OptionType } from "../types";

export const StyledTable = styled.table<{ alignRight?: boolean }>`
  border-collapse: collapse;
  border-radius: 5px;
  border-style: hidden; /* hide standard table (collapsed) border */
  box-shadow: 0px 3px 3px -2px rgb(0 0 0 / 20%), 0px 3px 4px 0px rgb(0 0 0 / 14%),
    0px 1px 8px 0px rgb(0 0 0 / 12%); /* this draws the table border  */

  thead {
    tr {
      background-color: #ffffff !important;
    }
  }
  //tr:nth-child(even) {
  //  background-color: #ffffff;
  //}
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
