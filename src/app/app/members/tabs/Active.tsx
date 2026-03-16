import { useShortMutations, useShortQuery } from "@/lib/hooks/useShortQuery";
import { useSupabase } from "@/lib/supabase/client";
import { List, ListItem, ListItemAvatar, ListItemText, Stack, TextField } from "@mui/material";
import { Block, BlockTitle, Button } from 'konsta/react';
import Image from "next/image";
import { useEffect } from "react";
import { useImmer } from "use-immer";

type FrontMutations = {
  update: (member_id: string) => Promise<void>,
};

export default function FrontsActive () {
  const supabase = useSupabase();

  const [ comments, updateComments ] = useImmer<Record<string, string>>({});

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
        .select('*, member( * )')
        .eq('account', account!.id)
        .is('end', null);
      if (error) console.error('active_fronts', error);
      return data;
    },
    [ account ],
  );

  useEffect(() => {
    if (!active_fronts) return;
    active_fronts.forEach(af => updateComments(draft => { draft[af.member.id] = af.message ?? '' }))
  }, [active_fronts, updateComments]);

  // @ts-expect-error Bad still
  const front_mutators = useShortMutations<FrontMutations>(
    ["fronts"],
    {
      update: async (member_id: string) => {
        await supabase
          .from('fronts')
          .update({ message: comments[member_id] })
          .eq('member', member_id);
      }
    }
  );

  return (
    <>
      <Block>
        <BlockTitle style={{ marginBottom: 1 }}>Active fronters and statuses</BlockTitle>
        <List>
          { active_fronts?.map(af => {
            console.log('af', af);
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
                <Stack direction="row" gap={2}>
                  <TextField
                    label="Comment"
                    variant="outlined"
                    value={comments[af.member.id]}
                    onChange={ev => updateComments(draft => { draft[af.member.id] = ev.target.value })}
                  />
                  <Button
                    style={{ height: '4em', width: '4em' }}
                    onClick={() => front_mutators.update(af.member.id)}
                  >
                    Save
                  </Button>
                </Stack>
              </ListItem>
            )
          }) }
        </List>
      </Block>
    </>
  )
}