'use client';
import useAccount from "@/lib/hooks/useAccount";
import { useShortMutations, useShortQuery } from "@/lib/hooks/useShortQuery";
import { useSupabase } from "@/lib/supabase/client";
import { Add, Check, Close } from "@mui/icons-material";
import { List, ListItem, ListItemButton, ListItemText, Stack, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Block, Button, Link, Sheet, Toolbar, ToolbarPane } from "konsta/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useImmer } from "use-immer";

export default function PrivacyBuckets() {
  const supabase = useSupabase();
  const router = useRouter();

  const [ sheet_opened, setSheetOpened ] = useState(false);
  const [ sheet_form, updateSheetForm ] = useImmer({
    name: '',
    description: '',
  });

  const theme = useTheme()
  const is_mobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { data: account } = useAccount();
  const { data: buckets } = useShortQuery(
    ['buckets', account?.id],
    async () => {
      const { data } = await supabase
        .from('buckets')
        .select()
        .eq('account', account!.id);
      return data;
    },
    [ account ],
  );

  const bucket_mutators = useShortMutations(
    ['buckets', account?.id],
    {
      create: async () => {
        await supabase
          .from('buckets')
          .insert({
            name: sheet_form.name,
            description: sheet_form.description,
            account: account!.id,
          });
      },
    },
  );

  return (
    <Stack gap={2} sx={{ width: '100%', alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
      <Sheet
        className="pb-safe"
        opened={sheet_opened}
        onBackdropClick={() => setSheetOpened(false)}
        style={{ zIndex: 1400, maxWidth: '500px', left: is_mobile ? '0' : '40%' }}
      >
        <Toolbar top className="justify-end">
          <ToolbarPane>
            <Link iconOnly onClick={() => setSheetOpened(false)}>
              <Close/>
            </Link>
          </ToolbarPane>
          <ToolbarPane>
            <Link iconOnly onClick={() => {
              bucket_mutators.create();
              updateSheetForm(draft => {
                draft.name = '';
                draft.description = '';
              })
              setSheetOpened(false);
            }}>
              <Check/>
            </Link>
          </ToolbarPane>
        </Toolbar>
        <Block>
          <Stack gap={2}>
            <TextField
              id="member-name"
              label="Name"
              variant="outlined"
              sx={{ width: '100%' }}
              value={sheet_form.name}
              onChange={ev => updateSheetForm(draft => { draft.name = ev.target.value })}
            />
            <TextField multiline
              id="member-description"
              label="Description"
              variant="outlined"
              minRows={3}
              sx={{ width: '100%' }}
              value={sheet_form.description}
              onChange={ev => updateSheetForm(draft => { draft.description = ev.target.value })}
            />
          </Stack>
        </Block>
      </Sheet>
      <Button
        onClick={() => setSheetOpened(true)}
        style={{ width: '90%', marginTop: 10 }}
      >
        <Add/> Create bucket
      </Button>
      <List sx={{ width: '90%' }}>
        { buckets?.map(bucket => {
          return (
            <ListItem key={bucket.id}
              style={{
                backgroundColor: `rgba(${bucket.color ?? '255, 255, 255'}, 20%)`,
                borderRadius: '10px',
                marginBottom: 5,
              }}
            >
              <ListItemButton
                onClick={() => router.push(`/app/buckets/${bucket.id}`)}
              >
                <ListItemText
                  primary={bucket.name}
                  secondary={bucket.description}
                />
              </ListItemButton>
            </ListItem>
          )
        }) }
      </List>
    </Stack>
  )
}