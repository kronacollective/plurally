import { List, ListItem, Stack } from "@mui/material";
import { Tables } from '@/lib/supabase/database.types';
import { useShortQuery } from "@/lib/hooks/useShortQuery";
import { useSupabase } from "@/lib/supabase/client";
import EditableMarkdownField from "@/app/components/EditableMarkdownField";
import EditableDateField from "@/app/components/EditableDateField";
import EditableColorField from "@/app/components/EditableColorField";
import { getFriendFields } from "../../actions";

export default function FieldsMemberDisplay({
  member,
  friend_id,
}: {
  member: Tables<'members'>,
  friend_id: string,
}) {
  const supabase = useSupabase();

  const { data: account } = useShortQuery(
    ["account"],
    async () => {
      const { data: user } = await supabase.auth.getUser();
      const { data: account } = await supabase
        .from('accounts')
        .select()
        .eq('user', user.user!.id)
        .single();
      return account;
    },
  );

  const { data: fields } = useShortQuery(
    ['fields', account!.id, friend_id],
    async () => {
      const fields = await getFriendFields(account!.id, friend_id);
      return fields;
    },
    [ account ],
  );

  const { data: fields_and_values } = useShortQuery(
    ['field-values', member.id],
    async () => {
      const { data } = await supabase
        .from('field_values')
        .select('field, member, value')
        .eq('member', member.id)
        .in('field', fields?.map(field => field.id) ?? []);
      // console.log('fav.filters', fields?.map(field => field.id));
      console.log('fav.data', data);
      return data;
    },
    [ fields ],
  );

  return (
    <>
      <Stack gap={2} display="flex" sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <List sx={{ width: '90%' }}>
        { fields?.map(field => {
          const fav = fields_and_values?.find(fav => fav.field === field.id && fav.member === member.id);
          return (
            <ListItem key={`${field.id}-${member.id}`}
              style={{
                backgroundColor: `rgba(${member.color ?? '255, 255, 255'}, 20%)`,
                borderRadius: '10px',
                marginBottom: 5,
              }}
            >
              { field.type === 'text' ? (
                <EditableMarkdownField readonly
                  label={field.name}
                  value={fav?.value as string ?? ''}
                />
              ) : (
                ['date', 'datetime', 'daymonth'].includes(field.type) ? (
                  <EditableDateField readonly
                    // @ts-expect-error Type will match
                    type={field.type}
                    label={field.name}
                    value={fav?.value ?? ''}
                  />
                ) : (
                  field.type === 'color' ? (
                    <EditableColorField readonly
                      label="Color"
                      value={fav?.value as string ?? '#ffffff'}
                    />
                  ) : (
                    <></>
                  )
                )
              )}
            </ListItem>
          )
        }) }
        </List>
      </Stack>
    </>
  )
}