import { MenuList, MenuListItem } from "konsta/react";
import PersonIcon from '@mui/icons-material/Person';
import React from "react";
import { Divider } from "@mui/material";
import { useSupabase } from "@/lib/supabase/client";
import { CoPresent, Dataset, Description, Diversity2, Group, HowToVote, Link, Logout, TextFields, Timelapse } from "@mui/icons-material";
import { useRouter } from "next/navigation";

export default function MenuDrawer({
  page,
}: {
  page: string,
}) {
  const supabase = useSupabase();
  const router = useRouter();
  return (
    <div>
      <MenuList>
        <MenuListItem
          title="Members"
          active={page === '/app/members'}
          onClick={() => router.push('/app/members')}
          media={<Group/>}
        />
        <MenuListItem
          title="Fronts"
          active={page === '/app/fronts'}
          onClick={() => router.push('/app/fronts')}
          media={<Timelapse/>}
        />
        <MenuListItem
          title="Journal"
          active={page === '/app/journal'}
          onClick={() => router.push('/app/journal')}
          media={<Description/>}
        />
        <MenuListItem
          title="Privacy buckets"
          active={page === '/app/buckets'}
          onClick={() => router.push('/app/buckets')}
          media={<Dataset/>}
        />
        <MenuListItem
          title="Custom fields"
          active={page === '/app/fields'}
          onClick={() => router.push('/app/fields')}
          media={<TextFields/>}
        />
        <MenuListItem
          title="Polls"
          active={page === '/app/polls'}
          onClick={() => router.push('/app/polls')}
          media={<HowToVote/>}
        />
        <MenuListItem
          title="Friends"
          active={page === '/app/friends'}
          onClick={() => router.push('/app/friends')}
          media={<Diversity2/>}
        />
        <MenuListItem
          title="Relationships"
          active={page === '/app/relationships'}
          onClick={() => router.push('/app/relationships')}
          media={<Link/>}
        />
        <MenuListItem
          title="Account"
          active={page === '/app/account'}
          onClick={() => router.push('/app/account')}
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