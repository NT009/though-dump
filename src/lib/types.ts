import { ObjectId } from "mongodb";

export interface Dump {
  _id?: ObjectId;
  thought: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  tag_ids: ObjectId[];
  user_id: string;
}

export interface Tag {
  _id?: ObjectId;
  user_id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
