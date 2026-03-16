import FriendDisplay from "./FriendDisplay";

export default async function FriendPage({
  params
}: {
  params: Promise<{friend: string}>,
}) {
  const { friend: friend_id } = await params;

  return (
    <>
      <FriendDisplay friend_id={friend_id} />
    </>
  )
}