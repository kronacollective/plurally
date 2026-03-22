import { useShortMutations, useShortQuery } from "@/lib/hooks/useShortQuery";
import { useSupabase } from "@/lib/supabase/client";
import { Add, ArrowDownward, ArrowUpward, Check, Close } from "@mui/icons-material";
import { IconButton, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Stack, TextField, useMediaQuery, useTheme } from "@mui/material";
import { Block, BlockTitle, Fab, Link, Sheet, Toolbar, ToolbarPane } from "konsta/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useImmer } from "use-immer";
import { nanoid } from 'nanoid';

type FrontMutators = {
  front: (member_id: string) => Promise<void>,
  unfront: (member_id: string) => Promise<void>
};

export default function MemberList() {
  const supabase = useSupabase();
  const router = useRouter();

  const theme = useTheme()
  const is_mobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [ sheet_opened, setSheetOpened ] = useState(false);
  const [ sheet_form, updateSheetForm ] = useImmer({
    name: '',
    pronouns: '',
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

  const { data: members } = useShortQuery(
    ["members", account?.id],
    async () => {
      const { data } = await supabase
        .from('members')
        .select()
        .eq('account', account!.id)
        .eq('is_status', false);
      return data;
    },
    [ account ],
  );


  const member_mutations = useShortMutations(
    ["members", account?.id],
    {
      add: async () => {
        await supabase
          .from('members')
          .insert({
            id: nanoid(),
            account: account!.id,
            ...sheet_form,
            color: '255, 255, 255',
          });
      }
    }
  );

  const { data: active_fronts } = useShortQuery(
    ["fronts", account?.id, "active"],
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

  const ordered_members = useMemo(() => {
    const fronting_members = members?.filter(member => active_fronts?.find(afr => afr.member === member.id));
    const sleeping_members = members?.filter(member => !active_fronts?.find(afr => afr.member === member.id));
    const alphabetical_fronting_members = fronting_members?.toSorted((a, b) => a.name?.localeCompare(b.name!) ?? 0) ?? [];
    const alphabetical_sleeping_members = sleeping_members?.toSorted((a, b) => a.name?.localeCompare(b.name!) ?? 0) ?? [];
    return [
      ...alphabetical_fronting_members,
      ...alphabetical_sleeping_members,
    ];
  }, [active_fronts, members]);

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
              member_mutations.add();
              updateSheetForm(draft => {
                draft.name = '';
                draft.pronouns = '';
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
            <TextField
              id="member-pronouns"
              label="Pronouns"
              variant="outlined"
              sx={{ width: '100%' }}
              value={sheet_form.pronouns}
              onChange={ev => updateSheetForm(draft => { draft.pronouns = ev.target.value })}
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
      <Block>
        <BlockTitle style={{ marginBottom: 1 }}>All members</BlockTitle>
        <List>
          { ordered_members?.map(member => {
            const is_fronting = active_fronts?.find(fr => fr.member === member.id);
            return (
              <ListItem
                key={member.id}
                style={{
                  backgroundColor: `rgba(${member.color ?? '255, 255, 255'}, ${is_fronting ? 35 : 20}%)`,
                  borderRadius: '10px',
                  marginBottom: 5,
                }}
                secondaryAction={
                  is_fronting ? (
                    <IconButton onClick={() => front_mutations.unfront(member.id)}>
                      <ArrowDownward/>
                    </IconButton>
                  ) : (
                    <IconButton onClick={() => front_mutations.front(member.id)}>
                      <ArrowUpward/>
                    </IconButton>
                  )
                }
              >
                <ListItemButton
                  onClick={() => router.push(`/app/members/${member.id}`)}
                >
                  <ListItemAvatar sx={{ mr: 2 }}>
                    { member && member.avatar ? (
                      <Image
                        className="rounded-full"
                        src={member.avatar}
                        width={60}
                        height={60}
                        alt="Profile picture"
                      />
                    ) : (
                      "?"
                    )}
                  </ListItemAvatar>
                  <ListItemText
                    primary={member.name}
                    secondary={member.pronouns}
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