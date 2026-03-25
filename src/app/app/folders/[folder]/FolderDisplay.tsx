'use client';

import { Stack, useMediaQuery, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { useSupabase } from "@/lib/supabase/client";
import { Tabbar, TabbarLink, ToolbarPane } from "konsta/react";
import { People, Settings } from "@mui/icons-material";
import { useShortMutations, useShortQuery } from "@/lib/hooks/useShortQuery";
import { useImmer } from "use-immer";
import { DRAWER_WIDTH } from "@/lib/globals";
import SettingsFolderDisplay from "./tabs/Settings";
import MembersFolderDisplay from "./tabs/Members";

const TAB_COMPONENTS = {
  members: MembersFolderDisplay,
  settings: SettingsFolderDisplay,
}

type FolderMutators = {
  update: () => Promise<void>,
  deleteFolder: () => Promise<void>,
};

export default function FolderDisplay({
  folder_id,
}: {
  folder_id: string,
}) {
  const supabase = useSupabase();

  const theme = useTheme()
  const is_mobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [ folder_state, updateFolderState ] = useImmer<Record<string, string | null>>({});
  const [ active_tab, setActiveTab ] = useState('members');

  const { data: folder } = useShortQuery(
    ["folder", folder_id],
    async () => {
      const { data: member } = await supabase
        .from('folders')
        .select()
        .eq('id', folder_id)
        .single();
      return member;
    },
  );

  useEffect(() => {
    if (!folder) return;
    updateFolderState(draft => {
      draft.name = folder.name;
      draft.description = folder.description;
      draft.color = folder.color;
    });
  }, [folder, updateFolderState]);

  const folder_mutators = useShortMutations<FolderMutators>(
    ["folder", folder_id],
    {
      update: async () => {
        await supabase
          .from('folders')
          .update(folder_state)
          .eq('id', folder_id);
      },
      deleteFolder: async () => {
        await supabase
          .from('folders')
          .delete()
          .eq('id', folder_id);
      },
    }
  );

  // @ts-expect-error This is probably not proper, but we select a tab component from an object
  const Tab = TAB_COMPONENTS[active_tab];

  return !folder ? <></> : (
    <Stack gap={2} display="flex" sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
      <div className="mb-16" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <Tab
          folder={folder}
          folder_mutators={folder_mutators}
          folder_state={folder_state}
          updateFolderState={updateFolderState}
        />
      </div>
      <Tabbar
        className="right-0 bottom-0 fixed"
        style={{ left: is_mobile ? '0' : DRAWER_WIDTH, width: is_mobile ? '100%' : `calc(100% - ${DRAWER_WIDTH}px)` }}
      >
        <ToolbarPane>
          <TabbarLink
            active={active_tab === 'members'}
            onClick={() => setActiveTab('members')}
            icon={<People/>}
            label="Members"
          />
          <TabbarLink
            active={active_tab === 'settings'}
            onClick={() => setActiveTab('settings')}
            icon={<Settings/>}
            label="Settings"
          />
        </ToolbarPane>
      </Tabbar>
    </Stack>
  );
}