import { AppBar, Drawer, IconButton, List, ListItem, Stack, Toolbar, Typography, useMediaQuery, useTheme } from "@mui/material";
import GlassSurface from "./bits/GlassSurface";
import Image from "next/image";
import Link from "next/link";
import { Stack_Sans_Headline } from "next/font/google";
import { Button } from "konsta/react";
import { Menu } from "@mui/icons-material";
import { useState } from "react";

const stack_sans = Stack_Sans_Headline({ subsets: ['latin'] });

export default function Navbar() {
  const theme = useTheme();
  const is_mobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [ drawer_open, setDrawerOpen ] = useState(false);

  return (
    <>
      <Drawer open={drawer_open} onClose={() => setDrawerOpen(false)} sx={{ borderRadius: '5px' }}>
        <List sx={{ width: '9em', borderRadius: '5px' }}>
          <ListItem>
            <Link href="/about"><Typography className={stack_sans.className}>About</Typography></Link>
          </ListItem>
          <ListItem>
            <Link href="/features"><Typography className={stack_sans.className}>Features</Typography></Link>
          </ListItem>
        </List>
      </Drawer>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{mt: 2}}>
          <GlassSurface
            width="100%"
            height={50}
            borderRadius={50}
            opacity={0.93}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" width="95%">
              <Stack direction="row" spacing={1} alignItems="center">
                { is_mobile && <IconButton onClick={() => setDrawerOpen(true)}>
                  <Menu/>
                </IconButton>}
                <Image
                  src="/favicon-96x96.png"
                  alt="Icon"
                  width={30}
                  height={30}
                  style={{ borderRadius: '5px' }}
                />
                <Typography variant="h6" color="white" className={stack_sans.className}>Plurally</Typography>
              </Stack>
              { !is_mobile && <Stack direction="row" spacing={2}>
                <Link href="/about"><Typography color="white" className={stack_sans.className}>About</Typography></Link>
                <Link href="/features"><Typography color="white" className={stack_sans.className}>Features</Typography></Link>
              </Stack> }
              <Link href="/login">
                <Button rounded style={{ width: '7em' }}>
                  Log in
                </Button>
              </Link>
            </Stack>
          </GlassSurface>
        </Toolbar>
      </AppBar>
    </>
  );
}