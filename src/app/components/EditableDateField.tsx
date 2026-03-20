import { Json } from "@/lib/supabase/database.types";
import { Edit, Save } from "@mui/icons-material";
import { Stack, Typography } from "@mui/material";
import { DatePicker, DateTimePicker } from "@mui/x-date-pickers";
import { format, formatISO, parseJSON } from "date-fns";
import { Button } from "konsta/react";
import MuiMarkdown from "mui-markdown";
import { useCallback, useMemo, useState } from "react";

export default function EditableDateField({
  type,
  label,
  value,
  onSave,
}: {
  type: 'date' | 'datetime' | 'daymonth',
  label: string,
  value: Json,
  onSave: (iso_date: string) => Promise<void>,
}) {
  const [ editing, setEditing ] = useState(false);
  const [ inner_state, setInnerState ] = useState(parseJSON(JSON.stringify(value)));

  const toggleEditing = useCallback(() => {
    if (editing) {
      onSave(formatISO(inner_state));
      setEditing(false);
    } else {
      setEditing(true);
    }
  }, [editing, inner_state, onSave]);

  const formatted_value = useMemo(() => {
    console.log('fv', inner_state);
    // @ts-expect-error Check works despite type error
    if (inner_state instanceof Date && !isNaN(inner_state)) {
      if (type === 'date') {
        return format(inner_state, 'P');
      } else if (type === 'datetime') {
        return format(inner_state, 'Pp');
      } else if (type === 'daymonth') {
        return format(inner_state, 'dd/MM');
      } else {
        return format(inner_state, 'PPpp');
      }
    } else {
      return 'Invalid date';
    }
  }, [inner_state, type]);

  return (
    <Stack direction="row" gap={1} sx={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
      {editing ? (
        type === 'date' || type === 'daymonth' ? (
          <DatePicker
            label={label}
            value={inner_state}
            onChange={nv => setInnerState(nv!)}
            sx={{ width: '100%' }}
          />
        ) : (
          type === 'datetime' ? (
            <DateTimePicker
              label={label}
              value={inner_state}
              onChange={nv => setInnerState(nv!)}
              sx={{ width: '100%' }}
            />
          ) : (
            <></>
          )
        )
      ) : (
        <Stack gap={1}>
          <Typography variant="caption">{label}</Typography>
          <Typography>{formatted_value}</Typography>
        </Stack>
      )}
      <Button clear
        onClick={toggleEditing}
        style={{ width: '4em', height: '4em' }}
      >
        { editing ? <Save/> : <Edit/> }
      </Button>
    </Stack>
  )
}