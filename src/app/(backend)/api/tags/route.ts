import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { withAuth } from "@/lib/api-utils";

export const GET = withAuth(async (req, userId) => {
  try {
    const { searchParams } = new URL(req.url);
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const searchQuery = searchParams.get("query");

    const client = await clientPromise;
    const db = client.db();

    // 1. Build Base Query (ensure we only fetch tags owned by this user and not deleted)
    const query: any = { 
      user_id: userId,
      deleted_at: null 
    };

    if (searchQuery) {
      // Case-insensitive search on tag name
      query.name = { $regex: searchQuery, $options: "i" };
    }

    // 2. Fetch Data
    if (pageParam && limitParam) {
      // --- Paginated Mode ---
      const page = Math.max(1, parseInt(pageParam, 10) || 1);
      const limit = Math.max(1, parseInt(limitParam, 10) || 10);
      const skip = (page - 1) * limit;

      const [tags, total] = await Promise.all([
        db.collection("tags").find(query).skip(skip).limit(limit).toArray(),
        db.collection("tags").countDocuments(query)
      ]);
      
      return NextResponse.json({
        data: tags,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } else {
      // --- Return All Mode ---
      const tags = await db.collection("tags").find(query).toArray();
      return NextResponse.json({ data: tags });
    }
  } catch (error: any) {
    console.error("Error fetching tags:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});
