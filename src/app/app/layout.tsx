'use client';
import { Box, createTheme, Drawer, IconButton, Stack, ThemeProvider, useMediaQuery, useTheme } from "@mui/material";
import { App, Navbar, Page } from "konsta/react";
import MenuDrawer from "../components/Drawer";
import Menu from "@mui/icons-material/Menu";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { QueryProvider } from "../components/QueryProvider";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DRAWER_WIDTH } from "@/lib/globals";
import { useSupabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const TITLES = {
  '^/app/members$': 'Members',
  '^/app/members/(.+)$': 'Member',
  '^/app/fronts$': 'Fronts',
  '^/app/buckets$': 'Privacy buckets',
  '^/app/buckets/(.+)$': 'Bucket',
  '^/app/fields$': 'Fields',
  '^/app/polls$': 'Polls',
  '^/app/polls/(.+)$': 'Poll',
  '^/app/friends$': 'Friends',
  '^/app/relationships$': 'Relationships',
  '^/app/account$': 'Account',
  '^/app/account/create$': 'Create an account',
};

const THEME = createTheme({
  colorSchemes: {
    dark: true,
  },
});

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = useSupabase();

  const [ mobile_open, setMobileOpen ] = useState<boolean>(false);
  const [ is_closing, setIsClosing ] = useState<boolean>(false);

  const pathname = usePathname();
  const router = useRouter();

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

  const title = Object
    .entries(TITLES)
    .map(([K, T]) => pathname.match(K)?.[0] && T)
    .filter(x => x)
    .at(0);

  // Create account effect
  useEffect(() => {
    if (pathname === '/app/account/create') return;
    const checkIfAccountExists = async () => {
      const { data: user } = await supabase.auth.getUser();
      const { data: account } = await supabase
        .from('accounts')
        .select()
        .eq('user', user?.user?.id ?? '')
        .single();
      if (!account) {
        router.push('/app/account/create');
      }
    };
    checkIfAccountExists();
  }, [pathname, router, supabase]);

  // Dark mode effect
  useEffect(() => {
    const prefers_dark_scheme = window.matchMedia('(prefers-color-scheme: dark)');

    if (prefers_dark_scheme.matches) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    prefers_dark_scheme.addEventListener('change', ev => {
      if (ev.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });
  }, []);

  return (
    <App theme='material' className="safe-areas">
      <ThemeProvider theme={THEME}>
        <QueryProvider>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
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
                    title={title}
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
          </LocalizationProvider>
        </QueryProvider>
      </ThemeProvider>
    </App>
  )
}