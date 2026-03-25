'use client';
import { useShortMutations, useShortQuery } from "@/lib/hooks/useShortQuery";
import { useSupabase } from "@/lib/supabase/client";
import { List, ListItem, ListItemText, Stack, Switch, TextField, Typography } from "@mui/material";
import { Block, BlockTitle, Button } from "konsta/react";
import { MuiColorInput } from "mui-color-input";
import { useCallback, useEffect, useState } from "react";
import { useImmer } from "use-immer";
import { importFromSimplyPlural, sendNotification, subscribeUser, unsubscribeUser } from "./actions";
import { urlBase64ToUint8Array } from "@/lib/pwa";
import { Send } from "@mui/icons-material";

export default function Account() {
  const supabase = useSupabase();

  const [ supported, setSupported ] = useState(false);
  const [ subscription, setSubscription ] = useState<PushSubscription | null>(null);

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

  const registerServiceWorker = useCallback(async () => {
    const reg = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    });
    const sub = await reg.pushManager.getSubscription();
    setSubscription(sub);
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSupported(true);
      registerServiceWorker();
    }
  }, [registerServiceWorker]);

  const subscribeToPush = useCallback(async () => {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      ),
    });
    setSubscription(sub);
    const serialized_sub = JSON.parse(JSON.stringify(sub));
    await subscribeUser(account!.id, serialized_sub);
  }, [account]);

  const unsubscribeFromPush = useCallback(async () => {
    await subscription?.unsubscribe();
    setSubscription(null);
    await unsubscribeUser(account!.id);
  }, [account, subscription]);

  const sendTestNotification = useCallback(async () => {
    if (subscription) await sendNotification(account!.id, 'This is a test notification from Plurally');
  }, [account, subscription]);

  const [ account_data, updateAccountData ] = useImmer<Record<string, string | null>>({
    username: '',
    display_name: '',
    description: '',
    color: '',
    sp_key: '',
  });

  useEffect(() => {
    if (!account) return;
    updateAccountData(draft => {
      Object.entries(account!).forEach(entry => draft[entry[0]] = entry[1]);
    })
  }, [account, updateAccountData]);

  const account_mutators = useShortMutations(
    ['account', account?.id],
    {
      update: async () => {
        await supabase
          .from('accounts')
          .update(account_data)
          .eq('id', account!.id);
      }
    },
  );

  const startImport = useCallback(async () => {
    await account_mutators.update();
    importFromSimplyPlural(account!.id);
  }, [account, account_mutators]);

  return (
    <Stack gap={2} sx={{ width: '100%' }}>
      <BlockTitle>Account data</BlockTitle>
      <Block style={{ width: '100%' }}>
        <Stack gap={2} sx={{ width: '100%' }}>
          <TextField disabled
            label="Username"
            variant="outlined"
            value={account_data.username}
            onChange={ev => updateAccountData(draft => { draft.username = ev.target.value })}
            sx={{ width: '100%' }}
          />
          <TextField
            label="Display name"
            variant="outlined"
            value={account_data.display_name}
            onChange={ev => updateAccountData(draft => { draft.display_name = ev.target.value })}
            sx={{ width: '100%' }}
          />
          <TextField multiline
            label="Description"
            variant="outlined"
            value={account_data.description}
            onChange={ev => updateAccountData(draft => { draft.description = ev.target.value })}
            minRows={3}
            sx={{ width: '100%' }}
          />
          <MuiColorInput
            name="color"
            label="Color"
            variant="outlined"
            format="rgb"
            value={account_data?.color ? `rgb(${account_data.color})` : 'rgb(255, 255, 255)'}
            onChange={nv => updateAccountData(draft => { draft.color = nv.slice(4, -1) })}
            sx={{ width: '100%' }}
          />
          <Button
            onClick={account_mutators.update}
            style={{ width: '100%' }}
            disabled={account_data.username == ''}
          >
            Update account
          </Button>
        </Stack>
      </Block>
      <BlockTitle>SimplyPlural integration</BlockTitle>
      <Block style={{ width: '100%' }}>
        <Stack gap={2} sx={{ width: '100%' }}>
          <TextField
            label="SimplyPlural token"
            value={account_data.sp_key}
            onChange={ev => updateAccountData(draft => { draft.sp_key = ev.target.value })}
            sx={{ width: '100%' }}
          />
          <Button
            onClick={startImport}
            style={{ width: '100%' }}
            disabled={account_data.sp_key == ''}
          >
            Import from SimplyPlural
          </Button>
        </Stack>
      </Block>
      <BlockTitle>Notifications</BlockTitle>
      <Block>
        { supported ? (
          <List>
            <ListItem
              secondaryAction={
                <Switch
                  checked={!!subscription}
                  onChange={ev => ev.target.checked ? subscribeToPush() : unsubscribeFromPush()}
                />
              }
            >
              <ListItemText primary="Enable notifications"/>
            </ListItem>
            <ListItem
              secondaryAction={
                <Button
                  onClick={sendTestNotification}
                >
                  <Send/>
                </Button>
              }
            >
              <ListItemText primary="Send test notification"/>
            </ListItem>
          </List>
        ) : (
          <Typography>Notifications are not supported.</Typography>
        )}
      </Block>
    </Stack>
  )
}