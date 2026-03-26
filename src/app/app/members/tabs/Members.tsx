import { useShortMutations, useShortQuery } from "@/lib/hooks/useShortQuery";
import { useSupabase } from "@/lib/supabase/client";
import { Add, Archive, ArrowDownward, ArrowLeft, ArrowUpward, Check, Close, CreateNewFolder, ExpandLess, ExpandMore, Folder, Settings } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, IconButton, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Stack, TextField, useMediaQuery, useTheme } from "@mui/material";
import { Block, BlockTitle, Button, Fab, Link, Sheet, Toolbar, ToolbarPane } from "konsta/react";
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

  const [ new_member_sheet_opened, setNewMemberSheetOpened ] = useState(false);
  const [ new_member_sheet_form, updateNewMemberSheetForm ] = useImmer({
    name: '',
    pronouns: '',
    description: '',
  });

  const [ new_folder_sheet_opened, setNewFolderSheetOpened ] = useState(false);
  const [ new_folder_sheet_form, updateNewFolderSheetForm ] = useImmer({
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

  const [ in_folder, setInFolder ] = useState<string[]>([]);
  const [ in_archive, setInArchive ] = useState<boolean>(false);
  const [ folders_collapsed, setFoldersCollapsed ] = useState<boolean>(false);
  const { data: folders } = useShortQuery(
    ['folders', account?.id, in_folder],
    async () => {
      if (in_folder.at(-1)) {
        const { data } = await supabase
          .from('folders')
          .select()
          .eq('subfolder_of', in_folder.at(-1) ?? '')
          .eq('account', account!.id);
        return data;
      } else {
        const { data } = await supabase
          .from('folders')
          .select()
          .is('subfolder_of', null)
          .eq('account', account!.id);
        return data;
      }
    },
    [ account ],
  );

  const folder_mutators = useShortMutations(
    ['folders', account?.id, in_folder],
    {
      create: async () => {
        const { error } = await supabase
          .from('folders')
          .insert({
            account: account!.id,
            name: new_folder_sheet_form.name,
            description: new_folder_sheet_form.description,
            subfolder_of: in_folder?.at(-1) ?? null,
          });
        if (error) console.error(error);
      }
    }
  )

  const { data: members } = useShortQuery(
    ["members", account?.id, in_folder],
    async () => {
      if (in_folder.at(-1)) {
        const { error, data: folder_members } = await supabase
          .from('folder_members')
          .select('folder, member ( * )')
          .eq('folder', in_folder.at(-1) ?? '');
        if (error) console.error(['members', account?.id, in_folder], error);
        return folder_members?.map(fm => fm.member) ?? [];
      } else {
        const { data } = await supabase
          .from('members')
          .select()
          .eq('account', account!.id)
          .eq('is_status', false);
        return data;
      }
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
            ...new_member_sheet_form,
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
        const response = await fetch(`/api/member/${member_id}/front`, {
          method: 'POST',
        });
        const result = await response.json();
        if (result.error) {
          console.error(result);
        }
      },
      unfront: async (member_id: string) => {
        const response = await fetch(`/api/member/${member_id}/unfront`, {
          method: 'POST',
        });
        const result = await response.json();
        if (result.error) {
          console.error(result);
        }
      }
    },
  );

  const ordered_members = useMemo(() => {
    const fronting_members = members?.filter(member => active_fronts?.find(afr => afr.member === member.id));
    const sleeping_members = members?.filter(member => !active_fronts?.find(afr => afr.member === member.id));
    const alphabetical_fronting_members = fronting_members?.toSorted((a, b) => a.name?.localeCompare(b.name!) ?? 0) ?? [];
    const alphabetical_sleeping_members = sleeping_members?.toSorted((a, b) => a.name?.localeCompare(b.name!) ?? 0) ?? [];
    const ordered_members = [
      ...alphabetical_fronting_members,
      ...alphabetical_sleeping_members,
    ];
    const ordered_members_without_archived = ordered_members.filter(om => !om.archived);
    return ordered_members_without_archived;
  }, [active_fronts, members]);

  const archived_members = useMemo(() => {
    return members?.filter(m => m.archived);
  }, [members]);

  return (
    <>
      <Fab
        className="fixed right-safe-4 bottom-safe-16"
        icon={<Add/>}
        onClick={() => setNewMemberSheetOpened(true)}
      />
      <Sheet
        className="pb-safe"
        opened={new_member_sheet_opened}
        onBackdropClick={() => setNewMemberSheetOpened(false)}
        style={{ zIndex: 1400, maxWidth: '500px', left: is_mobile ? '0' : '40%' }}
      >
        <Toolbar top className="justify-end">
          <ToolbarPane>
            <Link iconOnly onClick={() => setNewMemberSheetOpened(false)}>
              <Close/>
            </Link>
          </ToolbarPane>
          <ToolbarPane>
            <Link iconOnly onClick={() => {
              member_mutations.add();
              updateNewMemberSheetForm(draft => {
                draft.name = '';
                draft.pronouns = '';
                draft.description = '';
              })
              setNewMemberSheetOpened(false);
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
              value={new_member_sheet_form.name}
              onChange={ev => updateNewMemberSheetForm(draft => { draft.name = ev.target.value })}
            />
            <TextField
              id="member-pronouns"
              label="Pronouns"
              variant="outlined"
              sx={{ width: '100%' }}
              value={new_member_sheet_form.pronouns}
              onChange={ev => updateNewMemberSheetForm(draft => { draft.pronouns = ev.target.value })}
            />
            <TextField multiline
              id="member-description"
              label="Description"
              variant="outlined"
              minRows={3}
              sx={{ width: '100%' }}
              value={new_member_sheet_form.description}
              onChange={ev => updateNewMemberSheetForm(draft => { draft.description = ev.target.value })}
            />
          </Stack>
        </Block>
      </Sheet>
      <Sheet
        className="pb-safe"
        opened={new_folder_sheet_opened}
        onBackdropClick={() => setNewFolderSheetOpened(false)}
        style={{ zIndex: 1400, maxWidth: '500px', left: is_mobile ? '0' : '40%' }}
      >
        <Toolbar top className="justify-end">
          <ToolbarPane>
            <Link iconOnly onClick={() => setNewFolderSheetOpened(false)}>
              <Close/>
            </Link>
          </ToolbarPane>
          <ToolbarPane>
            <Link iconOnly onClick={() => {
              folder_mutators.create();
              updateNewFolderSheetForm(draft => {
                draft.name = '';
                draft.description = '';
              })
              setNewFolderSheetOpened(false);
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
              value={new_folder_sheet_form.name}
              onChange={ev => updateNewFolderSheetForm(draft => { draft.name = ev.target.value })}
            />
            <TextField multiline
              label="Description"
              variant="outlined"
              minRows={3}
              sx={{ width: '100%' }}
              value={new_folder_sheet_form.description}
              onChange={ev => updateNewFolderSheetForm(draft => { draft.description = ev.target.value })}
            />
          </Stack>
        </Block>
      </Sheet>
      <Block>
        {(in_folder?.length ?? 0) > 0 && <Button
          onClick={() => setInFolder(inf => inf.slice(0, -1))}
        >
          <ArrowLeft/> Go back
        </Button> }
        {in_archive && <Button
          onClick={() => setInArchive(false)}
        >
          <ArrowLeft/> Go back
        </Button> }
        {!in_archive && <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <BlockTitle className="mt-0 mb-0">Folders</BlockTitle>
          <Stack direction="row">
            <IconButton onClick={() => setNewFolderSheetOpened(true)}>
              <CreateNewFolder/>
            </IconButton>
            {in_folder.at(-1) && <IconButton onClick={() => router.push(`/app/folders/${in_folder.at(-1)}`)}>
              <Settings/>
            </IconButton> }
            <IconButton onClick={() => {setFoldersCollapsed(fc => !fc)}}>
              { folders_collapsed ? <ExpandMore/> : <ExpandLess/> }
            </IconButton>
          </Stack>
        </Stack> }
        { !folders_collapsed && <List>
          { (archived_members?.length ?? 0) > 0 && !in_archive && (
            <ListItem
              style={{
                backgroundColor: `rgba(200, 200, 200, 20%)`,
                borderRadius: '10px',
                marginBottom: 5,
              }}
            >
              <ListItemButton
                onClick={() => setInArchive(true)}
              >
                <ListItemAvatar>
                  <Archive/>
                </ListItemAvatar>
                <ListItemText
                  primary="Archive"
                  secondary="See archived members"
                />
              </ListItemButton>
            </ListItem>
          )}
          { !in_archive && folders?.map(folder => {
            return (
              <ListItem
                key={folder.id}
                style={{
                  backgroundColor: `rgba(${folder.color ?? '255, 255, 255'}, 20%)`,
                  borderRadius: '10px',
                  marginBottom: 5,
                }}
              >
                <ListItemButton
                  onClick={() => setInFolder(inf => [...(inf ?? []), folder.id])}
                >
                  <ListItemAvatar>
                    <Folder/>
                  </ListItemAvatar>
                  <ListItemText
                    primary={folder.name}
                    secondary={folder.description}
                  />
                </ListItemButton>
              </ListItem>
            );
          }) }
        </List> }
      </Block>
      <Block>
        <BlockTitle style={{ marginBottom: 1 }}>{in_folder ? `Members in folder` : "All members"}</BlockTitle>
        <List>
          { (in_archive ? archived_members : ordered_members)?.map(member => {
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