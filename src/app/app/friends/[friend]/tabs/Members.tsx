import { List, ListItem, ListItemAvatar, ListItemButton, ListItemText } from "@mui/material"
import Image from "next/image"
import { getFriendMembers } from "../actions";
import { useSupabase } from "@/lib/supabase/client";
import { useShortQuery } from "@/lib/hooks/useShortQuery";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import useAccount from "@/lib/hooks/useAccount";

export default function FriendMembers({
  friend_id
}: {
  friend_id: string,
}) {
  const router = useRouter();

  const { data: account } = useAccount();
  const { data: members } = useShortQuery(
    [account?.id, 'friend', friend_id, 'members'],
    async () => {
      return getFriendMembers(account!.id, friend_id);
    },
    [ account ],
  );

  const ordered_members = useMemo(() => {
    const proper_members = members?.filter(member => !member.is_status);
    const custom_statuses = members?.filter(member => member.is_status);
    const alphabetical_proper_members = proper_members?.toSorted((a, b) => a.name?.localeCompare(b.name!) ?? 0) ?? [];
    const alphabetical_custom_statuses = custom_statuses?.toSorted((a, b) => a.name?.localeCompare(b.name!) ?? 0) ?? [];
    return [
      ...alphabetical_proper_members,
      ...alphabetical_custom_statuses,
    ];
  }, [members]);

  return (
    <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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