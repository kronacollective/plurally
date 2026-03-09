import { createClient } from "@/lib/supabase/server";
import MemberDisplay from "./MemberDisplay";

export default async function MemberPage({
  params,
}: {
  params: Promise<{ member: string }>
}) {
  const { member: member_id } = await params;
  const supabase = await createClient();
  const { data: member } = await supabase
    .from('members')
    .select()
    .eq('id', member_id)
    .single();

  return (
    <div>
      <MemberDisplay member={member} />
    </div>
  )
}