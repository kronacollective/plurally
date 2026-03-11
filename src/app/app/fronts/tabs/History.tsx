import { List, ListItem, ListItemAvatar, ListItemText, Stack } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { useState } from "react";
import { formatDuration, interval, intervalToDuration, subDays } from "date-fns";
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
      const { data } = await supabase
        .from('fronts')
        .select('*, member ( * )')
        .gte('end', start_date.toISOString())
        .lte('start', end_date.toISOString());
      return data;
    }
  );

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
        {fronts_in_range?.map(fir => {
          const front_interval = interval(fir.start, fir.end!);
          const front_duration = intervalToDuration(front_interval);
          const front_duration_label = formatDuration(front_duration);
          return (
            <ListItem key={fir.id}
              style={{
                backgroundColor: `rgba(${fir.member.color ?? '255, 255, 255'}, 20%)`,
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
                secondary={front_duration_label}
              />
            </ListItem>
          )
        })}
      </List>
    </Stack>
  )
}