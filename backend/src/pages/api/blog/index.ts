import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb/init";
import { ObjectId } from "mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const client = await clientPromise;
    const db = client.db("portofolio");
    const collection = db.collection("blog");
    const blogs = await collection.find({}).toArray();
    return res.status(200).json(blogs);
  }
}

export async function addBlog(req: NextApiRequest, res: NextApiResponse) {
  const { title, content } = req.body;
}

export async function editBlog(req: NextApiRequest, res: NextApiResponse) {
  const { id, title, content } = req.body;
  const client = await clientPromise;
  const db = client.db("portofolio");
  const collection = db.collection("blog");

  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { title, content } }
  );

  if (result.modifiedCount > 0) {
    return res.status(200).json({ message: "Blog updated successfully" });
  } else {
    return res.status(500).json({ message: "Failed to update blog" });
  }
}
