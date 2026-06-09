import { Box, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";

export default function PrivacyPolicy() {

  return (
    <div>
      <div style={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2, gap: '1em', padding: '1em' }}>
        <Typography variant="h1" textAlign="center">Terms of use</Typography>
        {/* <Typography variant="body1" textAlign="center">Who makes Plurally and why?</Typography> */}
      </div>
      <Stack justifyContent="center" alignItems="center" sx={{ mb: 5 }}>
        <Box sx={{ background: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <iframe width="100%" height="500em" style={{ zIndex: 1100 }} src="https://app.termly.io/policy-viewer/policy.html?policyUUID=cbe7485e-a053-4e54-b917-bb752b913907"/>
        </Box>
      </Stack>
    </div>
  );
}