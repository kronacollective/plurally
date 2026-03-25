'use client';

import { Tabbar, TabbarLink, ToolbarPane } from "konsta/react";
import { Info, People } from "@mui/icons-material";
import { useState } from "react";
import { DRAWER_WIDTH } from "@/lib/globals";
import FriendMembers from "./tabs/Members";
import { useMediaQuery, useTheme } from "@mui/material";
import FriendInformation from "./tabs/Information";

const TAB_COMPONENTS = {
  members: FriendMembers,
  info: FriendInformation,
};

export default function FriendDisplay({
  friend_id
}: {
  friend_id: string,
}) {
  const [ active_tab, setActiveTab ] = useState('members');

  const theme = useTheme()
  const is_mobile = useMediaQuery(theme.breakpoints.down('sm'));

  // @ts-expect-error Still bad
  const Tab = TAB_COMPONENTS[active_tab];

  return (
    <>
      <div style={{ marginBottom: 64 }}>
        <Tab
          friend_id={friend_id}
        />
      </div>
      <Tabbar
        className="right-0 bottom-0 fixed"
        style={{ left: is_mobile ? '0' : DRAWER_WIDTH, width: is_mobile ? '100%' : `calc(100% - ${DRAWER_WIDTH}px)` }}
      >
        <ToolbarPane>
          <TabbarLink
            active={active_tab === 'members'}
            onClick={() => setActiveTab('members')}
            icon={<People/>}
            label="Members"
          />
          <TabbarLink
            active={active_tab === 'info'}
            onClick={() => setActiveTab('info')}
            icon={<Info/>}
            label="Information"
          />
        </ToolbarPane>
      </Tabbar>
    </>
  )
}