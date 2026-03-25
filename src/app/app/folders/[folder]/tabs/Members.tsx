import { useShortMutations, useShortQuery } from "@/lib/hooks/useShortQuery";
import { useSupabase } from "@/lib/supabase/client";
import { Tables } from "@/lib/supabase/database.types";
import { Save } from "@mui/icons-material";
import { Checkbox, List, ListItem, ListItemAvatar, ListItemText, Stack, TextField } from "@mui/material";
import { Button } from "konsta/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Updater } from "use-immer";

type FolderMemberMutators = {
  includeMember: (member_id: string) => Promise<void>,
  excludeMember: (member_id: string) => Promise<void>,
};

export default function MembersFolderDisplay({
  folder,
  folder_mutators,
  folder_state,
  updateFolderState,
}: {
  folder: Tables<'members'>
  folder_mutators: {
    update: () => Promise<void>;
    deleteFolder: () => Promise<void>;
  } & {
    invalidateCache: () => Promise<void>;
  },
  folder_state: Record<string, string | null>,
  updateFolderState: Updater<Record<string, string | null>>,
}) {
  const supabase = useSupabase();

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

  const ordered_members = useMemo(() => {
    const alphabetical_members = members?.toSorted((a, b) => a.name?.localeCompare(b.name!) ?? 0) ?? [];
    return alphabetical_members;
  }, [members]);

  const { data: folder_members } = useShortQuery(
    ['folder', folder.id, 'members'],
    async () => {
      const { data } = await supabase
        .from('folder_members')
        .select()
        .eq('folder', folder.id);
      const list = data?.map(member => member.member);
      return list;
    },
    [ folder ],
  );

  // @ts-expect-error: Bad
  const folder_member_mutators = useShortMutations<FolderMemberMutators>(
    ['folder', folder.id, 'members'],
    {
      includeMember: async (member_id: string) => {
        await supabase
          .from('folder_members')
          .insert({
            member: member_id,
            folder: folder.id,
          });
      },
      excludeMember: async (member_id: string) => {
        await supabase
          .from('folder_members')
          .delete()
          .eq('member', member_id)
          .eq('folder', folder.id);
      },
    }
  )

  return (
    <div className="p-3" style={{ width: '100%' }}>
      <List>
        { ordered_members?.map(member => {
          return (
            <ListItem
              key={member.id}
              style={{
                backgroundColor: `rgba(${member.color ?? '255, 255, 255'}, 20%)`,
                borderRadius: '10px',
                marginBottom: 5,
              }}
              secondaryAction={
                <Checkbox
                  checked={folder_members?.includes(member.id) ?? false}
                  onChange={ev => ev.target.checked ? folder_member_mutators.includeMember(member.id) : folder_member_mutators.excludeMember(member.id)}
                />
              }
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
            </ListItem>
          )
        }) }
      </List>
    </div>
  )
}