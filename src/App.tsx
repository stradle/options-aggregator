import { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import { ThemeOptions } from "@rainbow-me/rainbowkit/dist/themes/baseTheme";
import { useLocalStorage } from "react-use";
import { createClient, WagmiConfig } from "wagmi";
import {
  darkTheme,
  lightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { RatesProvider } from "./context/RatesProvider";
import AppRouter from "./pages/AppRouter";
import AppContextProvider from "./context/AppContext";
import { ColorModeContext } from "./context/ColorModeContext";
import { chains, connectors, provider } from "./services/wallet/connectors";

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
  provider,
});

const getRainbowTheme = (light: boolean) => {
  const params: ThemeOptions = { fontStack: "system" };

  return light ? lightTheme(params) : darkTheme(params);
};

const App = () => {
  const [mode = "dark", setMode] = useLocalStorage<ColorTheme>("dark");
  const colorModeContext = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode(mode === "light" ? "dark" : "light");
      },
    }),
    [mode]
  );
  const theme = useMemo(() => getTheme(mode), [mode]);
  const rainbowTheme = useMemo(() => getRainbowTheme(mode === "light"), [mode]);

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig client={client}>
        <RainbowKitProvider theme={rainbowTheme} chains={chains}>
          <AppContextProvider>
            <RatesProvider>
              <ThemeProvider theme={theme}>
                <ColorModeContext.Provider value={colorModeContext}>
                  <CssBaseline enableColorScheme />
                  <AppRouter />
                  <ReactQueryDevtools />
                </ColorModeContext.Provider>
              </ThemeProvider>
            </RatesProvider>
          </AppContextProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
};

export default App;
