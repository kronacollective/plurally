'use client';

import { Stack, useMediaQuery, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { useSupabase } from "@/lib/supabase/client";
import { Tabbar, TabbarLink, ToolbarPane } from "konsta/react";
import { Person, Settings, TextFields } from "@mui/icons-material";
import { useShortMutations, useShortQuery } from "@/lib/hooks/useShortQuery";
import { useImmer } from "use-immer";
import { DRAWER_WIDTH } from "@/lib/globals";
import MainMemberDisplay from "./tabs/Main";
import SettingsMemberDisplay from "./tabs/Settings";
import { CalendarIcon } from "@mui/x-date-pickers";
import HistoryMemberDisplay from "./tabs/History";
import FieldsMemberDisplay from "./tabs/Fields";

const TAB_COMPONENTS = {
  main: MainMemberDisplay,
  settings: SettingsMemberDisplay,
  history: HistoryMemberDisplay,
  fields: FieldsMemberDisplay,
}

type MemberMutations = {
  update: () => Promise<void>,
  deleteMember: () => Promise<void>,
  updateAvatar: (url: string) => Promise<void>,
  updateBanner: (url: string) => Promise<void>,
  archiveMember: () => Promise<void>,
  unarchiveMember: () => Promise<void>,
  unlistMember: () => Promise<void>,
  relistMember: () => Promise<void>,
  updateMemberOf: (member_of: string | null) => Promise<void>,
};

export default function MemberDisplay({
  member_id,
}: {
  member_id: string,
}) {
  const supabase = useSupabase();

  const theme = useTheme()
  const is_mobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [ member_state, updateMemberState ] = useImmer<Record<string, string | string[] | null>>({});
  const [ active_tab, setActiveTab ] = useState('main');

  const { data: member } = useShortQuery(
    ["member", member_id],
    async () => {
      const { data: member } = await supabase
        .from('members')
        .select()
        .eq('id', member_id)
        .single();
      return member;
    },
  );

  useEffect(() => {
    if (!member) return;
    updateMemberState(draft => {
      draft.avatar = member.avatar;
      draft.banner = member.banner;
      draft.name = member.name;
      draft.username = member.username;
      draft.description = member.description;
      draft.pronouns = member.pronouns;
      draft.color = member.color;
      draft.roles = member.roles;
    });
  }, [member, updateMemberState]);

  // @ts-expect-error Bad
  const member_mutations = useShortMutations<MemberMutations>(
    ["member", member_id],
    {
      update: async () => {
        await supabase
          .from('members')
          .update(member_state)
          .eq('id', member_id);
      },
      deleteMember: async () => {
        await supabase
          .from('members')
          .delete()
          .eq('id', member_id);
      },
      updateAvatar: async (url: string) => {
        await supabase
          .from('members')
          .update({ avatar: url })
          .eq('id', member_id);
      },
      updateBanner: async (url: string) => {
        await supabase
          .from('members')
          .update({ banner: url })
          .eq('id', member_id);
      },
      archiveMember: async () => {
        await supabase
          .from('members')
          .update({ archived: true })
          .eq('id', member_id);
      },
      unarchiveMember: async () => {
        await supabase
          .from('members')
          .update({ archived: false })
          .eq('id', member_id);
      },
      unlistMember: async () => {
        await supabase
          .from('members')
          .update({ unlisted: true })
          .eq('id', member_id);
      },
      relistMember: async () => {
        await supabase
          .from('members')
          .update({ unlisted: false })
          .eq('id', member_id);
      },
      updateMemberOf: async (member_of: string | null) => {
        await supabase
          .from('members')
          .update({ member_of })
          .eq('id', member_id);
      }
    }
  );

  // @ts-expect-error This is probably not proper, but we select a tab component from an object
  const Tab = TAB_COMPONENTS[active_tab];

  return !member ? <></> : (
    <Stack gap={2} display="flex" sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
      <div className="mb-16" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
        <Tab
          member={member}
          member_mutations={member_mutations}
          member_state={member_state}
          updateMemberState={updateMemberState}
        />
      </div>
      <Tabbar
        className="right-0 bottom-0 fixed"
        style={{ left: is_mobile ? '0' : DRAWER_WIDTH, width: is_mobile ? '100%' : `calc(100% - ${DRAWER_WIDTH}px)` }}
      >
        <ToolbarPane>
          <TabbarLink
            active={active_tab === 'main'}
            onClick={() => setActiveTab('main')}
            icon={<Person/>}
            label="Main"
          />
          <TabbarLink
            active={active_tab === 'history'}
            onClick={() => setActiveTab('history')}
            icon={<CalendarIcon/>}
            label="History"
          />
          <TabbarLink
            active={active_tab === 'fields'}
            onClick={() => setActiveTab('fields')}
            icon={<TextFields/>}
            label="Fields"
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