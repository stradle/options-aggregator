import "@mui/material/styles";

declare module "@mui/material/styles" {
  interface SimplePaletteColorOptions {
    secondaryText?: string;
    positiveText?: string;
    negativeText?: string;
  }
}
