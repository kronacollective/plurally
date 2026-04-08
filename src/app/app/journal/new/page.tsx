'use client';

import useAccount from "@/lib/hooks/useAccount";
import { useShortMutations, useShortQuery } from "@/lib/hooks/useShortQuery";
import { useSupabase } from "@/lib/supabase/client";
import { Save } from "@mui/icons-material";
import { List, ListItem, ListItemAvatar, ListItemText, MenuItem, Select, Stack, Switch, TextField } from "@mui/material";
import { Fab } from "konsta/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useImmer } from "use-immer";

export default function NewJournalEntry() {
  const supabase = useSupabase();
  const router = useRouter();
  const { data: account } = useAccount();
  const [ entry_data, updateEntryData ] = useImmer({
    member: '',
    is_public: false,
    title: '',
    content: '',
  });

  // Get selectable members for entry
  const { data: selectable_members } = useShortQuery(
    ['members', account?.id, 'entry-selectable'],
    async () => {
      // Fetch data
      const { data } = await supabase
        .from('members')
        .select()
        .eq('account', account!.id)
        .eq('is_status', false);
      // Sort data
      const alphabetical_members = data?.toSorted((a, b) => a.name?.localeCompare(b.name!) ?? 0) ?? [];
      // Return
      return alphabetical_members;
    }
  );

  const entry_mutators = useShortMutations(
    ['entries', account?.id],
    {
      create: async () => {
        await supabase
          .from('journal')
          .insert({
            account: account!.id,
            member: entry_data.member,
            is_public: entry_data.is_public,
            title: entry_data.title,
            content: entry_data.content,
          });
      }
    }
  )

  return (
    <>
      <Fab
        className="fixed bottom-safe-4 right-safe-4"
        style={{ zIndex: 1500 }}
        icon={<Save/>}
        component="button"
        onClick={() => {
          entry_mutators.create();
          router.push('/app/journal');
        }}
      />
      <Stack sx={{ p: 5 }} spacing={2}>
        <Select
          id="member"
          label="Member"
          value={entry_data.member}
          onChange={ev => updateEntryData(draft => { draft.member = ev.target.value })}
          // sx={{ width: '10em' }}
        >
          { selectable_members?.map(smember => {
            return (
              <MenuItem key={smember.id} value={smember.id}>
                <ListItem sx={{ p: 0 }}>
                  <ListItemAvatar>
                    { smember && smember.avatar ? (
                      <Image
                        className="rounded-full"
                        src={smember.avatar}
                        width={25}
                        height={25}
                        alt="Profile picture"
                      />
                    ) : '?' }
                  </ListItemAvatar>
                  <ListItemText
                    primary={smember.name}
                    secondary={smember.pronouns}
                  />
                </ListItem>
              </MenuItem>
            )
          }) }
        </Select>
        <List>
          <ListItem
            secondaryAction={
              <Switch
                checked={entry_data.is_public}
                onChange={ev => updateEntryData(draft => { draft.is_public = ev.target.checked })}
              />
            }
          >
            <ListItemText
              primary="Is journal entry public?"
              secondary="If enabled, strangers will be able to read this entry"
            />
          </ListItem>
        </List>
        <TextField
          label="Title"
          variant="outlined"
          value={entry_data.title}
          onChange={ev => updateEntryData(draft => { draft.title = ev.target.value })}
          sx={{ width: '100%' }}
        />
        <TextField multiline
          label="Content"
          variant="outlined"
          value={entry_data.content}
          onChange={ev => updateEntryData(draft => { draft.content = ev.target.value })}
          minRows={10}
          sx={{ width: '100%' }}
        />
      </Stack>
    </>
  );
}