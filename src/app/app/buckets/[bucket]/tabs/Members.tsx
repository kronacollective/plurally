import { useShortMutations, useShortQuery } from "@/lib/hooks/useShortQuery";
import { useSupabase } from "@/lib/supabase/client";
import { Tables } from "@/lib/supabase/database.types";
import { Checkbox, List, ListItem, ListItemAvatar, ListItemText, Stack } from "@mui/material";
import Image from "next/image";
import { useMemo } from "react";
import { Updater } from "use-immer";

type BucketMemberMutations = {
  includeMember: (member_id: string) => Promise<void>,
  excludeMember: (member_id: string) => Promise<void>,
};

export default function BucketMembers({
  bucket,
}: {
  bucket: Tables<'buckets'>
  bucket_mutations: {
    update: () => Promise<void>,
  } & {
    invalidateCache: () => Promise<void>,
  },
  bucket_state: Record<string, string | null>,
  updateBucketState: Updater<Record<string, string | null>>,
}) {
  const supabase = useSupabase();

  const { data: account } = useShortQuery(
    ['account'],
    async () => {
      const { data: user } = await supabase.auth.getUser();
      const { data } = await supabase
        .from('accounts')
        .select()
        .eq('user', user.user!.id)
        .single();
      return data;
    },
  );

  const { data: members } = useShortQuery(
    ['members', account?.id],
    async () => {
      const { data } = await supabase
        .from('members')
        .select()
        .eq('account', account!.id);
      return data;
    },
    [ account ],
  );

  const { data: bucket_members } = useShortQuery(
    ['bucket-members', bucket.id],
    async () => {
      const { data } = await supabase
        .from('bucket_members')
        .select()
        .eq('bucket', bucket.id);
      const list = data!.map(member => member.member);
      return list;
    },
  );

  const ordered_members = useMemo(() => {
    const actual_members = members?.filter(member => !member.is_status);
    const statuses = members?.filter(member => member.is_status);
    const alphabetical_members = actual_members?.toSorted((a, b) => a.name?.localeCompare(b.name!) ?? 0) ?? [];
    const alphabetical_statuses = statuses?.toSorted((a, b) => a.name?.localeCompare(b.name!) ?? 0) ?? [];
    const ordered_members = [
      ...alphabetical_members,
      ...alphabetical_statuses,
    ];
    return ordered_members;
  }, [members]);

  // @ts-expect-error Types bad
  const bucket_member_mutators = useShortMutations<BucketMemberMutations>(
    ['bucket-members', bucket.id],
    {
      includeMember: async (member_id: string) => {
        await supabase
          .from('bucket_members')
          .insert({
            bucket: bucket.id,
            member: member_id,
          });
      },
      excludeMember: async (member_id: string) => {
        await supabase
          .from('bucket_members')
          .delete()
          .eq('bucket', bucket.id)
          .eq('member', member_id);
      },
    }
  )

  return (
    <>
      <Stack gap={2} display="flex" sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <List sx={{ width: '90%' }}>
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
                    checked={bucket_members?.includes(member.id) ?? false}
                    onChange={ev => ev.target.checked ? bucket_member_mutators.includeMember(member.id) : bucket_member_mutators.excludeMember(member.id)}
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
      </Stack>
    </>
  )
}