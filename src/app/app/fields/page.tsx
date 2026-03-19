'use client';

import { useShortMutations, useShortQuery } from "@/lib/hooks/useShortQuery";
import { useSupabase } from "@/lib/supabase/client";
import { Add, Alarm, CalendarMonth, Check, Close, Delete, Palette, TextFields } from "@mui/icons-material";
import { IconButton, List, ListItem, ListItemText, MenuItem, Select, Stack, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import { CalendarIcon } from "@mui/x-date-pickers";
import { Block, Fab, Link, Sheet, Toolbar, ToolbarPane } from "konsta/react";
import { useState } from "react";
import { useImmer } from "use-immer";

type FieldMutators = {
  update: (field_id: string, type: string) => Promise<void>,
  delete: (field_id: string) => Promise<void>,
  create: () => Promise<void>,
}

export default function Fields() {
  const supabase = useSupabase();

  const [ sheet_opened, setSheetOpened ] = useState(false);
  const [ sheet_form, updateSheetForm ] = useImmer({
    name: '',
  });

  const theme = useTheme()
  const is_mobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { data: account } = useShortQuery(
    ['account'],
    async () => {
      // Find our account ID
      const { data: user } = await supabase.auth.getUser();
      const { data: account, error: account_error } = await supabase
        .from('accounts')
        .select('id')
        .eq('user', user.user!.id)
        .single();
      if (account_error || !account) {
        console.error("Couldn't find self account");
        return;
      }
      return account;
    },
  );

  const { data: fields } = useShortQuery(
    ['fields'],
    async () => {
      if (!account) return [];
      const { data } = await supabase
        .from('fields')
        .select()
        .eq('account', account.id);
      return data;
    },
    [ account ],
  );

  // @ts-expect-error Still bad
  const field_mutators = useShortMutations<FieldMutators>(
    ['fields'],
    {
      update: async (field_id: string, type: string) => {
        await supabase
          .from('fields')
          .update({ type })
          .eq('id', field_id);
      },
      delete: async (field_id: string) => {
        await supabase
          .from('fields')
          .delete()
          .eq('id', field_id);
      },
      create: async () => {
        await supabase
          .from('fields')
          .insert({
            account: account!.id,
            name: sheet_form.name,
          })
      }
    }
  )

  return (
    <>
      <Fab
        className="fixed right-safe-4 bottom-safe-4"
        icon={<Add/>}
        onClick={() => setSheetOpened(true)}
      />
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
              field_mutators.create();
              updateSheetForm(draft => {
                draft.name = '';
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
          </Stack>
        </Block>
      </Sheet>
      <Stack gap={2} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 3 }}>
        <List sx={{ width: '90%' }}>
          { fields?.map(field => {
            return (
              <ListItem key={field.id}
                style={{
                  backgroundColor: 'rgb(255, 255, 255)',
                  borderRadius: '10px',
                  marginBottom: 5,
                  height: '5em',
                }}
                secondaryAction={
                  <Stack gap={2} direction="row">
                    <Select
                      label="Type"
                      value={field.type}
                      sx={{ width: '10em' }}
                      onChange={ev => field_mutators.update(field.id, ev.target.value as string)}
                    >
                      <MenuItem value="text"><TextFields/> Text</MenuItem>
                      <MenuItem value="date"><CalendarIcon /> Date</MenuItem>
                      <MenuItem value="datetime"><Alarm /> Date and time</MenuItem>
                      <MenuItem value="daymonth"><CalendarMonth /> Day and month</MenuItem>
                      <MenuItem value="color"><Palette /> Color</MenuItem>
                    </Select>
                    <IconButton
                      color="error"
                      onClick={() => field_mutators.delete(field.id)}
                    >
                      <Delete/>
                    </IconButton>
                  </Stack>
                }
              >
                <ListItemText
                  primary={field.name}
                />
              </ListItem>
            )
          }) }
        </List>
      </Stack>
    </>
  );
}