"use server";

import connectToDatabase from "@/lib/mongodb";
import Thought from "@/models/Thought";
import { getServerSession } from "next-auth";

export async function createThought(contentHtml: string, tags: string[]) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  await connectToDatabase();
  const thought = await Thought.create({
    userId: session.user.email,
    contentHtml,
    tags,
  });

  return JSON.parse(JSON.stringify(thought));
}

export async function getThoughts() {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  await connectToDatabase();
  const thoughts = await Thought.find({ userId: session.user.email }).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(thoughts));
}

export async function deleteThought(id: string) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  await connectToDatabase();
  await Thought.findOneAndDelete({ _id: id, userId: session.user.email });
  return { success: true };
}
