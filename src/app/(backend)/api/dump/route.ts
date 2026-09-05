import { withAuth } from "@/lib/api-utils";
import clientPromise from "@/lib/mongodb";
import { Dump } from "@/lib/types";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { z } from "zod";

const dumpSchema = z.object({
  thought: z.string().min(1, "Thought is required and cannot be empty"),
  tag_id: z.string().optional().nullable(),
  tag_name: z.string().optional().nullable(),
});

export const POST = withAuth(async (req, userId) => {
  try {
    // 2. Parse and validate request body with Zod
    const body = await req.json();
    const parseResult = dumpSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten().fieldErrors }, 
        { status: 400 }
      );
    }

    const { thought, tag_id, tag_name } = parseResult.data;

    // 3. Connect to database
    const client = await clientPromise;
    const db = client.db(); 

    // 4. Handle Tag Logic
    let finalTagId: ObjectId | null = null;
    const providedTag = tag_id || tag_name;

    if (providedTag) {
      // Build a single query to check if the tag exists by either 'name' OR '_id'
      const query: any = { 
        user_id: userId, 
        deleted_at: null,
        $or: [{ name: providedTag }] 
      };

      // Only add the `_id` check if the string can be safely parsed into an ObjectId
      if (ObjectId.isValid(providedTag) && String(new ObjectId(providedTag)) === String(providedTag)) {
        query.$or.push({ _id: new ObjectId(providedTag) });
      }

      // 1 database call to find it
      const existingTag = await db.collection("tags").findOne(query);

      if (existingTag) {
        finalTagId = existingTag._id;
      } else {
        // Doesn't exist by ID or Name, so create it!
        const tagResult = await db.collection("tags").insertOne({
          name: providedTag,
          user_id: userId,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
        });
        finalTagId = tagResult.insertedId;
      }
    }

    // 5. Create dump object
    const newDump: Omit<Dump, "_id"> = {
      thought,
      tag_id: finalTagId,
      user_id: userId,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    };

    // 6. Insert into dumps collection
    const result = await db.collection("dumps").insertOne(newDump);

    return NextResponse.json({
      message: "Dump created successfully",
      dump: {
        _id: result.insertedId,
        ...newDump
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error creating dump:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});

export const GET = withAuth(async (req, userId) => {
  try {
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(url.searchParams.get("limit") || "10", 10));
    
    const timezone = url.searchParams.get("timezone") || "UTC";

    // Filters
    const tagId = url.searchParams.get("tag_id");
    const search = url.searchParams.get("search");
    const date = url.searchParams.get("date"); // YYYY-MM-DD
    const startDate = url.searchParams.get("startDate"); // YYYY-MM-DD
    const endDate = url.searchParams.get("endDate"); // YYYY-MM-DD

    const skip = (page - 1) * limit;
    
    const client = await clientPromise;
    const db = client.db();

    // Build the match query
    const matchQuery: any = {
      user_id: userId,
      deleted_at: null,
    };

    // Filter by Tag
    if (tagId && ObjectId.isValid(tagId)) {
      matchQuery.tag_id = new ObjectId(tagId);
    }

    // Filter by Search text (case-insensitive regex on 'thought')
    if (search) {
      matchQuery.thought = { $regex: search, $options: "i" };
    }

    // Filter by Date(s) with Timezone support
    if (date || startDate || endDate) {
      if (!matchQuery.$expr) matchQuery.$expr = { $and: [] };

      if (date) {
        matchQuery.$expr.$and.push({
          $eq: [
            { $dateToString: { format: "%Y-%m-%d", date: "$created_at", timezone } },
            date
          ]
        });
      } else {
        if (startDate) {
          matchQuery.$expr.$and.push({
            $gte: [
              { $dateToString: { format: "%Y-%m-%d", date: "$created_at", timezone } },
              startDate
            ]
          });
        }
        if (endDate) {
          matchQuery.$expr.$and.push({
            $lte: [
              { $dateToString: { format: "%Y-%m-%d", date: "$created_at", timezone } },
              endDate
            ]
          });
        }
      }
    }

    const pipeline = [
      { $match: matchQuery },
      // Optional: Lookup tag details if you want to include tag name in the response
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
          preserveNullAndEmptyArrays: true // Keep dumps even if they don't have a tag
        }
      },
      {
        $sort: { created_at: -1 as const },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: skip },
            { $limit: limit },
          ]
        }
      }
    ];

    const result = await db.collection("dumps").aggregate(pipeline).toArray();
    
    const total = result[0]?.metadata[0]?.total || 0;
    const dumps = result[0]?.data || [];

    return NextResponse.json({ 
      dumps,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error listing dumps:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});

