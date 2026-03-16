import MemberDisplay from "./MemberDisplay";

export default async function FriendMemberPage({
  params
}: {
  params: Promise<{member: string}>,
}) {
  const { member: member_id } = await params;
  
  return (
    <>
      <MemberDisplay member_id={member_id} />
    </>
  )
}