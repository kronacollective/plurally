import { Edit, Save } from "@mui/icons-material";
import { Stack, TextField, Typography } from "@mui/material";
import { Button } from "konsta/react";
import { MuiColorInput } from "mui-color-input";
import { useCallback, useState } from "react";

export default function EditableColorField({
  label,
  value,
  onSave,
}: {
  label: string,
  value: string,
  onSave: (value: string) => Promise<void>,
}) {
  const [ editing, setEditing ] = useState(false);
  const [ inner_state, setInnerState ] = useState(value);

  const toggleEditing = useCallback(() => {
    if (editing) {
      onSave(inner_state);
      setEditing(false);
    } else {
      setEditing(true);
    }
  }, [editing, inner_state, onSave]);

  return (
    <Stack direction="row" gap={1} sx={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
      {editing ? (
        <MuiColorInput
          format="hex"
          label={label}
          variant="outlined"
          value={inner_state}
          onChange={nv => setInnerState(nv)}
          sx={{ width: '70%' }}
        />
      ) : (
        <Stack gap={1} sx={{ width: '100%' }}>
          <Typography variant="caption">{label}</Typography>
          <div
            style={{
              width: '100%',
              height: '3em',
              borderRadius: '10px',
              backgroundColor: value,
              border: `2px solid white`,
            }}
          />
        </Stack>
      )}
      <Button
        onClick={toggleEditing}
        style={{ width: '4em', height: '4em' }}
      >
        { editing ? <Save/> : <Edit/> }
      </Button>
    </Stack>
  )
}