import { Avatar, Stack, TextField, useMediaQuery, useTheme } from "@mui/material";
import { Block, Button, Fab, Link, Sheet, Toolbar, ToolbarPane } from "konsta/react";
import Image from "next/image";
import { Tables } from '../../../../../lib/supabase/database.types';
import { useCallback, useState } from "react";
import { Check, Close, Save } from "@mui/icons-material";
import { MuiColorInput } from "mui-color-input";
import { Updater } from "use-immer";
import { useFilePicker } from 'use-file-picker';
import { useSupabase } from "@/lib/supabase/client";
import mime from 'mime';

const AVATAR_SIZES = [300, 300];

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
    const path = `${member.id}.${mime.getExtension(avatar_file!.type)}`;
    await supabase.storage
      .from('avatars')
      .upload(path, avatar_file!, {upsert: true});
    const { data } = await supabase.storage.from('avatars').getPublicUrl(path);
    member_mutations.updateAvatar(data.publicUrl);
  }, [avatar_file, member.id, member_mutations, supabase.storage]);

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
      <Stack gap={2} display="flex" sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <TextField
          name="name"
          label="Name"
          variant="outlined"
          // defaultValue={member?.name}
          value={member_state.name}
          onChange={ev => updateMemberState(draft => { draft.name = ev.target.value })}
          sx={{ width: '90%' }}
        />
        {!member.is_status && <TextField
          name="pronouns"
          label="Pronouns"
          variant="outlined"
          // defaultValue={member?.pronouns}
          value={member_state.pronouns}
          onChange={ev => updateMemberState(draft => { draft.pronouns = ev.target.value })}
          sx={{ width: '90%' }}
        />}
        <TextField multiline
          name="description"
          label="Description"
          variant="outlined"
          // defaultValue={member?.description}
          value={member_state.description}
          onChange={ev => updateMemberState(draft => { draft.description = ev.target.value })}
          minRows={3}
          sx={{ width: '90%' }}
        />
        <MuiColorInput
          name="color"
          label="Color"
          variant="outlined"
          format="rgb"
          value={member_state?.color ? `rgb(${member_state.color})` : 'rgb(255, 255, 255)'}
          onChange={nv => updateMemberState(draft => { draft.color = nv.slice(4, -1) })}
          sx={{ width: '90%' }}
        />
      </Stack>
      <Fab
        className="fixed bottom-safe-16 right-safe-4"
        icon={<Save/>}
        text="Save"
        textPosition="after"
        component="button"
        onClick={member_mutations.update}
      />
    </>
  )
}