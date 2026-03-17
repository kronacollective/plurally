import { useShortQuery } from "@/lib/hooks/useShortQuery";
import { useSupabase } from "@/lib/supabase/client"
import { Tables } from "@/lib/supabase/database.types";
import { List, ListItem, ListItemAvatar, ListItemText } from "@mui/material";
import { clamp, interval } from "date-fns";
import Image from "next/image";
import { useMemo } from "react";

export default function AnalyticsCount({
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
    ['fronts', 'range'],
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

  const front_count = useMemo(() => {
    if (!clamped_fronts) return {};
    const count: Record<string, number> = {};
    for (const front of clamped_fronts) {
      count[front.member.id] = count[front.member.id] ? count[front.member.id] + 1 : 1;
    }
    return count;
  }, [clamped_fronts]);

  return (
    <>
      <List sx={{ width: '100%' }}>
        { Object.entries(front_count ?? {}).map(([member_id, count]) => {
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
                secondary={`Fronted ${count} time(s)`}
              />
            </ListItem>
          )
        })}
      </List>
    </>
  )
}