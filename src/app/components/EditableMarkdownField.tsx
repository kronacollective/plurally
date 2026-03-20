import { Edit, Save } from "@mui/icons-material";
import { FormControl, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import { Button } from "konsta/react";
import { useCallback, useState } from "react";
import { MuiMarkdown } from 'mui-markdown';

export default function EditableMarkdownField({
  label,
  value,
  onSave,
  readonly,
}: {
  label: string,
  value: string,
  onSave?: (value: string) => Promise<void>,
  readonly: boolean,
}) {
  const [ editing, setEditing ] = useState(false);
  const [ inner_state, setInnerState ] = useState(value);

  const toggleEditing = useCallback(() => {
    if (editing) {
      onSave?.(inner_state);
      setEditing(false);
    } else {
      setEditing(true);
    }
  }, [editing, inner_state, onSave]);

  return (
    <Stack direction="row" gap={1} sx={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
      {editing ? (
        <TextField multiline
          label={label}
          variant="outlined"
          value={inner_state}
          onChange={ev => setInnerState(ev.target.value)}
          sx={{ width: '70%' }}
        />
      ) : (
        <Stack gap={1}>
          <Typography variant="caption">{label}</Typography>
          <MuiMarkdown>{value}</MuiMarkdown>
        </Stack>
      )}
      {!readonly && <Button clear
        onClick={toggleEditing}
        style={{ width: '4em', height: '4em' }}
      >
        { editing ? <Save/> : <Edit/> }
      </Button>}
    </Stack>
  )
}