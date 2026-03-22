import { Avatar, List, ListItem, Stack, TextField, useMediaQuery, useTheme } from "@mui/material";
import { Block, Fab, Link, Sheet, Toolbar, ToolbarPane } from "konsta/react";
import Image from "next/image";
import { Json, Tables } from '../../../../../lib/supabase/database.types';
import { useState } from "react";
import { Check, Close, Edit, Save } from "@mui/icons-material";
import { MuiColorInput } from "mui-color-input";
import { Updater } from "use-immer";
import { useShortMutations, useShortQuery } from "@/lib/hooks/useShortQuery";
import { useSupabase } from "@/lib/supabase/client";
import EditableMarkdownField from "@/app/components/EditableMarkdownField";
import { dateCalendarClasses, DatePicker, DateTimePicker } from "@mui/x-date-pickers";
import { formatISO, parseJSON } from "date-fns";
import EditableDateField from "@/app/components/EditableDateField";
import EditableColorField from "@/app/components/EditableColorField";

type FavMutators = {
  save: (field_id: string, value: Json) => Promise<void>,
}

export default function FieldsMemberDisplay({
  member,
  member_mutations,
  member_state,
  updateMemberState,
}: {
  member: Tables<'members'>
  member_mutations: {
    update: () => Promise<void>;
    deleteMember: () => Promise<void>;
  } & {
    invalidateCache: () => Promise<void>;
  },
  member_state: Record<string, string | null>,
  updateMemberState: Updater<Record<string, string | null>>,
}) {
  const supabase = useSupabase();

  const theme = useTheme()
  const is_mobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  const { data: fields_and_values } = useShortQuery(
    ['field-values', member.id],
    async () => {
      const { data } = await supabase
        .from('field_values')
        .select('field ( * ), member, value')
        .eq('member', member.id);
      return data;
    },
  );

  // @ts-expect-error Bad still
  const fav_mutators = useShortMutations<FavMutators>(
    ['field-values', member.id],
    {
      save: async (field_id: string, value: Json) => {
        await supabase
          .from('field_values')
          .upsert({
            field: field_id,
            member: member.id,
            value,
          });
      }
    }
  )

  return (
    <>
      <Stack gap={2} display="flex" sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <List sx={{ width: '90%' }}>
        { fields?.map(field => {
          const fav = fields_and_values?.find(fav => fav.field.id === field.id && fav.member === member.id);
          return (
            <ListItem key={`${field.id}-${member.id}`}
              style={{
                backgroundColor: `rgba(${member.color ?? '255, 255, 255'}, 20%)`,
                borderRadius: '10px',
                marginBottom: 5,
              }}
            >
              { field.type === 'text' ? (
                <EditableMarkdownField
                  label={field.name}
                  value={fav?.value as string ?? ''}
                  onSave={val => fav_mutators.save(field.id, val)}
                />
              ) : (
                ['date', 'datetime', 'daymonth'].includes(field.type) ? (
                  <EditableDateField
                    // @ts-expect-error Type will match
                    type={field.type}
                    label={field.name}
                    value={fav?.value ?? ''}
                    onSave={isod => fav_mutators.save(field.id, isod)}
                  />
                ) : (
                  field.type === 'color' ? (
                    <EditableColorField
                      label="Color"
                      value={fav?.value as string ?? '#ffffff'}
                      onSave={ncv => fav_mutators.save(field.id, ncv)}
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