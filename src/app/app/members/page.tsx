'use client';
import { ArrowUpward, MenuOpen, People } from "@mui/icons-material";
import { useMediaQuery, useTheme } from "@mui/material";
import { Tabbar, TabbarLink, ToolbarPane } from "konsta/react";
import { useState } from "react";
import { DRAWER_WIDTH } from "@/lib/globals";
import MemberList from "./tabs/Members";
import FrontsActive from "./tabs/Active";
import Statuses from "./tabs/Statuses";

const TAB_COMPONENTS = {
  members: MemberList,
  active: FrontsActive,
  statuses: Statuses,
};

export default function Members() {
  const [ active_tab, setActiveTab ] = useState('members');

  const theme = useTheme()
  const is_mobile = useMediaQuery(theme.breakpoints.down('sm'));

  // @ts-expect-error Still bad
  const Tab = TAB_COMPONENTS[active_tab];

  return (
    <div>
      <Tab
      />
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
            active={active_tab === 'active'}
            onClick={() => setActiveTab('active')}
            icon={<ArrowUpward/>}
            label="Active"
          />
          <TabbarLink
            active={active_tab === 'statuses'}
            onClick={() => setActiveTab('statuses')}
            icon={<MenuOpen/>}
            label="Statuses"
          />
        </ToolbarPane>
      </Tabbar>
    </div>
  )
}