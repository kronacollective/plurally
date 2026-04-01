import { Avatar, IconButton, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, MenuItem, Select, Stack, TextField, useMediaQuery, useTheme } from "@mui/material";
import { Block, BlockTitle, Button, Fab, Link, Sheet, Toolbar, ToolbarPane } from "konsta/react";
import Image from "next/image";
import { Tables } from '../../../../../lib/supabase/database.types';
import { useCallback, useMemo, useState } from "react";
import { Add, ArrowDownward, ArrowUpward, Check, Close, Delete, Save, SwapVert } from "@mui/icons-material";
import { MuiColorInput } from "mui-color-input";
import { Updater } from "use-immer";
import { useFilePicker } from 'use-file-picker';
import { useSupabase } from "@/lib/supabase/client";
import mime from 'mime';
import { useShortMutations, useShortQuery } from "@/lib/hooks/useShortQuery";
import useAccount from "@/lib/hooks/useAccount";
import { useRouter } from "next/navigation";
import EditableMarkdownField from "@/app/components/EditableMarkdownField";

const AVATAR_SIZES = [300, 300];

type FrontMutators = {
  front: (member_id: string) => Promise<void>,
  unfront: (member_id: string) => Promise<void>
};

type RelationshipMutators = {
  create: () => Promise<void>,
  update: (id: string, field: string, value: string | null) => Promise<void>,
  delete: (id: string) => Promise<void>,
  swap: (rel: Tables<'relationships'>) => Promise<void>,
}

export default function MainMemberDisplay({
  member,
  member_mutations,
  member_state,
  updateMemberState,
}: {
  member: Tables<'members'>
  member_mutations: {
    update: () => Promise<void>;
    deleteMember: () => Promise<void>;
    updateAvatar: (url: string) => Promise<void>;
  } & {
    invalidateCache: () => Promise<void>;
  },
  member_state: Record<string, string | null>,
  updateMemberState: Updater<Record<string, string | null>>,
}) {
  const supabase = useSupabase();
  const router = useRouter();
  const [ avatar_src, setAvatarSrc ] = useState<string | null>(null);
  const [ avatar_file, setAvatarFile ] = useState<File | null>(null);
  const { openFilePicker, } = useFilePicker({
    readAs: 'DataURL',
    accept: 'image/*',
    onFilesSuccessfullySelected: ({filesContent, plainFiles}) => {
      setAvatarSrc(filesContent.at(0)!.content)
      setAvatarFile(plainFiles.at(0)!);
    },
  });
  const theme = useTheme()
  const is_mobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [ avatar_sheet_open, setAvatarSheetOpen ] = useState(false);

  const uploadAvatar = useCallback(async () => {
    // Locate old file
    const { data: old_file } = await supabase
      .storage
      .from('avatars')
      .list('', {
        limit: 1,
        search: member.id
      });
    // Remove old file
    await supabase.storage.from('avatars').remove([old_file?.[0].name ?? '']);
    // Upload new file
    const path = `${member.id}-${new Date().getTime()}.${mime.getExtension(avatar_file!.type)}`;
    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, avatar_file!, {upsert: true});
    if (error) console.error('uploadAvatar', error);
    // Get public URL for new file
    const { data } = await supabase.storage.from('avatars').getPublicUrl(path);
    // Update avatar URL
    member_mutations.updateAvatar(data.publicUrl);
  }, [avatar_file, member.id, member_mutations, supabase.storage]);

  // Get submembers
  const { data: account } = useAccount();
  const { data: submembers } = useShortQuery(
    ['members', account?.id, 'sub', member.id],
    async () => {
      const { data } = await supabase
        .from('members')
        .select()
        .eq('account', account!.id)
        .eq('member_of', member.id);
      return data;
    },
  );

  // Get active fronts
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

  // Order submembers
  const ordered_submembers = useMemo(() => {
    const fronting_members = submembers?.filter(member => active_fronts?.find(afr => afr.member === member.id));
    const sleeping_members = submembers?.filter(member => !active_fronts?.find(afr => afr.member === member.id));
    const alphabetical_fronting_members = fronting_members?.toSorted((a, b) => a.name?.localeCompare(b.name!) ?? 0) ?? [];
    const alphabetical_sleeping_members = sleeping_members?.toSorted((a, b) => a.name?.localeCompare(b.name!) ?? 0) ?? [];
    const ordered_members = [
      ...alphabetical_fronting_members,
      ...alphabetical_sleeping_members,
    ];
    const ordered_members_without_archived = ordered_members.filter(om => !om.archived);
    return ordered_members_without_archived;
  }, [active_fronts, submembers]);

  // Mutate fronts
  // @ts-expect-error: bad
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

  // Get relationships
  const { data: relationships } = useShortQuery(
    ['relationships', member.id],
    async () => {
      const { data } = await supabase
        .from('relationships')
        .select('*,origin_member:members!origin_member(*),target_member:members!target_member(*)')
        .or(`origin_member.eq.${member.id},target_member.eq.${member.id}`);
      return data;
    },
  );

  // @ts-expect-error: bad
  const relationship_mutators = useShortMutations<RelationshipMutators>(
    ['relationships'],
    {
      create: async () => {
        await supabase
          .from('relationships')
          .insert({
            origin_member: member.id,
            target_type: 'member',
          });
      },
      update: async (id: string, field: string, value: string | null) => {
        await supabase
          .from('relationships')
          .update({ [field]: value })
          .eq('id', id);
      },
      delete: async (id: string) => {
        await supabase
          .from('relationships')
          .delete()
          .eq('id', id);
      },
      swap: async (rel: Tables<'relationships'>) => {
        console.log('swap', rel);
        const { error } = await supabase
          .from('relationships')
          .update({
            // @ts-expect-error: rel is unsufficiently typed
            origin_member: rel.target_member?.id,
            origin_arbitrary: rel.target_arbitrary,
            origin_label: rel.target_label,
            origin_type: rel.target_type,
            // @ts-expect-error: rel is unsufficiently typed
            target_member: rel.origin_member?.id,
            target_arbitrary: rel.origin_arbitrary,
            target_label: rel.origin_label,
            target_type: rel.origin_type,
          })
          .eq('id', rel.id);
        if (error) console.error('swap', error);
      }
    }
  );

  // Get selectable members for relationships
  const { data: selectable_members } = useShortQuery(
    ['members', account?.id, 'selectable'],
    async () => {
      // Fetch data
      const { data } = await supabase
        .from('members')
        .select()
        .eq('account', account!.id)
        .neq('id', member.id)
        .eq('is_status', false);
      // Sort data
      const alphabetical_members = data?.toSorted((a, b) => a.name?.localeCompare(b.name!) ?? 0) ?? [];
      // Return
      return alphabetical_members;
    }
  );

  return (
    <>
      <Link onClick={() => setAvatarSheetOpen(true)}>
        <Avatar variant="rounded" sx={{ width: AVATAR_SIZES[0], height: AVATAR_SIZES[1], mt: 3, mb: 3 }}>
          {member && member.avatar ? (
            <Image
              src={member.avatar}
              alt={`Profile picture for ${member.name}`}
              width={AVATAR_SIZES[0]}
              height={AVATAR_SIZES[1]}
            />
          ) : (
            "?"
          )}
        </Avatar>
      </Link>
      <Sheet
        className="pb-safe"
        opened={avatar_sheet_open}
        onBackdropClick={() => setAvatarSheetOpen(false)}
        style={{ zIndex: 1400, maxWidth: '500px', left: is_mobile ? '0' : '40%' }}
      >
        <Toolbar top className="justify-end">
          <ToolbarPane>
            <Link iconOnly onClick={() => setAvatarSheetOpen(false)}>
              <Close/>
            </Link>
          </ToolbarPane>
          <ToolbarPane>
            <Link iconOnly onClick={() => {
              uploadAvatar();
              setAvatarSheetOpen(false);
            }}>
              <Check/>
            </Link>
          </ToolbarPane>
        </Toolbar>
        <Block style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
          {/* <TextField
            label="Avatar URL"
            variant="outlined"
            sx={{ width: '100%' }}
            value={member_state.avatar ?? ''}
            onChange={ev => updateMemberState(draft => { draft.avatar = ev.target.value })}
          /> */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {avatar_src && <img
            src={avatar_src}
            id="proposed-avatar"
            alt="Proposed profile picture"
            width={300}
            height={300}
            style={{ padding: 16 }}
          />}
          <Button
            onClick={openFilePicker}
          >
            Select image
          </Button>
        </Block>
      </Sheet>
      <BlockTitle>Information</BlockTitle>
      <Block style={{ width: '100%' }}>
        <Stack gap={2} display="flex" sx={{ width: '100%' }}>
          <TextField
            name="name"
            label="Name"
            variant="outlined"
            // defaultValue={member?.name}
            value={member_state.name ?? ''}
            onChange={ev => updateMemberState(draft => { draft.name = ev.target.value })}
            sx={{ width: '100%' }}
          />
          {!member.is_status && <TextField
            name="pronouns"
            label="Pronouns"
            variant="outlined"
            // defaultValue={member?.pronouns}
            value={member_state.pronouns ?? ''}
            onChange={ev => updateMemberState(draft => { draft.pronouns = ev.target.value })}
            sx={{ width: '100%' }}
          />}
          <TextField multiline
            name="description"
            label="Description"
            variant="outlined"
            // defaultValue={member?.description}
            value={member_state.description ?? ''}
            onChange={ev => updateMemberState(draft => { draft.description = ev.target.value })}
            minRows={3}
            sx={{ width: '100%' }}
          />
          <MuiColorInput
            name="color"
            label="Color"
            variant="outlined"
            format="rgb"
            value={member_state?.color ? `rgb(${member_state.color})` : 'rgb(255, 255, 255)'}
            onChange={nv => updateMemberState(draft => { draft.color = nv.slice(4, -1) })}
            sx={{ width: '100%' }}
          />
        </Stack>
      </Block>
      <BlockTitle>Relationships</BlockTitle>
      <Block>
        <Stack>
          <List>
            { relationships?.map(rel => {
              return (
                <ListItem key={rel.id} sx={{
                  backgroundColor: `rgba(${member.color ?? '255, 255, 255'}, 20%)`,
                  borderRadius: '10px',
                  marginBottom: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Stack sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} spacing={2}>
                    <Stack spacing={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      { rel.origin_member?.id === member.id
                        ? member.name
                        : (
                          <>
                            <Select
                              value={rel.origin_type ?? 'member'}
                              onChange={ev => relationship_mutators.update(rel.id, 'origin_type', ev.target.value ?? 'member')}
                            >
                              <MenuItem value="member">Member</MenuItem>
                              <MenuItem value="arbitrary">Arbitrary value</MenuItem>
                              <MenuItem value="external">External member</MenuItem>
                            </Select>
                            { rel.origin_type === 'member' && (
                              <Select
                                id="member"
                                value={rel.origin_member?.id ?? null}
                                onChange={ev => relationship_mutators.update(rel.id, 'origin_member', ev.target.value ?? null)}
                                sx={{ width: '10em' }}
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
                            ) }
                            { rel.origin_type === 'external' && (
                              <EditableMarkdownField
                                label="Member ID"
                                value={rel.origin_member?.id ?? ''}
                                onSave={nomi => relationship_mutators.update(rel.id, 'origin_member', nomi)}
                              />
                            ) }
                            { rel.origin_type === 'arbitrary' && (
                              <EditableMarkdownField
                                label="Value"
                                value={rel.target_arbitrary ?? ''}
                                onSave={noa => relationship_mutators.update(rel.id, 'origin_arbitrary', noa)}
                              />
                            ) }
                          </>
                        )
                      }
                      <EditableMarkdownField
                        label="Is"
                        value={rel.origin_label ?? ''}
                        onSave={nol => relationship_mutators.update(rel.id, 'origin_label', nol)}
                      />
                    </Stack>
                    <ArrowDownward/>
                    <Stack direction="row" spacing={2}>
                      <IconButton onClick={() => relationship_mutators.swap(rel)}>
                        <SwapVert/>
                      </IconButton>
                      <div
                        style={{
                          backgroundColor: 'white',
                          borderRadius: '10px',
                          padding: '1em',
                        }}
                      >
                        <EditableMarkdownField
                          label="Relation"
                          value={rel.label ?? ''}
                          onSave={nl => relationship_mutators.update(rel.id, 'label', nl)}
                        />
                      </div>
                    </Stack>
                    <ArrowDownward/>
                    <Stack sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} spacing={2}>
                      { rel.target_member?.id === member.id
                        ? member.name
                        : (
                          <>
                            <Select
                              value={rel.target_type ?? 'member'}
                              onChange={ev => relationship_mutators.update(rel.id, 'target_type', ev.target.value ?? 'member')}
                            >
                              <MenuItem value="member">Member</MenuItem>
                              <MenuItem value="arbitrary">Arbitrary value</MenuItem>
                              <MenuItem value="external">External member</MenuItem>
                            </Select>
                            { rel.target_type === 'member' && (
                              <Select
                                id="member"
                                value={rel.target_member?.id ?? null}
                                onChange={ev => relationship_mutators.update(rel.id, 'target_member', ev.target.value ?? null)}
                                sx={{ width: '10em' }}
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
                            ) }
                            { rel.target_type === 'external' && (
                              <EditableMarkdownField
                                label="Member ID"
                                value={rel.target_member?.id ?? ''}
                                onSave={ntmi => relationship_mutators.update(rel.id, 'target_member', ntmi)}
                              />
                            ) }
                            { rel.target_type === 'arbitrary' && (
                              <EditableMarkdownField
                                label="Value"
                                value={rel.target_arbitrary ?? ''}
                                onSave={nta => relationship_mutators.update(rel.id, 'target_arbitrary', nta)}
                              />
                            ) }
                          </>
                        )
                      }
                      <EditableMarkdownField
                        label="Is"
                        value={rel.target_label ?? ''}
                        onSave={ntl => relationship_mutators.update(rel.id, 'target_label', ntl)}
                      />
                    </Stack>
                    <Button
                      className="bg-red-700"
                      onClick={() => relationship_mutators.delete(rel.id)}
                    >
                      <Delete/> Delete relationship
                    </Button>
                  </Stack>
                </ListItem>
              )
            }) }
          </List>
          <Button onClick={() => relationship_mutators.create()}>
            <Add/> Add relationship
          </Button>
        </Stack>
      </Block>
      <BlockTitle>Submembers</BlockTitle>
      <Block>
        <List>
          { ordered_submembers?.map(member => {
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
      <Fab
        className="fixed bottom-safe-16 right-safe-4"
        style={{ zIndex: 1500 }}
        icon={<Save/>}
        text="Save"
        textPosition="after"
        component="button"
        onClick={member_mutations.update}
      />
    </>
  )
}