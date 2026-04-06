'use client';
import useAccount from "@/lib/hooks/useAccount";
import { useShortMutations, useShortQuery } from "@/lib/hooks/useShortQuery";
import { useSupabase } from "@/lib/supabase/client"
import { Checkbox, List, ListItem, ListItemAvatar, ListItemText, MenuItem, Select, Typography } from "@mui/material";
import { Block, BlockTitle, Button } from "konsta/react";
import Image from "next/image";
import { useMemo } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { formatDuration, interval, intervalToDuration } from "date-fns";
import { Delete } from "@mui/icons-material";
import { useRouter } from "next/navigation";

type VoteMutators = {
  vote: (member_id: string, option_id: string) => Promise<void>,
};

export default function PollDisplay({
  poll_id
}: {
  poll_id: string
}) {
  const supabase = useSupabase();
  const router = useRouter();
  const { data: account } = useAccount();

  const { data: poll } = useShortQuery(
    ['poll', poll_id],
    async () => {
      const { data } = await supabase
        .from('polls')
        .select()
        .eq('id', poll_id)
        .single();
      return data;
    },
  );

  const poll_mutators = useShortMutations(
    ['poll', poll_id],
    {
      delete: async () => {
        await supabase
          .from('polls')
          .delete()
          .eq('id', poll_id);
      },
    }
  )

  const { data: voting_members } = useShortQuery(
    ['members', account?.id, 'voting'],
    async () => {
      const { data } = await supabase
        .from('members')
        .select()
        .eq('account', account!.id)
        .eq('is_status', false)
        .eq('archived', false);
      return data;
    },
  );
  const voting_member_list = useMemo(() => voting_members?.map(vm => vm.id), [voting_members]);

  const { data: options } = useShortQuery(
    ['options', poll_id],
    async () => {
      const { data } = await supabase
        .from('poll_options')
        .select()
        .eq('poll', poll_id);
      return data;
    }
  );

  const { data: votes } = useShortQuery(
    ['votes', poll_id, voting_member_list],
    async () => {
      const { data } = await supabase
        .from('poll_votes')
        .select()
        .eq('poll', poll_id)
        .in('member', voting_member_list ?? [])
      return data;
    },
    [ voting_member_list ],
  );

  // @ts-expect-error: Bad
  const vote_mutators = useShortMutations<VoteMutators>(
    ['votes', poll_id],
    {
      vote: async (member_id: string, option_id: string) => {
        // Delete old vote if it exists
        await supabase
          .from('poll_votes')
          .delete()
          .eq('member', member_id)
          .eq('poll', poll_id);
        // Create new vote
        await supabase
          .from('poll_votes')
          .insert({
            member: member_id,
            option: option_id,
            poll: poll_id,
          });
      }
    },
  )

  const aggregated_votes = useMemo(() => {
    const ag_votes: Record<string, number> = {};
    votes?.forEach(vote => {
      ag_votes[vote.option!] = (ag_votes[vote.option!] ?? 0) + 1;
    });
    return ag_votes;
  }, [votes]);

  const vote_percentages = useMemo(() => {
    const total_votes = Object.values(aggregated_votes).reduce((prev, cur) => prev + cur, 0);
    const percentages = Object.fromEntries(
      Object.entries(aggregated_votes).map(([option_id, vote_count]) => [option_id, (vote_count / total_votes) * 100])
    );
    return percentages;
  }, [aggregated_votes]);

  const chart_votes = useMemo(() => {
    const series = [{ data: [] as { id: string, value: number, label: string }[] }];
    Object.entries(aggregated_votes ?? {}).forEach(([option_id, vote_count]) => {
      const option = options?.find(opt => opt.id === option_id);
      if (!option) return;
      if (option.is_veto || option.is_abstain) return;
      series[0].data.push({
        id: option.id,
        value: vote_count,
        label: option.name!,
      })
    });
    return series;
  }, [aggregated_votes, options]);

  const ordered_voting_members = useMemo(() => {
    const polled_members = voting_members?.filter(vm => !!votes?.find(v => v.member === vm.id));
    const unpolled_members = voting_members?.filter(vm => !votes?.find(v => v.member === vm.id));
    const alphabetical_polled_members = polled_members?.toSorted((a, b) => a.name?.localeCompare(b.name!) ?? 0) ?? [];
    const alphabetical_unpolled_members = unpolled_members?.toSorted((a, b) => a.name?.localeCompare(b.name!) ?? 0) ?? [];
    return [
      ...alphabetical_polled_members!,
      ...alphabetical_unpolled_members!,
    ]
  }, [votes, voting_members]);

  const closing_date = useMemo(() => {
    if (!poll) return "";
    const now = new Date();
    const ends_at = new Date(poll?.ends_at ?? '');
    const now_to_end = interval(now, ends_at);
    const end_to_now = interval(ends_at, now);
    const duration = intervalToDuration(ends_at > now ? now_to_end : end_to_now);
    return '~' + formatDuration(duration, { format: ['years', 'months', 'days', 'hours', 'minutes'] });
  }, [poll]);

  return (
    <>
      <div style={{ padding: '1em' }}>
        <Typography variant="h4">{poll?.name}</Typography>
        <Typography>{poll?.description}</Typography>
      </div>
      <BlockTitle>Results</BlockTitle>
      <Block style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <PieChart
          series={chart_votes}
          width={200}
          height={200}
        />
        <List sx={{ width: '90%' }}>
          { Object.entries(vote_percentages).map(([option_id, vote_percentage]) => {
            const option = options?.find(opt => opt.id === option_id);
            return (
              <ListItem key={option_id}
                sx={{
                  backgroundColor: `rgb(255, 255, 255)`,
                  borderRadius: '10px',
                  marginBottom: 2,
                }}
                secondaryAction={<strong>{vote_percentage}%</strong>}
              >
                <ListItemText
                  primary={option?.name}
                  secondary={option?.description}
                />
              </ListItem>
            );
          }) }
        </List>
      </Block>
      <BlockTitle>Poll status</BlockTitle>
      <Block>
        <List>
          <ListItem secondaryAction={closing_date}>
            <ListItemText
              primary="Closing date"
              secondary={new Date(poll?.ends_at ?? '') > (new Date()) ? 'Poll finishes in' : 'Poll finished'}
            />
          </ListItem>
        </List>
      </Block>
      <BlockTitle>Votes</BlockTitle>
      <Block>
        <List sx={{ width: '100%' }}>
          { ordered_voting_members?.map(member => {
            return (
              <ListItem
                key={member.id}
                style={{
                  backgroundColor: `rgba(${member.color ?? '255, 255, 255'}, 20%)`,
                  borderRadius: '10px',
                  marginBottom: 5,
                  padding: 20,
                }}
                secondaryAction={
                  <Select
                    value={votes?.find(vote => vote.member === member.id)?.option ?? null}
                    onChange={ev => vote_mutators.vote(member.id, ev.target.value!)}
                  >
                    { options?.map(option => {
                      return (
                        <MenuItem key={option.id} value={option.id}>
                          <ListItemText
                            primary={option.name}
                            // secondary={option.description}
                          />
                        </MenuItem>
                      )
                    }) }
                  </Select>
                }
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
                  secondary={member.pronouns}
                />
              </ListItem>
            )
          }) }
        </List>
      </Block>
      <BlockTitle>Options</BlockTitle>
      <Block>
        <Button
          className="bg-red-700"
          onClick={() => {
            poll_mutators.delete();
            router.push('/app/polls');
          }}
        >
          <Delete/> Delete poll
        </Button>
      </Block>
    </>
  )
}