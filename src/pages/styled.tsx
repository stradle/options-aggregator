import { ProviderType } from "../types";
import styled from "styled-components";
import { Button } from "@mui/material";
import { getUrlByProvider } from "../services/util/constants";

type StyledProviderLinkProps = { provider: ProviderType };

export const StyledProviderLink = styled(Button).attrs<StyledProviderLinkProps>((props) => ({
  href: getUrlByProvider(props.provider),
  target: "_blank",
}))<StyledProviderLinkProps>`
  display: flex;
  align-items: center;
  padding: 2px;
  flex: 1;
  min-width: 0px;
`;
