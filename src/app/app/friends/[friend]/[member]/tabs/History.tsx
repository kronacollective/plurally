import { useShortQuery } from "@/lib/hooks/useShortQuery";
import { useSupabase } from "@/lib/supabase/client";
import { Tables } from "@/lib/supabase/database.types";
import { List, ListItem, ListItemText, Stack } from "@mui/material";
import { compareDesc, format, formatDuration, interval, intervalToDuration } from "date-fns";
import { useMemo } from "react";

export default function HistoryMemberDisplay({
  member,
}: {
  member: Tables<'members'>
}) {
  const supabase = useSupabase();

  const { data: front_history } = useShortQuery(
    ['fronts', member.id],
    async () => {
      const { data } = await supabase
        .from('fronts')
        .select('*, member ( * )')
        .eq('member', member.id);
      return data;
    }
  );

  const sorted_history = useMemo(() => {
    return front_history?.toSorted((fea, feb) => compareDesc(fea.start, feb.start)) ?? [];
  }, [front_history]);

  return (
    <List sx={{ width: '90%' }}>
      { sorted_history?.map(fe => {
        return (
          <ListItem key={fe.id}
            style={{
              backgroundColor: `rgba(${member.color ?? '255, 255, 255'}, 20%)`,
              borderRadius: '10px',
              marginBottom: 5,
            }}
          >
            <Stack sx={{ width: '100%' }}>
              <Stack direction="row" sx={{
                width: '100%',
                justifyContent: 'space-between'
              }}>
                <ListItemText
                  primary={format(fe.start, 'dd/mm/yyyy')}
                  secondary={format(fe.start, 'hh:mm:ss')}
                />
                {fe.end && (<ListItemText
                  sx={{ textAlign: 'right' }}
                  primary={format(fe.end, 'dd/mm/yyyy')}
                  secondary={format(fe.end, 'hh:mm:ss')}
                />)}
              </Stack>
              <ListItemText
                primary={!fe.end && 'Active'}
                secondary={formatDuration(intervalToDuration(interval(fe.start, fe.end ?? new Date())))}
              />
            </Stack>
          </ListItem>
        )
      }) }
    </List>
  )
}