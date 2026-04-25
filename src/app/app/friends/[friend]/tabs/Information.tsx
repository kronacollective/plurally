import EditableMarkdownField from "@/app/components/EditableMarkdownField";
import { useShortQuery } from "@/lib/hooks/useShortQuery";
import { useSupabase } from "@/lib/supabase/client";
import { Stack } from "@mui/material";

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
    <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Stack gap={2} style={{ width: '90%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
        <EditableMarkdownField readonly
          label="Username"
          value={friend!.username}
        />
        <EditableMarkdownField readonly
          label="Display name"
          value={friend!.display_name!}
        />
        <EditableMarkdownField readonly
          label="Description"
          value={friend!.description!}
        />
      </Stack>
    </div>
  );
}