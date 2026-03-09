import { Add } from "@mui/icons-material";
import { Grid, Stack, Typography } from "@mui/material";
import { Block, BlockTitle, Fab, List, ListItem, Navbar } from "konsta/react";
import Image from "next/image";

export default function MemberList() {
  return (
    <div>
      <Fab
        className="fixed right-safe-4 bottom-safe-4"
        icon={<Add/>}
      />
      <Block>
        <BlockTitle>All members</BlockTitle>
        <List>
          <ListItem link
            title="🌟Aqua"
            subtitle="He/him"
            chevronMaterial={false}
            media={
              <Image
                className="rounded-full"
                src="https://file.garden/aR45A-PELWsfxjhj/aqua/pfp.jpg"
                width={60}
                height={60}
                alt="Profile picture"
              />
            }
          />
          <ListItem link
            title="⚜️mikaela."
            subtitle="any/all"
            chevronMaterial={false}
            media={
              <Image
                className="rounded-full"
                src="https://file.garden/aR45A-PELWsfxjhj/mikaela/pfp.jpg"
                width={60}
                height={60}
                alt="Profile picture"
              />
            }
          />
        </List>
      </Block>
    </div>
  )
}