import { createAdminClient } from "@/lib/supabase/server";
import { List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Paper, Typography } from "@mui/material";
import Image from "next/image";
import Link from "next/link";

export default async function FrontersByUser({
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
  const { data: active_fronts } = await supabase
    .from('fronts')
    .select()
    .eq('account', account!.id)
    .in('member', Array.from(visible_member_ids))
    .is('end', null);

  // Get actively fronting visible members
  const actively_fronting_visible_members = active_fronts?.map(af => members?.find(member => member.id === af.member));

  // Filter visible members
  // const visible_members = members?.filter(member => visible_member_ids.has(member.id));

  return (
    <Paper elevation={1} sx={{ borderRadius: '10px', m: 5, p: 5 }}>
      <Typography variant="h4">{account?.display_name}&apos;s frontroom</Typography>
      <List sx={{ width: '100%' }}>
        { actively_fronting_visible_members?.map(member => {
          return (
            <ListItem
              key={member?.id}
              style={{
                backgroundColor: `rgba(${member?.color ?? '255, 255, 255'}, 20%)`,
                borderRadius: '10px',
                marginBottom: 5,
              }}
            >
              <Link href={`/fronters/${username}/${member?.id}`} style={{ width: '100%' }}>
                <ListItemButton
                  // sx={{ width: '100%' }}
                  // onClick={() => router.push(`/app/friends/${friend_id}/${member.id}`)}
                >
                  <ListItemAvatar sx={{ mr: 2 }}>
                    { member && member.avatar ? (
                      <Image
                        className="rounded-full"
                        src={member.avatar}
                        width={60}
                        height={60}
                        alt="Profile picture"
                      />
                    ) : (
                      "?"
                    )}
                  </ListItemAvatar>
                  <ListItemText
                    primary={member?.name}
                    secondary={member?.pronouns}
                  >
                  </ListItemText>
                </ListItemButton>
              </Link>
            </ListItem>
          )
        }) }
      </List>
    </Paper>
  )
}