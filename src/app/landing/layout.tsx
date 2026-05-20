'use client';
import { createTheme, CssBaseline, Grid, Stack, ThemeProvider, Typography } from "@mui/material";
import { Stack_Sans_Headline, Stack_Sans_Text } from "next/font/google";
import Navbar from "../components/Navbar";
import Aurora from "../components/bits/Aurora";
import Image from "next/image";
import Link from "next/link";

const THEME = createTheme({
  typography: {
    h1: { fontFamily: 'Stack Sans Headline,Helvetica,Arial' },
    h2: { fontFamily: 'Stack Sans Headline,Helvetica,Arial' },
    h3: { fontFamily: 'Stack Sans Headline,Helvetica,Arial' },
    h4: { fontFamily: 'Stack Sans Headline,Helvetica,Arial' },
    h5: { fontFamily: 'Stack Sans Headline,Helvetica,Arial' },
    h6: { fontFamily: 'Stack Sans Headline,Helvetica,Arial' },
    fontFamily: 'Stack Sans Text,Helvetica,Arial',
  },
  colorSchemes: {
    dark: true,
  },
  palette: {
    mode: 'dark',
  },
});

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider theme={THEME} defaultMode="dark">
      <CssBaseline/>
      <div className={'bg-gray-800'}>
        <div style={{ position: 'absolute', width: '100%', height: '100%' }} className="1">
          <Aurora
            colorStops={["#11d1b7","#b77af0","#5227FF"]}
            blend={0.5}
            amplitude={1.0}
            speed={1}

          />
        </div>
        <Navbar/>
      {children}
      <Grid container spacing={2} sx={{ p: '1em' }} className="bg-gray-900">
        <Grid size={{ xs: 12, lg: 4 }}>
          <Link href="/">
            <Stack direction="row" spacing={1} alignItems="center">
              <Image
                src="/favicon-96x96.png"
                alt="Icon"
                width={30}
                height={30}
                style={{ borderRadius: '5px' }}
              />
              <Typography variant="h6">Plurally</Typography>
            </Stack>
          </Link>
        </Grid>
      </Grid>
      </div>
    </ThemeProvider>
  );
}