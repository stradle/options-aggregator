import type { Theme } from "theme-ui";
import { ThemeProvider } from "theme-ui";
import { DeribitProvider } from "./exchanges/deribit";

import MarketsGrid from "./pages/MarketsGrid";
import styled from "styled-components";
import { LyraProvider } from "./exchanges/lyra";
import { QueryClient, QueryClientProvider } from "react-query";

export const theme: Theme = {
  fonts: {
    body: "system-ui, sans-serif",
    heading: '"Avenir Next", sans-serif',
    monospace: "Menlo, monospace",
  },
  colors: {
    text: "#000",
    background: "#fff",
    primary: "#33e",
  },
};

const Wrapper = styled.div`
  margin: 10rem;
`;
const queryClient = new QueryClient();

function App() {
  return (
    <DeribitProvider>
      <QueryClientProvider client={queryClient}>
        <LyraProvider>
          <ThemeProvider theme={theme}>
            <Wrapper>
              <MarketsGrid />
            </Wrapper>
          </ThemeProvider>
        </LyraProvider>
      </QueryClientProvider>
    </DeribitProvider>
  );
}

export default App;
