import { Stack, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { subDays } from "date-fns";
import { useState } from "react";
import AnalyticsTotals from "./tabs/Totals";
import AnalyticsCount from "./tabs/Count";
import AnalyticsMax from "./tabs/Max";
import AnalyticsMin from "./tabs/Min";

const SUBTAB_COMPONENTS = {
  total: AnalyticsTotals,
  count: AnalyticsCount,
  max: AnalyticsMax,
  min: AnalyticsMin,
}

export default function AnalyticsFronts() {
  const [ subtab, setSubtab ] = useState('total');

  const [ start_date, setStartDate ] = useState(subDays(new Date(), 30));
  const [ end_date, setEndDate ] = useState(new Date());

  // @ts-expect-error Still not allowed
  const Subtab = SUBTAB_COMPONENTS[subtab];

  return (
    <>
      <Stack gap={2} sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <ToggleButtonGroup exclusive
          value={subtab}
          onChange={(_, nv) => nv && setSubtab(nv)}
          aria-label="sub tab"
        >
          <ToggleButton value="total" aria-label="total fronting times">
            Totals
          </ToggleButton>
          <ToggleButton value="count" aria-label="front count">
            Count
          </ToggleButton>
          <ToggleButton value="max" aria-label="maximum fronting time">
            Maximum
          </ToggleButton>
          <ToggleButton value="min" aria-label="minimum fronting time">
            Minimum
          </ToggleButton>
        </ToggleButtonGroup>
        <DatePicker
          label="Start"
          value={start_date}
          // @ts-expect-error This is literally copying the documentation
          onChange={nv => setStartDate(nv)}
          sx={{ width: '100%' }}
        />
        <DatePicker
          label="End"
          value={end_date}
          // @ts-expect-error This is literally copying the documentation
          onChange={nv => setEndDate(nv)}
          sx={{ width: '100%' }}
        />
        <Subtab
          start_date={start_date}
          end_date={end_date}
        />
      </Stack>
    </>
  )
}