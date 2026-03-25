import FolderDisplay from "./FolderDisplay";
import MemberDisplay from "./FolderDisplay";

export default async function FolderPage({
  params,
}: {
  params: Promise<{ folder: string }>
}) {
  const { folder: folder_id } = await params;

  return (
    <div>
      <FolderDisplay folder_id={folder_id} />
    </div>
  )
}