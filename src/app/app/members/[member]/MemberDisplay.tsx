'use client';

import { Tables } from "@/lib/supabase/database.types";
import { Avatar, CircularProgress, Stack, TextField, useMediaQuery, useTheme } from "@mui/material";
import Image from "next/image";
import { MuiColorInput } from "mui-color-input";
import { useCallback, useEffect, useOptimistic, useState, useTransition } from "react";
import { useSupabase } from "@/lib/supabase/client";
import { Block, Fab, Link, Sheet, Tabbar, TabbarLink, Toolbar, ToolbarPane } from "konsta/react";
import { Check, Close, Person, Save, Settings } from "@mui/icons-material";
import { useShortMutations, useShortQuery } from "@/lib/hooks/useShortQuery";
import { useImmer } from "use-immer";
import { DRAWER_WIDTH } from "@/lib/globals";
import MainMemberDisplay from "./tabs/Main";
import SettingsMemberDisplay from "./tabs/Settings";
import { CalendarIcon } from "@mui/x-date-pickers";
import HistoryMemberDisplay from "./tabs/History";

const TAB_COMPONENTS = {
  main: MainMemberDisplay,
  settings: SettingsMemberDisplay,
  history: HistoryMemberDisplay,
}

export default function MemberDisplay({
  member_id,
}: {
  member_id: string,
}) {
  const supabase = useSupabase();

  const theme = useTheme()
  const is_mobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [ member_state, updateMemberState ] = useImmer<Record<string, string | null>>({});
  const [ active_tab, setActiveTab ] = useState('main');

  const { data: member } = useShortQuery(
    ["member", member_id],
    async () => {
      const { data: member } = await supabase
        .from('members')
        .select()
        .eq('id', member_id)
        .single();
      return member;
    },
  );

  useEffect(() => {
    if (!member) return;
    updateMemberState(draft => {
      Object.entries(member!).forEach(entry => draft[entry[0]] = String(entry[1]))
    });
  }, [member, updateMemberState]);

  const member_mutations = useShortMutations(
    ["member", member_id],
    {
      update: async () => {
        await supabase
          .from('members')
          .update(member_state)
          .eq('id', member_id);
      },
      deleteMember: async () => {
        await supabase
          .from('members')
          .delete()
          .eq('id', member_id);
      }
    }
  );

  // @ts-expect-error This is probably not proper, but we select a tab component from an object
  const Tab = TAB_COMPONENTS[active_tab];

  return !member ? <></> : (
    <Stack gap={2} display="flex" sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
      <Tab
        member={member}
        member_mutations={member_mutations}
        member_state={member_state}
        updateMemberState={updateMemberState}
      />
      <Tabbar
        className="right-0 bottom-0 fixed"
        style={{ left: is_mobile ? '0' : DRAWER_WIDTH, width: is_mobile ? '100%' : `calc(100% - ${DRAWER_WIDTH}px)` }}
      >
        <ToolbarPane>
          <TabbarLink
            active={active_tab === 'main'}
            onClick={() => setActiveTab('main')}
            icon={<Person/>}
            label="Main"
          />
          <TabbarLink
            active={active_tab === 'history'}
            onClick={() => setActiveTab('history')}
            icon={<CalendarIcon/>}
            label="History"
          />
          <TabbarLink
            active={active_tab === 'settings'}
            onClick={() => setActiveTab('settings')}
            icon={<Settings/>}
            label="Settings"
          />
        </ToolbarPane>
      </Tabbar>
    </Stack>
  );
}