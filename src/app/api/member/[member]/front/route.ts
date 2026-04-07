import webpush from 'web-push';
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

webpush.setVapidDetails(
  'mailto:kronacollective@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function POST(request: Request, context: RouteContext<'/api/member/[member]/front'>) {
  const supabase = await createClient();
  // Get account
  const { data: user } = await supabase.auth.getUser();
  const { data: account } = await supabase
    .from('accounts')
    .select()
    .eq('user', user.user!.id)
    .single();
  // Get member
  const { member: member_id } = await context.params;
  // Check member ID belongs to account
  const { data: member } = await supabase
    .from('members')
    .select('id')
    .eq('id', member_id)
    .eq('account', account!.id)
    .single();
  if (!member) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  }
  // Create new front
  const { error } = await supabase
    .from('fronts')
    .insert({
      account: account!.id,
      member: member.id,
    });
  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
  // Get current front
  const { data: active_fronts } = await supabase
    .from('fronts')
    .select('*, member ( * )')
    .eq('account', account!.id)
    .is('end', null);
  const active_fronter_ids = active_fronts?.map(af => af.member.id);
  const active_fronters_set = new Set(active_fronter_ids);
  // Get list of friends to send notifications to
  const { data: friends } = await supabase
    .from('friends')
    .select('related:accounts!friends_related_fkey ( id ), relating:accounts!friends_relating_fkey ( id ), accepted')
    .or(`relating.eq.${account!.id},related.eq.${account!.id}`)
    .eq('accepted', true);
  // Get subscriptions for friends
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('subscription, account')
    .in('account', friends?.map(friend => friend.relating.id === account!.id ? friend.related.id : friend.relating.id) ?? [])
  // Send out active front to subscriptions
  subscriptions?.map(async (sub) => {
    // TODO: Get visible active fronts
    // Get buckets friend is in
    const { data: buckets_friend_is_in_data } = await supabase
      .from('bucket_friends')
      .select('buckets!bucket ( id, account ), account')
      .eq('account', sub.account) // friend is in bucket
      .eq('buckets.account', account!.id); // bucket owner is us
    const buckets_friend_is_in = buckets_friend_is_in_data?.map(bfii => bfii.buckets.id);
    // Get all members from buckets friend is in
    const { data: members_from_bfii } = await supabase
      .from('bucket_members')
      .select()
      .in('bucket', buckets_friend_is_in!)
    const members_from_bfii_set = new Set(members_from_bfii?.map(mfbfii => mfbfii.member));
    // Get only members we can see
    const visible_fronters_set = members_from_bfii_set.intersection(active_fronters_set);
    // If we can see no members, return early
    if (visible_fronters_set.size < 1) return;
    // Filter active fronts
    const visible_active_fronts = active_fronts?.filter(af => visible_fronters_set.has(af.member.id));
    // Add notification to history
    await supabase
      .from('notifications')
      .insert({
        account: sub.account,
        title: account?.display_name,
        body: visible_active_fronts?.map(af => af.member.name).join(', '),
      });
    // Send notification
    try {
      await webpush.sendNotification(
        // @ts-expect-error: Type cast issue
        sub.subscription,
        JSON.stringify({
          title: account?.display_name,
          body: visible_active_fronts?.map(af => af.member.name).join(', '),
          icon: '/web-app-manifest-192x192.png',
        }),
      );
    } catch (error) {
      console.error('Could not send push notification:', error);
    }
  });
  // Return successfully
  return NextResponse.json({ success: true });
}