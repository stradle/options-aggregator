import { QueryClient, QueryClientProvider } from "react-query";
import styled from "styled-components";
import Main from "./pages/Main";
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
          <Main />
        </Wrapper>
      </RateProvider>
    </QueryClientProvider>
  );
}

export default App;
