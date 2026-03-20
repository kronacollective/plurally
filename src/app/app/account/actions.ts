'use server';

import { createClient } from "@/lib/supabase/server";
import { nanoid } from "nanoid";

const SP_API = 'https://api.apparyllis.com/v1';

const MAP_SPFIELDTYPE_OURFIELDTYPE = {
  [0]: 'text',
  [1]: 'color',
  [2]: 'datetime',
  [5]: 'date',
};

type SPField = {
  name: string,
  type: 0 | 1 | 2 | 5,
};

type SPFieldWrapper = {
  id: string,
  content: SPField,
}

type SPCustomFront = {
  name: string,
  desc: string,
  color: string,
}

type SPCustomFrontWrapper = {
  content: SPCustomFront,
}

type SPUser = {
  id: string,
  content: {
    fields: Record<string, SPField>
  },
};

type SPMember = {
  content: {
    name: string,
    color: string,
    desc: string,
    pronouns: string,
    info: Record<string, string>,
  }
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export async function importFromSimplyPlural(account_id: string) {
  const supabase = await createClient();

  // Get our own token
  const { data: account } = await supabase
    .from('accounts')
    .select('sp_key')
    .eq('id', account_id)
    .single();

  // Setup connections
  const headers = new Headers();
  headers.append('Authorization', account!.sp_key!);

  const request_options = {
    method: 'GET',
    headers,
    // redirect: 'follow',
  };

  // Request our own user
  const ourselves_rq = await fetch(`${SP_API}/me`, request_options);
  const ourselves: SPUser = await ourselves_rq.json();
  console.log('ourselves', ourselves);

  // Attempt to get all fields
  const fields_rq = await fetch(`${SP_API}/customFields/${ourselves.id}`, request_options);
  const fields: SPFieldWrapper[] = await fields_rq.json();

  // Import fields
  const MAP_SPFIELDS_OURFIELDS: Record<string, string> = {};
  Object.entries(fields).map(async ([, field]) => {
    const { data: new_field } = await supabase
      .from('fields')
      .insert({
        account: account_id,
        name: field.content.name,
        type: MAP_SPFIELDTYPE_OURFIELDTYPE[field.content.type]
      })
      .select()
      .single();
    MAP_SPFIELDS_OURFIELDS[field.id] = new_field!.id;
  });

  // Import members
  const members_rq = await fetch(`${SP_API}/members/${ourselves.id}`, request_options);
  const members: SPMember[] = await members_rq.json();

  members.forEach(async (member) => {
    const { data: new_member } = await supabase
      .from('members')
      .insert({
        account: account_id,
        id: nanoid(),
        name: member.content.name,
        pronouns: member.content.pronouns,
        description: member.content.desc,
        color: `${hexToRgb(member.content.color)!.r}, ${hexToRgb(member.content.color)?.g}, ${hexToRgb(member.content.color)?.b}`,
      })
      .select()
      .single();
    Object.entries(member.content.info).forEach(async ([field_id, field_value]) => {
      await supabase
        .from('field_values')
        .insert({
          field: MAP_SPFIELDS_OURFIELDS[field_id],
          member: new_member!.id,
          value: field_value
        });
    });
  });

  // Import custom fronts
  const custom_fronts_rq = await fetch(`${SP_API}/customFronts/${ourselves.id}`, request_options);
  const custom_fronts: SPCustomFrontWrapper[] = await custom_fronts_rq.json();

  custom_fronts.forEach(async (custom_front) => {
    await supabase
      .from('members')
      .insert({
        account: account_id,
        id: nanoid(),
        name: custom_front.content.name,
        description: custom_front.content.desc,
        color: `${hexToRgb(custom_front.content.color)!.r}, ${hexToRgb(custom_front.content.color)?.g}, ${hexToRgb(custom_front.content.color)?.b}`,
        is_status: true,
      })
      .select()
      .single();
  });
}