import { createTheme, ThemeProvider } from '@mui/material';

const theme = createTheme({ palette: { mode: 'dark' } });

export const AppStyling = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);