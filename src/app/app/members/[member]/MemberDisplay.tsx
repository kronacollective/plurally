'use client';

import { Tables } from "@/lib/supabase/database.types";
import { Avatar, CircularProgress, Stack, TextField, useMediaQuery, useTheme } from "@mui/material";
import Image from "next/image";
import { MuiColorInput } from "mui-color-input";
import { useCallback, useEffect, useOptimistic, useState, useTransition } from "react";
import { useSupabase } from "@/lib/supabase/client";
import { Block, Fab, Link, Sheet, Toolbar, ToolbarPane } from "konsta/react";
import { Check, Close, Save } from "@mui/icons-material";
import { useShortMutations, useShortQuery } from "@/lib/hooks/useShortQuery";
import { useImmer } from "use-immer";

const SIZES = [300, 300]

export default function MemberDisplay({
  member_id,
}: {
  member_id: string,
}) {
  const supabase = useSupabase();

  const theme = useTheme()
  const is_mobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [ member_state, updateMemberState ] = useImmer<Record<string, string | null>>({});
  const [ avatar_sheet_open, setAvatarSheetOpen ] = useState(false);

  const { data: member } = useShortQuery(
    ["member", member_id],
    async () => {
      const { data: member } = await supabase
        .from('members')
        .select()
        .eq('id', member_id)
        .single();
      return member;
    },
  );

  useEffect(() => {
    if (!member) return;
    updateMemberState(draft => {
      Object.entries(member!).forEach(entry => draft[entry[0]] = entry[1])
    });
  }, [member, updateMemberState]);

  const member_mutations = useShortMutations(
    ["member", member_id],
    {
      update: async () => {
        await supabase
          .from('members')
          .update(member_state)
          .eq('id', member_id);
      },
    }
  );

  return !member ? <></> : (
    <Stack gap={2} display="flex" sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
      <Link onClick={() => setAvatarSheetOpen(true)}>
        <Avatar variant="rounded" sx={{ width: SIZES[0], height: SIZES[1], mt: 3, mb: 3 }}>
          {member && member.avatar ? (
            <Image
              src={member.avatar}
              alt={`Profile picture for ${member.name}`}
              width={SIZES[0]}
              height={SIZES[1]}
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
              member_mutations.update();
              setAvatarSheetOpen(false);
            }}>
              <Check/>
            </Link>
          </ToolbarPane>
        </Toolbar>
        <Block>
          <TextField
            label="Avatar URL"
            variant="outlined"
            sx={{ width: '100%' }}
            value={member_state.avatar}
            onChange={ev => updateMemberState(draft => { draft.avatar = ev.target.value })}
          />
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
        <TextField
          name="pronouns"
          label="Pronouns"
          variant="outlined"
          // defaultValue={member?.pronouns}
          value={member_state.pronouns}
          onChange={ev => updateMemberState(draft => { draft.pronouns = ev.target.value })}
          sx={{ width: '90%' }}
        />
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
          value={member?.color ? `rgb(${member.color})` : 'rgb(255, 255, 255)'}
          onChange={nv => updateMemberState(draft => { draft.color = nv.slice(4, -1) })}
          sx={{ width: '90%' }}
        />
      </Stack>
      <Fab
        className="fixed bottom-safe-4 right-safe-4"
        icon={<Save/>}
        text="Save"
        textPosition="after"
        component="button"
        onClick={member_mutations.update}
      />
    </Stack>
  );
}