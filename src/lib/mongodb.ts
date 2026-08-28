import { MongoClient } from 'mongodb';

// Ensure the MongoDB URI is provided in the environment variables
if (!process.env.MONGODB_URI) {
  throw new Error('Add Mongo URI to .env.local');
}

const uri: string = process.env.MONGODB_URI;
// Additional options for the MongoClient can be added here
const options = {};

let client: MongoClient;
// This promise will be exported and used across the application to connect to the database
let clientPromise: Promise<MongoClient>;

// Extend the global namespace to cache the connection in the development environment.
// This prevents multiple connections from being created due to Next.js's Hot Module Replacement (HMR).
let globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR.
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  // We simply create a new MongoClient and connect directly.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export the module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;