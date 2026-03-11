import { Tables } from "@/lib/supabase/database.types";
import { Button } from "konsta/react";
import { useRouter } from "next/navigation";
import { Updater } from "use-immer";

export default function SettingsMemberDisplay({
  member,
  member_mutations,
  member_state,
  updateMemberState,
}: {
  member: Tables<'members'>
  member_mutations: {
    update: () => Promise<void>;
    deleteMember: () => Promise<void>;
  } & {
    invalidateCache: () => Promise<void>;
  },
  member_state: Record<string, string | null>,
  updateMemberState: Updater<Record<string, string | null>>,
}) {
  const router = useRouter();
  return (
    <>
      <Button
        className="bg-red-700"
        onClick={() => {
          member_mutations.deleteMember()
          router.push('/app/members');
        }}
      >
        Delete member
      </Button>
    </>
  )
}