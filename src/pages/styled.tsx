import styled from "styled-components";
import { Box, Button } from "@mui/material";

export const StyledProviderLink = styled(Button)`
  display: flex;
  align-items: center;
  padding: 2px;
  flex: 1;
  min-width: 0px;
  color: inherit;
`;

export const PageWrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: 1rem;
`;

export const ConfigSection = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  align-items: center;
`;
