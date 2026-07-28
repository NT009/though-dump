import mongoose, { Schema, Document, Model } from "mongoose";

export interface IThought extends Document {
  userId: string;
  contentHtml: string;
  tags: string[];
  createdAt: Date;
}

const ThoughtSchema: Schema = new Schema({
  userId: { type: String, required: true },
  contentHtml: { type: String, required: true },
  tags: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

// Prevent model recompilation error in Next.js development
const Thought: Model<IThought> = mongoose.models.Thought || mongoose.model<IThought>("Thought", ThoughtSchema);

export default Thought;
