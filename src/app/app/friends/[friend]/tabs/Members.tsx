import { List, ListItem, ListItemAvatar, ListItemButton, ListItemText } from "@mui/material"
import Image from "next/image"
import { getFriendMembers } from "../actions";
import { useSupabase } from "@/lib/supabase/client";
import { useShortQuery } from "@/lib/hooks/useShortQuery";
import { useRouter } from "next/navigation";

export default function FriendMembers({
  friend_id
}: {
  friend_id: string,
}) {
  const supabase = useSupabase();
  const router = useRouter();

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
    ['friend', friend_id, 'members'],
    async () => {
      return getFriendMembers(account!.id, friend_id);
    },
    [ account ],
  );

  return (
    <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <List sx={{ width: '90%' }}>
        { members?.map(member => {
          return (
            <ListItem
              key={member.id}
              style={{
                backgroundColor: `rgba(${member.color ?? '255, 255, 255'}, 20%)`,
                borderRadius: '10px',
                marginBottom: 5,
              }}
            >
              <ListItemButton
                onClick={() => router.push(`/app/friends/${friend_id}/${member.id}`)}
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
    </div>
  )
}