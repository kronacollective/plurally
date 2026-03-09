"use client";
import { App, MenuList, MenuListItem, Navbar, Page, Tabbar, TabbarLink, ToolbarPane } from 'konsta/react';
import { Box, Drawer, Grid, IconButton, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import PersonIcon from '@mui/icons-material/Person';
import MemberList from './components/members/MemberList';
import MenuDrawer from './components/Drawer';
import { Menu } from '@mui/icons-material';
import { Pane, SplitPane } from 'react-split-pane';

const PAGES = {
  members: MemberList,
};

const PAGE_NAMES = {
  members: 'Members',
};

const DRAWER_WIDTH = 240

export default function Plurally() {
  const [ page, setPage ] = useState<'members'>('members');
  const [ mobile_open, setMobileOpen ] = useState<boolean>(false);
  const [ is_closing, setIsClosing ] = useState<boolean>(false);

  const theme = useTheme()
  const is_mobile = useMediaQuery(theme.breakpoints.down('sm'));

  const PageComponent = PAGES[page];

  const handleDrawerClose = useCallback(() => {
    setIsClosing(true);
    setMobileOpen(false);
  }, []);

  const handleDrawerTransitionEnd = useCallback(() => {
    setIsClosing(false);
  }, []);

  const handleDrawerToggle = useCallback(() => {
    if (!is_closing) setMobileOpen(mo => !mo);
  }, [is_closing]);

  return (
    <App theme='material' className="safe-areas">
      <Page>
        {/* <Box
          component="nav"
          sx={{ width: { sm: `calc(100% - ${DRAWER_WIDTH}px)`}, ml: { sm: `${DRAWER_WIDTH}px` } }}
        >
        </Box> */}
        <Box
          component="nav"
          sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
          aria-label="navigation"
        >
          <Drawer
            variant="temporary"
            open={mobile_open}
            onTransitionEnd={handleDrawerTransitionEnd}
            onClose={handleDrawerClose}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH }
            }}
            slotProps={{
              root: {
                keepMounted: true
              }
            }}
          >
            <MenuDrawer
              page={page}
              setPage={setPage}
            />
          </Drawer>
          <Drawer open
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH }
            }}
          >
            <MenuDrawer
              page={page}
              setPage={setPage}
            />
          </Drawer>
        </Box>
        <Box
          component="main"
          sx={{ flexGrow: 1, width: `calc(100% - ${is_mobile ? 0 : DRAWER_WIDTH}px)`, height: '100vh', ml: `${is_mobile ? 0 : DRAWER_WIDTH}px` }}
        >
          <Stack sx={{ mt: 7 }}>
            <Navbar
              title={PAGE_NAMES[page]}
              className="top-0 fixed"
              left={
                <IconButton aria-label="open toolbar" onClick={handleDrawerToggle}>
                  <Menu/>
                </IconButton>
              }
            />
            <PageComponent/>
          </Stack>
        </Box>
      </Page>
    </App>
  );
}
