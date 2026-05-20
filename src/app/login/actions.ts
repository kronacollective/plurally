'use server';

import { createAdminClient, createClient } from "@/lib/supabase/server";

export async function signInOrUp(invite: string, discord_email: string) {
  const supabase = await createClient();
  const supabase_admin = await createAdminClient();

  await supabase_admin
    .from('invites')
    .update({ email: discord_email })
    .eq('id', invite)
    .eq('used', false);

  const siwo = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      // redirectTo: `http://localhost:3001/auth/callback`,
    },
  });

  return siwo;
}