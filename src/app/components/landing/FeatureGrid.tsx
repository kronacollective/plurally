import { Grid, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import BorderGlow from "../bits/BorderGlow";
import { Stack_Sans_Headline, Stack_Sans_Text } from "next/font/google";
import { Analytics, DarkMode, Diversity2, Link, Note, People, Poll, PrivacyTip, Timelapse, Web } from "@mui/icons-material";

const stack_sans_hl = Stack_Sans_Headline({ subsets: ['latin'] });
const stack_sans = Stack_Sans_Text({ subsets: ['latin'] });

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode,
  title: string,
  description: string,
}) {
  return (
    <BorderGlow
      edgeSensitivity={30}
      glowColor="40 80 80"
      backgroundColor="#120F17"
      borderRadius={28}
      glowRadius={40}
      glowIntensity={1}
      coneSpread={25}
      animated={false}
      colors={['#c084fc', '#f472b6', '#38bdf8']}
    >
      <div style={{ padding: '2em' }}>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            {icon}
            <Typography variant="h5" color="white" className={stack_sans_hl.className}>{title}</Typography>
          </Stack>
          <Typography variant="body2" color="white" className={stack_sans.className}>{description}</Typography>
        </Stack>
      </div>
    </BorderGlow>
  );
}
export default function FeatureGrid() {
  const theme = useTheme();
  const is_mobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Grid container sx={{ mx: is_mobile ? '1em' : '10em', p: '1em' }} spacing={2}>
      <Grid size={{ xs: 12, lg: 6 }}>
        <FeatureCard
          icon={<People color="info"/>}
          title="Member profiles"
          description="Member profiles include names, usernames, profile pictures, banners, roles, and much more."
        />
      </Grid>
      <Grid size={{ xs: 12, lg: 6 }}>
        <FeatureCard
          icon={<Timelapse color="info"/>}
          title="Front tracking"
          description="Keep track of your fronting status, add comments to each front, and visualize your fronting history."
        />
      </Grid>
      <Grid size={{ xs: 12, lg: 6 }}>
        <FeatureCard
          icon={<PrivacyTip color="info"/>}
          title="Privacy buckets"
          description="Maintain full control of your privacy with granular settings. Restrict members, fields, and others to just some people. Make members public."
        />
      </Grid>
      <Grid size={{ xs: 12, lg: 6 }}>
        <FeatureCard
          icon={<Note color="info"/>}
          title="Journaling"
          description="Write down journal entries for each member, and optionally share them with the public."
        />
      </Grid>
      <Grid size={{ xs: 12, lg: 6 }}>
        <FeatureCard
          icon={<Analytics color="info"/>}
          title="Analytics"
          description="Get basic analytics about your most frequent fronters, front times, and such."
        />
      </Grid>
      <Grid size={{ xs: 12, lg: 6 }}>
        <FeatureCard
          icon={<Poll color="info"/>}
          title="Polls"
          description="Create polls with support for multiple options, abstain and veto."
        />
      </Grid>
      <Grid size={{ xs: 12, lg: 6 }}>
        <FeatureCard
          icon={<Diversity2 color="info"/>}
          title="Friends"
          description="Send and receive friend requests. See your friends' fronters and members."
        />
      </Grid>
      <Grid size={{ xs: 12, lg: 6 }}>
        <FeatureCard
          icon={<Link color="info"/>}
          title="Relationship map"
          description="Map out your relationships and see your connections, even with members of other systems."
        />
      </Grid>
      <Grid size={{ xs: 12, lg: 6 }}>
        <FeatureCard
          icon={<Web color="info"/>}
          title="Public pages"
          description="Show others your frontroom with a simple link, and share member profiles with only information you make public."
        />
      </Grid>
      <Grid size={{ xs: 12, lg: 6 }}>
        <FeatureCard
          icon={<DarkMode color="info"/>}
          title="Dark mode"
          description="Dark mode is supported throughout the entire application."
        />
      </Grid>
    </Grid>
  );
}