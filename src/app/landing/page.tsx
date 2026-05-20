'use client';
import { Typography } from "@mui/material";
import FeatureGrid from "../components/landing/FeatureGrid";

export default function LandingPage() {
  return (
    <div>
      <div style={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2, gap: '1em', padding: '1em' }}>
        <Typography variant="h1" color="white" textAlign="center">Meet Plurally</Typography>
        <Typography variant="body1" color="white" textAlign="center">
          Plurally is an alternative plurality management tool aimed towards helping systems of all kinds
        </Typography>
      </div>
      <FeatureGrid/>
    </div>
  );
}