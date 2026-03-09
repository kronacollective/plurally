import { MenuList, MenuListItem } from "konsta/react";
import PersonIcon from '@mui/icons-material/Person';
import React from "react";
import { Divider } from "@mui/material";
import { useSupabase } from "@/lib/supabase/client";
import { Logout } from "@mui/icons-material";
import { useRouter } from "next/navigation";

export default function MenuDrawer({
  page, setPage
}: {
  page: 'members',
  setPage: React.Dispatch<React.SetStateAction<'members'>>
}) {
  const supabase = useSupabase();
  const router = useRouter();
  return (
    <div>
      <MenuList>
        <MenuListItem
          title="Members"
          active={page === 'members'}
          onClick={() => setPage('members')}
          media={<PersonIcon/>}
        />
      </MenuList>
      <Divider variant="middle"/>
      <MenuList>
        <MenuListItem
          title="Log out"
          onClick={() => {
            supabase.auth.signOut();
            router.push('/login');
          }}
          media={<Logout/>}
        />
      </MenuList>
    </div>
  )
}