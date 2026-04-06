import PollDisplay from "./PollDisplay";

export default async function PollPage({
  params
}: {
  params: Promise<{poll: string}>,
}) {
  const { poll: poll_id } = await params;

  return (
    <>
      <PollDisplay poll_id={poll_id} />
    </>
  )
}