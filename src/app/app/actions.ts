'use server';

import { createClient } from "@/lib/supabase/server";
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:kronacollective@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function sendPushNotification(account_id: string, title: string, message: string) {
  const supabase = await createClient();
  const { data: sub, error } = await supabase
    .from('subscriptions')
    .select()
    .eq('account', account_id)
    .single();
  if (!sub?.subscription) {
    throw new Error(`No subscription available: ${error?.message}`);
  }

  try {
    await webpush.sendNotification(
      // @ts-expect-error Type import issue
      sub.subscription,
      JSON.stringify({
        title: title ?? 'Plurally',
        body: message,
        icon: '/web-app-manifest-192x192.png'
      }),
    );
    return { success: true };
  } catch (error) {
    console.error('Could not send push notification:', error);
    return { success: false, error: 'Could not send notification' };
  }
}