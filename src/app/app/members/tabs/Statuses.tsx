import { useShortMutations, useShortQuery } from "@/lib/hooks/useShortQuery";
import { useSupabase } from "@/lib/supabase/client";
import { Add, ArrowDownward, ArrowUpward, Check, Close } from "@mui/icons-material";
import { IconButton, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Stack, TextField, useMediaQuery, useTheme } from "@mui/material";
import { Block, BlockTitle, Fab, Link, Sheet, Toolbar, ToolbarPane } from "konsta/react";
import { nanoid } from "nanoid";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useImmer } from "use-immer";

export default function Statuses() {
  const supabase = useSupabase();
  const router = useRouter();

  const theme = useTheme()
  const is_mobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [ sheet_opened, setSheetOpened ] = useState(false);
  const [ sheet_form, updateSheetForm ] = useImmer({
    name: '',
    description: '',
  });

  const { data: account } = useShortQuery(
    ["account"],
    async () => {
      const { data: user } = await supabase.auth.getUser();
      const { data: account } = await supabase
        .from('accounts')
        .select()
        .eq('user', user.user!.id)
        .single();
      return account;
    },
  );

  const { data: statuses } = useShortQuery(
    ["statuses"],
    async () => {
      const { data } = await supabase
        .from('members')
        .select()
        .eq('account', account!.id)
        .eq('is_status', true);
      return data;
    },
    [ account ],
  );


  const status_mutations = useShortMutations(
    ["statuses"],
    {
      add: async () => {
        await supabase
          .from('members')
          .insert({
            id: nanoid(),
            account: account!.id,
            ...sheet_form,
            color: '255, 255, 255',
            is_status: true,
          });
      }
    }
  );

  const { data: active_fronts } = useShortQuery(
    ["fronts", "active"],
    async () => {
      const { data, error } = await supabase
        .from('fronts')
        .select()
        .eq('account', account!.id)
        .is('end', null);
      if (error) console.error('active_fronts', error);
      return data;
    },
    [ account ],
  );

  // @ts-expect-error Strictness is making short mutations not work anymore
  const front_mutations = useShortMutations<FrontMutators>(
    ["fronts"],
    {
      front: async (member_id: string) => {
        const { error } = await supabase
          .from('fronts')
          .insert({
            member: member_id,
            account: account!.id,
          });
        if (error) console.error(error);
      },
      unfront: async (member_id: string) => {
        await supabase
          .from('fronts')
          .update({
            end: new Date().toISOString(),
          })
          .eq('member', member_id)
          .is('end', null);
      }
    },
  );
  return (
    <>
      <Fab
        className="fixed right-safe-4 bottom-safe-16"
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
              status_mutations.add();
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
              label="Name"
              variant="outlined"
              sx={{ width: '100%' }}
              value={sheet_form.name}
              onChange={ev => updateSheetForm(draft => { draft.name = ev.target.value })}
            />
            <TextField multiline
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
      <Block>
        <BlockTitle style={{ marginBottom: 1 }}>All statuses</BlockTitle>
        <List>
          { statuses?.map(status => {
            const is_fronting = active_fronts?.find(fr => fr.member === status.id);
            return (
              <ListItem
                key={status.id}
                style={{
                  backgroundColor: `rgba(${status.color ?? '255, 255, 255'}, ${is_fronting ? 35 : 20}%)`,
                  borderRadius: '10px',
                  marginBottom: 5,
                }}
                secondaryAction={
                  is_fronting ? (
                    <IconButton onClick={() => front_mutations.unfront(status.id)}>
                      <ArrowDownward/>
                    </IconButton>
                  ) : (
                    <IconButton onClick={() => front_mutations.front(status.id)}>
                      <ArrowUpward/>
                    </IconButton>
                  )
                }
              >
                <ListItemButton
                  onClick={() => router.push(`/app/members/${status.id}`)}
                >
                  <ListItemAvatar sx={{ mr: 2 }}>
                    { status && status.avatar ? (
                      <Image
                        className="rounded-full"
                        src={status.avatar}
                        width={60}
                        height={60}
                        alt="Profile picture"
                      />
                    ) : (
                      "?"
                    )}
                  </ListItemAvatar>
                  <ListItemText
                    primary={status.name}
                    secondary={status.pronouns}
                  >
                  </ListItemText>
                </ListItemButton>
              </ListItem>
            )
          }) }
        </List>
      </Block>
    </>
  )
}