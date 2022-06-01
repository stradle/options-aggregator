import { createTheme, ThemeOptions } from "@mui/material";

export function useTheme() {
  const themeOptions: ThemeOptions = {
    palette: {
      mode: "dark",
      primary: {
        main: "#fff",
        light: "#92AFB1",
      },
      secondary: {
        main: "#63f3dc",
      },
      background: {
        paper: "#1A3B49",
        default: "#7b8a95",
      },
      text: {
        primary: "#fff",
      },
    },
  };

  return createTheme(themeOptions);
}
