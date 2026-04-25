import { useShortQuery } from "@/lib/hooks/useShortQuery";
import { useSupabase } from "@/lib/supabase/client"
import { Tables } from "@/lib/supabase/database.types";
import { List, ListItem, ListItemAvatar, ListItemText } from "@mui/material";
import { add, clamp, Duration, formatDuration, formatISODuration, interval, intervalToDuration } from "date-fns";
import Image from "next/image";
import { useMemo } from "react";
import { compare, IsoDuration } from "iso-fns";

const addDurations = (duration1: Duration, duration2: Duration) => {
  const base_date = new Date(0) // can probably be any date, 0 just seemed like a good start

  return intervalToDuration({
    start: base_date,
    end: add(add(base_date, duration1), duration2),
  })
};

export default function AnalyticsTotals({
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
    ['fronts', account?.id, 'range'],
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

  const clamped_fronts = useMemo(() => {
    if (!fronts_in_range) return;
    return fronts_in_range.map(fir => ({
      ...fir,
      start: clamp(fir.start, interval(start_date, end_date)),
      end: clamp(fir.end ?? new Date(), interval(start_date, end_date)),
    }));
  }, [end_date, fronts_in_range, start_date]);

  const aggregated_members = useMemo(() => {
    if (!clamped_fronts) return {};
    const members: Record<string, Tables<'members'>> = {};
    for (const front of clamped_fronts) {
      members[front.member.id] = front.member;
    }
    return members;
  }, [clamped_fronts]);

  const aggregated_durations = useMemo(() => {
    if (!clamped_fronts) return;
    const per_member: Record<string, Duration> = {};
    for (const front of clamped_fronts) {
      const started_at = front.start;
      const ended_at = front.end;
      const front_interval = interval(started_at, ended_at);
      const front_duration = intervalToDuration(front_interval);
      if (per_member[front.member.id]) {
        const pmfcm = per_member[front.member.id];
        per_member[front.member.id] = addDurations(pmfcm, front_duration);
      } else {
        per_member[front.member.id] = front_duration;
      }
    }
    return per_member;
  }, [ clamped_fronts ]);

  const sorted_durations = useMemo(() => {
    if (!aggregated_durations) return;
    const entries = Object.entries(aggregated_durations);
    return entries.toSorted((a, b) => {
      const [ , duration_a ] = a;
      const [ , duration_b ] = b;
      return -compare(formatISODuration(duration_a) as IsoDuration, formatISODuration(duration_b) as IsoDuration);
    });
  }, [aggregated_durations]);

  return (
    <>
      <List sx={{ width: '100%' }}>
        { sorted_durations?.map(([member_id, duration]) => {
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
                secondary={formatDuration(duration)}
              />
            </ListItem>
          )
        })}
      </List>
    </>
  )
}