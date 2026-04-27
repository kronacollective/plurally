'use client';
import { createTheme, Grid, Stack, ThemeProvider, Typography } from "@mui/material";
import { Stack_Sans_Headline } from "next/font/google";
import Aurora from "./components/bits/Aurora";
import Navbar from "./components/Navbar";
import FeatureGrid from "./components/landing/FeatureGrid";
import Image from "next/image";

const stack_sans_hl = Stack_Sans_Headline({ subsets: ['latin'] });

const THEME = createTheme({
  colorSchemes: {
    dark: true,
  },
});

export default function LandingPage() {
  return (
    <ThemeProvider theme={THEME}>
      <div className={stack_sans_hl.className + ' bg-gray-800'}>
        <div style={{ position: 'absolute', width: '100%', height: '100%' }} className="1">
          <Aurora
            colorStops={["#11d1b7","#b77af0","#5227FF"]}
            blend={0.5}
            amplitude={1.0}
            speed={1}

          />
        </div>
        <Navbar/>
        <div style={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2, gap: '1em', padding: '1em' }}>
          <Typography variant="h1" color="white" className={stack_sans_hl.className} textAlign="center">Meet Plurally</Typography>
          <Typography variant="body1" color="white" className={stack_sans_hl.className} textAlign="center">
            Plurally is an alternative plurality management tool aimed towards helping systems of all kinds
          </Typography>
        </div>
        <FeatureGrid/>
        <Grid container spacing={2} sx={{ p: '1em' }} className="bg-gray-900">
          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Image
                src="/favicon-96x96.png"
                alt="Icon"
                width={30}
                height={30}
                style={{ borderRadius: '5px' }}
              />
              <Typography variant="h6" color="white" className={stack_sans_hl.className}>Plurally</Typography>
            </Stack>
          </Grid>
        </Grid>
      </div>
    </ThemeProvider>
  );
}