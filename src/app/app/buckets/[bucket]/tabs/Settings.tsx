import { Tables } from "@/lib/supabase/database.types";
import { Save } from "@mui/icons-material";
import { List, ListItem, ListItemText, Stack, Switch, TextField } from "@mui/material";
import { Fab } from "konsta/react";
import { MuiColorInput } from "mui-color-input";
import { Updater } from "use-immer";

export default function BucketSettings({
  bucket_mutations,
  bucket_state,
  updateBucketState,
}: {
  bucket: Tables<'buckets'>
  bucket_mutations: {
    update: () => Promise<void>,
  } & {
    invalidateCache: () => Promise<void>,
  },
  bucket_state: Record<string, string | boolean | null>,
  updateBucketState: Updater<Record<string, string | boolean | null>>,
}) {
  return (
    <>
      <Stack gap={2} display="flex" sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <TextField
          name="name"
          label="Name"
          variant="outlined"
          // defaultValue={member?.name}
          value={bucket_state.name}
          onChange={ev => updateBucketState(draft => { draft.name = ev.target.value })}
          sx={{ width: '90%' }}
        />
        <TextField multiline
          name="description"
          label="Description"
          variant="outlined"
          // defaultValue={member?.description}
          value={bucket_state.description}
          onChange={ev => updateBucketState(draft => { draft.description = ev.target.value })}
          minRows={3}
          sx={{ width: '90%' }}
        />
        <MuiColorInput
          name="color"
          label="Color"
          variant="outlined"
          format="rgb"
          value={bucket_state?.color ? `rgb(${bucket_state.color})` : 'rgb(255, 255, 255)'}
          onChange={nv => updateBucketState(draft => { draft.color = nv.slice(4, -1) })}
          sx={{ width: '90%' }}
        />
        <List sx={{ width: '90%' }}>
          <ListItem
            secondaryAction={
              <Switch
                checked={bucket_state?.is_public as boolean}
                onChange={ev => updateBucketState(draft => { draft.is_public = ev.target.checked })}
              />
            }
          >
            <ListItemText
              primary="Make bucket public"
              secondary="If enabled, anyone will be able to see the contents of this bucket"
            />
          </ListItem>
        </List>
      </Stack>
      <Fab
        className="fixed bottom-safe-16 right-safe-4"
        icon={<Save/>}
        text="Save"
        textPosition="after"
        component="button"
        onClick={bucket_mutations.update}
      />
    </>
  )
}