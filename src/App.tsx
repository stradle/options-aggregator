import { QueryClient, QueryClientProvider } from "react-query";
import { ThemeProvider, CssBaseline } from "@mui/material";

import { RootRoutes } from "./pages/Root";
import { RatesProvider } from "./exchanges/RatesProvider";
import { useTheme } from "./services";

const queryClient = new QueryClient();

function App() {
  const theme = useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <RatesProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline enableColorScheme />
          <RootRoutes />
        </ThemeProvider>
      </RatesProvider>
    </QueryClientProvider>
  );
}

export default App;
