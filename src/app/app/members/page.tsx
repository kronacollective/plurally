'use client';
import { useShortQuery } from "@/lib/hooks/useShortQuery";
import { useSupabase } from "@/lib/supabase/client";
import styled from "@emotion/styled";
import { ArrowDownward, ArrowUpward } from "@mui/icons-material";
import Add from "@mui/icons-material/Add";
import { List, ListItem, ListItemAvatar, ListItemButton, ListItemText } from "@mui/material";
import { Block, BlockTitle, Fab } from "konsta/react";
import Image from 'next/image';
import { LeadingActions, SwipeableList, SwipeableListItem, SwipeAction, TrailingActions } from "react-swipeable-list";
import 'react-swipeable-list/dist/styles.css';

const ActionContent = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  padding: 8px;
  font-size: 12px;
  font-weight: 500;
  box-sizing: border-box;
  color: #eee;
  user-select: none;
`;


export default function Members() {
  const supabase = useSupabase();

  const { data: user } = useShortQuery(
    ["user"],
    async () => {
      return (await supabase.auth.getUser()).data;
    },
  );

  const { data: members } = useShortQuery(
    ["members"],
    async () => {
      const { data } = await supabase
        .from('members')
        .select()
        .eq('user', user?.user?.id);
      return data;
    },
    [ user ],
  );
  console.log('user, members', user, members);

  const MemberLeadingActions = () => {
    return (
      <LeadingActions>
        <SwipeAction onClick={() => console.info('Swiped right')}>
          <ActionContent style={{ backgroundColor: '#555' }}>
            <ArrowDownward/>
          </ActionContent>
        </SwipeAction>
      </LeadingActions>
    );
  };

  const MemberTrailingActions = () => {
    return (
      <TrailingActions>
        <SwipeAction onClick={() => console.info('Swiped left')}>
          <ActionContent className="bg-lime-400">
            <ArrowUpward/>
          </ActionContent>
        </SwipeAction>
      </TrailingActions>
    )
  }

  return (
    <div>
      <Fab
        className="fixed right-safe-4 bottom-safe-4"
        icon={<Add/>}
      />
      <Block>
        <BlockTitle style={{ marginBottom: 1 }}>All members</BlockTitle>
        <SwipeableList>
          { members?.map(member => {
            return (
              <SwipeableListItem
                key={member.id}
                // style={{ backgroundColor: `rgba(${member.color}, 20%)`, borderRadius: '10px' }}
                leadingActions={<MemberLeadingActions/>}
                trailingActions={<MemberTrailingActions/>}
              >
                <ListItemButton>
                  <ListItemAvatar sx={{ mr: 2 }}>
                    <Image
                      className="rounded-full"
                      src={member.avatar}
                      width={60}
                      height={60}
                      alt="Profile picture"
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={member.name}
                    secondary={member.pronouns}
                  >
                  </ListItemText>
                </ListItemButton>
              </SwipeableListItem>
            )
          }) }
        </SwipeableList>
      </Block>
    </div>
  )
}