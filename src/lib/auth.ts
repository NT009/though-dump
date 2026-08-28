import { betterAuth } from "better-auth";
import clientPromise from "./mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
 
const client = await clientPromise;
const db = client.db();


export const auth = betterAuth({
  database: mongodbAdapter(db, {
    // Optional: if you don't provide a client, database transactions won't be enabled.
    client,
  }),
    emailAndPassword: { 
    enabled: true, 
  },
  
});