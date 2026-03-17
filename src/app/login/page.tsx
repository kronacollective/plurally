'use client';
import { useSupabase } from "@/lib/supabase/client";
import { Close } from "@mui/icons-material";
import { Container, IconButton, Stack, Typography } from "@mui/material";
import { App, Button, Page, Toast } from "konsta/react";
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from "react";

export default function Login() {
  const supabase = useSupabase();
  const router = useRouter()
  const [ error_toast_opened, setErrorToastOpened ] = useState(false);
  const [ error_toast_content, setErrorToastContent ] = useState('');

  useEffect(() => {
    const checkLoggedIn = async () => {
      if ((await supabase.auth.getClaims()).data) {
        router.push('/');
      }
    }
    checkLoggedIn();
  }, [router, supabase]);

  const signInWithDiscord = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        // redirectTo: `http://localhost:3001/auth/callback`,
      },
    });
    if (error) {
      setErrorToastContent('Could not log in with Discord: ' + error.message)
      setErrorToastOpened(true);
      return;
    }
  }, [supabase]);

  return (
    <App theme="material" className="safe-areas">
      <Page>
        <Container sx={{ maxWidth: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Stack>
            <Typography variant="h1" sx={{ textAlign: 'center', mt: 10, mb: 5 }}>P&</Typography>
            <Typography variant="h4" sx={{ textAlign: 'center' }}>Plurally</Typography>
          </Stack>
          <Button className="fixed bottom-safe mb-safe-3 w-50" onClick={signInWithDiscord}>Log in with Discord</Button>
        </Container>
        <Toast
          position="center"
          opened={error_toast_opened}
          button={
            <IconButton onClick={() => setErrorToastOpened(false)}>
              <Close/>
            </IconButton>
          }
        >
          {error_toast_content}
        </Toast>
      </Page>
    </App>
  )
}