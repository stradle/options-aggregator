import { QueryClient, QueryClientProvider } from "react-query";
import { CssBaseline } from "@mui/material";

import { RootRoutes } from "./pages/Root";
import { RatesProvider } from "./exchanges/RatesProvider";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RatesProvider>
        <CssBaseline enableColorScheme />
        <RootRoutes />
      </RatesProvider>
    </QueryClientProvider>
  );
}

export default App;
