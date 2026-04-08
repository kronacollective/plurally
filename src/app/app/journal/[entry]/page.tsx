import EntryDisplay from "./EntryDisplay";

export default async function JournalEntryPage({
  params
}: {
  params: Promise<{entry: string}>,
}) {
  const { entry: entry_id } = await params;

  return (
    <>
      <EntryDisplay entry_id={entry_id} />
    </>
  );
}