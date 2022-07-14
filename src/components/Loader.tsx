import { CircularProgress } from "@mui/material";
import styled from "styled-components";

export const Loader: React.FC = () => {
  const LoaderBase = styled.div`
    margin: 5rem;
    align-items: center;
    display: flex;
    gap: 1rem;
  `;

  return (
    <LoaderBase>
      <CircularProgress />
      <h4>Aggregating data...</h4>
    </LoaderBase>
  );
};
