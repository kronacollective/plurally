import { useShortQuery } from "@/lib/hooks/useShortQuery";
import { useSupabase } from "@/lib/supabase/client";
import { Stack, TextField } from "@mui/material";

export default function FriendInformation({
  friend_id
}: {
  friend_id: string,
}) {
  const supabase = useSupabase();

  const { data: friend } = useShortQuery(
    ['account', friend_id],
    async () => {
      const { data } = await supabase
        .from('accounts')
        .select()
        .eq('id', friend_id)
        .single();
      return data;
    },
  );

  return (
    <Stack gap={2} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
      <TextField disabled
        label="Username"
        variant="outlined"
        value={friend?.username}
        sx={{ width: '90%' }}
      />
      <TextField disabled
        label="Display name"
        variant="outlined"
        value={friend?.display_name}
        sx={{ width: '90%' }}
      />
      <TextField disabled multiline
        label="Description"
        variant="outlined"
        value={friend?.description}
        minRows={3}
        sx={{ width: '90%' }}
      />
    </Stack>
  );
}