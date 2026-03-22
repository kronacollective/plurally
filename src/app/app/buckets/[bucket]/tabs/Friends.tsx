import { useShortMutations, useShortQuery } from "@/lib/hooks/useShortQuery";
import { useSupabase } from "@/lib/supabase/client";
import { Tables } from "@/lib/supabase/database.types";
import { Checkbox, List, ListItem, ListItemAvatar, ListItemText, Stack } from "@mui/material";
import Image from "next/image";
import { Updater } from "use-immer";

type BucketFriendMutations = {
  includeFriend: (friend_id: string) => Promise<void>,
  excludeFriend: (friend_id: string) => Promise<void>,
};

export default function BucketFriends({
  bucket,
  bucket_mutations,
  bucket_state,
  updateBucketState,
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

  const { data: friends } = useShortQuery(
    ['friends', account!.id],
    async () => {
      const { data } = await supabase
        .from('friends')
        .select('accepted, related:accounts!friends_related_fkey ( id, username, display_name, color ), relating:accounts!friends_relating_fkey ( id, username, display_name, color ), accepted')
        .or(`relating.eq.${account!.id},related.eq.${account!.id}`)
        .eq('accepted', true);
      return data;
    },
    [ account ],
  );

  const { data: bucket_friends } = useShortQuery(
    ['bucket-friends', bucket.id],
    async () => {
      const { data } = await supabase
        .from('bucket_friends')
        .select()
        .eq('bucket', bucket.id);
      const list = data!.map(friend => friend.account);
      return list;
    },
  );

  // @ts-expect-error Types bad
  const bucket_friend_mutators = useShortMutations<BucketFriendMutations>(
    ['bucket-friends', bucket.id],
    {
      includeFriend: async (friend_id: string) => {
        await supabase
          .from('bucket_friends')
          .insert({
            bucket: bucket.id,
            account: friend_id,
          });
      },
      excludeFriend: async (friend_id: string) => {
        await supabase
          .from('bucket_friends')
          .delete()
          .eq('bucket', bucket.id)
          .eq('account', friend_id);
      },
    }
  )

  return (
    <>
      <Stack gap={2} display="flex" sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <List sx={{ width: '90%' }}>
          {friends?.map(friendship => {
            const are_we_relating = friendship.relating.id === account!.id;
            return (
              <ListItem key={`${friendship.relating.id}-${friendship.related.id}`}
                style={{
                  backgroundColor: `rgba(${(are_we_relating ? friendship.related.color : friendship.relating.color) ?? '255, 255, 255'}, 35%)`,
                  borderRadius: '10px',
                  marginBottom: 5,
                }}
                secondaryAction={
                  <Checkbox
                    checked={bucket_friends?.includes(are_we_relating ? friendship.related.id : friendship.relating.id)}
                    onChange={ev => ev.target.checked
                      ? bucket_friend_mutators.includeFriend(are_we_relating ? friendship.related.id : friendship.relating.id)
                      : bucket_friend_mutators.excludeFriend(are_we_relating ? friendship.related.id : friendship.relating.id)
                    }
                  />
                }
              >
                {are_we_relating
                  ? (<ListItemText
                      primary={`${friendship.related.display_name} (${friendship.related.username})`}
                      // secondary={friends_fronters[friendship.related.id]?.join(', ')}
                    />)
                  : (<ListItemText
                      primary={`${friendship.relating.display_name} (${friendship.relating.username})`}
                      // secondary={friends_fronters[friendship.relating.id]?.join(', ')}
                    />)
                }
              </ListItem>
            );
          })}
        </List>
      </Stack>
    </>
  )
}