import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error(
    "Please add your MongoDB URI to the environment variables (e.g., .env.local)"
  );
} else {
  console.log("Terhubung ke database MongoDB");
}

const client = new MongoClient(uri);
const clientPromise = client.connect();

export default clientPromise;
