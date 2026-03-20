'use client';

import { DRAWER_WIDTH } from "@/lib/globals";
import { useShortMutations, useShortQuery } from "@/lib/hooks/useShortQuery";
import { useSupabase } from "@/lib/supabase/client";
import { Diversity2, People, Settings, TextFields } from "@mui/icons-material";
import { useMediaQuery, useTheme } from "@mui/material";
import { Tabbar, TabbarLink, ToolbarPane } from "konsta/react";
import { useEffect, useState } from "react";
import { useImmer } from "use-immer";
import BucketSettings from "./tabs/Settings";
import BucketMembers from "./tabs/Members";
import BucketFriends from "./tabs/Friends";
import BucketFields from "./tabs/Fields";

const TAB_COMPONENTS = {
  members: BucketMembers,
  friends: BucketFriends,
  fields: BucketFields,
  settings: BucketSettings,
}

type BucketMutators = {
  update: () => Promise<void>,
}

export default function BucketDisplay({
  bucket_id,
}: {
  bucket_id: string,
}) {
  const supabase = useSupabase();

  const theme = useTheme()
  const is_mobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [ active_tab, setActiveTab ] = useState('settings');
  const [ bucket_state, updateBucketState ] = useImmer<Record<string, string | null>>({
    name: '',
    description: '',
    color: '',
  });

  const { data: bucket } = useShortQuery(
    ['bucket', bucket_id],
    async () => {
      const { data } = await supabase
        .from('buckets')
        .select()
        .eq('id', bucket_id)
        .single();
      return data;
    },
  );

  useEffect(() => {
    if (!bucket) return;
    updateBucketState(draft => {
      Object.entries(bucket!).forEach(entry => draft[entry[0]] = entry[1])
    });
  }, [bucket, updateBucketState]);

  const bucket_mutations = useShortMutations<BucketMutators>(
    ['bucket', bucket_id],
    {
      update: async () => {
        const { error } = await supabase
          .from('buckets')
          .update({
            name: bucket_state.name!,
            description: bucket_state.description,
            color: bucket_state.color,
          })
          .eq('id', bucket_id);
        if (error) {
          console.log('cannot update bucket', error);
        }
      },
    },
  );

  // @ts-expect-error Bad
  const Tab = TAB_COMPONENTS[active_tab];

  return (
    <>
      <div style={{ width: '100%', marginTop: 5, marginBottom: 64 }}>
        <Tab
          bucket={bucket}
          bucket_mutations={bucket_mutations}
          bucket_state={bucket_state}
          updateBucketState={updateBucketState}
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
            active={active_tab === 'friends'}
            onClick={() => setActiveTab('friends')}
            icon={<Diversity2/>}
            label="Friends"
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
    </>
  )
}