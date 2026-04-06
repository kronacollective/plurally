'use client'

import useAccount from "@/lib/hooks/useAccount"
import { useShortMutations, useShortQuery } from "@/lib/hooks/useShortQuery";
import { useSupabase } from "@/lib/supabase/client";
import { Add, Check, Close, Delete } from "@mui/icons-material";
import { IconButton, List, ListItem, ListItemButton, ListItemText, Stack, Switch, TextField, useMediaQuery, useTheme } from "@mui/material"
import { DateTimePicker } from "@mui/x-date-pickers";
import { addDays } from "date-fns";
import { Block, Button, Fab, Link, Sheet, Toolbar, ToolbarPane } from "konsta/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useImmer } from "use-immer";

type PollOption = {
  name: string,
  description: string,
};

export default function Polls() {
  const supabase = useSupabase();
  const router = useRouter();
  const { data: account } = useAccount();

  const theme = useTheme();
  const is_mobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [ new_poll_sheet_opened, setNewPollSheetOpened ] = useState(false);
  const [ new_poll_sheet_form, updateNewPollSheetForm ] = useImmer({
    name: '',
    description: '',
    ends_at: addDays(new Date(), 7),
    is_multi: false,
    can_veto: true,
    can_abstain: true,
    multi_options: [] as PollOption[],
  });

  const { data: polls } = useShortQuery(
    ['polls', account?.id],
    async () => {
      const { data } = await supabase
        .from('polls')
        .select()
        .eq('account', account!.id);
      return data;
    },
  );

  const poll_mutators = useShortMutations(
    ['polls', account?.id],
    {
      create: async () => {
        const { data: new_poll } = await supabase
          .from('polls')
          .insert({
            account: account!.id,
            name: new_poll_sheet_form.name,
            description: new_poll_sheet_form.description,
            ends_at: new_poll_sheet_form.ends_at.toISOString(),
            is_multi: new_poll_sheet_form.is_multi,
            can_veto: new_poll_sheet_form.can_veto,
            can_abstain: new_poll_sheet_form.can_abstain,
          })
          .select()
          .single();
        if (new_poll_sheet_form.is_multi) {
          new_poll_sheet_form.multi_options.forEach(async (option) => {
            await supabase
              .from('poll_options')
              .insert({
                name: option.name,
                description: option.description,
                poll: new_poll!.id,
              });
          });
        } else {
          await supabase
            .from('poll_options')
            .insert([
              { name: 'Yes', description: 'Affirmative or positive vote', poll: new_poll!.id },
              { name: 'No', description: 'Negative vote', poll: new_poll!.id },
              ...(new_poll_sheet_form.can_veto ? [{ name: 'Veto', description: 'Nulls the vote', poll: new_poll!.id }] : []),
              ...(new_poll_sheet_form.can_abstain ? [{ name: 'Abstain', description: 'Neutral position', poll: new_poll!.id }] : []),
            ])
        }
      }
    }
  )

  return (
    <>
      <List>
        {polls?.map(poll => {
          return (
            <ListItem key={poll.id}>
              <ListItemButton onClick={() => router.push(`/app/polls/${poll.id}`)}>
                <ListItemText
                  primary={poll.name}
                  secondary={poll.description}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
      <Fab
        className="fixed right-safe-4 bottom-safe-4"
        style={{ zIndex: 1500 }}
        icon={<Add/>}
        onClick={() => setNewPollSheetOpened(true)}
      />
      <Sheet
        className="pb-safe"
        opened={new_poll_sheet_opened}
        onBackdropClick={() => setNewPollSheetOpened(false)}
        style={{ zIndex: 1400, maxWidth: '500px', left: is_mobile ? '0' : '40%' }}
      >
        <Toolbar top className="justify-end">
          <ToolbarPane>
            <Link iconOnly onClick={() => setNewPollSheetOpened(false)}>
              <Close/>
            </Link>
          </ToolbarPane>
          <ToolbarPane>
            <Link iconOnly onClick={() => {
              poll_mutators.create();
              updateNewPollSheetForm(draft => {
                draft.name = '';
                draft.description = '';
                draft.ends_at = addDays(new Date(), 7);
                draft.is_multi = false;
                draft.can_veto = true;
                draft.can_abstain = true;
                draft.multi_options = [] as PollOption[];
              });
              setNewPollSheetOpened(false);
            }}>
              <Check/>
            </Link>
          </ToolbarPane>
        </Toolbar>
        <Block style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <Stack gap={2}>
            <TextField
              label="Name"
              variant="outlined"
              sx={{ width: '100%' }}
              value={new_poll_sheet_form.name}
              onChange={ev => updateNewPollSheetForm(draft => { draft.name = ev.target.value })}
            />
            <TextField multiline
              label="Description"
              variant="outlined"
              minRows={3}
              sx={{ width: '100%' }}
              value={new_poll_sheet_form.description}
              onChange={ev => updateNewPollSheetForm(draft => { draft.description = ev.target.value })}
            />
            <DateTimePicker
              label="Ends at"
              sx={{ width: '100%' }}
              value={new_poll_sheet_form.ends_at}
              onChange={nd => updateNewPollSheetForm(draft => { draft.ends_at = nd! })}
            />
            <List>
              <ListItem secondaryAction={
                <Switch
                  value={new_poll_sheet_form.is_multi}
                  onChange={ev => updateNewPollSheetForm(draft => { draft.is_multi = ev.target.checked })}
                />
              }>
                <ListItemText primary="Multiple choice question?" secondary="Turned off means it will be a yes/no/abstain/veto vote"/>
              </ListItem>
              <ListItem secondaryAction={
                <Switch
                  value={new_poll_sheet_form.can_veto}
                  onChange={ev => updateNewPollSheetForm(draft => { draft.can_veto = ev.target.checked })}
                />
              }>
                <ListItemText primary="Are vetos allowed?"/>
              </ListItem>
              <ListItem secondaryAction={
                <Switch
                  value={new_poll_sheet_form.can_abstain}
                  onChange={ev => updateNewPollSheetForm(draft => { draft.can_abstain = ev.target.checked })}
                />
              }>
                <ListItemText primary="Is abstaining allowed?"/>
              </ListItem>
            </List>
            { new_poll_sheet_form.is_multi && (
              <>
                <List>
                  { new_poll_sheet_form.multi_options.map((option, option_idx) => {
                    return (
                      <ListItem key={option.name} secondaryAction={
                        <IconButton color="error" onClick={() => updateNewPollSheetForm(draft => { draft.multi_options = draft.multi_options.toSpliced(option_idx, 1) })}>
                          <Delete/>
                        </IconButton>
                      }>
                        <Stack spacing={2}>
                          <TextField
                            label="Name"
                            variant="outlined"
                            sx={{ width: '100%' }}
                            value={option.name}
                            onChange={ev => updateNewPollSheetForm(draft => { draft.multi_options[option_idx].name = ev.target.value })}
                          />
                          <TextField multiline
                            label="Description"
                            variant="outlined"
                            sx={{ width: '100%' }}
                            value={option.description}
                            onChange={ev => updateNewPollSheetForm(draft => { draft.multi_options[option_idx].description = ev.target.value })}
                          />
                        </Stack>
                      </ListItem>
                    );
                  }) }
                </List>
                <Button onClick={() => updateNewPollSheetForm(draft => { draft.multi_options.push({ name: '', description: '' }) })}>
                  <Add/> Add new option
                </Button>
              </>
            )}
          </Stack>
        </Block>
      </Sheet>
    </>
  )
}