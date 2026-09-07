import { withAuth } from "@/lib/api-utils";
import clientPromise from "@/lib/mongodb";
import { Dump } from "@/lib/types";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { z } from "zod";

const dumpSchema = z.object({
  thought: z.string().min(1, "Thought is required and cannot be empty"),
  existing_tag_ids: z.array(z.string()).optional(),
  new_tag_names: z.array(z.string()).optional(),
});

export const POST = withAuth(async (req, userId) => {
  try {
    const body = await req.json();
    const parseResult = dumpSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten().fieldErrors }, 
        { status: 400 }
      );
    }

    const { thought, existing_tag_ids, new_tag_names } = parseResult.data;

    const client = await clientPromise;
    const db = client.db(); 

    let tagIds: ObjectId[] = [];

    if (existing_tag_ids && existing_tag_ids.length > 0) {
      const validObjectIds = existing_tag_ids.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
      
      if (validObjectIds.length !== existing_tag_ids.length) {
        return NextResponse.json({ error: "One or more tag IDs are in an invalid format" }, { status: 400 });
      }

      // Verify that ALL provided tags exist and belong strictly to this user
      const verifiedTags = await db.collection("tags").find({
        _id: { $in: validObjectIds },
        user_id: userId,
        deleted_at: null
      }).toArray();

      if (verifiedTags.length !== validObjectIds.length) {
        return NextResponse.json({ 
          error: "One or more selected tags are invalid or could not be found." 
        }, { status: 400 });
      }

      for (const tag of verifiedTags) {
        tagIds.push(tag._id);
      }
    }

    if (new_tag_names && new_tag_names.length > 0) {
      const existingTagsByName = await db.collection("tags").find({ 
        user_id: userId,
        deleted_at: null,
        name: { $in: new_tag_names }
      }).toArray();

      const existingNames = existingTagsByName.map(t => t.name);
      
      for (const existingTag of existingTagsByName) {
        tagIds.push(existingTag._id);
      }

      const tagsToCreate = new_tag_names.filter(name => !existingNames.includes(name));

      if (tagsToCreate.length > 0) {
        const newDocs = tagsToCreate.map(name => ({
          name,
          user_id: userId,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
        }));

        const insertResult = await db.collection("tags").insertMany(newDocs);
        for (const id of Object.values(insertResult.insertedIds)) {
          tagIds.push(id as ObjectId);
        }
      }
    }

    const newDump = {
      thought,
      tag_ids: tagIds,
      user_id: userId,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    };

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

    const tagId = url.searchParams.get("tag_id");
    const search = url.searchParams.get("search");
    const date = url.searchParams.get("date"); // YYYY-MM-DD
    const startDate = url.searchParams.get("startDate"); // YYYY-MM-DD
    const endDate = url.searchParams.get("endDate"); // YYYY-MM-DD

    const skip = (page - 1) * limit;
    
    const client = await clientPromise;
    const db = client.db();

    const matchQuery: any = {
      user_id: userId,
      deleted_at: null,
    };

    if (tagId && ObjectId.isValid(tagId)) {
      matchQuery.tag_ids = new ObjectId(tagId);
    }

    if (search) {
      matchQuery.thought = { $regex: search, $options: "i" };
    }

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
      {
        $lookup: {
          from: "tags",
          localField: "tag_ids",
          foreignField: "_id",
          as: "tags",
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

