import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getThoughts } from "../actions/thoughtActions";
import VaultClient from "./VaultClient";

export default async function VaultPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/");
  }

  const thoughts = await getThoughts();

  return <VaultClient initialThoughts={thoughts} />;
}
