'use client';
import { useShortMutations, useShortQuery } from "@/lib/hooks/useShortQuery";
import { useSupabase } from "@/lib/supabase/client";
import { Tables } from "@/lib/supabase/database.types";
import { Add, Check, Clear } from "@mui/icons-material";
import { IconButton, List, ListItem, ListItemButton, ListItemText, Stack, TextField } from "@mui/material";
import { Button } from "konsta/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getFriendFronters } from "./actions";
import { useRouter } from "next/navigation";

type FriendshipMutators = {
  acceptIncomingRequest: (relating_id: string, related_id: string) => Promise<void>,
  rejectIncomingRequest: (relating_id: string, related_id: string) => Promise<void>,
  addFriend: () => Promise<void>,
}

export default function Friends() {
  const supabase = useSupabase();
  const router = useRouter();

  const [ username, setUsername ] = useState('');
  const [ friends_fronters, setFriendsFronters ] = useState<Record<string, string[]>>({});

  const { data: account } = useShortQuery(
    ['account'],
    async () => {
      // Find our account ID
      const { data: user } = await supabase.auth.getUser();
      const { data: account, error: account_error } = await supabase
        .from('accounts')
        .select('id')
        .eq('user', user.user!.id)
        .single();
      if (account_error || !account) {
        console.error("Couldn't find self account");
        return;
      }
      return account;
    },
  );

  const { data: friends_and_requests } = useShortQuery(
    ['friends', account!.id],
    async () => {
      if (!account) return;
      const { data, error } = await supabase
        .from('friends')
        .select('related:accounts!friends_related_fkey ( id, username, display_name, color ), relating:accounts!friends_relating_fkey ( id, username, display_name, color ), accepted')
        .or(`relating.eq.${account.id},related.eq.${account.id}`);
      if (error) {
        console.error("Couldn't fetch friends", error);
      }
      return data;
    },
    [account],
  );

  const incoming_requests = useMemo(() => {
    return friends_and_requests?.filter(far => (!far.accepted) && (far.related.id === account!.id)) ?? [];
  }, [account, friends_and_requests]);

  const outgoing_requests = useMemo(() => {
    return friends_and_requests?.filter(far => (!far.accepted) && (far.relating.id === account!.id)) ?? [];
  }, [account, friends_and_requests]);

  const friends = useMemo(() => {
    return friends_and_requests?.filter(far => far.accepted) ?? [];
  }, [friends_and_requests]);

  const friend_list = useMemo(() => {
    return friends.map(friend => friend.relating.id === account!.id ? friend.related.id : friend.relating.id);
  }, [account, friends]);

  useEffect(() => {
    const getFriendFrontersFromServer = async () => {
      const fronters = await getFriendFronters(account!.id, friend_list);
      setFriendsFronters(fronters);
    };
    getFriendFrontersFromServer();
  }, [account, friend_list, supabase]);

  // @ts-expect-error Wrong inference in mutators
  const friendship_mutators = useShortMutations<FriendshipMutators>(
    ['friends', account!.id],
    {
      acceptIncomingRequest: async (relating_id: string, related_id: string) => {
        await supabase
          .from('friends')
          .update({ accepted: true })
          .eq('relating', relating_id)
          .eq('related', related_id);
      },
      rejectIncomingRequest: async (relating_id: string, related_id: string) => {
        await supabase
          .from('friends')
          .delete()
          .eq('relating', relating_id)
          .eq('related', related_id);
      },
      addFriend: async () => {
        if (!account) return;
        // Find the friend's account
        const { data: friend, error: friend_error } = await supabase
          .from('accounts')
          .select('id')
          .eq('username', username)
          .single();
        if (friend_error || !friend) {
          console.error("Couldn't find friend's account");
          return;
        }
        // Create friend request
        await supabase
          .from('friends')
          .insert({
            relating: account.id,
            related: friend.id,
            accepted: false,
          });
        // Empty field
        setUsername('');
      }
    }
  );

  return (
    <Stack gap={2} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 3 }}>
      <Stack direction="row" gap={2} sx={{ width: '90%' }}>
        <TextField
          label="Friend's username"
          variant="outlined"
          value={username}
          onChange={ev => setUsername(ev.target.value)}
          sx={{ width: '90%' }}
        />
        <Button
          onClick={friendship_mutators.addFriend}
          disabled={account && username == ''}
          style={{ height: '4em' }}
        >
          <Add/> Add friend
        </Button>
      </Stack>
      <List sx={{ width: '90%' }}>
        {incoming_requests?.map(req => {
          return (
            <ListItem key={`${req.relating.id}-${req.related.id}`}
              style={{
                backgroundColor: `rgba(${req.relating.color ?? '255, 255, 255'}, 35%)`,
                borderRadius: '10px',
                marginBottom: 5,
                width: '100%',
              }}
              secondaryAction={
                <Stack direction="row" gap={2}>
                  <IconButton
                    onClick={() => friendship_mutators.acceptIncomingRequest(req.relating.id, req.related.id)}
                  >
                    <Check/>
                  </IconButton>
                  <IconButton
                    onClick={() => friendship_mutators.rejectIncomingRequest(req.relating.id, req.related.id)}
                  >
                    <Clear/>
                  </IconButton>
                </Stack>
              }
            >
              <ListItemText
                primary={`${req.relating.display_name} (${req.relating.username})`}
                secondary="Incoming request"
              />
            </ListItem>
          );
        })}
        {outgoing_requests?.map(req => {
          return (
            <ListItem key={`${req.relating.id}-${req.related.id}`}
              style={{
                backgroundColor: `rgba(${req.related.color ?? '255, 255, 255'}, 35%)`,
                borderRadius: '10px',
                marginBottom: 5,
              }}
            >
              <ListItemText
                primary={`${req.related.display_name} (${req.related.username})`}
                secondary="Outgoing request"
              />
            </ListItem>
          );
        })}
        {friends?.map(friendship => {
          const are_we_relating = friendship.relating.id === account!.id;
          return (
            <ListItem key={`${friendship.relating.id}-${friendship.related.id}`}
              style={{
                backgroundColor: `rgba(${(are_we_relating ? friendship.related.color : friendship.relating.color) ?? '255, 255, 255'}, 35%)`,
                borderRadius: '10px',
                marginBottom: 5,
              }}
            >
              <ListItemButton
                onClick={() => router.push(`/app/friends/${are_we_relating ? friendship.related.id : friendship.relating.id}`)}
              >
                {are_we_relating
                  ? (<ListItemText
                      primary={`${friendship.related.display_name} (${friendship.related.username})`}
                      secondary={friends_fronters[friendship.related.id]?.join(', ')}
                    />)
                  : (<ListItemText
                      primary={`${friendship.relating.display_name} (${friendship.relating.username})`}
                      secondary={friends_fronters[friendship.relating.id]?.join(', ')}
                    />)
                }
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Stack>
  )
}