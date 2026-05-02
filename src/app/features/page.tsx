'use client';
import { createTheme, Grid, Stack, ThemeProvider, Typography } from "@mui/material";
import Navbar from "../components/Navbar";
import Image from "next/image";
import { Stack_Sans_Headline } from "next/font/google";

const stack_sans_hl = Stack_Sans_Headline({ subsets: ['latin'] });

const THEME = createTheme({
  colorSchemes: {
    dark: true,
  },
});

export default function FeaturesPage() {
  return (
    <ThemeProvider theme={THEME}>
      <div className={stack_sans_hl.className + ' bg-gray-800'}>
        <Navbar/>
        <div style={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2, gap: '1em', padding: '1em' }}>
          <Typography variant="h1" color="white" className={stack_sans_hl.className} textAlign="center">Features</Typography>
          <Typography variant="body1" color="white" className={stack_sans_hl.className} textAlign="center">
            See all that Plurally has to offer
          </Typography>
        </div>
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