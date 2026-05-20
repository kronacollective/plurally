'use client';
import BorderGlow from "@/app/components/bits/BorderGlow";
import { ArrowUpward, Label, Note, People, PrivacyTip, Timelapse } from "@mui/icons-material";
import { Chip, Grid, IconButton, List, ListItem, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, MenuItem, Select, Stack, Switch, TextField, Typography } from "@mui/material";
import Image from "next/image";
import React from "react";

const Feature = ({
  title,
  features,
  Showcase,
  Icon,
  lefty = false,
}: {
  title: string,
  features: string[],
  Showcase: React.ReactNode,
  Icon: React.ReactNode,
  lefty?: boolean,
}) => {
  return (
    <BorderGlow
      edgeSensitivity={30}
      glowColor="40 80 80"
      backgroundColor="#120F17"
      borderRadius={28}
      glowRadius={40}
      glowIntensity={1}
      coneSpread={25}
      animated={false}
      colors={['#c084fc', '#f472b6', '#38bdf8']}
    >
      <div style={{ padding: '2em' }}>
        {/* Change this to grid */}
        <Stack direction="row" justifyContent="space-between">
          { lefty && Showcase }
          <Stack>
            <Typography variant="h4">{Icon} {title}</Typography>
            <List>
              { features.map(feature => {
                return (
                  <ListItem key={feature}>
                    <ListItemIcon>
                      <Label/>
                    </ListItemIcon>
                    <ListItemText
                      primary={feature}
                    />
                  </ListItem>
                )
              }) }
            </List>
          </Stack>
          { lefty || Showcase }
        </Stack>
      </div>
    </BorderGlow>
  )
}

export default function FeaturesPage() {
  const aqua = {
    "idx": 31, "id": "hA0c3VU-BjMbdazqPYwWV", "name": "🌟Aqua", "pronouns": "He/him", "avatar": "https://myrssvqfvsuovxsqdlfi.supabase.co/storage/v1/object/public/avatars/hA0c3VU-BjMbdazqPYwWV-1774981650921.jpg", "color": "23, 255, 244", "banner": "https://myrssvqfvsuovxsqdlfi.supabase.co/storage/v1/object/public/banners/hA0c3VU-BjMbdazqPYwWV-1777045192356.jpg", "roles": ["introject", "pseudo-host"]
  }
  const iru = {
    "idx":9,"id":"4jSWZxbGjfwN9Xzo9F467","name":"☀️Iru","pronouns":"He/they/sun neos","avatar":"https://myrssvqfvsuovxsqdlfi.supabase.co/storage/v1/object/public/avatars/4jSWZxbGjfwN9Xzo9F467.jpg","color":"255, 185, 3", "banner":"https://myrssvqfvsuovxsqdlfi.supabase.co/storage/v1/object/public/banners/4jSWZxbGjfwN9Xzo9F467-1777045042735.jpg","roles":["cheerleader"]
  }
  const finn = {
    "idx":12,"id":"5vM6mrVOiS8ylSS1k2dAb","name":"🦌finngálkn","avatar":"https://myrssvqfvsuovxsqdlfi.supabase.co/storage/v1/object/public/avatars/5vM6mrVOiS8ylSS1k2dAb.jpg","color":"37, 75, 44","banner":"https://myrssvqfvsuovxsqdlfi.supabase.co/storage/v1/object/public/banners/5vM6mrVOiS8ylSS1k2dAb-1777045437946.jpg","roles":["introject","spirituality holder"]
  }
  return (
    <div>
      <div style={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2, gap: '1em', padding: '1em' }}>
        <Typography variant="h1" textAlign="center">Features</Typography>
        <Typography variant="body1" textAlign="center">See all that Plurally can do</Typography>
      </div>
      <Stack gap={2} sx={{ m: 5 }}>
        <Feature
          title="Member profiles"
          Icon={<People color="info"/>}
          features={[
            'Full customization options: avatars, banners and colors.',
            'All the data you need: name, pronouns, roles, description, and more.',
            'Custom fields for all the extra information you need to add.',
            'Folders to categorize your members, as well as an archive.',
          ]}
          Showcase={
            <List>
              <ListItem
                key={aqua.id}
                style={{
                  ...(aqua.banner ? {
                    backgroundImage: `url(${aqua.banner})`,
                    backgroundSize: 'cover',
                    backgroundPositionY: '50%',
                    backgroundColor: `rgba(${aqua.color ?? '255, 255, 255'}, 90%)`,
                    backgroundBlendMode: 'lighten',
                    color: `contrast-color(rgba(${aqua.color ?? '255, 255, 255'}, 90%))`,
                  } : {
                    backgroundColor: `rgba(${aqua.color ?? '255, 255, 255'}, 20%)`,
                    color: `contrast-color(rgba(${aqua.color ?? '255, 255, 255'}, 20%))`,
                  }),
                  borderRadius: '10px',
                  marginBottom: 5,
                }}
                secondaryAction={
                  <IconButton sx={{ color: `contrast-color(rgba(${aqua.color ?? '255, 255, 255'}, 20%))` }}>
                    <ArrowUpward/>
                  </IconButton>
                }
              >
                <ListItemButton>
                  <Grid container spacing={2}>
                    <Grid size={12}>
                      <Stack direction="row">
                        <ListItemAvatar sx={{ width: 60, height: 60, mr: 2 }}>
                          { aqua && aqua.avatar ? (
                            <Image
                              className="rounded-full"
                              src={aqua.avatar}
                              width={60}
                              height={60}
                              alt="Profile picture"
                            />
                          ) : (
                            "?"
                          )}
                        </ListItemAvatar>
                        <ListItemText
                          primary={aqua.name}
                          secondary={aqua.pronouns}
                          slotProps={{
                            secondary: {
                              sx: {
                                color: `contrast-color(rgba(${aqua.color ?? '255, 255, 255'}, 20%))`,
                              }
                            }
                          }}
                        />
                      </Stack>
                    </Grid>
                    {aqua.roles && aqua.roles.length > 0 && <Grid size={12}>
                      <Stack direction="row" gap={1}>
                        { aqua.roles?.map(role => (
                          <Chip
                            label={role}
                            key={role}
                            slotProps={{
                              label: {
                                sx: {
                                  color: `contrast-color(rgba(${aqua.color ?? '255, 255, 255'}, 20%))`,
                                }
                              }
                            }}
                          />
                        )) }
                      </Stack>
                    </Grid>}
                  </Grid>
                </ListItemButton>
              </ListItem>
            </List>
          }
        />
        <Feature lefty
          title="Front tracking"
          Icon={<Timelapse color="info"/>}
          features={[
            'Mark members as fronting or not.',
            'Add comments to each front.',
            'Visualize your fronting history in a linear manner',
          ]}
          Showcase={
            <List>
              <ListItem key={iru.id}
                style={{
                  backgroundColor: `rgba(${iru.color ?? '255, 255, 255'}, 20%)`,
                  // color: `contrast-color(rgba(${iru.color ?? '255, 255, 255'}, 20%))`,
                  borderRadius: '10px',
                  marginBottom: 5,
                }}
              >
                <ListItemAvatar sx={{ mr: 2 }}>
                  { iru.avatar ? (
                    <Image
                      className="rounded-full"
                      src={iru.avatar}
                      width={60}
                      height={60}
                      alt="Profile picture"
                    />
                  ) : (
                    "?"
                  )}
                </ListItemAvatar>
                <ListItemText
                  primary={iru.name}
                  secondary={`Active — 4 hours 40 minutes 56 seconds`}
                  slotProps={{
                    secondary: {
                      sx: {
                        // color: `contrast-color(rgba(${iru.color ?? '255, 255, 255'}, 20%))`,
                      }
                    }
                  }}
                />
              </ListItem>
              <ListItem key={finn.id}
                style={{
                  backgroundColor: `rgba(${finn.color ?? '255, 255, 255'}, 20%)`,
                  // color: `contrast-color(rgba(${iru.color ?? '255, 255, 255'}, 20%))`,
                  borderRadius: '10px',
                  marginBottom: 5,
                }}
              >
                <ListItemAvatar sx={{ mr: 2 }}>
                  { iru.avatar ? (
                    <Image
                      className="rounded-full"
                      src={finn.avatar}
                      width={60}
                      height={60}
                      alt="Profile picture"
                    />
                  ) : (
                    "?"
                  )}
                </ListItemAvatar>
                <ListItemText
                  primary={finn.name}
                  secondary={`8 hours 30 minutes`}
                  slotProps={{
                    secondary: {
                      sx: {
                        // color: `contrast-color(rgba(${iru.color ?? '255, 255, 255'}, 20%))`,
                      }
                    }
                  }}
                />
              </ListItem>
            </List>
          }
        />
        <Feature
          title="Privacy buckets"
          Icon={<PrivacyTip color="info"/>}
          features={[
            'Use a familiar system to control and fine-tune privacy.',
            'Restrict members, custom fields, and public information.',
            'Make buckets public to make information available in public pages.',
          ]}
          Showcase={
            <List>
              <ListItem
                style={{
                  backgroundColor: `rgba(127, 35, 49, 20%)`,
                  borderRadius: '10px',
                  marginBottom: 5,
                }}
              >
                <ListItemText
                  primary="High trust"
                  secondary="People I trust a lot and who can keep secrets"
                />
              </ListItem>
              <ListItem
                style={{
                  backgroundColor: `rgba(80, 255, 49, 20%)`,
                  borderRadius: '10px',
                  marginBottom: 5,
                }}
              >
                <ListItemText
                  primary="Public"
                  secondary="Things that can be seen on our public pages"
                />
              </ListItem>
            </List>
          }
        />
        <Feature
          title="Journaling"
          Icon={<Note color="info"/>}
          features={[
            'Write down journal entries for each member',
            'Share them on public pages if you choose to, like a blog',
            'Full Markdown support',
          ]}
          Showcase={
            <Stack sx={{ p: 5 }} spacing={2}>
              <Select
                id="member"
                label="Member"
                value={iru.id}
                // onChange={ev => updateEntryData(draft => { draft.member = ev.target.value })}
                // sx={{ width: '10em' }}
              >
                { [iru].map(smember => {
                  return (
                    <MenuItem key={smember.id} value={smember.id}>
                      <ListItem sx={{ p: 0 }}>
                        <ListItemAvatar>
                          { smember && smember.avatar ? (
                            <Image
                              className="rounded-full"
                              src={smember.avatar}
                              width={25}
                              height={25}
                              alt="Profile picture"
                            />
                          ) : '?' }
                        </ListItemAvatar>
                        <ListItemText
                          primary={smember.name}
                          secondary={smember.pronouns}
                        />
                      </ListItem>
                    </MenuItem>
                  )
                }) }
              </Select>
              <List>
                <ListItem
                  secondaryAction={
                    <Switch
                      // checked={entry_data.is_public}
                      // onChange={ev => updateEntryData(draft => { draft.is_public = ev.target.checked })}
                    />
                  }
                >
                  <ListItemText
                    primary="Is journal entry public?"
                    secondary="If enabled, strangers will be able to read this entry"
                  />
                </ListItem>
              </List>
              <TextField
                label="Title"
                variant="outlined"
                // value={entry_data.title}
                value="Daily haiku"
                // onChange={ev => updateEntryData(draft => { draft.title = ev.target.value })}
                sx={{ width: '100%' }}
              />
              <TextField multiline
                label="Content"
                variant="outlined"
                value={[
                  'Plurally is cool',
                  'If i say so myself, yeah',
                  'Hi Dad, Im on here'
                ].join('\n')}
                // value={entry_data.content}
                // onChange={ev => updateEntryData(draft => { draft.content = ev.target.value })}
                minRows={3}
                sx={{ width: '100%' }}
              />
            </Stack>
          }
        />
      </Stack>
    </div>
  );
}