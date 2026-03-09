'use client';
import { useSupabase } from "@/lib/supabase/client";
import { X } from "@mui/icons-material";
import { Container, IconButton, Stack, Typography } from "@mui/material";
import { App, Button, Page, Toast } from "konsta/react";
import { useRouter, redirect, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from "react";

export default function Login() {
  const supabase = useSupabase();
  const router = useRouter()
  const search_params = useSearchParams();
  const [ error_toast_opened, setErrorToastOpened ] = useState(false);
  const [ error_toast_content, setErrorToastContent ] = useState('');

  useEffect(() => {
    const checkLoggedIn = async () => {
      if ((await supabase.auth.getClaims()).data) {
        router.push('/');
      }
    }
    checkLoggedIn();
  }, [router, search_params, supabase]);

  const signInWithDiscord = useCallback(async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
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
              <X/>
            </IconButton>
          }
        >
          {error_toast_content}
        </Toast>
      </Page>
    </App>
  )
}