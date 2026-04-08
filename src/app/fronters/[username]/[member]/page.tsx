import { createClient } from "@/lib/supabase/server";
import { Avatar, Grid, List, ListItem, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { format } from "date-fns";
import MuiMarkdown from "mui-markdown";
import Image from "next/image";

export default async function UserMember({
  params
}: {
  params: Promise<{username: string, member: string}>,
}) {
  const supabase = await createClient();
  const { username, member: member_id } = await params;

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

  // Get this member
  const { data: member } = await supabase
    .from('members')
    .select()
    .eq('id', member_id)
    .single();

  // Get fields in public buckets
  const { data: fields_in_public_buckets } = await supabase
    .from('bucket_fields')
    .select('bucket, field ( * )')
    .in('bucket', public_buckets?.map(bucket => bucket.id) ?? []);

  // Get values for fields
  const { data: fields_and_values } = await supabase
    .from('field_values')
    .select('field ( * ), member, value')
    .eq('member', member!.id)
    .in('field', fields_in_public_buckets?.map(fipb => fipb.field.id) ?? []);

  // Get public journal entries for member
  const { data: entries } = await supabase
    .from('journal')
    .select()
    .eq('member', member_id)
    .eq('is_public', true);

  // Return nothing if invisible
  if (!member || !visible_member_ids.has(member_id)) {
    return <></>;
  }

  return (
    <Paper elevation={1} sx={{ borderRadius: '10px', m: 5, p: 5, backgroundColor: `rgba(${member.color ?? '255, 255, 255'}, 20%)` }}>
      <Typography variant="h4" sx={{ mb: 2 }}>{member.name}&apos;s profile</Typography>
      <Grid container spacing={2}>
        <Grid size={4}>
          <Stack spacing={2}>
            <TableContainer component={Paper} sx={{ backgroundColor: `rgba(${member.color ?? '255, 255, 255'}, 30%)` }}>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell><strong>Pronouns</strong></TableCell>
                    <TableCell>{member.pronouns}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Bio</strong></TableCell>
                    <TableCell><MuiMarkdown>{member.description}</MuiMarkdown></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <TableContainer component={Paper} sx={{ backgroundColor: `rgba(${member.color ?? '255, 255, 255'}, 30%)` }}>
              <Table>
                <TableBody>
                  { fields_and_values?.map(fav => {
                    return (
                      <TableRow key={fav.field.id}>
                        <TableCell><strong>{fav.field.name}</strong></TableCell>
                        <TableCell>
                          {fav.field.type === 'text'
                            ? <MuiMarkdown>
                                {fav.value}
                              </MuiMarkdown>
                            : ['date', 'datetime', 'daymonth'].includes(fav.field.type)
                              ? <Typography>{format(fav.value as string, 'PPPppp')}</Typography>
                              : fav.field.type === 'color'
                                ? <div style={{ width: '100%', height: '2em', backgroundColor: `rgb(${fav.value})` }}/>
                                : '?'
                          }
                        </TableCell>
                      </TableRow>
                    )
                  }) }
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </Grid>
        <Grid size={8}>
          <Stack spacing={5}>
            {entries?.map(entry => {
              return (
                <Paper key={entry.id} elevation={1}>
                  <div style={{ padding: '2em' }}>
                    <Typography variant="h4">{entry?.title}</Typography>
                    <Stack direction="row" sx={{ alignItems: 'center' }}>
                      <Avatar>
                        {member.avatar ? <Image
                          className="rounded-full"
                          src={member.avatar!}
                          width={100}
                          height={100}
                          alt="Profile picture"
                        /> : member.name?.slice(0,1)}
                      </Avatar>
                      { member.name }
                    </Stack>
                    <Paper elevation={1} sx={{ p: 3, m: 3 }}>
                      <MuiMarkdown>{entry?.content}</MuiMarkdown>
                    </Paper>
                  </div>
                </Paper>
              )
            })}
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  )
}