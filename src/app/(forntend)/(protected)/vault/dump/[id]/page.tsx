import DumpDetailClient from "./DumpDetailClient";

export default async function DumpDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <DumpDetailClient id={resolvedParams.id} />;
}
