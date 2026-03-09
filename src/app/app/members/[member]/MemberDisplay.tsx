'use client';

import { Tables } from "@/lib/supabase/database.types";
import { Avatar, Stack, TextField } from "@mui/material";
import Image from "next/image";

const SIZES = [300, 300]

export default function MemberDisplay({
  member,
}: {
  member: Tables<'members'> | null,
}) {
  return (
    <Stack gap={2} display="flex" sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
      <Avatar variant="rounded" sx={{ width: SIZES[0], height: SIZES[1], mt: 3, mb: 3 }}>
        {member && member.avatar ? (
          <Image
            src={member.avatar}
            alt={`Profile picture for ${member.name}`}
            width={SIZES[0]}
            height={SIZES[1]}
          />
        ) : (
          "?"
        )}
      </Avatar>
      <TextField
        id="member-name"
        label="Name"
        variant="outlined"
        value={member?.name}
        sx={{ width: '90%' }}
      />
      <TextField
        id="member-pronouns"
        label="Pronouns"
        variant="outlined"
        value={member?.pronouns}
        sx={{ width: '90%' }}
      />
      <TextField multiline
        id="member-description"
        label="Description"
        variant="outlined"
        value={member?.description}
        minRows={3}
        sx={{ width: '90%' }}
      />
    </Stack>
  );
}