import styled from "styled-components";

export const StyledTable = styled.table<{ alignRight?: boolean }>`
  border-collapse: collapse;

  thead {
    text-align: center;
  }

  th,
  td {
    ${({ alignRight }) => alignRight && "text-align: right;"}
    border: solid 1px darkgray;
    border-radius: 5px;
    padding: 2px 2px;
    font-weight: 500
  }
`;
