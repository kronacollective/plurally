'use client';

import useAccount from "@/lib/hooks/useAccount";
import { useShortQuery } from "@/lib/hooks/useShortQuery";
import { useSupabase } from "@/lib/supabase/client";
import { Add } from "@mui/icons-material";
import { Avatar, List, ListItem, ListItemButton, ListItemText, Stack } from "@mui/material";
import { Fab } from "konsta/react";
import Image from "next/image";
import Link from "next/link";

export default function Journal() {
  const supabase = useSupabase();
  const { data: account } = useAccount();

  const { data: entries } = useShortQuery(
    ['journal-entries', account?.id],
    async () => {
      const { data } = await supabase
        .from('journal')
        .select('*, member ( * )')
        .eq('account', account!.id);
      return data;
    },
  );

  return (
    <>
      <Link href="/app/journal/new">
        <Fab
          className="fixed bottom-safe-4 right-safe-4"
          style={{ zIndex: 1500 }}
          icon={<Add/>}
          component="button"
        />
      </Link>
      <List sx={{ p: 2 }}>
        { entries?.map(entry => {
          return (
            <ListItem key={entry.id} sx={{ backgroundColor: `rgba(${entry.member.color ?? '255, 255, 255'}, 20%)`, borderRadius: '10px', mb: 2 }}>
              <Link href={`/app/journal/${entry.id}`} style={{ width: '100%' }}>
                <ListItemButton>
                  <ListItemText
                    primary={entry.title}
                    secondary={<Stack direction="row" sx={{ alignItems: 'center' }}>
                      <Avatar>
                        {entry.member.avatar ? <Image
                          className="rounded-full"
                          src={entry.member.avatar!}
                          width={100}
                          height={100}
                          alt="Profile picture"
                        /> : entry.member.name?.slice(0,1)}
                      </Avatar>
                      { entry.member.name }
                    </Stack>}
                  />
                </ListItemButton>
              </Link>
            </ListItem>
          )
        }) }
      </List>
    </>
  );
}