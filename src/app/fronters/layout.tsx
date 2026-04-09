'use client';
import { createTheme, ThemeProvider } from "@mui/material";
import { Page } from "konsta/react";
import { useEffect } from "react";

const THEME = createTheme({
  colorSchemes: {
    dark: true,
  },
});

export default function FrontersLayout({children}: Readonly<{
  children: React.ReactNode;
}>) {
  // Dark mode effect
  useEffect(() => {
    const prefers_dark_scheme = window.matchMedia('(prefers-color-scheme: dark)');

    if (prefers_dark_scheme.matches) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    prefers_dark_scheme.addEventListener('change', ev => {
      if (ev.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });
  }, []);

  return (
    <ThemeProvider theme={THEME}>
      <Page>
        {children}
      </Page>
    </ThemeProvider>
  )
}