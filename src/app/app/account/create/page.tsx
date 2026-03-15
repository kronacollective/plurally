'use client';
import { useSupabase } from "@/lib/supabase/client";
import { Stack, TextField } from "@mui/material";
import { Button } from "konsta/react";
import { MuiColorInput } from "mui-color-input";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useImmer } from "use-immer";

export default function CreateAccount() {
  const supabase = useSupabase();
  const router = useRouter();

  const [ account_data, updateAccountData ] = useImmer({
    username: '',
    display_name: '',
    description: '',
    color: '',
  });

  const createAccount = useCallback(async () => {
    const { data: user } = await supabase.auth.getUser();
    await supabase
      .from('accounts')
      .insert({
        ...account_data,
        // @ts-expect-error User ID can be null
        user: user.user?.id,
      });
    router.push('/app');
  }, [account_data, router, supabase]);

  return (
    <Stack gap={2} sx={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 5 }}>
      <TextField
        label="Username"
        variant="outlined"
        value={account_data.username}
        onChange={ev => updateAccountData(draft => { draft.username = ev.target.value })}
        sx={{ width: '90%' }}
        error={account_data.username == ''}
      />
      <TextField
        label="Display name"
        variant="outlined"
        value={account_data.display_name}
        onChange={ev => updateAccountData(draft => { draft.display_name = ev.target.value })}
        sx={{ width: '90%' }}
      />
      <TextField multiline
        label="Description"
        variant="outlined"
        value={account_data.description}
        onChange={ev => updateAccountData(draft => { draft.description = ev.target.value })}
        minRows={3}
        sx={{ width: '90%' }}
      />
      <MuiColorInput
        name="color"
        label="Color"
        variant="outlined"
        format="rgb"
        value={account_data?.color ? `rgb(${account_data.color})` : 'rgb(255, 255, 255)'}
        onChange={nv => updateAccountData(draft => { draft.color = nv.slice(4, -1) })}
        sx={{ width: '90%' }}
      />
      <Button
        onClick={createAccount}
        style={{ width: '90%' }}
        disabled={account_data.username == ''}
      >
        Create account
      </Button>
    </Stack>
  )
}