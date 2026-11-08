import mongoose from "mongoose";

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not configured. Copy .env.example to .env and set a MongoDB connection string.");
  }

  try {
    await mongoose.connect(uri);
    console.info("Connected to MongoDB.");
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown connection error";
    throw new Error(`Could not connect to MongoDB: ${reason}`);
  }
}

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}