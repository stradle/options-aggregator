import { QueryClient, QueryClientProvider } from "react-query";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import { RatesProvider } from "./providers/RatesProvider";
import AppRouter from "./pages/AppRouter";
import AppContextProvider from "./context/AppContext";

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
      <AppContextProvider>
        <RatesProvider>
          <ThemeProvider theme={darkTheme}>
            <CssBaseline enableColorScheme />
            <AppRouter />
          </ThemeProvider>
        </RatesProvider>
      </AppContextProvider>
    </QueryClientProvider>
  );
}

export default App;
