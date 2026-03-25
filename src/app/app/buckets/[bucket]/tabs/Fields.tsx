import { useShortMutations, useShortQuery } from "@/lib/hooks/useShortQuery";
import { useSupabase } from "@/lib/supabase/client";
import { Tables } from "@/lib/supabase/database.types";
import { Checkbox, List, ListItem, ListItemText, Stack } from "@mui/material";
import { Updater } from "use-immer";

type BucketFieldMutations = {
  includeField: (field_id: string) => Promise<void>,
  excludeField: (field_id: string) => Promise<void>,
};

export default function BucketFields({
  bucket,
}: {
  bucket: Tables<'buckets'>
  bucket_mutations: {
    update: () => Promise<void>,
  } & {
    invalidateCache: () => Promise<void>,
  },
  bucket_state: Record<string, string | null>,
  updateBucketState: Updater<Record<string, string | null>>,
}) {
  const supabase = useSupabase();

  const { data: account } = useShortQuery(
    ['account'],
    async () => {
      const { data: user } = await supabase.auth.getUser();
      const { data } = await supabase
        .from('accounts')
        .select()
        .eq('user', user.user!.id)
        .single();
      return data;
    },
  );

  const { data: fields } = useShortQuery(
    ['fields', account?.id],
    async () => {
      const { data } = await supabase
        .from('fields')
        .select()
        .eq('account', account!.id);
      return data;
    },
    [ account ],
  );

  const { data: bucket_fields } = useShortQuery(
    ['bucket-fields', bucket.id],
    async () => {
      const { data } = await supabase
        .from('bucket_fields')
        .select()
        .eq('bucket', bucket.id);
      const list = data!.map(field => field.field);
      return list;
    },
  );

  // @ts-expect-error Types bad
  const bucket_field_mutators = useShortMutations<BucketFieldMutations>(
    ['bucket-fields', bucket.id],
    {
      includeField: async (field_id: string) => {
        await supabase
          .from('bucket_fields')
          .insert({
            bucket: bucket.id,
            field: field_id,
          });
      },
      excludeField: async (field_id: string) => {
        await supabase
          .from('bucket_fields')
          .delete()
          .eq('bucket', bucket.id)
          .eq('field', field_id);
      },
    }
  )

  return (
    <>
      <Stack gap={2} display="flex" sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <List sx={{ width: '90%' }}>
          { fields?.map(field => {
            return (
              <ListItem
                key={field.id}
                style={{
                  borderRadius: '10px',
                  marginBottom: 5,
                }}
                secondaryAction={
                  <Checkbox
                    checked={bucket_fields?.includes(field.id) ?? false}
                    onChange={ev => ev.target.checked ? bucket_field_mutators.includeField(field.id) : bucket_field_mutators.excludeField(field.id)}
                  />
                }
              >
                <ListItemText
                  primary={field.name}
                  secondary={field.type}
                >
                </ListItemText>
              </ListItem>
            )
          }) }
        </List>
      </Stack>
    </>
  )
}