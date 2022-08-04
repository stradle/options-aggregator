import { CircularProgress } from "@mui/material";
import { styled } from "@mui/material";

const StyledLoader = styled("div")`
  margin: 5rem;
  align-items: center;
  display: flex;
  gap: 1rem;
`;

const Loader = () => (
  <StyledLoader>
    <CircularProgress />
    <h4>Aggregating data...</h4>
  </StyledLoader>
);

export default Loader;
