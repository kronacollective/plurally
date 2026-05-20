'use client';
import { useSupabase } from "@/lib/supabase/client";
import { Close } from "@mui/icons-material";
import { Container, IconButton, Stack, TextField, Typography } from "@mui/material";
import { App, Button, Page, Toast } from "konsta/react";
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from "react";
import { signInOrUp } from "./actions";

export default function Login() {
  const supabase = useSupabase();
  const router = useRouter()
  const [ error_toast_opened, setErrorToastOpened ] = useState(false);
  const [ error_toast_content, setErrorToastContent ] = useState('');
  const [ invite, setInvite ] = useState('');
  const [ email, setEmail ] = useState('');

  useEffect(() => {
    const checkLoggedIn = async () => {
      if ((await supabase.auth.getClaims()).data) {
        router.push('/app');
      }
    }
    checkLoggedIn();
  }, [router, supabase]);

  const signInWithDiscord = useCallback(async () => {
    const siwo = await signInOrUp(invite, email);
    if (siwo.error) {
      setErrorToastContent('Could not log in with Discord: ' + siwo.error.message)
      setErrorToastOpened(true);
      return;
    }
    router.push(siwo.data.url);
  }, [email, invite, router]);

  return (
    <App theme="material" className="safe-areas">
      <Page>
        <Container sx={{ maxWidth: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Stack>
            <Typography variant="h1" sx={{ textAlign: 'center', mt: 10, mb: 5 }}>P&</Typography>
            <Typography variant="h4" sx={{ textAlign: 'center' }}>Plurally</Typography>
          </Stack>
          <div className="fixed bottom-safe mb-safe-3 w-50 flex flex-col gap-2">
            <TextField
              label="Invite code"
              value={invite}
              onChange={ev => setInvite(ev.target.value)}
            />
            <TextField
              label="Discord e-mail"
              value={email}
              onChange={ev => setEmail(ev.target.value)}
              sx={{ mb: 5 }}
            />
            <Button onClick={signInWithDiscord}>Log in with Discord</Button>
          </div>
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