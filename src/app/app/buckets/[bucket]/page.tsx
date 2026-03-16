import BucketDisplay from "./BucketDisplay";

export default async function Bucket({
  params,
}: {
  params: Promise<{bucket: string}>
}) {
  const { bucket: bucket_id } = await params;
  return (
    <>
      <BucketDisplay bucket_id={bucket_id} />
    </>
  )
}