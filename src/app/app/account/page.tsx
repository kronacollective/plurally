'use client';
import { useShortQuery } from "@/lib/hooks/useShortQuery";
import { useSupabase } from "@/lib/supabase/client";
import { Stack, TextField } from "@mui/material";
import { Button } from "konsta/react";
import { MuiColorInput } from "mui-color-input";
import { useCallback, useEffect } from "react";
import { useImmer } from "use-immer";

export default function Account() {
  const supabase = useSupabase();

  const { data: account } = useShortQuery(
    ['account'],
    async () => {
      const { data: user } = await supabase.auth.getUser();
      const { data } = await supabase
        .from('accounts')
        .select()
        .eq('user', user.user?.id ?? '')
        .single();
      return data;
    },
  );

  const [ account_data, updateAccountData ] = useImmer<Record<string, string | null>>({});

  useEffect(() => {
    if (!account) return;
    updateAccountData(draft => {
      Object.entries(account!).forEach(entry => draft[entry[0]] = entry[1]);
    })
  }, [account, updateAccountData]);

  const updateAccount = useCallback(async () => {
    await supabase
      .from('accounts')
      .update(account_data)
      .eq('username', account!.username);
  }, [account, account_data, supabase]);

  return (
    <Stack gap={2} sx={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 5 }}>
      <TextField disabled
        label="Username"
        variant="outlined"
        value={account_data.username}
        onChange={ev => updateAccountData(draft => { draft.username = ev.target.value })}
        sx={{ width: '90%' }}
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
        onClick={updateAccount}
        style={{ width: '90%' }}
        disabled={account_data.username == ''}
      >
        Update account
      </Button>
    </Stack>
  )
}