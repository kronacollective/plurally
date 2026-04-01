import { Avatar, Stack, TextField } from "@mui/material";
import Image from "next/image";
import { Tables } from "@/lib/supabase/database.types";

const AVATAR_SIZES = [300, 300];

export default function MainMemberDisplay({
  member,
}: {
  member: Tables<'members'>
}) {
  return (
    <>
      <Avatar variant="rounded" sx={{ width: AVATAR_SIZES[0], height: AVATAR_SIZES[1], mt: 3, mb: 3 }}>
        {member && member.avatar ? (
          <Image
            src={member.avatar}
            alt={`Profile picture for ${member.name}`}
            width={AVATAR_SIZES[0]}
            height={AVATAR_SIZES[1]}
          />
        ) : (
          "?"
        )}
      </Avatar>
      <Stack gap={2} display="flex" sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <TextField disabled
          name="name"
          label="Name"
          variant="outlined"
          // defaultValue={member?.name}
          value={member.name}
          sx={{ width: '90%' }}
        />
        <TextField disabled
          name="pronouns"
          label="Pronouns"
          variant="outlined"
          // defaultValue={member?.pronouns}
          value={member.pronouns}
          sx={{ width: '90%' }}
        />
        <TextField multiline disabled
          name="description"
          label="Description"
          variant="outlined"
          // defaultValue={member?.description}
          value={member.description}
          minRows={3}
          sx={{ width: '90%' }}
        />
        <TextField
          name="id"
          label="Member ID"
          variant="outlined"
          // defaultValue={member?.pronouns}
          value={member.id}
          sx={{ width: '90%' }}
          slotProps={{
            input: {
              readOnly: true,
            }
          }}
        />
      </Stack>
    </>
  )
}