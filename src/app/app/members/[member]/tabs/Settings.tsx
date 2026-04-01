import useAccount from "@/lib/hooks/useAccount";
import { useShortQuery } from "@/lib/hooks/useShortQuery";
import { useSupabase } from "@/lib/supabase/client";
import { Tables } from "@/lib/supabase/database.types";
import { Clear } from "@mui/icons-material";
import { FormControl, FormControlLabel, IconButton, List, ListItem, ListItemAvatar, ListItemText, MenuItem, Select, Stack, Switch } from "@mui/material";
import { Button } from "konsta/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Updater } from "use-immer";

export default function SettingsMemberDisplay({
  member,
  member_mutations,
}: {
  member: Tables<'members'>
  member_mutations: {
    deleteMember: () => Promise<void>;
    archiveMember: () => Promise<void>;
    unarchiveMember: () => Promise<void>;
    updateMemberOf: (member_of: string | null) => Promise<void>;
  } & {
    invalidateCache: () => Promise<void>;
  },
  member_state: Record<string, string | null>,
  updateMemberState: Updater<Record<string, string | null>>,
}) {
  const supabase = useSupabase();
  const router = useRouter();

  const { data: account } = useAccount();
  const { data: selectable_members } = useShortQuery(
    ['members', account?.id, 'selectable'],
    async () => {
      // Fetch data
      const { data } = await supabase
        .from('members')
        .select()
        .eq('account', account!.id)
        .neq('id', member.id)
        .eq('is_status', false);
      // Sort data
      const alphabetical_members = data?.toSorted((a, b) => a.name?.localeCompare(b.name!) ?? 0) ?? [];
      // Return
      return alphabetical_members;
    }
  );

  return (
    <div className="p-3" style={{ width: '100%' }}>
      <Stack spacing={2} sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <List sx={{ width: '100%' }}>
          <ListItem
            secondaryAction={
              <Switch
                checked={member.archived}
                onChange={ev => ev.target.checked ? member_mutations.archiveMember() : member_mutations.unarchiveMember()}
              />
            }
          >
            <ListItemText primary="Archive member"/>
          </ListItem>
          <ListItem
            sx={{ paddingBlock: 5 }}
            secondaryAction={
              <Stack direction="row" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconButton
                  onClick={() => member_mutations.updateMemberOf(null)}
                  sx={{ width: 50, height: 50 }}
                >
                  <Clear/>
                </IconButton>
                <Select
                  id="member"
                  value={member.member_of ?? null}
                  onChange={ev => member_mutations.updateMemberOf(ev.target.value)}
                  sx={{ width: '10em' }}
                >
                  { selectable_members?.map(smember => {
                    return (
                      <MenuItem key={smember.id} value={smember.id}>
                        <ListItem sx={{ p: 0 }}>
                          <ListItemAvatar>
                            { smember && smember.avatar ? (
                              <Image
                                className="rounded-full"
                                src={smember.avatar}
                                width={25}
                                height={25}
                                alt="Profile picture"
                              />
                            ) : '?' }
                          </ListItemAvatar>
                          <ListItemText
                            primary={smember.name}
                            secondary={smember.pronouns}
                          />
                        </ListItem>
                      </MenuItem>
                    )
                  }) }
                </Select>
              </Stack>
            }
          >
            <ListItemText primary="Is submember of"/>
          </ListItem>
        </List>
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