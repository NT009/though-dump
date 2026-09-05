import DailyDumpsClient from "./DailyDumpsClient";

export default async function DailyDumpsPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const resolvedParams = await params;
  return <DailyDumpsClient date={resolvedParams.date} />;
}
