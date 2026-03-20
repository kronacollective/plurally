'use client';
import { DRAWER_WIDTH } from "@/lib/globals";
import { Analytics } from "@mui/icons-material";
import { useMediaQuery, useTheme } from "@mui/material";
import { CalendarIcon } from "@mui/x-date-pickers";
import { Tabbar, TabbarLink, ToolbarPane } from "konsta/react";
import { useState } from "react";
import HistoryFronts from "./tabs/History";
import AnalyticsFronts from "./tabs/Analytics";

const TAB_COMPONENTS = {
  history: HistoryFronts,
  analytics: AnalyticsFronts,
};

export default function Fronts() {
  const [ active_tab, setActiveTab ] = useState('history');

  const theme = useTheme()
  const is_mobile = useMediaQuery(theme.breakpoints.down('sm'));

  // @ts-expect-error This is still apparently wrong
  const Tab = TAB_COMPONENTS[active_tab];

  return (
    <div className="p-2">
      <div className="mb-16">
        <Tab
        />
      </div>
      <Tabbar
        className="right-0 bottom-0 fixed"
        style={{ left: is_mobile ? '0' : DRAWER_WIDTH, width: is_mobile ? '100%' : `calc(100% - ${DRAWER_WIDTH}px)` }}
      >
        <ToolbarPane>
          <TabbarLink
            active={active_tab === 'history'}
            onClick={() => setActiveTab('history')}
            icon={<CalendarIcon/>}
            label="History"
          />
          <TabbarLink
            active={active_tab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
            icon={<Analytics/>}
            label="Analytics"
          />
        </ToolbarPane>
      </Tabbar>
    </div>
  )
}