'use client';
import { Box, Drawer, IconButton, Stack, useMediaQuery, useTheme } from "@mui/material";
import { App, Navbar, Page } from "konsta/react";
import MenuDrawer from "../components/Drawer";
import Menu from "@mui/icons-material/Menu";
import { useCallback, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { QueryProvider } from "../components/QueryProvider";

const DRAWER_WIDTH = 240

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [ mobile_open, setMobileOpen ] = useState<boolean>(false);
  const [ is_closing, setIsClosing ] = useState<boolean>(false);

  const pathname = usePathname();

  const theme = useTheme()
  const is_mobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      <QueryProvider>
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
                page={pathname}
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
                page={pathname}
              />
            </Drawer>
          </Box>
          <Box
            component="main"
            sx={{ flexGrow: 1, width: `calc(100% - ${is_mobile ? 0 : DRAWER_WIDTH}px)`, height: '100vh', ml: `${is_mobile ? 0 : DRAWER_WIDTH}px` }}
          >
            <Stack sx={{ mt: 8 }}>
              <Navbar
                title={pathname}
                className="top-0 fixed"
                left={
                  <IconButton aria-label="open toolbar" onClick={handleDrawerToggle}>
                    <Menu/>
                  </IconButton>
                }
              />
              {children}
            </Stack>
          </Box>
        </Page>
      </QueryProvider>
    </App>
  )
}