import { useShortQuery } from "@/lib/hooks/useShortQuery";
import { useSupabase } from "@/lib/supabase/client";
import { List, ListItem, ListItemAvatar, ListItemText } from "@mui/material";
import { Block, BlockTitle } from 'konsta/react';
import Image from "next/image";

export default function FrontsActive () {
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

  const { data: active_fronts } = useShortQuery(
    ["fronts", "active"],
    async () => {
      const { data, error } = await supabase
        .from('fronts')
        .select('*, member ( * )')
        .eq('account', account!.id)
        .is('end', null);
      if (error) console.error('active_fronts', error);
      return data;
    },
    [ account ],
  );

  return (
    <>
      <Block>
        <BlockTitle style={{ marginBottom: 1 }}>Active fronters and statuses</BlockTitle>
        <List>
          { active_fronts?.map(af => {
            return (
              <ListItem key={af.id}
                style={{
                  backgroundColor: `rgba(${af.member.color ?? '255, 255, 255'}, 35%)`,
                  borderRadius: '10px',
                  marginBottom: 5,
                }}
              >
                <ListItemAvatar sx={{ mr: 2 }}>
                  { af.member && af.member.avatar ? (
                    <Image
                      className="rounded-full"
                      src={af.member.avatar}
                      width={60}
                      height={60}
                      alt="Profile picture"
                    />
                  ) : (
                    "?"
                  )}
                </ListItemAvatar>
                <ListItemText
                  primary={af.member.name}
                  secondary={af.member.pronouns}
                >
                </ListItemText>
              </ListItem>
            )
          }) }
        </List>
      </Block>
    </>
  )
}