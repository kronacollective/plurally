import { createClient } from "@/lib/supabase/server";
import MemberDisplay from "./MemberDisplay";

export default async function MemberPage({
  params,
}: {
  params: Promise<{ member: string }>
}) {
  const { member: member_id } = await params;

  return (
    <div>
      <MemberDisplay member_id={member_id} />
    </div>
  )
}