import { withAuth } from "@/lib/api-utils";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export const GET = withAuth(async (req: NextRequest, userId: string, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid dump ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const pipeline = [
      {
        $match: {
          _id: new ObjectId(id),
          user_id: userId,
          deleted_at: null,
        },
      },
      {
        $lookup: {
          from: "tags",
          localField: "tag_id",
          foreignField: "_id",
          as: "tag",
        }
      },
      {
        $unwind: {
          path: "$tag",
          preserveNullAndEmptyArrays: true
        }
      }
    ];

    const result = await db.collection("dumps").aggregate(pipeline).toArray();
    const dump = result[0];

    if (!dump) {
      return NextResponse.json({ error: "Dump not found" }, { status: 404 });
    }

    return NextResponse.json({ dump }, { status: 200 });

  } catch (error: any) {
    console.error("Error fetching dump details:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});

export const DELETE = withAuth(async (req: NextRequest, userId: string, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid dump ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection("dumps").findOneAndUpdate(
      { _id: new ObjectId(id), user_id: userId, deleted_at: null },
      { $set: { deleted_at: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: "Dump not found or already deleted" }, { status: 404 });
    }

    return NextResponse.json({ message: "Dump deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting dump:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});
