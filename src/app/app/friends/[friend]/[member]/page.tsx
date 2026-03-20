import MemberDisplay from "./MemberDisplay";

export default async function FriendMemberPage({
  params
}: {
  params: Promise<{member: string, friend: string}>,
}) {
  const { member: member_id, friend: friend_id } = await params;
  
  return (
    <>
      <MemberDisplay member_id={member_id} friend_id={friend_id} />
    </>
  )
}