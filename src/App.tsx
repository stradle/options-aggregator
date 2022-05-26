import type { Theme } from "theme-ui";
import { ThemeProvider } from "theme-ui";
import styled from "styled-components";
import { QueryClient, QueryClientProvider } from "react-query";
import MarketsGrid from "./pages/MarketsGrid";
import { RateProvider } from "./exchanges/RateProvider";

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
    <QueryClientProvider client={queryClient}>
      <RateProvider>
        <ThemeProvider theme={theme}>
          <Wrapper>
            <MarketsGrid />
          </Wrapper>
        </ThemeProvider>
      </RateProvider>
    </QueryClientProvider>
  );
}

export default App;
