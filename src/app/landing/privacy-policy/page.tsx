import { Box, Stack, Typography } from "@mui/material";

export default function PrivacyPolicy() {
  return (
    <div>
      <div style={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2, gap: '1em', padding: '1em' }}>
        <Typography variant="h1" textAlign="center">Privacy policy</Typography>
        {/* <Typography variant="body1" textAlign="center">Who makes Plurally and why?</Typography> */}
      </div>
      <Stack justifyContent="center" alignItems="center" sx={{ mb: 5 }}>
        <Box sx={{ background: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <iframe width="100%" height="500em" style={{ zIndex: 1100 }} src="https://app.termly.io/policy-viewer/policy.html?policyUUID=331eb58e-300c-4746-8122-af6c4ab24a39"/>
        </Box>
      </Stack>
    </div>
  );
}