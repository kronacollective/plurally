import { useShortQuery } from "@/lib/hooks/useShortQuery";
import { useSupabase } from "@/lib/supabase/client"
import { Tables } from "@/lib/supabase/database.types";
import { List, ListItem, ListItemAvatar, ListItemText } from "@mui/material";
import { add, clamp, compareDesc, Duration, formatDuration, Interval, interval, intervalToDuration } from "date-fns";
import Image from "next/image";
import { useMemo } from "react";

const compareDurations = (duration1: Duration, duration2: Duration) => {
  const base_date = new Date(0);
  const date1 = add(base_date, duration1);
  const date2 = add(base_date, duration2);
  const comparison = compareDesc(date1, date2);
  return comparison;
}

export default function AnalyticsMin({
  start_date,
  end_date,
}: {
  start_date: Date,
  end_date: Date,
}) {
  const supabase = useSupabase();

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

  const { data: fronts_in_range } = useShortQuery(
    ['fronts', account!.id, 'range'],
    async () => {
      if (!account) return [];
      const { data: inactive_fronts } = await supabase
        .from('fronts')
        .select('*, member ( * )')
        .eq('account', account.id)
        .gte('end', start_date.toISOString())
        .lte('start', end_date.toISOString());
      const { data: active_fronts } = await supabase
        .from('fronts')
        .select('*, member ( * )')
        .eq('account', account.id)
        .lte('start', end_date.toISOString())
        .is('end', null);
      const data = [ ...active_fronts!, ...inactive_fronts! ];
      return data;
    },
    [ account ],
  );

  // const clamped_fronts = useMemo(() => {
  //   if (!fronts_in_range) return;
  //   return fronts_in_range.map(fir => ({
  //     ...fir,
  //     start: clamp(fir.start, interval(start_date, end_date)),
  //     end: clamp(fir.end ?? new Date(), interval(start_date, end_date)),
  //   }));
  // }, [end_date, fronts_in_range, start_date]);

  const aggregated_members = useMemo(() => {
    if (!fronts_in_range) return {};
    const members: Record<string, Tables<'members'>> = {};
    for (const front of fronts_in_range) {
      members[front.member.id] = front.member;
    }
    return members;
  }, [fronts_in_range]);

  const front_min = useMemo(() => {
    if (!fronts_in_range) return {};
    const minimums: Record<string, Duration> = {};
    const fronts_with_durations = fronts_in_range.map(fir => ({...fir, duration: intervalToDuration(interval(fir.start, fir.end ?? new Date()))}))
    const sorted_durations = fronts_with_durations.toSorted((fa, fb) => compareDurations(fa.duration, fb.duration))
    const reverse_sorted_durations = sorted_durations.toReversed();
    for (const front of reverse_sorted_durations) {
      if (!minimums[front.member.id]) {
        minimums[front.member.id] = front.duration;
      }
    }
    return minimums;
  }, [fronts_in_range]);

  return (
    <>
      <List sx={{ width: '100%' }}>
        { Object.entries(front_min ?? {}).map(([member_id, duration]) => {
          const member = aggregated_members[member_id];
          return (
            <ListItem key={member_id}
              style={{
                backgroundColor: `rgba(${member.color ?? '255, 255, 255'}, 20%)`,
                borderRadius: '10px',
                marginBottom: 5,
              }}
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
                secondary={`Fronted ${formatDuration(duration)} at least`}
              />
            </ListItem>
          )
        })}
      </List>
    </>
  )
}