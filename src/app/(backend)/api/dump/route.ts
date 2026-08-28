import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { Dump } from "@/lib/types";
import { withAuth } from "@/lib/api-utils";
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
          user_id: userId
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
