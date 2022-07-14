import { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import { RatesProvider } from "./providers/RatesProvider";
import AppRouter from "./pages/AppRouter";
import AppContextProvider from "./context/AppContext";
import { ColorModeContext } from "./context/ColorModeContext";
import { useLocalStorage } from "react-use";
import { createClient, WagmiConfig } from "wagmi";
import { connectors } from "./services/wallet/connectors";
// import amber from '@mui/material/colors/amber';
import { getDefaultProvider } from "ethers";

type ColorTheme = "light" | "dark";

const queryClient = new QueryClient();

const getTheme = (theme: ColorTheme) =>
  createTheme(
    {
      palette: {
        mode: theme,
      },
    },
    {
      palette: {
        primary: {
          positiveText: "#32C57a",
          negativeText: "#EB5757",
        },
      },
    }
  );

const client = createClient({
  autoConnect: true,
  connectors,
  provider: getDefaultProvider(),
});

const App = () => {
  const [mode = "light", setMode] = useLocalStorage<ColorTheme>("light");
  const colorModeContext = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode(mode === "light" ? "dark" : "light");
      },
    }),
    [mode]
  );
  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig client={client}>
        <AppContextProvider>
          <RatesProvider>
            <ThemeProvider theme={theme}>
              <ColorModeContext.Provider value={colorModeContext}>
                <CssBaseline enableColorScheme />
                <AppRouter />
              </ColorModeContext.Provider>
            </ThemeProvider>
          </RatesProvider>
        </AppContextProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
};

export default App;
