'use client';
import { useShortQuery } from "@/lib/hooks/useShortQuery";
import { useSupabase } from "@/lib/supabase/client";
import { Avatar, Paper, Stack, Typography } from "@mui/material";
import MuiMarkdown from "mui-markdown";
import Image from "next/image";

export default function EntryDisplay({
  entry_id
}: {
  entry_id: string
}) {
  const supabase = useSupabase();

  const { data: entry } = useShortQuery(
    ['entry', entry_id],
    async () => {
      const { data } = await supabase
        .from('journal')
        .select('*, member ( * )')
        .eq('id', entry_id)
        .single();
      return data;
    },
  );

  return (
    <>
      <div style={{ padding: '2em' }}>
        <Typography variant="h4">{entry?.title}</Typography>
        <Stack direction="row" sx={{ alignItems: 'center' }}>
          <Avatar>
            {entry?.member.avatar ? <Image
              className="rounded-full"
              src={entry.member.avatar!}
              width={100}
              height={100}
              alt="Profile picture"
            /> : entry?.member.name?.slice(0,1)}
          </Avatar>
          { entry?.member.name }
        </Stack>
        <Paper elevation={1} sx={{ p: 3, m: 3 }}>
          <MuiMarkdown>{entry?.content}</MuiMarkdown>
        </Paper>
      </div>
    </>
  );
}