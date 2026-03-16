'use server';

import { createClient } from "@/lib/supabase/server";

export async function getFriendFronters(self_id: string, friend_list: string[]) {
  const supabase = await createClient();

  const fronters_entries = await Promise.all(friend_list.map(async (friend_id) => {
    // Get buckets we're in from friend
    const { data: buckets_we_are_in_data } = await supabase
      .from('bucket_friends')
      .select('buckets!bucket ( id, account ), account')
      .eq('account', self_id)
      .eq('buckets.account', friend_id);
    const buckets_we_are_in = buckets_we_are_in_data?.map(bwai => bwai.buckets.id);
    // Get all members from buckets we are in
    const { data: members_from_buckets_we_are_in_data } = await supabase
      .from('bucket_members')
      .select()
      .in('bucket', buckets_we_are_in!);
    const members_from_buckets_we_are_in = members_from_buckets_we_are_in_data?.map(mfbwai => mfbwai.member);
    const set_of_members_from_buckets_we_are_in = new Set(members_from_buckets_we_are_in);
    // Get active fronts for friend
    const { data: active_fronts } = await supabase
      .from('fronts')
      .select()
      .eq('account', friend_id)
      .is('end', null);
    // Make into list and set of active fronters
    const active_fronter_ids = active_fronts!.map(af => af.member);
    const set_of_active_fronter_ids = new Set(active_fronter_ids);
    // Get only members we can see
    const set_of_visible_active_fronter_ids = set_of_members_from_buckets_we_are_in.intersection(set_of_active_fronter_ids);
    const visible_active_fronter_ids = Array.from(set_of_visible_active_fronter_ids);
    // Fetch member for each fronter
    const active_fronters = await Promise.all(visible_active_fronter_ids.map(async (vafid) => {
      const { data: member } = await supabase
        .from('members')
        .select('name')
        .eq('id', vafid)
        .single();
      return member!.name;
    }));
    // Return object entry
    return [friend_id, active_fronters];
  }));

  return Object.fromEntries(fronters_entries);
}