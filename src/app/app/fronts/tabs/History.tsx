import { List, ListItem, ListItemAvatar, ListItemText, Stack } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { useMemo, useState } from "react";
import { compareDesc, formatDuration, interval, intervalToDuration, subDays } from "date-fns";
import { useShortQuery } from "@/lib/hooks/useShortQuery";
import { useSupabase } from "@/lib/supabase/client";
import Image from "next/image";

export default function HistoryFronts() {
  const supabase = useSupabase();

  const [ start_date, setStartDate ] = useState(subDays(new Date(), 30));
  const [ end_date, setEndDate ] = useState(new Date());

  const { data: fronts_in_range } = useShortQuery(
    ['fronts', 'range'],
    async () => {
      const { data: inactive_fronts } = await supabase
        .from('fronts')
        .select('*, member ( * )')
        .gte('end', start_date.toISOString())
        .lte('start', end_date.toISOString());
      const { data: active_fronts } = await supabase
        .from('fronts')
        .select('*, member ( * )')
        .lte('start', end_date.toISOString())
        .is('end', null);
      const data = [ ...active_fronts!, ...inactive_fronts! ];
      return data;
    }
  );

  const sorted_fronts = useMemo(() => {
    if (!fronts_in_range) return []
    const active_fronts = fronts_in_range.filter(fir => !fir.end);
    const inactive_fronts = fronts_in_range.filter(fir => fir.end);
    const active_fronts_sorted = active_fronts.toSorted((afa, afb) => compareDesc(afa.start, afb.start));
    const inactive_fronts_sorted = inactive_fronts.toSorted((ifa, ifb) => compareDesc(ifa.start, ifb.start));
    return [ ...active_fronts_sorted, ...inactive_fronts_sorted ];
  }, [fronts_in_range]);

  return (
    <Stack gap={2}>
      <DatePicker
        label="Start"
        value={start_date}
        // @ts-expect-error This is literally copying the documentation
        onChange={nv => setStartDate(nv)}
      />
      <DatePicker
        label="End"
        value={end_date}
        // @ts-expect-error This is literally copying the documentation
        onChange={nv => setEndDate(nv)}
      />
      <List>
        {sorted_fronts?.map(fir => {
          const front_interval = interval(fir.start, fir.end ?? new Date());
          const front_duration = intervalToDuration(front_interval);
          const front_duration_label = formatDuration(front_duration);
          return (
            <ListItem key={fir.id}
              style={{
                backgroundColor: `rgba(${fir.member.color ?? '255, 255, 255'}, ${fir.end ? 20 : 35}%)`,
                borderRadius: '10px',
                marginBottom: 5,
              }}
            >
              <ListItemAvatar sx={{ mr: 2 }}>
                { fir.member && fir.member.avatar ? (
                  <Image
                    className="rounded-full"
                    src={fir.member.avatar}
                    width={60}
                    height={60}
                    alt="Profile picture"
                  />
                ) : (
                  "?"
                )}
              </ListItemAvatar>
              <ListItemText
                primary={fir.member.name}
                secondary={fir.end ? front_duration_label : `Active — ${front_duration_label}`}
              />
            </ListItem>
          )
        })}
      </List>
    </Stack>
  )
}