import { QueryClient, QueryClientProvider } from "react-query";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import { RatesProvider } from "./exchanges/RatesProvider";
import AppRouter from "./pages/AppRouter";

const queryClient = new QueryClient();

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    // primary: {
    //   main: "#fff",
    //   light: "#92AFB1",
    // },
    // secondary: {
    //   main: "#63f3dc",
    // },
    // background: {
    //   paper: "#1A3B49",
    //   default: "#7b8a95",
    // },
    // text: {
    //   primary: "#fff",
    // },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RatesProvider>
        <ThemeProvider theme={darkTheme}>
          <CssBaseline enableColorScheme />
          <AppRouter />
        </ThemeProvider>
      </RatesProvider>
    </QueryClientProvider>
  );
}

export default App;
