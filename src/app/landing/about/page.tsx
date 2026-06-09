import { Box, Stack, Typography } from "@mui/material";

export default function AboutPage() {
  return (
    <div>
      <div style={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2, gap: '1em', padding: '1em' }}>
        <Typography variant="h1" textAlign="center">About</Typography>
        <Typography variant="body1" textAlign="center">Who makes Plurally and why?</Typography>
      </div>
      <Stack justifyContent="center" alignItems="center">
        <Box sx={{ padding: '1em', maxWidth: '80ch', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
          <Typography variant="h4" sx={{ mb: 1 }}>Who makes Plurally?</Typography>
          <Typography variant="body1">
            Just the Krona system. Seriously. There&apos;s not even a company behind it. And we make a point not to make it a company even though it &quot;hurts&quot; us not to.
            We don&apos;t plan on ever hiring people. We don&apos;t plan for this to be big. Like most apps, this was originally for ourselves and our friends, and if it helps anyone, great.
            These are all the same, or even worse, caveats that took SimplyPlural down. We are not trying to be the next true alternative.<br/>
            <br/>
            As such, the Privacy Policy and Terms of Service don&apos;t mention a company, and we had to use a PO Box for legal reasons. There are no &quot;offices&quot;. There will never be.
            In consequence, there is barely any way for us to reasonably profit off of this without getting in trouble with our country&apos;s tax system. That&apos;s why there are no ads,
            no tracking, and no means to profit. Everything is provided for free, and kindly sustained by donations from friends and strangers provided to us.<br/>
          </Typography>
        </Box>
        <Box sx={{ padding: '1em', maxWidth: '80ch', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
          <Typography variant="h4" sx={{ mb: 1 }}>Why make Plurally then?</Typography>
          <Typography variant="body1">
            Like most apps, we made this so we could support our friends through a time where we were short on alternatives. Although there are many alternatives now, none quite fit what
            we&apos;re looking for. We also made it for ourselves, for coding practice, and to try our hand at running a service that can provide help to a few hundred users. Our goal is to help.
          </Typography>
        </Box>
      </Stack>
    </div>
  )
}