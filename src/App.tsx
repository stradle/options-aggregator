import styled from "styled-components";
import { QueryClient, QueryClientProvider } from "react-query";
import MarketsGrid from "./pages/MarketsGrid";
import { RateProvider } from "./exchanges/RateProvider";

const Wrapper = styled.div`
  margin: 10rem;
`;
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RateProvider>
        <Wrapper>
          <MarketsGrid />
        </Wrapper>
      </RateProvider>
    </QueryClientProvider>
  );
}

export default App;
