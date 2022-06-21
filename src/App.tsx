import { useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import { lime } from "@mui/material/colors";
import { RatesProvider } from "./providers/RatesProvider";
import AppRouter from "./pages/AppRouter";
import AppContextProvider from "./context/AppContext";
import { ColorModeContext } from "./context/ColorModeContext";
import { useLocalStorage } from "react-use";
// import amber from '@mui/material/colors/amber';

type ColorTheme = "light" | "dark";

const queryClient = new QueryClient();

const getTheme = (theme: ColorTheme) =>
  createTheme({
    palette: {
      mode: theme,
      // primary: {
      //   ...lime,
      // secondaryText: "rgba(255,255,255,0.7)",
      // positiveText: "rgba(255,255,255,0.7)",
      // negativeText: "rgba(255,255,255,0.7)",
      // },
    },
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
    </QueryClientProvider>
  );
};

export default App;
