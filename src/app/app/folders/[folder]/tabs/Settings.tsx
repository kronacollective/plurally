import { Tables } from "@/lib/supabase/database.types";
import { Delete, Save } from "@mui/icons-material";
import { Stack, TextField } from "@mui/material";
import { Button } from "konsta/react";
import { MuiColorInput } from "mui-color-input";
import { useRouter } from "next/navigation";
import { Updater } from "use-immer";

export default function SettingsFolderDisplay({
  folder,
  folder_mutators,
  folder_state,
  updateFolderState,
}: {
  folder: Tables<'members'>
  folder_mutators: {
    update: () => Promise<void>;
    deleteFolder: () => Promise<void>;
  } & {
    invalidateCache: () => Promise<void>;
  },
  folder_state: Record<string, string | null>,
  updateFolderState: Updater<Record<string, string | null>>,
}) {
  const router = useRouter();
  return (
    <div className="p-3" style={{ width: '100%' }}>
      <Stack spacing={2}>
        <TextField
          label="Name"
          value={folder_state.name || ''}
          onChange={ev => updateFolderState(draft => { draft.name = ev.target.value; })}
        />
        <TextField multiline
          label="Description"
          value={folder_state.description || ''}
          onChange={ev => updateFolderState(draft => { draft.description = ev.target.value; })}
          minRows={3}
        />
        <MuiColorInput
          name="color"
          label="Color"
          variant="outlined"
          format="rgb"
          value={folder_state?.color ? `rgb(${folder_state.color})` : 'rgb(255, 255, 255)'}
          onChange={nv => updateFolderState(draft => { draft.color = nv.slice(4, -1) })}
          sx={{ width: '100%' }}
        />
        <Button
          onClick={() => {
            folder_mutators.update();
          }}
        >
          <Save/> Save
        </Button>
        <Button
          className="bg-red-700"
          onClick={() => {
            folder_mutators.deleteFolder()
            router.push('/app/members');
          }}
        >
          <Delete/> Delete
        </Button>
      </Stack>
    </div>
  )
}