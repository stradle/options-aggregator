import { QueryClient, QueryClientProvider } from "react-query";
import styled from "styled-components";
import { CssBaseline } from "@mui/material";
import Main from "./pages/Main";
import { RatesProvider } from "./exchanges/RatesProvider";

const Wrapper = styled.div`
  margin: 10rem;
`;
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RatesProvider>
        <CssBaseline enableColorScheme />
        <Wrapper>
          <Main />
        </Wrapper>
      </RatesProvider>
    </QueryClientProvider>
  );
}

export default App;
