import { withAuth } from "@/lib/api-utils";
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export const GET = withAuth(async (req, userId) => {
  try {
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(url.searchParams.get("limit") || "10", 10));
    const timezone = url.searchParams.get("timezone") || "UTC";

    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db();

    const pipeline = [
      {
        $match: {
          user_id: userId,
          deleted_at: null,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { 
              format: "%Y-%m-%d", 
              date: "$created_at",
              timezone: timezone 
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: -1 as const },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 0,
                date: "$_id",
                count: 1,
              },
            }
          ]
        }
      }
    ];

    const result = await db.collection("dumps").aggregate(pipeline).toArray();
    
    const total = result[0]?.metadata[0]?.total || 0;
    const summary = result[0]?.data || [];

    return NextResponse.json({ 
      summary,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching dump summary:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});
