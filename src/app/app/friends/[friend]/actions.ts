'use server';

import { createClient } from "@/lib/supabase/server";

export async function getFriendMembers(self_id: string, friend_id: string) {
  const supabase = await createClient();
  // Get buckets we're in from friend
  const { data: buckets_we_are_in_data } = await supabase
    .from('bucket_friends')
    .select('bucket:buckets!bucket ( id, account ), account')
    .eq('account', self_id)
    .eq('buckets.account', friend_id);
  const buckets_we_are_in = buckets_we_are_in_data?.map(bwai => bwai.bucket?.id).filter(x => x);
  // console.log('bwai', self_id, friend_id, buckets_we_are_in_data, buckets_we_are_in);
  // Get all members from buckets we are in
  const { data: members_from_buckets_we_are_in_data } = await supabase
    .from('bucket_members')
    .select('bucket, member ( * )')
    .in('bucket', buckets_we_are_in!);
  const members_from_buckets_we_are_in = members_from_buckets_we_are_in_data?.map(mfbwai => mfbwai.member);
  // Return
  return members_from_buckets_we_are_in ?? [];
}

export async function getFriendFields(self_id: string, friend_id: string) {
  const supabase = await createClient();
  // Get buckets we're in from friend
  const { data: buckets_we_are_in_data } = await supabase
    .from('bucket_friends')
    .select('buckets!bucket ( id, account ), account')
    .eq('account', self_id)
    .eq('buckets.account', friend_id);
  const buckets_we_are_in = buckets_we_are_in_data?.map(bwai => bwai.buckets.id);
  // Get all fields from buckets we are in
  const { data: fields_from_buckets_we_are_in_data } = await supabase
    .from('bucket_fields')
    .select('bucket, field ( * )')
    .in('bucket', buckets_we_are_in!);
  const fields_from_buckets_we_are_in = fields_from_buckets_we_are_in_data?.map(ffbwai => ffbwai.field);
  // Return
  return fields_from_buckets_we_are_in;
}