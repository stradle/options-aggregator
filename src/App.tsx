import { QueryClient, QueryClientProvider } from "react-query";
import styled from "styled-components";
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
        <Wrapper>
          <Main />
        </Wrapper>
      </RatesProvider>
    </QueryClientProvider>
  );
}

export default App;
