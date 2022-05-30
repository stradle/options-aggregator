import { QueryClient, QueryClientProvider } from "react-query";
import styled from "styled-components";
import { CssBaseline } from "@mui/material";

import { RootRoutes } from "./pages/Root";
import { RatesProvider } from "./exchanges/RatesProvider";

const Layout = styled.div`
  max-width: 1120px;
  margin: 0 auto;
`;

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RatesProvider>
        <CssBaseline enableColorScheme />
        <Layout>
          <RootRoutes />
        </Layout>
      </RatesProvider>
    </QueryClientProvider>
  );
}

export default App;
