import { MenuList, MenuListItem } from "konsta/react";
import PersonIcon from '@mui/icons-material/Person';
import React from "react";

export default function MenuDrawer({
  page, setPage
}: {
  page: 'members',
  setPage: React.Dispatch<React.SetStateAction<'members'>>
}) {
  return (
    <MenuList>
      <MenuListItem
        title="Members"
        active={page === 'members'}
        onClick={() => setPage('members')}
        media={<PersonIcon/>}
      />
    </MenuList>
  )
}