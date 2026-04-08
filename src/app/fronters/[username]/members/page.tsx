import { createAdminClient } from "@/lib/supabase/server";

export default async function MembersByUser({
  params
}: {
  params: Promise<{username: string}>,
}) {
  const supabase = await createAdminClient();
  const { username } = await params;

  // Get account for username
  const { data: account } = await supabase
    .from('accounts')
    .select()
    .eq('username', username)
    .single();

  // Get public buckets for account
  const { data: public_buckets } = await supabase
    .from('buckets')
    .select()
    .eq('account', account!.id)
    .eq('is_public', true);

  // Get members
  const { data: members } = await supabase
    .from('members')
    .select()
    .eq('account', account!.id)
    .eq('is_status', false)
    .eq('archived', false);

  // Get members in public buckets
  const { data: members_in_public_buckets } = await supabase
    .from('bucket_members')
    .select()
    .in('bucket', public_buckets?.map(bucket => bucket.id) ?? []);

  // Get visible members to the public
  const member_ids = new Set(members?.map(member => member.id));
  const mipb_ids = new Set(members_in_public_buckets?.map(member => member.member));
  const visible_member_ids = member_ids.intersection(mipb_ids);

  // Get active visible fronts
  // const { data: active_fronts } = await supabase
  //   .from('fronts')
  //   .select()
  //   .eq('account', account!.id)
  //   .in('member', Array.from(visible_member_ids))
  //   .is('end', null);

  // Get actively fronting visible members
  // const actively_fronting_visible_members = active_fronts?.map(af => members?.find(member => member.id === af.member));

  // Filter visible members
  const visible_members = members?.filter(member => visible_member_ids.has(member.id));

  return (
    <>
      { visible_members?.map(member => member?.name).join(', ') }
    </>
  )
}