'use client';

import { Stack, useMediaQuery, useTheme } from "@mui/material";
import { useState } from "react";
import { useSupabase } from "@/lib/supabase/client";
import { Tabbar, TabbarLink, ToolbarPane } from "konsta/react";
import { Person, Settings } from "@mui/icons-material";
import { DRAWER_WIDTH } from "@/lib/globals";
import MainMemberDisplay from "./tabs/Main";
import { CalendarIcon } from "@mui/x-date-pickers";
import HistoryMemberDisplay from "./tabs/History";
import { useShortQuery } from "@/lib/hooks/useShortQuery";

const TAB_COMPONENTS = {
  main: MainMemberDisplay,
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

  // @ts-expect-error This is probably not proper, but we select a tab component from an object
  const Tab = TAB_COMPONENTS[active_tab];

  return !member ? <></> : (
    <Stack gap={2} display="flex" sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
      <Tab
        member={member}
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
        </ToolbarPane>
      </Tabbar>
    </Stack>
  );
}