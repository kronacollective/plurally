import { Tables } from "@/lib/supabase/database.types";
import { FormControl, FormControlLabel, FormLabel, Stack, Switch } from "@mui/material";
import { Button } from "konsta/react";
import { useRouter } from "next/navigation";
import { Updater } from "use-immer";

export default function SettingsMemberDisplay({
  member,
  member_mutations,
  member_state,
  updateMemberState,
}: {
  member: Tables<'members'>
  member_mutations: {
    update: () => Promise<void>;
    deleteMember: () => Promise<void>;
    archiveMember: () => Promise<void>;
    unarchiveMember: () => Promise<void>;
  } & {
    invalidateCache: () => Promise<void>;
  },
  member_state: Record<string, string | null>,
  updateMemberState: Updater<Record<string, string | null>>,
}) {
  const router = useRouter();
  return (
    <div className="p-3" style={{ width: '100%' }}>
      <Stack spacing={2} sx={{ justifyContent: 'center', alignItems: 'center' }}>
        <FormControl>
          <FormControlLabel
            label="Archive member"
            control={
              <Switch
                checked={member.archived}
                onChange={ev => ev.target.checked ? member_mutations.archiveMember() : member_mutations.unarchiveMember()}
              />
            }
          />
        </FormControl>
        <Button
          className="bg-red-700"
          onClick={() => {
            member_mutations.deleteMember()
            router.push('/app/members');
          }}
        >
          Delete
        </Button>
      </Stack>
    </div>
  )
}